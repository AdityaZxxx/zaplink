"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
	PROFILE_CARD_PREVIEW_CLASS,
	ProfileCard,
} from "@/features/profile/components";
import type { LinksData, ProfileData, ProfileLink } from "@/types/api";
import { queryClient, trpc } from "@/utils/trpc/client";
import PageWithPreview from "../components/PageWithPreview";
import { type AddLinkData, AddLinkDialog } from "./components/AddLinkDialog";
import { ContactManager } from "./components/ContactManager";
import { ContentLinksManager } from "./components/ContentLinksManager";
import { EditLinkSheet, type LinkUpdate } from "./components/EditLinkSheet";
import { SocialsManager } from "./components/SocialsManager";

export type AddLinkType = "custom" | "platform" | "contact";

const linksQueryKey = trpc.links.getAllLinks.queryOptions().queryKey;

interface LinksPageProps {
	initialProfile: ProfileData;
	initialLinks: LinksData;
}

export default function LinksPage({
	initialProfile,
	initialLinks,
}: LinksPageProps) {
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [editingLink, setEditingLink] = useState<ProfileLink | null>(null);
	const [addLinkType, setAddLinkType] = useState<AddLinkType>("custom");

	const { data: fetchedProfile } = useQuery({
		...trpc.profile.getProfile.queryOptions(),
		initialData: initialProfile,
	});

	// Null only if the profile is deleted mid-session, where the last row
	// this page already rendered beats no row at all.
	const profile = fetchedProfile ?? initialProfile;

	const { data: links = initialLinks } = useQuery({
		...trpc.links.getAllLinks.queryOptions(),
		initialData: initialLinks,
	});

	const createLinkMutation = useMutation(
		trpc.links.createLink.mutationOptions({
			onSuccess: () => {
				setIsAddOpen(false);
				toast.success("Link added");
			},
			onSettled: () => {
				queryClient.invalidateQueries(trpc.links.getAllLinks.queryOptions());
			},
		}),
	);

	const updateLinkMutation = useMutation(
		trpc.links.updateLink.mutationOptions({
			/*
			 * Only top-level columns land optimistically: displayMode and
			 * thumbnailUrl sit under `custom`, so they arrive with the onSettled
			 * refetch.
			 */
			onMutate: async (next) => {
				await queryClient.cancelQueries({ queryKey: linksQueryKey });
				const previous = queryClient.getQueryData(linksQueryKey);
				queryClient.setQueryData(linksQueryKey, (current) =>
					current?.map((link) =>
						link.id === next.id ? { ...link, ...next } : link,
					),
				);
				return { previous };
			},
			onError: (error, _variables, context) => {
				toast.error(error.message);
				if (context?.previous) {
					queryClient.setQueryData(linksQueryKey, context.previous);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries(trpc.links.getAllLinks.queryOptions());
			},
		}),
	);

	const deleteLinkMutation = useMutation(
		trpc.links.deleteLink.mutationOptions({
			onSuccess: () => {
				toast.success("Link deleted");
			},
			onSettled: () => {
				queryClient.invalidateQueries(trpc.links.getAllLinks.queryOptions());
			},
		}),
	);

	const reorderLinksMutation = useMutation(
		trpc.links.updateLinksOrder.mutationOptions(),
	);

	function handleDragEnd(event: DragEndEvent, items: ProfileLink[]) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = items.findIndex((item) => item.id === active.id);
		const newIndex = items.findIndex((item) => item.id === over.id);
		const reordered = arrayMove(items, oldIndex, newIndex);

		reorderLinksMutation.mutate({
			orderedIds: reordered.map((item) => item.id),
		});
	}

	function handleUpdate(id: number, data: Partial<ProfileLink> | LinkUpdate) {
		updateLinkMutation.mutate({ id, ...data });
	}

	function handleAddLink(data: AddLinkData) {
		createLinkMutation.mutate(data);
	}

	function openAddDialog(type: AddLinkType) {
		setAddLinkType(type);
		setIsAddOpen(true);
	}

	const socialLinks = links.filter(
		(link) => link.type === "platform" && link.platform?.category === "social",
	);
	const contactLinks = links.filter((link) => link.type === "contact");
	const contentLinks = links.filter(
		(link) => link.type !== "contact" && !socialLinks.includes(link),
	);

	return (
		<PageWithPreview
			preview={
				<ProfileCard
					profile={profile}
					links={links.filter((link) => !link.isHidden)}
					className={PROFILE_CARD_PREVIEW_CLASS}
				/>
			}
		>
			{/* pb-20, not pb-20 alone at every width: the preview button is
			    hidden at lg, so the reserved space is only needed below it. */}
			<div className="space-y-6 pb-20 lg:space-y-8 lg:pb-0">
				<div className="space-y-1">
					<h1 className="text-title">Links</h1>
					<p className="text-muted-foreground">
						Everything on your public page, grouped by where it shows up.
					</p>
				</div>

				<SocialsManager
					links={socialLinks}
					onDragEnd={(event) => handleDragEnd(event, socialLinks)}
					onAdd={() => openAddDialog("platform")}
					onEdit={setEditingLink}
					onDelete={(id) => deleteLinkMutation.mutate({ id })}
				/>

				<ContentLinksManager
					links={contentLinks}
					onDragEnd={(event) => handleDragEnd(event, contentLinks)}
					onAdd={() => openAddDialog("custom")}
					onEdit={setEditingLink}
					onUpdate={handleUpdate}
					onDelete={(id) => deleteLinkMutation.mutate({ id })}
				/>

				<ContactManager
					links={contactLinks}
					onAdd={() => openAddDialog("contact")}
					onEdit={setEditingLink}
					onDelete={(id) => deleteLinkMutation.mutate({ id })}
				/>

				<AddLinkDialog
					isOpen={isAddOpen}
					onOpenChange={setIsAddOpen}
					onAddLink={handleAddLink}
					isSubmitting={createLinkMutation.isPending}
					initialTab={addLinkType}
				/>

				<EditLinkSheet
					link={editingLink}
					isOpen={!!editingLink}
					onOpenChange={(open) => !open && setEditingLink(null)}
					onUpdate={handleUpdate}
				/>
			</div>
		</PageWithPreview>
	);
}
