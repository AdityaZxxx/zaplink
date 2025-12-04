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
		<Button
			ref={setNodeRef}
			style={style}
			className={cn(
				"group relative flex h-14 w-14 flex-col items-center justify-center rounded-xl border bg-zinc-900/50 transition-all hover:border-zinc-700 hover:bg-zinc-900",
				isDragging && "scale-110 border-primary bg-zinc-900 shadow-xl",
			)}
			{...attributes}
			{...listeners}
			onClick={onEdit}
		>
			{Icon && (
				<Icon className="h-6 w-6 text-zinc-400 transition-colors group-hover:text-white" />
			)}

			{/* Delete Badge (visible on hover) */}
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
				className="-top-2 -right-2 absolute flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-zinc-800 text-zinc-400 shadow-sm transition-colors hover:bg-red-500 hover:text-white"
				aria-label="Delete social link"
			>
				<span className="font-bold text-xs">×</span>
			</button>
		</Button>
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
		<div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg text-white">Social Icons</h3>
					<p className="text-sm text-zinc-500">
						Displayed in the header of your profile.
					</p>
				</div>
				<Button onClick={onAdd} size="sm" variant="outline" className="gap-2">
					<Plus className="h-4 w-4" /> Add Social
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
							<div className="flex h-14 w-full items-center justify-center rounded-xl border border-zinc-800 border-dashed text-sm text-zinc-600">
								No social icons added
							</div>
						)}
					</div>
				</SortableContext>
			</DndContext>
		</div>
	);
}
