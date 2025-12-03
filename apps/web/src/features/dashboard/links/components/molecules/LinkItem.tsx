"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { links } from "@zaplink/db";
import { GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Link = typeof links.$inferSelect;

interface LinkItemProps {
	link: Link;
	onUpdate: (id: number, data: Partial<Link>) => void;
	onDelete: (id: number) => void;
}

export default function LinkItem({ link, onUpdate, onDelete }: LinkItemProps) {
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

	const [isEditing, setIsEditing] = useState(false);
	const [title, setTitle] = useState(link.title);
	const [url, setUrl] = useState(link.url);

	const handleBlur = () => {
		if (title !== link.title || url !== link.url) {
			onUpdate(link.id, { title, url });
		}
	};

	const handleVisibilityChange = (checked: boolean) => {
		onUpdate(link.id, { isHidden: !checked });
	};

	return (
		<div ref={setNodeRef} style={style} className={cn("group relative mb-3")}>
			<div
				className={cn(
					"flex items-center gap-0 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md",
					isDragging &&
						"z-50 scale-105 opacity-90 shadow-xl ring-2 ring-primary/20",
					link.isHidden && "bg-muted/40 opacity-75",
				)}
			>
				{/* Drag Handle */}
				<div
					{...attributes}
					{...listeners}
					className="flex h-24 w-10 shrink-0 cursor-grab touch-none items-center justify-center border-r bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground active:cursor-grabbing"
				>
					<GripVertical className="h-5 w-5" />
				</div>

				{/* Content */}
				<div className="flex flex-1 items-center gap-4 p-4">
					<div className="flex-1 space-y-1">
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							onBlur={handleBlur}
							className="h-auto border-transparent bg-transparent p-0 font-semibold text-lg shadow-none hover:underline focus-visible:bg-transparent focus-visible:underline focus-visible:ring-0"
							placeholder="Link Title"
						/>
						<Input
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							onBlur={handleBlur}
							className="h-auto border-transparent bg-transparent p-0 text-muted-foreground text-sm shadow-none hover:text-foreground focus-visible:bg-transparent focus-visible:ring-0"
							placeholder="https://example.com"
						/>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-3 border-l pl-4">
						<Switch
							checked={!link.isHidden}
							onCheckedChange={handleVisibilityChange}
							aria-label="Toggle visibility"
							className="data-[state=checked]:bg-green-500"
						/>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onDelete(link.id)}
							className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
