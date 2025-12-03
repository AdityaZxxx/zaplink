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
import type { links } from "@zaplink/db";
import { EmptyLinksState } from "../molecules/EmptyLinksState";
import LinkItem from "../molecules/LinkItem";

type Link = typeof links.$inferSelect;

interface LinksListProps {
	links: Link[];
	onDragEnd: (event: DragEndEvent) => void;
	onUpdate: (id: number, data: Partial<Link>) => void;
	onDelete: (id: number) => void;
}

export function LinksList({
	links,
	onDragEnd,
	onUpdate,
	onDelete,
}: LinksListProps) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	return (
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
						/>
					))}
					{links.length === 0 && <EmptyLinksState />}
				</div>
			</SortableContext>
		</DndContext>
	);
}
