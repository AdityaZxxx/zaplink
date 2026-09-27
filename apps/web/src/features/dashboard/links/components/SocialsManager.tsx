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
import { Trash } from "@phosphor-icons/react";
import { cn } from "cn";
import type { ProfileLink } from "@/types/api";
import { iconForLink } from "../lib/linkIcon";
import { LinksSection } from "./LinksSection";

interface SocialsManagerProps {
	links: ProfileLink[];
	onDragEnd: (event: DragEndEvent) => void;
	onAdd: () => void;
	onEdit: (link: ProfileLink) => void;
	onDelete: (id: number) => void;
}

function SocialItem({
	link,
	onEdit,
	onDelete,
}: {
	link: ProfileLink;
	onEdit: () => void;
	onDelete: () => void;
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
		transform: CSS.Translate.toString(transform),
		transition: isDragging ? undefined : transition,
		zIndex: isDragging ? 50 : "auto",
	};

	const Icon = iconForLink(link);

	return (
		/*
		 * Not a native button: the KeyboardSensor claims Enter and Space to
		 * start a drag, and a button would activate on the same keys.
		 */
		<div className="group/item relative">
			{/* biome-ignore lint/a11y/useSemanticElements: a native button would activate on the same keys the dnd-kit KeyboardSensor uses to start a drag. */}
			<div
				ref={setNodeRef}
				style={style}
				className={cn(
					"relative flex size-14 cursor-pointer flex-col items-center justify-center rounded-2xl border border-border bg-card transition-[border-color,background-color,box-shadow] duration-150 ease-out hover:border-ring/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
					isDragging && "z-50 scale-105 border-ring bg-card shadow-lg",
				)}
				{...attributes}
				{...listeners}
				onClick={onEdit}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						onEdit();
					}
				}}
				role="button"
				tabIndex={0}
				aria-label={`Edit ${link.title}`}
			>
				<Icon
					aria-hidden
					className="size-6 text-muted-foreground transition-colors duration-150 ease-out group-hover/item:text-foreground"
				/>
			</div>

			{/*
			 * Always visible below md: opacity leaves a control in the tap order, so a
			 * hover-only button would be tappable while invisible.
			 */}
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onDelete();
				}}
				className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-100 shadow-sm transition-[opacity,color,background-color] duration-150 ease-out hover:bg-destructive hover:text-destructive-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 md:opacity-0 md:group-hover/item:opacity-100"
				aria-label={`Delete ${link.title}`}
			>
				<Trash aria-hidden className="size-3" />
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
		<LinksSection
			title="Social icons"
			description="Shown in the header of your profile."
			actionLabel="Add social"
			onAdd={onAdd}
		>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={onDragEnd}
			>
				<SortableContext
					items={links.map((link) => link.id)}
					strategy={horizontalListSortingStrategy}
				>
					{links.length === 0 ? (
						<p className="rounded-2xl border border-border border-dashed px-4 py-6 text-center text-muted-foreground text-sm">
							No social icons yet. Add one to appear under your name.
						</p>
					) : (
						<div className="flex flex-wrap gap-3">
							{links.map((link) => (
								<SocialItem
									key={link.id}
									link={link}
									onEdit={() => onEdit(link)}
									onDelete={() => onDelete(link.id)}
								/>
							))}
						</div>
					)}
				</SortableContext>
			</DndContext>
		</LinksSection>
	);
}
