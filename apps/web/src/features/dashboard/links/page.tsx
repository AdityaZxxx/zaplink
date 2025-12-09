"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
	linkContacts,
	linkCustoms,
	linkPlatforms,
	links,
} from "@zaplink/db";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProfileCard } from "@/features/profile/components";
import { queryClient, trpc } from "@/utils/trpc/client";
import PageWithPreview from "../components/PageWithPreview";
import { AddLinkDialog } from "./components/AddLinkDialog";
import { ContactManager } from "./components/ContactManager";
import { ContentLinksManager } from "./components/ContentLinksManager";
import { EditLinkSheet } from "./components/EditLinkSheet";
import { SocialsManager } from "./components/SocialsManager";

type Link = typeof links.$inferSelect & {
	platform?: typeof linkPlatforms.$inferSelect | null;
	custom?: typeof linkCustoms.$inferSelect | null;
	contact?: typeof linkContacts.$inferSelect | null;
};

export default function LinksPage() {
	const router = useRouter();
	const [localLinks, setLocalLinks] = useState<Link[]>([]);
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [editingLink, setEditingLink] = useState<Link | null>(null);
	const [addLinkType, setAddLinkType] = useState<
		"custom" | "platform" | "contact"
	>("custom");

	const { data: profile, isLoading: isLoadingProfile } = useQuery(
		trpc.profile.getProfile.queryOptions(),
	);

	const { data: fetchedLinks, isLoading: isLoadingLinks } = useQuery(
		trpc.links.getAllLinks.queryOptions(),
	);

	// Sync local state with fetched links
	useEffect(() => {
		if (fetchedLinks) {
			setLocalLinks(
				fetchedLinks.map((link) => ({
					...link,
					createdAt: new Date(link.createdAt),
					updatedAt: new Date(link.updatedAt),
				})) as Link[],
			);
		}
	}, [fetchedLinks]);

	useEffect(() => {
		if (!isLoadingProfile && !profile) {
			router.push("/onboarding");
		}
	}, [profile, isLoadingProfile, router]);

	const createLinkMutation = useMutation(
		trpc.links.createLink.mutationOptions({
			onSuccess: (newLink) => {
				if (!newLink) return;
				setLocalLinks((prev) => [
					...prev,
					{
						...newLink,
						createdAt: new Date(newLink.createdAt),
						updatedAt: new Date(newLink.updatedAt),
					} as Link,
				]);
				setIsAddOpen(false);
				toast.success("Link created");
				queryClient.invalidateQueries(trpc.links.getAllLinks.queryOptions());
			},
		}),
	);

	const updateLinkMutation = useMutation(
		trpc.links.updateLink.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.links.getAllLinks.queryOptions());
			},
		}),
	);

	const deleteLinkMutation = useMutation(
		trpc.links.deleteLink.mutationOptions({
			onSuccess: (deletedLink) => {
				setLocalLinks((prev) => prev.filter((l) => l.id !== deletedLink.id));
				toast.success("Link deleted");
				queryClient.invalidateQueries(trpc.links.getAllLinks.queryOptions());
			},
		}),
	);

	const reorderLinksMutation = useMutation(
		trpc.links.updateLinksOrder.mutationOptions({
			onSuccess: () => {
				// Silent success
			},
		}),
	);

	// Handlers
	const handleDragEnd = (event: DragEndEvent, items: Link[]) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = items.findIndex((item) => item.id === active.id);
			const newIndex = items.findIndex((item) => item.id === over.id);
			const newOrderedItems = arrayMove(items, oldIndex, newIndex);

			// Update local state
			setLocalLinks((prev) => {
				const otherLinks = prev.filter(
					(l) => !items.find((i) => i.id === l.id),
				);
				return [...otherLinks, ...newOrderedItems];
			});

			// Sync with server (only for this zone)
			reorderLinksMutation.mutate({
				orderedIds: newOrderedItems.map((item) => item.id),
			});
		}
	};

	const handleUpdate = (id: number, data: Partial<Link>) => {
		// Optimistic update
		setLocalLinks((prev) =>
			prev.map((l) => (l.id === id ? { ...l, ...data } : l)),
		);
		updateLinkMutation.mutate({ id, ...data });
	};

	const handleDelete = (id: number) => {
		deleteLinkMutation.mutate({ id });
	};

	const handleAddLink = (data: any) => {
		createLinkMutation.mutate({
			title: data.title,
			url: data.url,
			type: data.type,
			platformName: data.platformName,
			displayMode: data.displayMode,
			thumbnailUrl: data.thumbnailUrl,
			contactType: data.contactType,
			contactValue: data.contactValue,
		} as any);
	};

	const openAddDialog = (type: "custom" | "platform" | "contact") => {
		setAddLinkType(type);
		setIsAddOpen(true);
	};

	// Filter Links for Zones
	const socialLinks = localLinks.filter(
		(l) => l.type === "platform" && l.platform?.category === "social",
	);
	const contactLinks = localLinks.filter((l) => l.type === "contact");
	const contentLinks = localLinks.filter(
		(l) => !socialLinks.includes(l) && !contactLinks.includes(l),
	);

	if (isLoadingProfile || isLoadingLinks) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!profile) return null;

	return (
		<PageWithPreview
			preview={
				<ProfileCard
					profile={profile as any}
					links={localLinks.filter((l) => !l.isHidden)}
					className="h-full max-w-none rounded-none border-none shadow-none ring-0"
				/>
			}
		>
			<div className="space-y-8 pb-20">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Links</h1>
					<p className="text-muted-foreground">Manage your profile content.</p>
				</div>

				{/* Zone A: Header (Socials) */}
				<SocialsManager
					links={socialLinks}
					onDragEnd={(e) => handleDragEnd(e, socialLinks)}
					onAdd={() => openAddDialog("platform")}
					onEdit={(link) => setEditingLink(link)}
					onDelete={handleDelete}
				/>

				{/* Zone B: Body (Content) */}
				<ContentLinksManager
					links={contentLinks}
					onDragEnd={(e) => handleDragEnd(e, contentLinks)}
					onAdd={() => openAddDialog("custom")}
					onEdit={(link) => setEditingLink(link)}
					onUpdate={handleUpdate}
					onDelete={handleDelete}
				/>

				{/* Zone C: Footer (Contact) */}
				<ContactManager
					links={contactLinks}
					onAdd={() => openAddDialog("contact")}
					onEdit={(link) => setEditingLink(link)}
					onDelete={handleDelete}
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
