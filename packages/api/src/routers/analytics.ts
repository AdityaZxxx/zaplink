import { TRPCError } from "@trpc/server";
import {
	analytics,
	and,
	count,
	desc,
	eq,
	gte,
	links,
	lte,
	profiles,
	sql,
} from "@zaplink/db";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";

const dateRangeSchema = z.enum([
	"today",
	"yesterday",
	"last7",
	"last30",
	"last90",
	"thisMonth",
	"thisWeek",
]);

export const analyticsRouter = router({
	trackView: publicProcedure
		.input(z.object({ username: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const profile = await ctx.db.query.profiles.findFirst({
				where: eq(profiles.username, input.username),
			});

			if (!profile) return;

			// Simple tracking, in production use IP hashing and better fingerprinting
			// Here we just insert
			await ctx.db.insert(analytics).values({
				profileId: profile.id,
				type: "view",
				// ipAddress and userAgent can be extracted from headers in context if available
				// For now we skip or add if context has them
			});

			return { success: true };
		}),

	trackClick: publicProcedure
		.input(z.object({ linkId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const link = await ctx.db.query.links.findFirst({
				where: eq(links.id, input.linkId),
			});

			if (!link) return;

			await ctx.db.insert(analytics).values({
				profileId: link.profileId,
				linkId: link.id,
				type: "click",
			});

			return { success: true };
		}),

	getStats: protectedProcedure
		.input(
			z.object({
				range: dateRangeSchema.optional(),
				from: z.coerce.date().optional(),
				to: z.coerce.date().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userProfile = await ctx.db.query.profiles.findFirst({
				where: eq(profiles.userId, ctx.session.user.id),
			});

			if (!userProfile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profile not found",
				});
			}

			let startDate = new Date();
			let endDate = new Date();

			if (input.from && input.to) {
				startDate = input.from;
				endDate = input.to;
				// Ensure endDate includes the full day
				endDate.setHours(23, 59, 59, 999);
			} else if (input.range) {
				// Set time to end of day for endDate
				endDate.setHours(23, 59, 59, 999);

				switch (input.range) {
					case "today":
						startDate.setHours(0, 0, 0, 0);
						break;
					case "yesterday":
						startDate.setDate(startDate.getDate() - 1);
						startDate.setHours(0, 0, 0, 0);
						endDate.setDate(endDate.getDate() - 1);
						endDate.setHours(23, 59, 59, 999);
						break;
					case "last7":
						startDate.setDate(startDate.getDate() - 7);
						startDate.setHours(0, 0, 0, 0);
						break;
					case "last30":
						startDate.setDate(startDate.getDate() - 30);
						startDate.setHours(0, 0, 0, 0);
						break;
					case "last90":
						startDate.setDate(startDate.getDate() - 90);
						startDate.setHours(0, 0, 0, 0);
						break;
					case "thisWeek": {
						const day = startDate.getDay();
						const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
						startDate.setDate(diff);
						startDate.setHours(0, 0, 0, 0);
						break;
					}
					case "thisMonth":
						startDate.setDate(1);
						startDate.setHours(0, 0, 0, 0);
						break;
				}
			} else {
				// Default to last 7 days if nothing provided
				startDate.setDate(startDate.getDate() - 7);
				startDate.setHours(0, 0, 0, 0);
				endDate.setHours(23, 59, 59, 999);
			}

			// Base filter
			const baseFilter = and(
				eq(analytics.profileId, userProfile.id),
				gte(analytics.createdAt, startDate),
				lte(analytics.createdAt, endDate),
			);

			// Calculate previous period dates for comparison
			const periodDuration = endDate.getTime() - startDate.getTime();
			const prevStartDate = new Date(startDate.getTime() - periodDuration);
			const prevEndDate = new Date(startDate.getTime() - 1); // End just before current period starts

			const prevPeriodFilter = and(
				eq(analytics.profileId, userProfile.id),
				gte(analytics.createdAt, prevStartDate),
				lte(analytics.createdAt, prevEndDate),
			);

			// Aggregate Totals for current period
			const [viewsResult] = await ctx.db
				.select({ count: count() })
				.from(analytics)
				.where(and(baseFilter, eq(analytics.type, "view")));

			const [clicksResult] = await ctx.db
				.select({ count: count() })
				.from(analytics)
				.where(and(baseFilter, eq(analytics.type, "click")));

			const totalViews = viewsResult?.count || 0;
			const totalClicks = clicksResult?.count || 0;
			const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

			// Aggregate Totals for previous period
			const [prevViewsResult] = await ctx.db
				.select({ count: count() })
				.from(analytics)
				.where(and(prevPeriodFilter, eq(analytics.type, "view")));

			const [prevClicksResult] = await ctx.db
				.select({ count: count() })
				.from(analytics)
				.where(and(prevPeriodFilter, eq(analytics.type, "click")));

			const prevTotalViews = prevViewsResult?.count || 0;
			const prevTotalClicks = prevClicksResult?.count || 0;
			const prevCtr =
				prevTotalViews > 0 ? (prevTotalClicks / prevTotalViews) * 100 : 0;

			// Calculate percentage changes
			const viewsChange =
				prevTotalViews > 0
					? ((totalViews - prevTotalViews) / prevTotalViews) * 100
					: totalViews > 0
						? 100
						: 0;

			const clicksChange =
				prevTotalClicks > 0
					? ((totalClicks - prevTotalClicks) / prevTotalClicks) * 100
					: totalClicks > 0
						? 100
						: 0;

			const ctrChange =
				prevCtr > 0 ? ((ctr - prevCtr) / prevCtr) * 100 : ctr > 0 ? 100 : 0;

			// Chart Data (Group by Hour for time series)
			// Format: 'YYYY-MM-DD HH24:00:00' for hourly granularity
			const chartDataRaw = await ctx.db
				.select({
					timestamp: sql<string>`to_char(${analytics.createdAt}, 'YYYY-MM-DD HH24:00:00')`,
					type: analytics.type,
					count: count(),
				})
				.from(analytics)
				.where(baseFilter)
				.groupBy(
					sql`to_char(${analytics.createdAt}, 'YYYY-MM-DD HH24:00:00')`,
					analytics.type,
				)
				.orderBy(sql`to_char(${analytics.createdAt}, 'YYYY-MM-DD HH24:00:00')`);

			// Process chart data
			const chartMap = new Map<string, { views: number; clicks: number }>();

			// Fill map with raw data
			chartDataRaw.forEach((row) => {
				const current = chartMap.get(row.timestamp) || { views: 0, clicks: 0 };
				if (row.type === "view") current.views = Number(row.count);
				if (row.type === "click") current.clicks = Number(row.count);
				chartMap.set(row.timestamp, current);
			});

			// Sort by timestamp and convert to array
			const chartData = Array.from(chartMap.entries())
				.sort((a, b) => a[0].localeCompare(b[0]))
				.map(([timestamp, stats]) => ({
					timestamp,
					...stats,
				}));

			// Top Links
			const topLinks = await ctx.db
				.select({
					id: links.id,
					title: links.title,
					url: links.url,
					clicks: count(),
				})
				.from(analytics)
				.innerJoin(links, eq(analytics.linkId, links.id))
				.where(and(baseFilter, eq(analytics.type, "click")))
				.groupBy(links.id, links.title, links.url)
				.orderBy(desc(count()))
				.limit(5);

			return {
				totalViews,
				totalClicks,
				ctr,
				viewsChange,
				clicksChange,
				ctrChange,
				chartData,
				topLinks,
			};
		}),

	getLinkClickCount: protectedProcedure
		.input(z.object({ linkId: z.number() }))
		.query(async ({ ctx, input }) => {
			// Verify the link belongs to the user's profile
			const link = await ctx.db.query.links.findFirst({
				where: eq(links.id, input.linkId),
			});

			if (!link) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Link not found",
				});
			}

			const userProfile = await ctx.db.query.profiles.findFirst({
				where: eq(profiles.userId, ctx.session.user.id),
			});

			if (!userProfile || link.profileId !== userProfile.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You don't have permission to view this link's analytics",
				});
			}

			// Get total click count for this link
			const [result] = await ctx.db
				.select({ count: count() })
				.from(analytics)
				.where(
					and(eq(analytics.linkId, input.linkId), eq(analytics.type, "click")),
				);

			return {
				linkId: input.linkId,
				clickCount: result?.count || 0,
			};
		}),
});
