import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "@zaplink/api/context";
import { appRouter } from "@zaplink/api/routers/index";
import type { NextRequest } from "next/server";

const handler = (req: NextRequest) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => createContext({ headers: req.headers }),
	});

export { handler as GET, handler as POST };
