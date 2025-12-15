"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	horizontalListSortingStrategy,
	SortableContext,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { linkPlatforms, links } from "@zaplink/db";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUPPORT_PLATFORMS } from "@/lib/constants/SUPPORT_PLATFORMS";
import { cn } from "@/lib/utils";

type Link = typeof links.$inferSelect & {
	platform?: typeof linkPlatforms.$inferSelect | null;
};

interface SocialsManagerProps {
	links: Link[];
	onDragEnd: (event: DragEndEvent) => void;
	onAdd: () => void;
	onEdit: (link: Link) => void;
	onDelete: (id: number) => void;
}

function SocialItem({
	link,
	onEdit,
	onDelete,
}: {
	link: Link;
	onEdit: () => void;
	onDelete: (id: number) => void;
}) {
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

	const platform = Object.values(SUPPORT_PLATFORMS).find(
		(p) => p.name === link.platform?.name,
	);
	const Icon = platform?.icon;

	return (
		// biome-ignore lint/a11y: cannot use button because of nested interactive elements
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"group relative flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-xl border border-border bg-card/50 transition-all hover:border-border/70 hover:bg-card",
				isDragging && "scale-110 border-primary bg-card shadow-xl",
			)}
			{...attributes}
			{...listeners}
			onClick={onEdit}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					onEdit();
				}
			}}
		>
			{Icon && (
				<Icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-foreground" />
			)}

			{/* Delete Badge */}
			<button
				type="button"
				tabIndex={0}
				onClick={(e) => {
					e.stopPropagation();
					onDelete(link.id);
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.stopPropagation();
						onDelete(link.id);
					}
				}}
				className="-top-2 -right-2 absolute flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
				aria-label="Delete social link"
			>
				<span className="font-bold text-xs">×</span>
			</button>
		</div>
	);
}

export function SocialsManager({
	links,
	onDragEnd,
	onAdd,
	onEdit,
	onDelete,
}: SocialsManagerProps) {
	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 10,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 250,
				tolerance: 5,
			},
		}),
		useSensor(KeyboardSensor),
	);

	return (
		<div className="rounded-2xl border border-border bg-card/50 p-6">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-foreground text-lg">
						Social Icons
					</h3>
					<p className="text-muted-foreground text-sm">
						Displayed in the header of your profile.
					</p>
				</div>
				<Button onClick={onAdd} size="sm" variant="outline" className="gap-2">
					<Plus className="h-4 w-4" />{" "}
					<span className="hidden md:inline">Add Social</span>
				</Button>
			</div>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={onDragEnd}
			>
				<SortableContext
					items={links.map((l) => l.id)}
					strategy={horizontalListSortingStrategy}
				>
					<div className="flex flex-wrap gap-3">
						{links.map((link) => (
							<SocialItem
								key={link.id}
								link={link}
								onEdit={() => onEdit(link)}
								onDelete={onDelete}
							/>
						))}
						{links.length === 0 && (
							<div className="flex h-14 w-full items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground text-sm">
								No social icons added
							</div>
						)}
					</div>
				</SortableContext>
			</DndContext>
		</div>
	);
}
