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
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import type { links, profiles } from "@zaplink/db";
import { Edit3, GripVertical, LinkIcon, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { queryClient, trpc } from "@/utils/trpc/client";
import SUPPORT_PLATFORMS from "../../../../lib/constants/SUPPORT_PLATFORMS";
import { ProfileEditor } from "./components/ProfileEditor";

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

const AddLinkTypeModal = ({
	isOpen,
	onClose,
	onSelectLinkType,
}: AddLinkTypeModalState & {
	onClose: () => void;
	onSelectLinkType: (type: "custom" | SupportedPlatform) => void;
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add New Link</DialogTitle>
					<DialogDescription>
						Choose the type of link you want to add.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3 py-4">
					<Button
						variant="outline"
						className="w-full justify-start gap-3"
						onClick={() => onSelectLinkType("custom")}
					>
						<LinkIcon className="h-5 w-5" />
						<span>Custom Link</span>
					</Button>

					<div className="border-t pt-2">
						<p className="mb-2 text-muted-foreground text-sm">
							Social Platforms
						</p>
						<div className="space-y-2">
							{Object.entries(SUPPORT_PLATFORMS).map(
								([platform, platformInfo]) => {
									const Icon = platformInfo.icon;
									return (
										<Button
											key={platform}
											variant="outline"
											className="w-full justify-start gap-3"
											onClick={() =>
												onSelectLinkType(platform as SupportedPlatform)
											}
										>
											<Icon className="h-5 w-5" />
											<span>{platformInfo.name}</span>
										</Button>
									);
								},
							)}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const LinkEditModal = ({
	isOpen,
	mode,
	platform,
	link,
	onClose,
}: LinkModalState & { onClose: () => void }) => {
	const router = useRouter();
	const isCustom = !platform;

	const form = useForm({
		defaultValues: {
			username: "",
			title: "",
			url: "",
		},
		onSubmit: async ({ value }) => {
			if (isCustom) {
				if (mode === "add") {
					createLink({ title: value.title, url: value.url });
				} else if (link) {
					updateLink({ id: link.id, title: value.title, url: value.url });
				}
			} else if (platformInfo) {
				const fullUrl = `${platformInfo.baseUrl}${value.username}`;
				if (mode === "add") {
					createLink({ title: platform, url: fullUrl });
				} else if (link) {
					updateLink({ id: link.id, url: fullUrl });
				}
			}
		},
	});

	const onSuccess = (message: string) => {
		toast.success(message);
		onClose();
		queryClient.invalidateQueries(trpc.links.getAllLinks.queryFilter());
		router.refresh();
	};

	const onError = (error: { message: string }) => {
		toast.error("Failed to save link", { description: error.message });
	};

	const { mutate: createLink, isPending: isCreating } = useMutation(
		trpc.links.createLink.mutationOptions({
			onSuccess: () => onSuccess("Link added successfully"),
			onError,
		}),
	);

	const { mutate: updateLink, isPending: isUpdating } = useMutation(
		trpc.links.updateLink.mutationOptions({
			onSuccess: () => onSuccess("Link updated successfully"),
			onError,
		}),
	);

	const { mutate: deleteLink, isPending: isDeleting } = useMutation(
		trpc.links.deleteLink.mutationOptions({
			onSuccess: () => onSuccess("Link removed"),
			onError,
		}),
	);

	const platformInfo = platform ? SUPPORT_PLATFORMS[platform] : null;

	useEffect(() => {
		if (isCustom && link) {
			form.setFieldValue("title", link.title);
			form.setFieldValue("url", link.url);
		} else if (platformInfo && link?.url) {
			const username = link.url.replace(platformInfo.baseUrl, "");
			form.setFieldValue("username", username);
		} else {
			form.reset();
		}
	}, [isCustom, platformInfo, link, form]);

	const isPending = isCreating || isUpdating || isDeleting;

	const handleDelete = () => {
		if (link) {
			deleteLink({ id: link.id });
			router.refresh();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				{isCustom ? (
					<>
						<DialogHeader>
							<DialogTitle>
								{mode === "add" ? "Add" : "Edit"} Custom Link
							</DialogTitle>
							<DialogDescription>
								Link to anywhere on the web.
							</DialogDescription>
						</DialogHeader>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="space-y-4"
						>
							<form.Field
								name="title"
								children={(field) => (
									<Field>
										<FieldLabel>Title</FieldLabel>
										<FieldContent>
											<Input
												placeholder="My awesome blog"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</FieldContent>
									</Field>
								)}
							/>
							<form.Field
								name="url"
								children={(field) => (
									<Field>
										<FieldLabel>URL</FieldLabel>
										<FieldContent>
											<Input
												type="url"
												placeholder="https://example.com"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</FieldContent>
									</Field>
								)}
							/>
							<DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
								{mode === "edit" && (
									<Button
										type="button"
										variant="outline"
										onClick={handleDelete}
										disabled={isPending}
										className="flex-1 gap-2"
									>
										<Trash2 className="h-4 w-4" />
										Remove
									</Button>
								)}
								<div className="flex flex-1 gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={onClose}
										disabled={isPending}
										className="flex-1"
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={isPending}
										className="flex-1 gap-2"
									>
										{isPending ? "Saving..." : "Save"}
									</Button>
								</div>
							</DialogFooter>
						</form>
					</>
				) : platformInfo ? (
					<>
						<DialogHeader>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
									<platformInfo.icon className="h-5 w-5" />
								</div>
								<div>
									<DialogTitle className="text-left">
										{mode === "add" ? "Add" : "Edit"} {platformInfo.name}
									</DialogTitle>
									<DialogDescription className="text-left">
										Enter your {platformInfo.name} username.
									</DialogDescription>
								</div>
							</div>
						</DialogHeader>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="space-y-4"
						>
							<form.Field
								name="username"
								children={(field) => (
									<Field>
										<FieldLabel className="font-medium text-sm">
											Username
										</FieldLabel>
										<FieldContent>
											<div className="flex items-center rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
												<span className="px-3 text-muted-foreground text-sm">
													{platformInfo.baseUrl.replace("https://", "")}
												</span>
												<Input
													type="text"
													placeholder="username"
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
													className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
												/>
											</div>
										</FieldContent>
									</Field>
								)}
							/>

							<DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
								{mode === "edit" && (
									<Button
										type="button"
										variant="outline"
										onClick={handleDelete}
										disabled={isPending}
										className="flex-1 gap-2"
									>
										<Trash2 className="h-4 w-4" />
										Remove
									</Button>
								)}
								<div className="flex flex-1 gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={onClose}
										disabled={isPending}
										className="flex-1"
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={isPending}
										className="flex-1 gap-2"
									>
										{isPending ? "Saving..." : "Save"}
									</Button>
								</div>
							</DialogFooter>
						</form>
					</>
				) : null}
			</DialogContent>
		</Dialog>
	);
};

const CustomLinkCard = ({
	link,
	onClick,
	dragHandleAttributes,
	dragHandleListeners,
}: {
	link: Link;
	onClick: () => void;
	// biome-ignore lint: false positive
	dragHandleAttributes: any;
	// biome-ignore lint: false positive
	dragHandleListeners: any;
}) => {
	return (
		<div className="flex items-center gap-3 rounded-xl border bg-card p-2.5">
			<div
				{...dragHandleAttributes}
				{...dragHandleListeners}
				className="cursor-grab touch-none p-2"
			>
				<GripVertical className="h-5 w-5 text-muted-foreground" />
			</div>
			<button
				type="button"
				onClick={onClick}
				className="flex min-w-0 flex-1 items-center gap-3 text-left"
			>
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					<LinkIcon className="h-6 w-6 text-muted-foreground" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="truncate font-medium">{link.title}</div>
					<div className="truncate text-muted-foreground text-sm">
						{link.url}
					</div>
				</div>
				<div className="rounded-full p-1 text-muted-foreground">
					<Edit3 className="h-4 w-4" />
				</div>
			</button>
		</div>
	);
};

const SocialPlatformCard = ({
	platform,
	existingLink,
	onClick,
	dragHandleAttributes,
	dragHandleListeners,
}: {
	platform: SupportedPlatform;
	existingLink?: Link;
	onClick: () => void;
	// biome-ignore lint: false positive
	dragHandleAttributes: any;
	// biome-ignore lint: false positive
	dragHandleListeners: any;
}) => {
	const platformInfo = SUPPORT_PLATFORMS[platform];
	const Icon = platformInfo.icon;

	return (
		<div
			className={`flex items-center gap-3 rounded-xl border p-2.5 ${
				!existingLink && "opacity-50"
			}`}
		>
			<div
				{...dragHandleAttributes}
				{...dragHandleListeners}
				className="cursor-grab touch-none p-2"
			>
				<GripVertical className="h-5 w-5 text-muted-foreground" />
			</div>
			<button
				type="button"
				onClick={onClick}
				className="flex min-w-0 flex-1 items-center gap-3 text-left"
			>
				<div
					className={`flex h-12 w-12 items-center justify-center rounded-full ${
						existingLink ? "bg-primary/10" : "bg-muted"
					}`}
				>
					<Icon
						className={`h-6 w-6 ${
							existingLink ? "text-primary" : "text-muted-foreground"
						}`}
					/>
				</div>
				<div className="min-w-0 flex-1">
					<div className="font-medium">{platformInfo.name}</div>
					<div className="truncate text-muted-foreground text-sm">
						{existingLink
							? existingLink.url.replace(platformInfo.baseUrl, "")
							: "Not connected"}
					</div>
				</div>
				<div
					className={`rounded-full p-1 ${
						existingLink ? "text-primary" : "text-muted-foreground"
					}`}
				>
					<Edit3 className="h-4 w-4" />
				</div>
			</button>
		</div>
	);
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
					link={link}
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
		[...links].sort((a, b) => a.order - b.order),
	);

	useEffect(() => {
		setOrderedLinks([...links].sort((a, b) => a.order - b.order));
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
					<div className="grid gap-3">
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
			<AddLinkTypeModal
				{...addLinkTypeModalState}
				onClose={closeAddLinkTypeModal}
				onSelectLinkType={handleSelectLinkType}
			/>
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
		<div className="mx-auto max-w-2xl space-y-6">
			<div className="space-y-6">
				<ProfileEditor profile={profile} />
				<SocialLinks links={links} />
			</div>
		</div>
	);
}
