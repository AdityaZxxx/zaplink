import { auth } from "@zaplink/auth";
import { db } from "@zaplink/db";
import type { Context as ElysiaContext } from "elysia";

export type CreateContextOptions = {
	context: ElysiaContext;
};

export async function createContext({ context }: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: context.request.headers,
	});
	return {
		session,
		db,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
