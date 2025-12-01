import { TRPCError } from "@trpc/server";
import {
	and,
	asc,
	eq,
	inArray,
	linkPlatforms,
	links,
	profiles,
} from "@zaplink/db";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";

export const linksRouter = router({
	getAllLinks: protectedProcedure.query(async ({ ctx }) => {
		const userProfile = await ctx.db
			.select({ id: profiles.id })
			.from(profiles)
			.where(eq(profiles.userId, ctx.session.user.id))
			.limit(1);

		if (!userProfile[0]) {
			return [];
		}

		const profileId = userProfile[0].id;

		// TODO: Join with linkPlatforms/linkCustoms if needed for full details
		const userLinks = await ctx.db
			.select()
			.from(links)
			.where(eq(links.profileId, profileId))
			.orderBy(asc(links.sortOrder));

		return userLinks;
	}),

	getPublicLinks: publicProcedure
		.input(z.object({ username: z.string() }))
		.query(async ({ ctx, input }) => {
			const userProfile = await ctx.db
				.select({ id: profiles.id })
				.from(profiles)
				.where(eq(profiles.username, input.username))
				.limit(1);

			if (!userProfile[0]) {
				return [];
			}

			const profileId = userProfile[0].id;

			const userLinks = await ctx.db
				.select()
				.from(links)
				.where(and(eq(links.profileId, profileId), eq(links.isHidden, false)))
				.orderBy(asc(links.sortOrder));

			return userLinks;
		}),

	createLink: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1).max(200),
				url: z.string().url(),
				type: z.enum(["custom", "platform", "contact", "embed"]).optional(),
				platformName: z.string().optional(), // For platform links
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userProfile = await ctx.db
				.select({ id: profiles.id })
				.from(profiles)
				.where(eq(profiles.userId, ctx.session.user.id))
				.limit(1);

			if (!userProfile[0]) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profile not found, cannot create link.",
				});
			}
			const profileId = userProfile[0].id;

			const linkType =
				input.type || (input.platformName ? "platform" : "custom");

			return await ctx.db.transaction(async (tx) => {
				// 1. Create the base link
				const [newLink] = await tx
					.insert(links)
					.values({
						profileId,
						title: input.title,
						url: input.url,
						type: linkType,
						sortOrder: 0, // Default to top or bottom? Schema default is 0
					})
					.returning();

				if (!newLink) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create link.",
					});
				}

				// 2. If platform link, create platform entry
				if (linkType === "platform" && input.platformName) {
					await tx.insert(linkPlatforms).values({
						linkId: newLink.id,
						name: input.platformName,
						category: "social", // Default category, maybe should be passed in input
					});
				}

				return newLink;
			});
		}),

	updateLink: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				title: z.string().min(1).max(200).optional(),
				url: z.string().url().optional(), // Changed z.url() to z.string().url() to match createLink
				isHidden: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userProfile = await ctx.db
				.select({ id: profiles.id })
				.from(profiles)
				.where(eq(profiles.userId, ctx.session.user.id))
				.limit(1);

			if (!userProfile[0]) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profile not found.",
				});
			}
			const profileId = userProfile[0].id;

			const updateData: Partial<typeof links.$inferInsert> = {
				updatedAt: new Date(),
				...(input.title !== undefined && { title: input.title }),
				...(input.url !== undefined && { url: input.url }),
				...(input.isHidden !== undefined && { isHidden: input.isHidden }),
			};

			const [updatedLink] = await ctx.db
				.update(links)
				.set(updateData)
				.where(and(eq(links.id, input.id), eq(links.profileId, profileId)))
				.returning();

			return updatedLink;
		}),

	updateLinksOrder: protectedProcedure
		.input(
			z.object({
				orderedIds: z.array(z.number()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userProfile = await ctx.db
				.select({ id: profiles.id })
				.from(profiles)
				.where(eq(profiles.userId, ctx.session.user.id))
				.limit(1);

			if (!userProfile[0]) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profile not found.",
				});
			}
			const profileId = userProfile[0].id;

			const userLinks = await ctx.db
				.select({ id: links.id })
				.from(links)
				.where(
					and(
						eq(links.profileId, profileId),
						inArray(links.id, input.orderedIds),
					),
				);

			if (userLinks.length !== input.orderedIds.length) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "One or more links do not belong to the user.",
				});
			}

			const updates = input.orderedIds.map((id, index) =>
				ctx.db.update(links).set({ sortOrder: index }).where(eq(links.id, id)),
			);

			await Promise.all(updates);

			return { success: true };
		}),

	deleteLink: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const userProfile = await ctx.db
				.select({ id: profiles.id })
				.from(profiles)
				.where(eq(profiles.userId, ctx.session.user.id))
				.limit(1);

			if (!userProfile[0]) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profile not found.",
				});
			}
			const profileId = userProfile[0].id;

			const [deletedLink] = await ctx.db
				.delete(links)
				.where(and(eq(links.id, input.id), eq(links.profileId, profileId)))
				.returning();

			if (!deletedLink) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Link not found or you do not have permission to delete it.",
				});
			}

			return deletedLink;
		}),
});
