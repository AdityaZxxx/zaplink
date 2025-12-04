"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type {
	linkContacts,
	linkCustoms,
	linkPlatforms,
	links,
} from "@zaplink/db";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyLinksState } from "../molecules/EmptyLinksState";
import LinkItem from "../molecules/LinkItem";

type Link = typeof links.$inferSelect & {
	platform?: typeof linkPlatforms.$inferSelect | null;
	custom?: typeof linkCustoms.$inferSelect | null;
	contact?: typeof linkContacts.$inferSelect | null;
};

interface ContentLinksManagerProps {
	links: Link[];
	onDragEnd: (event: DragEndEvent) => void;
	onUpdate: (id: number, data: Partial<Link>) => void;
	onDelete: (id: number) => void;
	onEdit: (link: Link) => void;
	onAdd: () => void;
}

export function ContentLinksManager({
	links,
	onDragEnd,
	onUpdate,
	onDelete,
	onEdit,
	onAdd,
}: ContentLinksManagerProps) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	return (
		<div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg text-white">Content Blocks</h3>
					<p className="text-sm text-zinc-500">
						Your main links, grids, and featured items.
					</p>
				</div>
				<Button
					onClick={onAdd}
					size="sm"
					className="gap-2 bg-white text-black hover:bg-zinc-200"
				>
					<Plus className="h-4 w-4" /> Add Block
				</Button>
			</div>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={onDragEnd}
			>
				<SortableContext
					items={links.map((l) => l.id)}
					strategy={verticalListSortingStrategy}
				>
					<div className="space-y-3">
						{links.map((link) => (
							<LinkItem
								key={link.id}
								link={link}
								onUpdate={onUpdate}
								onDelete={onDelete}
								onEdit={() => onEdit(link)}
							/>
						))}
						{links.length === 0 && <EmptyLinksState />}
					</div>
				</SortableContext>
			</DndContext>
		</div>
	);
}
