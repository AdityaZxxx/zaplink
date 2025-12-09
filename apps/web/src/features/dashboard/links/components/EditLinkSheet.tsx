"use client";

import type { links } from "@zaplink/db";
import {
	AlignJustify,
	Grid,
	Link as LinkIcon,
	Loader2,
	Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SUPPORT_PLATFORMS } from "@/lib/constants/SUPPORT_PLATFORMS";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/utils/uploadthing";
import { LinkThumbnailUploader } from "./LinkThumbnailUploader";

// Extended Link type
type Link = typeof links.$inferSelect & {
	platform?: {
		name: string;
		category: string | null;
		iconUrl: string | null;
	} | null;
	custom?: {
		displayMode: "standard" | "featured" | "grid" | null;
		title: string | null;
		iconUrl: string | null;
		thumbnailUrl: string | null;
	} | null;
	contact?: { type: string; value: string } | null;
};

interface EditLinkSheetProps {
	link: Link | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onUpdate: (id: number, data: any) => void;
}

export function EditLinkSheet({
	link,
	isOpen,
	onOpenChange,
	onUpdate,
}: EditLinkSheetProps) {
	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");
	const [displayMode, setDisplayMode] = useState<
		"standard" | "featured" | "grid"
	>("standard");
	const [thumbnailUrl, setThumbnailUrl] = useState("");
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [contactType, setContactType] = useState("email");
	const [contactValue, setContactValue] = useState("");
	const [isUploading, setIsUploading] = useState(false);

	const { startUpload } = useUploadThing("linkThumbnailUploader");

	useEffect(() => {
		if (link) {
			setTitle(link.title);
			setUrl(link.url);
			if (link.type === "custom") {
				setDisplayMode(link.custom?.displayMode || "standard");
				setThumbnailUrl(link.custom?.thumbnailUrl || "");
				setThumbnailFile(null); // Reset file on link change
			} else if (link.type === "contact") {
				setContactType(link.contact?.type || "email");
				setContactValue(link.contact?.value || "");
			}
		}
	}, [link]);

	const handleSave = async () => {
		if (!link) return;

		try {
			setIsUploading(true);
			let finalThumbnailUrl = thumbnailUrl;

			// Upload thumbnail if file exists
			if (thumbnailFile) {
				const res = await startUpload([thumbnailFile], {
					linkId: link.id,
				});
				if (res?.[0]) {
					finalThumbnailUrl = res[0].ufsUrl;
				} else {
					throw new Error("Failed to upload thumbnail");
				}
			}

			const updates: any = { title, url };

			if (link.type === "custom") {
				updates.displayMode = displayMode;
				updates.thumbnailUrl = finalThumbnailUrl;
			} else if (link.type === "contact") {
				updates.contactType = contactType;
				updates.contactValue = contactValue;
				// Auto-format URL for contact
				let finalUrl = contactValue;
				if (contactType === "email" && !contactValue.startsWith("mailto:")) {
					finalUrl = `mailto:${contactValue}`;
				} else if (
					contactType === "phone" &&
					!contactValue.startsWith("tel:")
				) {
					finalUrl = `tel:${contactValue}`;
				} else if (
					contactType === "website" &&
					!contactValue.startsWith("http://") &&
					!contactValue.startsWith("https://")
				) {
					finalUrl = `https://${contactValue}`;
				}
				updates.url = finalUrl;
			}

			onUpdate(link.id, updates);
			onOpenChange(false);
		} catch (error) {
			console.error(error);
			toast.error("Failed to save changes");
		} finally {
			setIsUploading(false);
		}
	};

	if (!link) return null;

	return (
		<Sheet open={isOpen} onOpenChange={onOpenChange}>
			<SheetContent className="w-full border-zinc-800 border-l bg-zinc-950 p-0 text-white sm:max-w-md">
				<SheetHeader className="border-zinc-800 border-b px-6 py-4">
					<SheetTitle>Edit Link</SheetTitle>
					<SheetDescription>
						Make changes to your link details.
					</SheetDescription>
				</SheetHeader>

				<div className="flex h-full flex-col px-6 py-6">
					{link.type === "custom" && (
						<Tabs defaultValue="content" className="w-full">
							<TabsList className="grid w-full grid-cols-2 bg-zinc-900">
								<TabsTrigger value="content">Content</TabsTrigger>
								<TabsTrigger value="display">Display</TabsTrigger>
							</TabsList>

							<TabsContent value="content" className="space-y-4 pt-4">
								<div className="space-y-2">
									<Label>Title</Label>
									<Input
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										className="border-zinc-800 bg-zinc-900"
									/>
								</div>
								<div className="space-y-2">
									<Label>URL</Label>
									<Input
										value={url}
										onChange={(e) => setUrl(e.target.value)}
										className="border-zinc-800 bg-zinc-900"
									/>
								</div>
							</TabsContent>

							<TabsContent value="display" className="space-y-6 pt-4">
								<div className="space-y-3">
									<Label>Display Mode</Label>
									<div className="grid grid-cols-3 gap-3">
										<button
											type="button"
											onClick={() => setDisplayMode("standard")}
											className={cn(
												"flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all",
												displayMode === "standard"
													? "border-white bg-zinc-800 text-white"
													: "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800",
											)}
										>
											<AlignJustify className="h-6 w-6" />
											<span className="text-xs">Standard</span>
										</button>
										<button
											type="button"
											onClick={() => setDisplayMode("featured")}
											className={cn(
												"flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all",
												displayMode === "featured"
													? "border-white bg-zinc-800 text-white"
													: "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800",
											)}
										>
											<Star className="h-6 w-6" />
											<span className="text-xs">Featured</span>
										</button>
										<button
											type="button"
											onClick={() => setDisplayMode("grid")}
											className={cn(
												"flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all",
												displayMode === "grid"
													? "border-white bg-zinc-800 text-white"
													: "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800",
											)}
										>
											<Grid className="h-6 w-6" />
											<span className="text-xs">Grid</span>
										</button>
									</div>
								</div>

								<div className="space-y-2">
									<Label>Thumbnail</Label>
									<LinkThumbnailUploader
										imageUrl={thumbnailUrl}
										onImageChange={setThumbnailUrl}
										onFileChange={setThumbnailFile}
									/>
									<p className="text-[10px] text-zinc-500">
										Recommended for Featured and Grid modes. Max 4MB.
									</p>
								</div>
							</TabsContent>
						</Tabs>
					)}

					{link.type === "platform" && (
						<div className="space-y-4">
							<div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
								{/* Icon */}
								{(() => {
									const platform = Object.values(SUPPORT_PLATFORMS).find(
										(p) => p.name === link.platform?.name,
									);
									const Icon = platform?.icon || LinkIcon;
									return <Icon className="h-8 w-8 text-zinc-400" />;
								})()}
								<div>
									<h3 className="font-medium text-white">
										{link.platform?.name}
									</h3>
									<p className="text-xs text-zinc-500">Social Platform</p>
								</div>
							</div>

							<div className="space-y-2">
								<Label>Title</Label>
								<Input
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className="border-zinc-800 bg-zinc-900"
								/>
							</div>
							<div className="space-y-2">
								<Label>URL</Label>
								<Input
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									className="border-zinc-800 bg-zinc-900"
								/>
							</div>
						</div>
					)}

					{link.type === "contact" && (
						<div className="space-y-4">
							<div className="grid grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label>Type</Label>
									<Select value={contactType} onValueChange={setContactType}>
										<SelectTrigger className="border-zinc-800 bg-zinc-900">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="border-zinc-800 bg-zinc-900">
											<SelectItem value="email">Email</SelectItem>
											<SelectItem value="phone">Phone</SelectItem>
											<SelectItem value="website">Website</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="col-span-2 space-y-2">
									<Label>Value</Label>
									<Input
										value={contactValue}
										onChange={(e) => setContactValue(e.target.value)}
										className="border-zinc-800 bg-zinc-900"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label>Label (Optional)</Label>
								<Input
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className="border-zinc-800 bg-zinc-900"
									placeholder="e.g. Contact Me"
								/>
							</div>
						</div>
					)}
				</div>

				<SheetFooter className="border-zinc-800 border-t px-6 py-4 sm:justify-between">
					<Button
						variant="ghost"
						onClick={() => onOpenChange(false)}
						className="text-zinc-400 hover:text-white"
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={isUploading}
						className="bg-white text-black hover:bg-zinc-200"
					>
						{isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Changes
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
