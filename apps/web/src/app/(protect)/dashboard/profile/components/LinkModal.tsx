import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import type { links } from "@zaplink/db";
import { LinkIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
import SUPPORT_PLATFORMS from "@/lib/constants/SUPPORT_PLATFORMS";
import { Input } from "../../../../../components/ui/input";
import { queryClient, trpc } from "../../../../../utils/trpc/client";

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

export const AddLinkTypeModal = ({
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

export const LinkEditModal = ({
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
			} else if (platform && platformInfo) {
				const fullUrl = `${platformInfo.baseUrl}${value.username}`;
				if (mode === "add") {
					createLink({ title: platform, url: fullUrl, platform: platform });
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
