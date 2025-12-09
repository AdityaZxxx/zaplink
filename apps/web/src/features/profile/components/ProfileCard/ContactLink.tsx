import type { links } from "@zaplink/db";
import { Contact, Globe, Mail, Phone } from "lucide-react";

type Link = typeof links.$inferSelect & {
	contact?: { type: string; value: string } | null;
};

interface ContactLinkProps {
	links: Link[];
	onLinkClick?: (linkId: number) => void;
}

export function ContactLink({ links, onLinkClick }: ContactLinkProps) {
	if (links.length === 0) return null;

	const getIcon = (type: string) => {
		switch (type) {
			case "email":
				return Mail;
			case "phone":
				return Phone;
			case "website":
				return Globe;
			default:
				return Contact;
		}
	};

	const getLabel = (type: string) => {
		switch (type) {
			case "email":
				return "Email";
			case "phone":
				return "Phone";
			case "website":
				return "Website";
			default:
				return "Contact";
		}
	};

	return (
		<div className="flex flex-wrap items-center justify-center gap-3">
			{links.map((link) => {
				const Icon = getIcon(link.contact?.type || "other");
				const label = getLabel(link.contact?.type || "other");
				return (
					<a
						key={link.id}
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						onClick={() => onLinkClick?.(link.id)}
						className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-sm transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-md active:scale-95"
						title={link.title}
					>
						<Icon className="h-4 w-4" />
						<span className="font-medium text-sm">{label}</span>
					</a>
				);
			})}
		</div>
	);
}
