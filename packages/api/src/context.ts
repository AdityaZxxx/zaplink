import { auth } from "@rinku/auth";
import { db } from "@rinku/db";
export type CreateContextOptions = {
	headers: Headers;
};

export async function createContext({ headers }: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: headers,
	});
	return {
		session,
		db,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
