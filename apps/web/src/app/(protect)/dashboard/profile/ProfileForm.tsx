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
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "@tanstack/react-query";
import type { links, profiles } from "@zaplink/db";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { queryClient, trpc } from "@/utils/trpc/client";
import { SUPPORT_PLATFORMS } from "../../../../lib/constants/SUPPORT_PLATFORMS";
import { CustomLinkCard } from "./components/CustomLinkCard";
import { LinkEditModal } from "./components/LinkModal";
import { ProfileEditor } from "./components/ProfileEditor";
import { SocialPlatformCard } from "./components/SocialPlatformCard";

type Profile = typeof profiles.$inferSelect;
type Link = typeof links.$inferSelect;
type SupportedPlatform = keyof typeof SUPPORT_PLATFORMS;

type LinkModalState = {
	isOpen: boolean;
	mode: "add" | "edit";
	platform?: SupportedPlatform;
	link?: Link;
};

type AddLinkTypeModalState = {
	isOpen: boolean;
};

const SortableItem = ({
	link,
	openModal,
}: {
	link: Link;
	openModal: (
		mode: "edit",
		platform: SupportedPlatform | undefined,
		link: Link,
	) => void;
}) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: link.id });
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const supportedPlatformKeys = Object.keys(SUPPORT_PLATFORMS);
	const platform = link.title.toLowerCase() as SupportedPlatform;
	const isSupported = supportedPlatformKeys.includes(platform);

	return (
		<div ref={setNodeRef} style={style}>
			{isSupported ? (
				<SocialPlatformCard
					platform={platform}
					existingLink={link}
					onClick={() => openModal("edit", platform, link)}
					dragHandleListeners={listeners}
					dragHandleAttributes={attributes}
				/>
			) : (
				<CustomLinkCard
					existingLink={link}
					onClick={() => openModal("edit", undefined, link)}
					dragHandleListeners={listeners}
					dragHandleAttributes={attributes}
				/>
			)}
		</div>
	);
};

const SocialLinks = ({ links }: { links: Link[] }) => {
	const [linkModalState, setLinkModalState] = useState<LinkModalState>({
		isOpen: false,
		mode: "add",
	});
	const [addLinkTypeModalState, setAddLinkTypeModalState] =
		useState<AddLinkTypeModalState>({
			isOpen: false,
		});
	const [orderedLinks, setOrderedLinks] = useState<Link[]>(() =>
		[...links].sort((a, b) => a.sortOrder - b.sortOrder),
	);

	useEffect(() => {
		setOrderedLinks([...links].sort((a, b) => a.sortOrder - b.sortOrder));
	}, [links]);

	const { mutate: updateOrder } = useMutation(
		trpc.links.updateLinksOrder.mutationOptions({
			onSuccess: () => {
				toast.success("Link order updated");
				queryClient.invalidateQueries(trpc.links.getAllLinks.queryFilter());
			},
			onError: (error) => {
				toast.error("Failed to update order", { description: error.message });
			},
		}),
	);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = orderedLinks.findIndex((item) => item.id === active.id);
			const newIndex = orderedLinks.findIndex((item) => item.id === over.id);

			const newOrder = arrayMove(orderedLinks, oldIndex, newIndex);
			setOrderedLinks(newOrder);

			const orderedIds = newOrder.map((item) => item.id);
			updateOrder({ orderedIds });
		}
	};

	const openLinkModal = (
		mode: "add" | "edit",
		platform?: SupportedPlatform,
		link?: Link,
	) => {
		setLinkModalState({ isOpen: true, mode, platform, link });
	};

	const openAddLinkTypeModal = () => {
		setAddLinkTypeModalState({ isOpen: true });
	};

	const closeAddLinkTypeModal = () =>
		setAddLinkTypeModalState({ isOpen: false });

	const handleSelectLinkType = (type: "custom" | SupportedPlatform) => {
		if (type === "custom") {
			openLinkModal("add");
		} else {
			openLinkModal("add", type);
		}
		closeAddLinkTypeModal();
	};

	const closeLinkModal = () =>
		setLinkModalState({ isOpen: false, mode: "add" });

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-semibold text-lg">Your Links</h2>
					<p className="text-muted-foreground text-sm">
						Drag and drop to reorder your links.
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={openAddLinkTypeModal}
					className="gap-2"
				>
					<Plus className="h-4 w-4" />
					Add Link
				</Button>
			</div>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={orderedLinks.map((link) => link.id)}
					strategy={verticalListSortingStrategy}
				>
					<div className="space-y-3">
						{orderedLinks.map((link) => (
							<SortableItem
								key={link.id}
								link={link}
								openModal={openLinkModal}
							/>
						))}
					</div>
				</SortableContext>
			</DndContext>

			<LinkEditModal {...linkModalState} onClose={closeLinkModal} />
			{/* <AddLinkTypeModal
				{...addLinkTypeModalState}
				onClose={closeAddLinkTypeModal}

				onSelectLinkType={handleSelectLinkType}
			/> */}
		</div>
	);
};

export default function ProfileForm({
	profile,
	links,
}: {
	profile: Profile;
	links: Link[];
}) {
	return (
		<div className="space-y-6">
			<ProfileEditor profile={profile} />
			<SocialLinks links={links} />
		</div>
	);
}
