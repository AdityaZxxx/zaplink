import { profiles } from "@rinku/db";

/*
 * Timestamps are left out on purpose. With no transformer configured, a server
 * caller hands the page a Date where the same procedure over HTTP has already
 * produced a string, so a timestamp column makes one procedure's two shapes
 * disagree and forces a cast at every page that passes a row to a client
 * component. Nothing reads a timestamp, so dropping the columns removes the
 * disagreement instead of casting across it.
 *
 * Each query builder wants a different form, so a table read through both
 * states the pair. The invariant that matters, that a server result is
 * assignable to the type its client components declare, is checked by tsc at
 * each consuming page, so adding a timestamp column back fails the build
 * there.
 */

export const profileSelect = {
	id: profiles.id,
	userId: profiles.userId,
	username: profiles.username,
	displayName: profiles.displayName,
	bio: profiles.bio,
	avatarUrl: profiles.avatarUrl,
	bannerUrl: profiles.bannerUrl,
	seoTitle: profiles.seoTitle,
	seoDescription: profiles.seoDescription,
	supportBanner: profiles.supportBanner,
};

export const profileColumns = {
	id: true,
	userId: true,
	username: true,
	displayName: true,
	bio: true,
	avatarUrl: true,
	bannerUrl: true,
	seoTitle: true,
	seoDescription: true,
	supportBanner: true,
} as const satisfies Record<keyof typeof profileSelect, true>;

/*
 * Only the relational query builder reads links, so there is no pair here.
 */
export const linkColumns = {
	id: true,
	profileId: true,
	type: true,
	title: true,
	url: true,
	sortOrder: true,
	isHidden: true,
} as const;
