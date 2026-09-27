import {
	AddressBook,
	Envelope,
	Globe,
	Link as LinkIcon,
	Phone,
} from "@phosphor-icons/react";
import { SUPPORT_PLATFORMS } from "@/lib/constants/SUPPORT_PLATFORMS";
import type { LinkKind } from "@/types/api";

/**
 * The icon that stands for a link, by what the link *is* rather than by its
 * type. Platform rows get the brand mark, contact rows get the icon for their
 * contact kind, and only a plain URL falls back to the generic chain.
 *
 * Returning the component instead of a node leaves sizing and colour to the
 * caller, which is what let the dashboard and the links list disagree about
 * both before this was shared.
 */
export function iconForLink(link: LinkKind) {
	if (link.type === "platform" && link.platform?.name) {
		const platform = Object.values(SUPPORT_PLATFORMS).find(
			(candidate) => candidate.name === link.platform?.name,
		);
		if (platform) return platform.icon;
	}

	if (link.type === "contact" && link.contact?.type) {
		switch (link.contact.type) {
			case "email":
				return Envelope;
			case "phone":
				return Phone;
			case "website":
				return Globe;
			default:
				return AddressBook;
		}
	}

	return LinkIcon;
}
