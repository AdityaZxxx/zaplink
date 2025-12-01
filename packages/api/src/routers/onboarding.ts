import { TRPCError } from "@trpc/server";
import {
	and,
	db,
	eq,
	linkPlatforms,
	links,
	not,
	platformCategoryEnum,
	profiles,
} from "@zaplink/db";
import { z } from "zod";
import { protectedProcedure, router } from "..";

export const onboardingRouter = router({
	/**
	 * Checks the current onboarding status of the user.
	 */
	getOnboardingState: protectedProcedure.query(async ({ ctx }) => {
		const profile = await db.query.profiles.findFirst({
			where: eq(profiles.userId, ctx.session.user.id),
			columns: {
				onboardingCompletedAt: true,
			},
		});

		return {
			isOnboardingComplete:
				profile?.onboardingCompletedAt !== null &&
				profile?.onboardingCompletedAt !== undefined,
		};
	}),

	/**
	 * Complete onboarding by saving profile and links in one transaction.
	 */
	completeOnboarding: protectedProcedure
		.input(
			z.object({
				username: z
					.string()
					.min(3, "Username must be at least 3 characters")
					.max(30, "Username must be 30 characters or less")
					.regex(
						/^[a-zA-Z0-9_]+$/,
						"Username can only contain letters, numbers, and underscores",
					),
				displayName: z.string().min(1).max(30),
				bio: z.string().max(500).nullish(),
				avatarUrl: z.string().url().nullish(),
				bannerUrl: z.string().url().nullish(),
				links: z.array(
					z.object({
						title: z.string().min(1),
						url: z.string().url(),
						type: z.enum(["custom", "platform"]),
						platformName: z.string().optional(),
						platformCategory: z
							.enum(platformCategoryEnum.enumValues)
							.optional(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if username is taken by ANOTHER user
			const existingProfileWithUsername = await db.query.profiles.findFirst({
				where: and(
					eq(profiles.username, input.username),
					not(eq(profiles.userId, ctx.session.user.id)),
				),
				columns: { id: true },
			});

			if (existingProfileWithUsername) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Username is already taken.",
				});
			}

			await db.transaction(async (tx) => {
				// 1. Create or Update Profile
				let profileId: number;
				const existingProfile = await tx.query.profiles.findFirst({
					where: eq(profiles.userId, ctx.session.user.id),
					columns: { id: true },
				});

				if (existingProfile) {
					profileId = existingProfile.id;
					await tx
						.update(profiles)
						.set({
							username: input.username,
							displayName: input.displayName,
							bio: input.bio,
							avatarUrl: input.avatarUrl,
							bannerUrl: input.bannerUrl,
							onboardingCompletedAt: new Date(),
							updatedAt: new Date(),
						})
						.where(eq(profiles.id, profileId));
				} else {
					const [newProfile] = await tx
						.insert(profiles)
						.values({
							userId: ctx.session.user.id,
							username: input.username,
							displayName: input.displayName,
							bio: input.bio,
							avatarUrl: input.avatarUrl,
							bannerUrl: input.bannerUrl,
							onboardingCompletedAt: new Date(),
						})
						.returning({ id: profiles.id });

					if (!newProfile) throw new Error("Failed to create profile");
					profileId = newProfile.id;
				}

				// 2. Insert Links
				if (input.links.length > 0) {
					for (const link of input.links) {
						const [newLink] = await tx
							.insert(links)
							.values({
								profileId: profileId,
								title: link.title,
								url: link.url,
								type: link.type,
							})
							.returning({ id: links.id });

						if (!newLink) continue;

						if (
							link.type === "platform" &&
							link.platformName &&
							link.platformCategory
						) {
							await tx.insert(linkPlatforms).values({
								linkId: newLink.id,
								name: link.platformName,
								category: link.platformCategory,
							});
						}
					}
				}
			});

			return { success: true };
		}),
});
