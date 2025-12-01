import { TRPCError } from "@trpc/server";
import { and, asc, eq, links, ne, profiles } from "@zaplink/db";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";

export const profileRouter = router({
	getProfile: protectedProcedure.query(async ({ ctx }) => {
		const profile = await ctx.db
			.select()
			.from(profiles)
			.where(eq(profiles.userId, ctx.session.user.id))
			.limit(1);

		return profile[0] || null;
	}),

	getProfileByUsername: publicProcedure
		.input(z.object({ username: z.string() }))
		.query(async ({ ctx, input }) => {
			const profile = await ctx.db
				.select()
				.from(profiles)
				.where(eq(profiles.username, input.username))
				.limit(1);

			if (!profile[0]) {
				return null;
			}

			const userLinks = await ctx.db
				.select()
				.from(links)
				.where(eq(links.profileId, profile[0].id))
				.orderBy(asc(links.sortOrder));

			return {
				...profile[0],
				links: userLinks,
			};
		}),

	createProfile: protectedProcedure
		.input(
			z.object({
				username: z.string().min(3).max(50).trim().toLowerCase(),
				displayName: z.string().max(100).optional(),
				bio: z.string().max(500).optional(),
				avatarUrl: z.union([z.url(), z.null()]).optional(),
				bannerUrl: z.union([z.url(), z.null()]).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if username already exists (global uniqueness)
			const existingProfile = await ctx.db
				.select({ id: profiles.id })
				.from(profiles)
				.where(eq(profiles.username, input.username))
				.limit(1);

			if (existingProfile.length > 0) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Username already exists",
				});
			}

			const [newProfile] = await ctx.db
				.insert(profiles)
				.values({
					userId: ctx.session.user.id,
					username: input.username,
					displayName: input.displayName ?? input.username,
					bio: input.bio ?? null,
					avatarUrl: input.avatarUrl ?? null,
					bannerUrl: input.bannerUrl ?? null,
					updatedAt: new Date(), // Explicit
				})
				.returning();

			return newProfile;
		}),

	updateProfile: protectedProcedure
		.input(
			z
				.object({
					username: z.string().min(3).max(50).trim().toLowerCase().optional(),
					displayName: z.string().max(100).optional(),
					bio: z.string().max(500).optional(),
					avatarUrl: z.union([z.url(), z.null()]).optional(),
					bannerUrl: z.union([z.url(), z.null()]).optional(),
				})
				.refine((data) => Object.keys(data).length > 0, {
					message: "At least one field must be provided for update",
				}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if profile exists
			const existingProfile = await ctx.db
				.select({ id: profiles.id })
				.from(profiles)
				.where(eq(profiles.userId, ctx.session.user.id))
				.limit(1);

			if (!existingProfile[0]) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profile not found",
				});
			}

			// Check if new username already exists (exclude current user, optimized query)
			if (input.username) {
				const usernameConflict = await ctx.db
					.select({ id: profiles.id })
					.from(profiles)
					.where(
						and(
							eq(profiles.username, input.username),
							ne(profiles.userId, ctx.session.user.id), // Direct exclude
						),
					)
					.limit(1);

				if (usernameConflict.length > 0) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Username already exists",
					});
				}
			}

			const updateData: Partial<typeof profiles.$inferInsert> = {
				updatedAt: new Date(),
				...(input.username && { username: input.username }),
				...(input.displayName !== undefined && {
					displayName: input.displayName ?? input.username,
				}), // Handle undefined vs null
				...(input.bio !== undefined && { bio: input.bio ?? null }),
				...(input.avatarUrl !== undefined && {
					avatarUrl: input.avatarUrl ?? null,
				}),
				...(input.bannerUrl !== undefined && {
					bannerUrl: input.bannerUrl ?? null,
				}),
			};

			const [updatedProfile] = await ctx.db
				.update(profiles)
				.set(updateData)
				.where(eq(profiles.userId, ctx.session.user.id))
				.returning();

			return updatedProfile;
		}),
});
