import { TRPCError } from "@trpc/server";
import {
	and,
	asc,
	eq,
	inArray,
	linkContacts,
	linkCustoms,
	linkPlatforms,
	links,
	sql,
} from "@zaplink/db";
import { z } from "zod";
import { linkColumns } from "../columns";
import { findProfileId } from "../find-profile-id";
import { protectedProcedure, publicProcedure, router } from "../index";

export const linksRouter = router({
	getAllLinks: protectedProcedure.query(async ({ ctx }) => {
		const profileId = await findProfileId(ctx.db, ctx.session.user.id);
		if (profileId === null) {
			return [];
		}

		const userLinks = await ctx.db.query.links.findMany({
			where: eq(links.profileId, profileId),
			orderBy: asc(links.sortOrder),
			columns: linkColumns,
			with: {
				platform: true,
				custom: true,
				contact: true,
			},
		});

		return userLinks;
	}),

	/*
	 * Takes the profile id rather than a username because the public profile
	 * page has already resolved the profile by the time it needs the links, and
	 * looking it up a second time here was a query whose result was discarded.
	 */
	getPublicLinks: publicProcedure
		.input(z.object({ profileId: z.number() }))
		.query(async ({ ctx, input }) => {
			const userLinks = await ctx.db.query.links.findMany({
				where: and(
					eq(links.profileId, input.profileId),
					eq(links.isHidden, false),
				),
				orderBy: asc(links.sortOrder),
				columns: linkColumns,
				with: {
					platform: true,
					custom: true,
					contact: true,
				},
			});

			return userLinks;
		}),

	createLink: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1).max(200),
				url: z.string().url(),
				type: z.enum(["custom", "platform", "contact", "embed"]).optional(),
				// Platform specific
				platformName: z.string().optional(),
				// Custom specific
				displayMode: z.enum(["standard", "featured", "grid"]).optional(),
				thumbnailUrl: z.string().url().optional().or(z.literal("")),
				// Contact specific
				contactType: z.string().optional(), // phone, email, website, etc.
				contactValue: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const profileId = await findProfileId(ctx.db, ctx.session.user.id);
			if (profileId === null) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profile not found, cannot create link.",
				});
			}

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
						sortOrder: 0, // Schema default is 0
					})
					.returning();

				if (!newLink) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create link.",
					});
				}

				// 2. Handle specific link types
				if (linkType === "platform" && input.platformName) {
					await tx.insert(linkPlatforms).values({
						linkId: newLink.id,
						name: input.platformName,
						category: "social",
					});
				} else if (linkType === "custom") {
					await tx.insert(linkCustoms).values({
						linkId: newLink.id,
						displayMode: input.displayMode || "standard",
						thumbnailUrl: input.thumbnailUrl || null,
					});
				} else if (
					linkType === "contact" &&
					input.contactType &&
					input.contactValue
				) {
					await tx.insert(linkContacts).values({
						linkId: newLink.id,
						type: input.contactType,
						value: input.contactValue,
					});
				}

				// Return the full link object with relations
				const fullLink = await tx.query.links.findFirst({
					where: eq(links.id, newLink.id),
					with: {
						platform: true,
						custom: true,
						contact: true,
					},
				});

				return fullLink;
			});
		}),

	updateLink: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				title: z.string().min(1).max(200).optional(),
				url: z.string().url().optional(),
				isHidden: z.boolean().optional(),
				// Custom specific updates
				displayMode: z.enum(["standard", "featured", "grid"]).optional(),
				thumbnailUrl: z.string().url().optional().or(z.literal("")),
				// Contact specific updates
				contactType: z.string().optional(),
				contactValue: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const profileId = await findProfileId(ctx.db, ctx.session.user.id);
			if (profileId === null) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profile not found.",
				});
			}

			const updateData: Partial<typeof links.$inferInsert> = {
				updatedAt: new Date(),
				...(input.title !== undefined && { title: input.title }),
				...(input.url !== undefined && { url: input.url }),
				...(input.isHidden !== undefined && { isHidden: input.isHidden }),
			};

			return await ctx.db.transaction(async (tx) => {
				const [updatedLink] = await tx
					.update(links)
					.set(updateData)
					.where(and(eq(links.id, input.id), eq(links.profileId, profileId)))
					.returning();

				if (!updatedLink) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Link not found.",
					});
				}

				// Update related tables based on link type
				if (updatedLink.type === "custom") {
					if (input.displayMode || input.thumbnailUrl !== undefined) {
						const existingCustom = await tx.query.linkCustoms.findFirst({
							where: eq(linkCustoms.linkId, updatedLink.id),
						});

						if (existingCustom) {
							await tx
								.update(linkCustoms)
								.set({
									...(input.displayMode && { displayMode: input.displayMode }),
									...(input.thumbnailUrl !== undefined && {
										thumbnailUrl: input.thumbnailUrl || null,
									}),
								})
								.where(eq(linkCustoms.linkId, updatedLink.id));
						} else {
							await tx.insert(linkCustoms).values({
								linkId: updatedLink.id,
								displayMode: input.displayMode || "standard",
								thumbnailUrl: input.thumbnailUrl || null,
							});
						}
					}
				} else if (updatedLink.type === "contact") {
					if (input.contactType || input.contactValue) {
						const existingContact = await tx.query.linkContacts.findFirst({
							where: eq(linkContacts.linkId, updatedLink.id),
						});

						if (existingContact) {
							await tx
								.update(linkContacts)
								.set({
									...(input.contactType && { type: input.contactType }),
									...(input.contactValue && { value: input.contactValue }),
								})
								.where(eq(linkContacts.linkId, updatedLink.id));
						} else {
							await tx.insert(linkContacts).values({
								linkId: updatedLink.id,
								type: input.contactType || "email",
								value: input.contactValue || "",
							});
						}
					}
				}

				// Return full object
				const fullLink = await tx.query.links.findFirst({
					where: eq(links.id, updatedLink.id),
					with: {
						platform: true,
						custom: true,
						contact: true,
					},
				});

				return fullLink;
			});
		}),

	updateLinksOrder: protectedProcedure
		.input(
			z.object({
				orderedIds: z.array(z.number()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const profileId = await findProfileId(ctx.db, ctx.session.user.id);
			if (profileId === null) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profile not found.",
				});
			}

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

			if (input.orderedIds.length === 0) {
				return { success: true };
			}

			/*
			 * One statement, so the order is never half applied. This used to build an
			 * UPDATE per id and run them through Promise.all with no transaction, so a
			 * failure partway left the links with duplicate or missing positions and
			 * nothing to roll back.
			 *
			 * The table and the two identifiers come from the schema rather than being
			 * written out, so a rename cannot leave this statement quietly matching
			 * nothing. Both columns of the values list are cast, because an uncast
			 * parameter in a VALUES list resolves to text and sort_order is an integer.
			 * An empty list is handled above, since `values` with no rows is a syntax
			 * error.
			 */
			const submitted = sql.join(
				input.orderedIds.map(
					(id, index) => sql`(${sql.param(id)}::int, ${sql.param(index)}::int)`,
				),
				sql`, `,
			);

			await ctx.db.execute(sql`
			update ${links}
			set sort_order = submitted.ord
			from (values ${submitted}) as submitted(link_id, ord)
			where ${links.id} = submitted.link_id
				and ${links.profileId} = ${profileId}
		`);

			return { success: true };
		}),

	deleteLink: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const profileId = await findProfileId(ctx.db, ctx.session.user.id);
			if (profileId === null) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profile not found.",
				});
			}

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
