"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	ChartBar,
	DotsSixVertical,
	SquaresFour,
	Star,
	Trash,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import Image from "next/image";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { ProfileLink } from "@/types/api";
import { trpc } from "@/utils/trpc/client";
import { iconForLink } from "../lib/linkIcon";

interface LinkItemProps {
	link: ProfileLink;
	onUpdate: (id: number, data: Partial<ProfileLink>) => void;
	onDelete: (id: number) => void;
	onEdit: () => void;
}

function ModeBadge({
	icon: Icon,
	label,
}: {
	icon: typeof Star;
	label: string;
}) {
	return (
		<span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-caption text-muted-foreground">
			<Icon aria-hidden className="size-3" />
			{label}
		</span>
	);
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

	const { data: clickData } = useQuery(
		trpc.analytics.getLinkClickCount.queryOptions(
			{ linkId: link.id },
			{
				refetchInterval: 30000,
				// silent: a failed count should not interrupt editing.
				meta: { silent: true },
			},
		),
	);

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 50 : "auto",
	};

	const Icon = iconForLink(link);
	const isHidden = link.isHidden;
	const visibilityId = useId();

	return (
		<div ref={setNodeRef} style={style} className="group relative">
			<div
				className={cn(
					"flex flex-col items-stretch overflow-hidden rounded-2xl border border-border bg-card text-card-foreground transition-[border-color,background-color,box-shadow] duration-150 ease-out md:flex-row md:items-center",
					"hover:border-ring/40",
					isDragging &&
						"z-50 scale-[1.02] border-ring bg-card shadow-lg ring-2 ring-ring/20",
					isHidden && "border-dashed bg-card/40",
				)}
			>
				<div className="flex flex-1 items-stretch">
					<div
						{...attributes}
						{...listeners}
						className="flex w-8 shrink-0 cursor-grab touch-none items-center justify-center border-border border-r bg-muted/30 text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground active:cursor-grabbing md:w-10"
					>
						<DotsSixVertical aria-hidden className="size-4 md:size-5" />
						<span className="sr-only">Reorder {link.title}</span>
					</div>

					<button
						type="button"
						onClick={onEdit}
						className="flex min-w-0 flex-1 cursor-pointer items-stretch text-left outline-none has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40 has-[:focus-visible]:ring-inset"
					>
						<span
							className={cn(
								"flex size-20 shrink-0 items-center justify-center border-border border-r bg-muted/30 md:size-24",
								link.custom?.thumbnailUrl && "p-2",
							)}
						>
							{link.custom?.thumbnailUrl ? (
								<span className="relative size-full overflow-hidden rounded-lg">
									<Image
										src={link.custom.thumbnailUrl}
										alt=""
										fill
										sizes="96px"
										className="object-cover"
									/>
								</span>
							) : (
								<Icon aria-hidden className="size-5 text-muted-foreground" />
							)}
						</span>

						<span className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3 md:p-4">
							<span className="flex items-center gap-2">
								<span className="truncate font-semibold text-body-lg md:text-heading">
									{link.title}
								</span>
								{link.custom?.displayMode === "featured" && (
									<ModeBadge icon={Star} label="Featured" />
								)}
								{link.custom?.displayMode === "grid" && (
									<ModeBadge icon={SquaresFour} label="Grid" />
								)}
								{isHidden && (
									<span className="flex shrink-0 items-center rounded-full border border-border border-dashed px-2 py-0.5 font-medium text-caption text-muted-foreground">
										Hidden
									</span>
								)}
							</span>
							<span className="max-w-[150px] truncate text-caption text-muted-foreground sm:max-w-[300px] md:text-body">
								{link.url}
							</span>
						</span>
					</button>
				</div>

				<div className="flex w-full items-center justify-end gap-3 border-border border-t bg-muted/20 px-4 py-2 md:w-auto md:border-t-0 md:border-l md:bg-transparent md:py-0 md:pr-4 md:pl-4">
					{clickData && clickData.clickCount > 0 && (
						<span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-caption text-muted-foreground tabular-nums">
							<ChartBar aria-hidden className="size-3" />
							{clickData.clickCount.toLocaleString()}
							<span className="sr-only">clicks</span>
						</span>
					)}
					<label
						htmlFor={visibilityId}
						className="flex cursor-pointer items-center gap-2"
					>
						<span className="text-caption text-muted-foreground">
							Show on page
						</span>
						<Switch
							id={visibilityId}
							checked={!isHidden}
							onCheckedChange={(checked) =>
								onUpdate(link.id, { isHidden: !checked })
							}
						/>
					</label>
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={() => onDelete(link.id)}
						className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
						aria-label={`Delete ${link.title}`}
					>
						<Trash className="size-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
