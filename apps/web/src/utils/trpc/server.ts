import { createContext } from "@zaplink/api/context";
import { appRouter } from "@zaplink/api/routers/index";
import { headers } from "next/headers";

export async function trpcServer() {
	const nextHeaders = headers();
	const headerMap = new Headers(await nextHeaders);

	const ctx = await createContext({
		headers: headerMap,
	});

	return appRouter.createCaller(ctx);
}
