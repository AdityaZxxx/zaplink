import type { Icon } from "@phosphor-icons/react";
import { HandHeart, Heart, Leaf, Users } from "@phosphor-icons/react";

export type SupportCause =
	| "none"
	| "stop_genocide"
	| "black_lives_matter"
	| "climate_action"
	| "mental_health";

/** The causes a visitor can actually pick. "none" is the off state, not a pick. */
export type SupportCauseId = Exclude<SupportCause, "none">;

export type SupportCauseContent = {
	title: string;
	description: string;
	icon: Icon;
	/** Solid fill used for the banner, and for the swatch in the settings picker. */
	color: string;
	textColor: string;
	link: string;
};

/**
 * Single source of truth for the causes. SupportBanner renders one of these on
 * the public profile, and the settings picker renders all of them, so both
 * sides of the toggle are guaranteed to describe the same thing.
 */
export const SUPPORT_CAUSES: Record<SupportCauseId, SupportCauseContent> = {
	stop_genocide: {
		title: "Stop Genocide",
		description: "Support humanitarian aid and global peace efforts.",
		icon: HandHeart,
		color: "bg-red-500",
		textColor: "text-white",
		link: "https://www.un.org/en/genocideprevention/",
	},
	black_lives_matter: {
		title: "Black Lives Matter",
		description: "Support the movement for racial justice and equality.",
		icon: Users,
		color: "bg-zinc-900",
		textColor: "text-white",
		link: "https://blacklivesmatter.com/",
	},
	climate_action: {
		title: "Climate Action",
		description: "Take action to protect our planet and future.",
		icon: Leaf,
		color: "bg-emerald-600",
		textColor: "text-white",
		link: "https://www.un.org/en/climatechange",
	},
	mental_health: {
		title: "Mental Health Awareness",
		description: "Prioritize mental well-being and support others.",
		icon: Heart,
		color: "bg-indigo-600",
		textColor: "text-white",
		link: "https://www.who.int/health-topics/mental-health",
	},
};

/**
 * Declaration order, not object key order, is what the picker lays out. Kept
 * explicit so a future key added to the map cannot silently reshuffle the grid.
 */
export const SUPPORT_CAUSE_IDS = [
	"stop_genocide",
	"black_lives_matter",
	"climate_action",
	"mental_health",
] as const satisfies readonly SupportCauseId[];

export function isSupportCauseId(value: unknown): value is SupportCauseId {
	return (
		typeof value === "string" &&
		Object.hasOwn(SUPPORT_CAUSES, value as SupportCauseId)
	);
}
