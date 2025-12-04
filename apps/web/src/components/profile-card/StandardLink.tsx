import type { links } from "@zaplink/db";
import { Link2 } from "lucide-react";
import { SUPPORT_PLATFORMS } from "@/lib/constants/SUPPORT_PLATFORMS";

type Link = typeof links.$inferSelect & {
	platform?: {
		name: string;
		category: string | null;
		iconUrl: string | null;
	} | null;
	custom?: {
		displayMode: "standard" | "featured" | "grid" | null;
		title: string | null;
		iconUrl: string | null;
		thumbnailUrl: string | null;
	} | null;
};

interface StandardLinkProps {
	link: Link;
	onClick?: () => void;
}

export function StandardLink({ link, onClick }: StandardLinkProps) {
	// Determine Icon
	let Icon: React.ElementType = Link2;
	if (link.type === "platform" && link.platform?.name) {
		const platform = Object.values(SUPPORT_PLATFORMS).find(
			(p) => p.name === link.platform?.name,
		);
		if (platform) Icon = platform.icon;
	}

	return (
		<a
			href={link.url}
			target="_blank"
			rel="noopener noreferrer"
			onClick={onClick}
			className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border/50 bg-secondary/30 p-1.5 pr-4 transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/50 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
		>
			<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-border/50 transition-colors group-hover:border-primary/20 group-hover:text-primary">
				<Icon className="h-5 w-5 text-foreground transition-colors group-hover:text-primary" />
			</div>

			<div className="flex min-w-0 flex-1 flex-col justify-center">
				<span className="truncate font-semibold text-foreground/90 text-sm transition-colors group-hover:text-primary">
					{link.title}
				</span>
				{link.type === "custom" && (
					<span className="truncate text-[10px] text-muted-foreground/70">
						{link.url.replace(/^https?:\/\//, "")}
					</span>
				)}
			</div>
		</a>
	);
}
