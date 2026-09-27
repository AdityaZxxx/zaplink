import { createContext } from "@rinku/api/context";
import { appRouter } from "@rinku/api/routers/index";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

const handler = (req: NextRequest) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => createContext({ headers: req.headers }),
	});

export { handler as GET, handler as POST };
