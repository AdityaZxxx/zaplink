import type { links } from "@zaplink/db";
import Image from "next/image";

type Link = typeof links.$inferSelect & {
	custom?: {
		displayMode: "standard" | "featured" | "grid" | null;
		title: string | null;
		iconUrl: string | null;
		thumbnailUrl: string | null;
	} | null;
};

interface GridLinkProps {
	link: Link;
	onClick?: () => void;
}

export function GridLink({ link, onClick }: GridLinkProps) {
	return (
		<a
			href={link.url}
			target="_blank"
			rel="noopener noreferrer"
			onClick={onClick}
			className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
		>
			{/* Thumbnail */}
			<div className="absolute inset-0 h-full w-full bg-zinc-800">
				{link.custom?.thumbnailUrl ? (
					<Image
						src={link.custom.thumbnailUrl}
						alt={link.title}
						fill
						className="object-cover transition-transform duration-500 group-hover:scale-110"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-muted">
						<span className="font-bold text-4xl text-muted-foreground/20">
							{link.title.charAt(0)}
						</span>
					</div>
				)}
			</div>

			{/* Overlay & Content */}
			<div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/80 via-transparent to-transparent p-3 opacity-90 transition-opacity group-hover:opacity-100">
				<div className="flex items-center justify-between gap-2">
					<span className="truncate font-medium text-white text-xs">
						{link.title}
					</span>
				</div>
			</div>
		</a>
	);
}
