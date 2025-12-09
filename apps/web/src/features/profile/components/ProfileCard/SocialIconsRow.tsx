import type { links } from "@zaplink/db";
import { SUPPORT_PLATFORMS } from "@/lib/constants/SUPPORT_PLATFORMS";

type Link = typeof links.$inferSelect & {
	platform?: {
		name: string;
		category: string | null;
		iconUrl: string | null;
	} | null;
};

interface SocialIconsRowProps {
	links: Link[];
	onLinkClick?: (linkId: number) => void;
}

export function SocialIconsRow({ links, onLinkClick }: SocialIconsRowProps) {
	if (links.length === 0) return null;

	return (
		<div className="flex flex-wrap justify-center gap-3 px-4 py-2">
			{links.map((link) => {
				const platform = Object.values(SUPPORT_PLATFORMS).find(
					(p) => p.name === link.platform?.name,
				);
				const Icon = platform?.icon;

				if (!Icon) return null;

				return (
					<a
						key={link.id}
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						onClick={() => onLinkClick?.(link.id)}
						className="group flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50 text-muted-foreground transition-all hover:scale-110 hover:bg-background hover:text-foreground hover:shadow-md hover:ring-2 hover:ring-primary/20"
						title={link.title}
					>
						<Icon className="h-5 w-5" />
					</a>
				);
			})}
		</div>
	);
}
