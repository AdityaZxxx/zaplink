"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "@tanstack/react-query";
import type {
	linkContacts,
	linkCustoms,
	linkPlatforms,
	links,
} from "@zaplink/db";
import {
	BarChart3,
	Contact,
	Grid,
	GripVertical,
	Link as LinkIcon,
	Mail,
	Phone,
	Smartphone,
	Star,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SUPPORT_PLATFORMS } from "@/lib/constants/SUPPORT_PLATFORMS";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc/client";

// Extended Link type to include relations
type Link = typeof links.$inferSelect & {
	platform?: typeof linkPlatforms.$inferSelect | null;
	custom?: typeof linkCustoms.$inferSelect | null;
	contact?: typeof linkContacts.$inferSelect | null;
};

interface LinkItemProps {
	link: Link;
	onUpdate: (id: number, data: Partial<Link>) => void;
	onDelete: (id: number) => void;
	onEdit: () => void;
}

export default function LinkItem({
	link,
	onUpdate,
	onDelete,
	onEdit,
}: LinkItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: link.id });

	// Fetch click count for this link
	const { data: clickData } = useQuery(
		trpc.analytics.getLinkClickCount.queryOptions(
			{ linkId: link.id },
			{
				// Refetch every 30 seconds to keep data fresh
				refetchInterval: 30000,
				// Don't show error toast for this query
				meta: { silent: true },
			},
		),
	);

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 50 : "auto",
	};

	const handleVisibilityChange = (checked: boolean) => {
		onUpdate(link.id, { isHidden: !checked });
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			onEdit();
		}
	};

	// Helper to get icon based on link type
	const getLinkIcon = () => {
		if (link.type === "platform" && link.platform?.name) {
			const platform = Object.values(SUPPORT_PLATFORMS).find(
				(p) => p.name === link.platform?.name,
			);
			if (platform) {
				return <platform.icon className="h-5 w-5 text-muted-foreground" />;
			}
		}

		if (link.type === "contact" && link.contact?.type) {
			switch (link.contact.type) {
				case "email":
					return <Mail className="h-5 w-5 text-muted-foreground" />;
				case "phone":
					return <Phone className="h-5 w-5 text-muted-foreground" />;
				case "whatsapp":
					return <Smartphone className="h-5 w-5 text-muted-foreground" />;
				default:
					return <Contact className="h-5 w-5 text-muted-foreground" />;
			}
		}

		return <LinkIcon className="h-5 w-5 text-muted-foreground" />;
	};

	return (
		<div ref={setNodeRef} style={style} className={cn("group relative mb-3")}>
			<div
				className={cn(
					"flex flex-col items-stretch gap-0 overflow-hidden rounded-xl border border-border bg-card/50 text-card-foreground shadow-sm transition-all hover:border-border/70 hover:bg-card md:flex-row md:items-center",
					isDragging &&
						"z-50 scale-105 bg-card opacity-90 shadow-xl ring-2 ring-primary/20",
					link.isHidden && "border-border border-dashed bg-card/30 opacity-75",
				)}
			>
				<div className="flex flex-1 items-stretch">
					{/* Drag Handle */}
					<div
						{...attributes}
						{...listeners}
						className="flex w-8 shrink-0 cursor-grab touch-none items-center justify-center border-border border-r bg-muted/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing md:w-10"
					>
						<GripVertical className="h-4 w-4 md:h-5 md:w-5" />
					</div>

					{/* Icon/Thumbnail Section */}
					<button
						type="button"
						className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center border-border border-r bg-muted/20 p-2 transition-colors hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset md:h-24 md:w-24"
						onClick={onEdit}
						onKeyDown={handleKeyDown}
						aria-label="Edit link thumbnail"
					>
						{link.custom?.thumbnailUrl ? (
							<div className="relative h-full w-full overflow-hidden rounded-lg">
								<Image
									src={link.custom.thumbnailUrl}
									alt="Thumbnail"
									fill
									className="object-cover"
								/>
							</div>
						) : (
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted md:h-12 md:w-12">
								{getLinkIcon()}
							</div>
						)}
					</button>

					{/* Content */}
					<button
						type="button"
						className="flex min-w-0 flex-1 cursor-pointer flex-col justify-center gap-1 p-3 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset md:p-4"
						onClick={onEdit}
						onKeyDown={handleKeyDown}
						aria-label="Edit link details"
					>
						<div className="flex items-center gap-2">
							<span className="truncate font-semibold text-base text-foreground md:text-lg">
								{link.title}
							</span>
							{link.custom?.displayMode === "featured" && (
								<span className="flex shrink-0 items-center gap-1 rounded-full bg-yellow-500/10 px-1.5 py-0.5 font-medium text-[9px] text-yellow-500 uppercase tracking-wider md:px-2 md:text-[10px]">
									<Star className="h-2.5 w-2.5 md:h-3 md:w-3" />{" "}
									<span className="hidden sm:inline">Featured</span>
								</span>
							)}
							{link.custom?.displayMode === "grid" && (
								<span className="flex shrink-0 items-center gap-1 rounded-full bg-blue-500/10 px-1.5 py-0.5 font-medium text-[9px] text-blue-500 uppercase tracking-wider md:px-2 md:text-[10px]">
									<Grid className="h-2.5 w-2.5 md:h-3 md:w-3" />{" "}
									<span className="hidden sm:inline">Grid</span>
								</span>
							)}
						</div>
						<span className="max-w-[150px] truncate text-muted-foreground text-xs sm:max-w-[300px] md:text-sm">
							{link.url}
						</span>
					</button>
				</div>

				{/* Actions */}
				<div className="flex w-full items-center justify-end gap-4 border-border border-t bg-muted/20 px-4 py-2 md:w-auto md:justify-start md:border-t-0 md:border-l md:bg-transparent md:p-0 md:px-4">
					{clickData && clickData.clickCount > 0 && (
						<span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 font-medium text-[9px] text-emerald-500 uppercase tracking-wider md:px-2 md:text-[10px]">
							<BarChart3 className="h-4 w-4" />{" "}
							<span>{clickData.clickCount.toLocaleString()}</span>
						</span>
					)}
					<Switch
						checked={!link.isHidden}
						onCheckedChange={handleVisibilityChange}
						aria-label="Toggle visibility"
						className="scale-90 cursor-pointer data-[state=checked]:bg-green-500 md:scale-100"
					/>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onDelete(link.id)}
						className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
						aria-label="Delete link"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
