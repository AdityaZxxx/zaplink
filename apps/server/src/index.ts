import { cors } from "@elysiajs/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "@zaplink/api/context";
import { appRouter } from "@zaplink/api/routers/index";
import { auth } from "@zaplink/auth";
import "dotenv/config";
import { Elysia } from "elysia";

// const PORT = process.env.PORT || 3000;

const app = new Elysia()
	.use(
		cors({
			origin: process.env.CORS_ORIGIN || "",
			methods: ["GET", "POST", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.all("/api/auth/*", async (context) => {
		const { request, status } = context;
		if (["POST", "GET"].includes(request.method)) {
			return auth.handler(request);
		}
		return status(405);
	})
	.all("/trpc/*", async (context) => {
		const res = await fetchRequestHandler({
			endpoint: "/trpc",
			router: appRouter,
			req: context.request,
			createContext: () => createContext({ context }),
		});
		return res;
	})
	.get("/", () => "OK");
// .listen(PORT, () => {
// 	console.log(`Server is running on ${PORT}`);
// });

export default app;
