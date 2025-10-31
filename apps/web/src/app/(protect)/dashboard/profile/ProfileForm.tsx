"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import type { links, profiles } from "@zaplink/db";
import {
	CameraIcon,
	Edit3,
	LinkIcon,
	Plus,
	Trash2,
	User2Icon,
} from "lucide-react";
import Image from "next/image";
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
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, trpc } from "@/utils/trpc/client";
import SUPPORT_PLATFORMS from "../../../../lib/constants/SUPPORT_PLATFORMS";
import { UploadButton } from "../../../../utils/uploadthing";

type profile = typeof profiles.$inferSelect;
type link = typeof links.$inferSelect;
type SupportedPlatform = keyof typeof SUPPORT_PLATFORMS;

type ModalState = {
	isOpen: boolean;
	mode: "add" | "edit";
	platform?: SupportedPlatform;
	link?: link;
};

const LinkEditModal = ({
	isOpen,
	mode,
	platform,
	link,
	onClose,
}: ModalState & { onClose: () => void }) => {
	const router = useRouter();
	const isCustom = mode === "add" && !platform;

	const form = useForm({
		defaultValues: {
			username: "",
			title: "",
			url: "",
		},
		onSubmit: async ({ value }) => {
			if (isCustom) {
				createLink({ title: value.title, url: value.url });
			} else if (platform && platformInfo) {
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
		if (!isCustom && platformInfo && link?.url) {
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
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				{isCustom ? (
					<>
						<DialogHeader>
							<DialogTitle>Add a custom link</DialogTitle>
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
							<DialogFooter>
								<Button type="submit" disabled={isPending} className="w-full">
									{isPending ? "Adding..." : "Add Link"}
								</Button>
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
}: {
	link: link;
	onClick: () => void;
}) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-primary hover:bg-muted/50 active:scale-95"
		>
			<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
				<LinkIcon className="h-6 w-6 text-muted-foreground" />
			</div>
			<div className="flex-1 text-left">
				<div className="font-medium">{link.title}</div>
				<div className="truncate text-muted-foreground text-sm">{link.url}</div>
			</div>
			<div className="rounded-full p-1 text-muted-foreground">
				<Edit3 className="h-4 w-4" />
			</div>
		</button>
	);
};

// SocialLinks Manager Component
const SocialLinks = ({ links }: { links: link[] }) => {
	const [modalState, setModalState] = useState<ModalState>({
		isOpen: false,
		mode: "add",
	});

	const openModal = (
		mode: "add" | "edit",
		platform?: SupportedPlatform,
		link?: link,
	) => {
		setModalState({ isOpen: true, mode, platform, link });
	};

	const closeModal = () => setModalState({ isOpen: false, mode: "add" });

	const supportedPlatformKeys = Object.keys(SUPPORT_PLATFORMS);
	const customLinks = links.filter(
		(link) => !supportedPlatformKeys.includes(link.title.toLowerCase()),
	);

	const connectedCount = links.length - customLinks.length;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-semibold text-lg">Social Platforms</h2>
					<p className="text-muted-foreground text-sm">
						{connectedCount} of {Object.keys(SUPPORT_PLATFORMS).length}{" "}
						connected
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => openModal("add")} // No platform opens custom modal
					className="gap-2"
				>
					<Plus className="h-4 w-4" />
					Add Custom Link
				</Button>
			</div>

			<div className="grid gap-3">
				{Object.keys(SUPPORT_PLATFORMS).map((p) => {
					const platform = p as SupportedPlatform;
					const existingLink = links.find(
						(l) => l.title.toLowerCase() === platform.toLowerCase(),
					);

					return (
						<SocialPlatformCard
							key={platform}
							platform={platform}
							existingLink={existingLink}
							onClick={() =>
								existingLink
									? openModal("edit", platform, existingLink)
									: openModal("add", platform)
							}
						/>
					);
				})}
			</div>

			{customLinks.length > 0 && (
				<div className="space-y-4 pt-4">
					<h3 className="font-semibold text-lg">Custom Links</h3>
					<div className="grid gap-3">
						{customLinks.map((link) => (
							<CustomLinkCard
								key={link.id}
								link={link}
								onClick={() => openModal("edit", undefined, link)}
							/>
						))}
					</div>
				</div>
			)}

			<LinkEditModal {...modalState} onClose={closeModal} />
		</div>
	);
};

const SocialPlatformCard = ({
	platform,
	existingLink,
	onClick,
}: {
	platform: SupportedPlatform;
	existingLink?: link;
	onClick: () => void;
}) => {
	const platformInfo = SUPPORT_PLATFORMS[platform];
	const Icon = platformInfo.icon;

	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-primary hover:bg-muted/50 active:scale-95"
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
			<div className="flex-1 text-left">
				<div className="font-medium">{platformInfo.name}</div>
				<div className="text-muted-foreground text-sm">
					{existingLink ? "Connected" : "Not connected"}
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
	);
};

const UserAvatar = ({ avatarUrl }: { avatarUrl: string }) => {
	const router = useRouter();
	return (
		<div className="group relative h-20 w-20 rounded-full">
			{avatarUrl ? (
				<Image
					src={avatarUrl}
					alt="avatar"
					width={80}
					height={80}
					className="rounded-full object-cover"
				/>
			) : (
				<div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100">
					<User2Icon className="h-8 w-8 text-muted-foreground" />
				</div>
			)}
			<div className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-all group-hover:opacity-100">
				<CameraIcon className="h-5 w-5" />
				<UploadButton
					endpoint="avatarUploader"
					onClientUploadComplete={() => {
						toast.success("Profile picture updated");
						router.refresh();
					}}
					onUploadError={(error: Error) => {
						toast.error(`Upload failed: ${error.message}`);
					}}
					className="absolute inset-0 z-10 ut-allowed-content:hidden h-full ut-button:h-full ut-button:w-full w-full ut-button:cursor-pointer ut-button:bg-transparent ut-button:p-0 ut-button:text-transparent ut-button:ring-0 ut-button:focus-within:ring-0"
				/>
			</div>
		</div>
	);
};

// Profile Editor Component
const ProfileEditor = ({ profile }: { profile: profile }) => {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	const { mutate, isPending } = useMutation(
		trpc.profile.updateProfile.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.profile.getProfile.queryFilter());
				toast.success("Profile updated");
				setIsOpen(false);
				router.refresh();
			},
			onError: (error) => {
				toast.error("Failed to update profile", { description: error.message });
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			displayName: profile.displayName ?? "",
			bio: profile.bio ?? "",
		},
		onSubmit: async ({ value }) => {
			mutate({
				displayName: value.displayName,
				bio: value.bio,
			});
		},
	});

	return (
		<div className="flex items-center gap-4 rounded-xl border bg-card p-4">
			<UserAvatar avatarUrl={profile.avatarUrl ?? ""} />

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<h1 className="truncate font-semibold text-lg hover:underline">
								{profile.displayName || "Your Name"}
							</h1>
							<Edit3 className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
						</div>
						<p className="line-clamp-2 text-muted-foreground text-sm hover:underline">
							{profile.bio || "Add a bio to describe yourself..."}
						</p>
					</div>
				</DialogTrigger>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Edit Profile</DialogTitle>
						<DialogDescription>
							Update your display name and bio
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
							name="displayName"
							children={(field) => (
								<Field>
									<FieldLabel>Display Name</FieldLabel>
									<FieldContent>
										<Input
											placeholder="Enter your name"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</FieldContent>
								</Field>
							)}
						/>

						<form.Field
							name="bio"
							children={(field) => (
								<Field>
									<FieldLabel>Bio</FieldLabel>
									<FieldContent>
										<Textarea
											placeholder="Tell people about yourself..."
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											rows={3}
										/>
									</FieldContent>
								</Field>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
								disabled={isPending}
								className="w-full gap-2"
							>
								{isPending ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default function ProfileForm({
	profile,
	links,
}: {
	profile: profile;
	links: link[];
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
