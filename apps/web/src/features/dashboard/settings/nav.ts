import type { Icon } from "@phosphor-icons/react";
import {
	CreditCard,
	FileText,
	Flag,
	MagnifyingGlass,
	Shield,
	User,
} from "@phosphor-icons/react";

export type SettingsSectionId = "account" | "seo" | "support-banner";

export type SettingsNavItem = {
	id: SettingsSectionId;
	title: string;
	icon: Icon;
	description: string;
};

/*
 * Planned sections stay in the nav as a roadmap, but are not interactive.
 */
export type PlannedNavItem = {
	id: string;
	title: string;
	icon: Icon;
	description: string;
};

export type SettingsNavGroup = {
	label: string;
	items: SettingsNavItem[];
};

/*
 * `satisfies` rather than an annotation, so a new id added to the union with
 * no content here fails the build instead of rendering an undefined section.
 */
export const SECTIONS = {
	account: {
		id: "account",
		title: "Account",
		icon: User,
		description: "The name and address people use to find and recognize you.",
	},
	seo: {
		id: "seo",
		title: "Search and SEO",
		icon: MagnifyingGlass,
		description:
			"Control the title and summary search engines show for your profile.",
	},
	"support-banner": {
		id: "support-banner",
		title: "Support banner",
		icon: Flag,
		description: "Show a banner for a cause at the foot of your public page.",
	},
} satisfies Record<SettingsSectionId, SettingsNavItem>;

const SECTION_ORDER = [
	"account",
	"seo",
	"support-banner",
] as const satisfies readonly SettingsSectionId[];

export const SETTINGS_NAV_GROUPS: SettingsNavGroup[] = [
	{
		label: "Your profile",
		items: SECTION_ORDER.map((id) => SECTIONS[id]),
	},
];

export const PLANNED_NAV_GROUP: PlannedNavItem[] = [
	{
		id: "billing",
		title: "Billing",
		icon: CreditCard,
		description: "Manage your billing information and subscription.",
	},
	{
		id: "terms",
		title: "Terms of Service",
		icon: FileText,
		description: "Read our terms and conditions.",
	},
	{
		id: "privacy",
		title: "Privacy Policy",
		icon: Shield,
		description: "Read our privacy policy.",
	},
];

export const SETTINGS_SECTIONS: SettingsNavItem[] = SECTION_ORDER.map(
	(id) => SECTIONS[id],
);

export const DEFAULT_SECTION_ID: SettingsSectionId = "account";

export function isSettingsSectionId(
	value: unknown,
): value is SettingsSectionId {
	return SECTION_ORDER.some((id) => id === value);
}
