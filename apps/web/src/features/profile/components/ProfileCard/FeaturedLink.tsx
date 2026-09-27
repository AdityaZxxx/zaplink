import Image from "next/image";
import type { ProfileLink } from "@/types/api";

interface FeaturedLinkProps {
	link: ProfileLink;
	onClick?: () => void;
}

export function FeaturedLink({ link, onClick }: FeaturedLinkProps) {
	return (
		<a
			href={link.url}
			target="_blank"
			rel="noopener noreferrer"
			onClick={onClick}
			className="group relative block h-48 w-full overflow-hidden rounded-3xl shadow-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
		>
			{/* Background Image with Parallax Effect */}
			<div className="absolute inset-0 h-full w-full bg-zinc-800 transition-transform duration-700 group-hover:scale-110">
				{link.custom?.thumbnailUrl ? (
					<Image
						src={link.custom.thumbnailUrl}
						alt={link.title}
						fill
						className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-muted">
						<span className="text-4xl text-muted-foreground/20">
							{link.title.charAt(0)}
						</span>
					</div>
				)}
			</div>

			{/* Gradient Overlay */}
			<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

			{/* Content */}
			<div className="absolute inset-x-0 bottom-0 p-6">
				<div className="flex items-end justify-between gap-4">
					<div className="space-y-1">
						<h3 className="text-heading text-white">{link.title}</h3>
					</div>
				</div>
			</div>
		</a>
	);
}
