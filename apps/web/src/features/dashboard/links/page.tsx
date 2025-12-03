"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { links } from "@zaplink/db";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ProfileCard from "@/components/ProfileCard";
import PageWithPreview from "@/features/dashboard/components/PageWithPreview";
import { queryClient, trpc } from "@/utils/trpc/client";
import { AddLinkDialog } from "./components/organisms/AddLinkDialog";
import { LinksList } from "./components/organisms/LinksList";

type Link = typeof links.$inferSelect;

export default function LinksPage() {
	const router = useRouter();
	const [localLinks, setLocalLinks] = useState<Link[]>([]);
	const [isAddOpen, setIsAddOpen] = useState(false);

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
				queryClient.invalidateQueries({
					queryKey: ["links"],
				});
			},
		}),
	);

	const updateLinkMutation = useMutation(
		trpc.links.updateLink.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["links"],
				});
			},
		}),
	);

	const deleteLinkMutation = useMutation(
		trpc.links.deleteLink.mutationOptions({
			onSuccess: (deletedLink) => {
				setLocalLinks((prev) => prev.filter((l) => l.id !== deletedLink.id));
				toast.success("Link deleted");
				queryClient.invalidateQueries({
					queryKey: ["links"],
				});
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
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setLocalLinks((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);
				const newItems = arrayMove(items, oldIndex, newIndex);

				// Sync with server
				reorderLinksMutation.mutate({
					orderedIds: newItems.map((item) => item.id),
				});

				return newItems;
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

	const handleAddLink = (title: string, url: string) => {
		createLinkMutation.mutate({
			title,
			url,
			type: "custom",
		});
	};

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
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="font-bold text-3xl tracking-tight">Links</h1>
						<p className="text-muted-foreground">Add and manage your links.</p>
					</div>
					<AddLinkDialog
						isOpen={isAddOpen}
						onOpenChange={setIsAddOpen}
						onAddLink={handleAddLink}
						isSubmitting={createLinkMutation.isPending}
					/>
				</div>

				<LinksList
					links={localLinks}
					onDragEnd={handleDragEnd}
					onUpdate={handleUpdate}
					onDelete={handleDelete}
				/>
			</div>
		</PageWithPreview>
	);
}
