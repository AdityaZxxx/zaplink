import { TRPCError } from "@trpc/server";
import { and, asc, eq, inArray, links, profiles } from "@zaplink/db";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

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

		const userLinks = await ctx.db
			.select()
			.from(links)
			.where(eq(links.profileId, profileId))
			.orderBy(asc(links.order)); // Order by the 'order' field

		return userLinks;
	}),

	createLink: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1).max(200),
				url: z.string().url(),
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

			const [newLink] = await ctx.db
				.insert(links)
				.values({
					profileId,
					title: input.title,
					url: input.url,
				})
				.returning();

			return newLink;
		}),

	updateLink: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				title: z.string().min(1).max(200).optional(),
				url: z.url().optional(),
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

			const [updatedLink] = await ctx.db
				.update(links)
				.set({
					...(input.title && { title: input.title }),
					...(input.url && { url: input.url }),
					updatedAt: new Date(),
				})
				.where(and(eq(links.id, input.id), eq(links.profileId, profileId))) // Ensure user owns the link
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
				ctx.db.update(links).set({ order: index }).where(eq(links.id, id)),
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
				.where(and(eq(links.id, input.id), eq(links.profileId, profileId))) // Ensure user owns the link
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
