import { z } from "zod";

/*
 * The limits are the column widths in `profiles.display_name` and
 * `profiles.username` (both varchar(30)), narrower than the ceilings the
 * updateProfile procedure accepts, so an over-long value fails on insert.
 * Widening the column is the real fix, and it is a migration.
 */
export const DISPLAY_NAME_MAX = 30;
export const USERNAME_MAX = 30;
export const BIO_MAX = 160;

export const displayNameRule = z
	.string()
	.min(1, "Enter a display name")
	.max(
		DISPLAY_NAME_MAX,
		`Shorten the display name to ${DISPLAY_NAME_MAX} characters or fewer`,
	);

export const usernameRule = z
	.string()
	.min(3, "Use at least 3 characters for the username")
	.max(
		USERNAME_MAX,
		`Shorten the username to ${USERNAME_MAX} characters or fewer`,
	);

export const bioRule = z
	.string()
	.max(BIO_MAX, `Shorten the bio to ${BIO_MAX} characters or fewer`)
	.optional();

/** Every field the profile form edits. */
export const profileFormSchema = z.object({
	displayName: displayNameRule,
	username: usernameRule,
	bio: bioRule,
	avatarUrl: z.string().optional(),
	bannerUrl: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

/**
 * The subset the account section writes, derived rather than restated so a
 * limit changed in one place cannot be missed in the other.
 */
export const accountFormSchema = profileFormSchema.pick({
	displayName: true,
	username: true,
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;
