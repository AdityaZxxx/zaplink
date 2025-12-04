"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
	linkContacts,
	linkCustoms,
	linkPlatforms,
	links,
} from "@zaplink/db";
import {
	Contact,
	Grid,
	GripVertical,
	Link as LinkIcon,
	Mail,
	Pencil,
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
				return <platform.icon className="h-5 w-5 text-zinc-400" />;
			}
		}

		if (link.type === "contact" && link.contact?.type) {
			switch (link.contact.type) {
				case "email":
					return <Mail className="h-5 w-5 text-zinc-400" />;
				case "phone":
					return <Phone className="h-5 w-5 text-zinc-400" />;
				case "whatsapp":
					return <Smartphone className="h-5 w-5 text-zinc-400" />;
				default:
					return <Contact className="h-5 w-5 text-zinc-400" />;
			}
		}

		return <LinkIcon className="h-5 w-5 text-zinc-400" />;
	};

	return (
		<div ref={setNodeRef} style={style} className={cn("group relative mb-3")}>
			<Button
				className={cn(
					"flex items-center gap-0 overflow-hidden rounded-xl border bg-zinc-900/50 text-card-foreground shadow-sm transition-all hover:border-zinc-700 hover:bg-zinc-900",
					isDragging &&
						"z-50 scale-105 bg-zinc-900 opacity-90 shadow-xl ring-2 ring-primary/20",
					link.isHidden &&
						"border-zinc-800 border-dashed bg-zinc-900/30 opacity-75",
					link.custom?.displayMode === "featured" &&
						!link.isHidden &&
						"border-l-4 border-l-yellow-500 bg-zinc-900/80",
				)}
			>
				{/* Drag Handle */}
				<div
					{...attributes}
					{...listeners}
					className="flex h-24 w-10 shrink-0 cursor-grab touch-none items-center justify-center border-zinc-800 border-r bg-zinc-900/30 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-400 active:cursor-grabbing"
				>
					<GripVertical className="h-5 w-5" />
				</div>

				{/* Icon/Thumbnail Section */}
				<Button
					className="flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center border-zinc-800 border-r bg-zinc-900/20 p-2 transition-colors hover:bg-zinc-900/40"
					onClick={onEdit}
					onKeyDown={handleKeyDown}
					role="button"
					tabIndex={0}
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
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
							{getLinkIcon()}
						</div>
					)}
				</Button>

				{/* Content */}
				<Button
					className="flex flex-1 cursor-pointer flex-col justify-center gap-1 p-4"
					onClick={onEdit}
					onKeyDown={handleKeyDown}
					role="button"
					tabIndex={0}
				>
					<div className="flex items-center gap-2">
						<span className="truncate font-semibold text-lg text-zinc-200">
							{link.title}
						</span>
						{link.custom?.displayMode === "featured" && (
							<span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 font-medium text-[10px] text-yellow-500 uppercase tracking-wider">
								<Star className="h-3 w-3" /> Featured
							</span>
						)}
						{link.custom?.displayMode === "grid" && (
							<span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 font-medium text-[10px] text-blue-500 uppercase tracking-wider">
								<Grid className="h-3 w-3" /> Grid
							</span>
						)}
					</div>
					<span className="max-w-[300px] truncate text-sm text-zinc-500">
						{link.url}
					</span>
				</Button>

				{/* Actions */}
				<Button className="flex items-center gap-2 border-zinc-800 border-l pr-4 pl-4">
					<Switch
						checked={!link.isHidden}
						onCheckedChange={handleVisibilityChange}
						aria-label="Toggle visibility"
						className="data-[state=checked]:bg-green-500"
					/>
					<Button
						variant="ghost"
						size="icon"
						onClick={onEdit}
						className="h-8 w-8 text-zinc-500 hover:bg-zinc-800 hover:text-white"
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onDelete(link.id)}
						className="h-8 w-8 text-zinc-500 hover:bg-red-500/10 hover:text-red-500"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</Button>
			</Button>
		</div>
	);
}
