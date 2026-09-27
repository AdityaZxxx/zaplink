import type { Icon } from "@phosphor-icons/react";
import {
	CreditCard,
	FileText,
	Flag,
	MagnifyingGlass,
	Shield,
	User,
} from "@phosphor-icons/react";

/** Sections a visitor can actually open. Each one maps to a `#id` deep link. */
export type SettingsSectionId = "account" | "seo" | "support-banner";

export type SettingsNavItem = {
	id: SettingsSectionId;
	title: string;
	icon: Icon;
	/**
	 * Drives the panel header rather than being written twice. The nav entry
	 * and the panel it opens can therefore never drift apart, which is what
	 * happened when each section component hard-coded its own heading.
	 */
	description: string;
};

/**
 * Sections the product has not built. They stay in the nav as a roadmap, but
 * they are not interactive and they have no panel: an item that navigates to
 * a "coming soon" placeholder is a promise the app cannot keep.
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

export const SETTINGS_NAV_GROUPS: SettingsNavGroup[] = [
	{
		label: "Your profile",
		items: [
			{
				id: "account",
				title: "Account",
				icon: User,
				description:
					"The name and address people use to find and recognise you.",
			},
			{
				id: "seo",
				title: "Search & SEO",
				icon: MagnifyingGlass,
				description:
					"Control the title and summary search engines show for your profile.",
			},
			{
				id: "support-banner",
				title: "Support Banner",
				icon: Flag,
				description:
					"Show a banner for a cause at the foot of your public profile.",
			},
		],
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

export const SETTINGS_SECTIONS: SettingsNavItem[] = SETTINGS_NAV_GROUPS.flatMap(
	(group) => group.items,
);

export const DEFAULT_SECTION_ID: SettingsSectionId = "account";

/**
 * id to title, for the controls that only ever receive the id as their value.
 * Derived rather than written out, so renaming a section cannot leave this
 * behind. Without it the mobile select trigger renders the raw id, "account".
 */
export const SECTION_TITLES = Object.fromEntries(
	SETTINGS_SECTIONS.map((section) => [section.id, section.title]),
) as Record<SettingsSectionId, string>;

export function isSettingsSectionId(
	value: unknown,
): value is SettingsSectionId {
	return SETTINGS_SECTIONS.some((section) => section.id === value);
}
