import { protectedProcedure, publicProcedure, router } from "../index";
import { linksRouter } from "./links";
import { onboardingRouter } from "./onboarding";
import { profileRouter } from "./profile";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	profile: profileRouter,
	links: linksRouter,
	onboarding: onboardingRouter,
});
export type AppRouter = typeof appRouter;
