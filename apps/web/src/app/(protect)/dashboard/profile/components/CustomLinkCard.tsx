import type { links } from "@zaplink/db";
import { Edit3, GripVertical, LinkIcon } from "lucide-react";

type Link = typeof links.$inferSelect;

export const CustomLinkCard = ({
	link,
	onClick,
	dragHandleAttributes,
	dragHandleListeners,
}: {
	link: Link;
	onClick: () => void;
	// biome-ignore lint: false positive
	dragHandleAttributes: any;
	// biome-ignore lint: false positive
	dragHandleListeners: any;
}) => {
	return (
		<div className="flex items-center gap-3 rounded-xl border bg-card p-2.5">
			<div
				{...dragHandleAttributes}
				{...dragHandleListeners}
				className="cursor-grab touch-none p-2"
			>
				<GripVertical className="h-5 w-5 text-muted-foreground" />
			</div>
			<button
				type="button"
				onClick={onClick}
				className="flex min-w-0 flex-1 items-center gap-3 text-left"
			>
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					<LinkIcon className="h-6 w-6 text-muted-foreground" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="truncate font-medium">{link.title}</div>
					<div className="truncate text-muted-foreground text-sm">
						{link.url}
					</div>
				</div>
				<div className="rounded-full p-1 text-muted-foreground">
					<Edit3 className="h-4 w-4" />
				</div>
			</button>
		</div>
	);
};
