import { router } from "../index";
import { analyticsRouter } from "./analytics";
import { linksRouter } from "./links";
import { onboardingRouter } from "./onboarding";
import { profileRouter } from "./profile";

export const appRouter = router({
	profile: profileRouter,
	links: linksRouter,
	onboarding: onboardingRouter,
	analytics: analyticsRouter,
});
export type AppRouter = typeof appRouter;
