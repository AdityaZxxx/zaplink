import { eq, profiles } from "@zaplink/db";
import type { Context } from "./context";

/*
 * Every link belongs to a profile, and a profile belongs to a user, so each
 * procedure that reads or writes links needs this id first. One lookup here
 * rather than the same six-line query pasted into every procedure, where a
 * change to the ownership rule would have to be found six times.
 */
export async function findProfileId(
	db: Context["db"],
	userId: string,
): Promise<number | null> {
	const [profile] = await db
		.select({ id: profiles.id })
		.from(profiles)
		.where(eq(profiles.userId, userId))
		.limit(1);

	return profile?.id ?? null;
}
