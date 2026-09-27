export {
	isSupportCauseId,
	SUPPORT_CAUSE_IDS,
	SUPPORT_CAUSES,
	type SupportCause,
	type SupportCauseId,
} from "./ProfileCard/causes";
export { default as ProfileCard } from "./ProfileCard/ProfileCard";

/**
 * The override that turns ProfileCard into a bare preview inside the
 * dashboard's phone frame. The frame supplies the radius, border and shadow,
 * so the card must not draw a second set. Written once because four pages
 * passed the same string and a fifth would be a copy of a copy.
 */
export const PROFILE_CARD_PREVIEW_CLASS =
	"h-full max-w-none rounded-none border-none shadow-none ring-0";
