import {
	AddressBook,
	Envelope,
	Globe,
	Link as LinkIcon,
	Phone,
} from "@phosphor-icons/react";
import { SUPPORT_PLATFORMS } from "@/lib/constants/SUPPORT_PLATFORMS";
import type { LinkKind } from "@/types/api";

/*
 * Returns the component rather than a node, so sizing and colour stay
 * with the caller.
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
