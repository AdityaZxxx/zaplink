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
import type { ProfileLink } from "@/types/api";
import { EmptyLinksState } from "./EmptyLinksState";
import LinkItem from "./LinkItem";
import { LinksSection } from "./LinksSection";

interface ContentLinksManagerProps {
	links: ProfileLink[];
	onDragEnd: (event: DragEndEvent) => void;
	onUpdate: (id: number, data: Partial<ProfileLink>) => void;
	onDelete: (id: number) => void;
	onEdit: (link: ProfileLink) => void;
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
		<LinksSection
			title="Content blocks"
			description="Your main links, grids and featured items."
			actionLabel="Add block"
			onAdd={onAdd}
		>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={onDragEnd}
			>
				<SortableContext
					items={links.map((link) => link.id)}
					strategy={verticalListSortingStrategy}
				>
					{/*
					 * The gap lives here only. LinkItem also carried an mb-3, so
					 * every row was separated by 24px: 12 from the list and 12
					 * from the item that was already in a spaced list.
					 */}
					<div className="grid gap-3">
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
		</LinksSection>
	);
}
