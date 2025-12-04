import type { links } from "@zaplink/db";
import { Contact, Globe, Mail, Phone, Smartphone } from "lucide-react";

type Link = typeof links.$inferSelect & {
	contact?: { type: string; value: string } | null;
};

interface ContactActionBarProps {
	links: Link[];
	onLinkClick?: (linkId: number) => void;
}

export function ContactActionBar({
	links,
	onLinkClick,
}: ContactActionBarProps) {
	if (links.length === 0) return null;

	const getIcon = (type: string) => {
		switch (type) {
			case "email":
				return Mail;
			case "phone":
				return Phone;
			case "whatsapp":
				return Smartphone;
			case "website":
				return Globe;
			default:
				return Contact;
		}
	};

	return (
		<div className="flex items-center justify-center gap-2">
			{links.map((link) => {
				const Icon = getIcon(link.contact?.type || "other");
				return (
					<a
						key={link.id}
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						onClick={() => onLinkClick?.(link.id)}
						className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110 hover:bg-primary/90 active:scale-95"
						title={link.title}
					>
						<Icon className="h-5 w-5" />
					</a>
				);
			})}
		</div>
	);
}
