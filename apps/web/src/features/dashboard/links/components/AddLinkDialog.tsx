"use client";

import {
	AddressBook,
	CaretDown,
	Envelope,
	Globe,
	GridFour,
	Link,
	Spinner,
	SquaresFour,
	Star,
	TextAlignJustify,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SUPPORT_PLATFORMS } from "@/lib/constants/SUPPORT_PLATFORMS";

export interface AddLinkData {
	title: string;
	url: string;
	type: "custom" | "platform" | "contact";
	platformName?: string;
	displayMode?: "standard" | "featured" | "grid";
	thumbnailUrl?: string;
	contactType?: string;
	contactValue?: string;
}

import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PlatformInfo } from "@/lib/constants/SUPPORT_PLATFORMS";
import { useUploadThing } from "@/utils/uploadthing";
import { LinkThumbnailUploader } from "./LinkThumbnailUploader";

interface AddLinkDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onAddLink: (data: AddLinkData) => void;
	isSubmitting: boolean;
	initialTab?: "custom" | "platform" | "contact";
}

export function AddLinkDialog({
	isOpen,
	onOpenChange,
	onAddLink,
	isSubmitting,
	initialTab = "custom",
}: AddLinkDialogProps) {
	const [activeTab, setActiveTab] = useState<string>(initialTab);

	useEffect(() => {
		if (isOpen) {
			setActiveTab(initialTab);
		}
	}, [isOpen, initialTab]);

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

	const [expandedCategories, setExpandedCategories] = useState<
		Record<string, boolean>
	>({});

	const toggleCategory = (category: string) => {
		setExpandedCategories((prev) => ({
			...prev,
			[category]: !prev[category],
		}));
	};

	const resetForm = () => {
		setTitle("");
		setUrl("");
		setDisplayMode("standard");
		setThumbnailUrl("");
		setThumbnailFile(null);
		setContactType("email");
		setContactValue("");
		setIsUploading(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (activeTab === "custom") {
			if (!url) return;

			try {
				setIsUploading(true);
				let finalThumbnailUrl = thumbnailUrl;

				if (thumbnailFile) {
					const res = await startUpload([thumbnailFile], {});
					if (res?.[0]) {
						finalThumbnailUrl = res[0].ufsUrl;
					} else {
						throw new Error("Failed to upload thumbnail");
					}
				}

				onAddLink({
					title: title || "New Link",
					url,
					type: "custom",
					displayMode,
					thumbnailUrl: finalThumbnailUrl,
				});
				resetForm();
			} catch (error) {
				console.error(error);
				toast.error("Failed to upload thumbnail");
			} finally {
				setIsUploading(false);
			}
		} else if (activeTab === "contact") {
			if (!contactValue) return;
			let finalUrl = contactValue;
			if (contactType === "email" && !contactValue.startsWith("mailto:")) {
				finalUrl = `mailto:${contactValue}`;
			} else if (contactType === "phone" && !contactValue.startsWith("tel:")) {
				finalUrl = `tel:${contactValue}`;
			} else if (
				contactType === "website" &&
				!contactValue.startsWith("http://") &&
				!contactValue.startsWith("https://")
			) {
				finalUrl = `https://${contactValue}`;
			}

			onAddLink({
				title:
					title || contactType.charAt(0).toUpperCase() + contactType.slice(1),
				url: finalUrl,
				type: "contact",
				contactType,
				contactValue,
			});
			resetForm();
		}
	};

	const handlePlatformSelect = (platform: PlatformInfo) => {
		onAddLink({
			title: platform.name,
			url: platform.baseUrl,
			type: "platform",
			platformName: platform.name,
		});
		resetForm();
	};

	return (
		/*
		 * No DialogTrigger: the per-section Add buttons open this on their own tab.
		 */
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Add New Link</DialogTitle>
				</DialogHeader>
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="custom">
							<Link className="mr-2 h-4 w-4" />
							URL Link
						</TabsTrigger>
						<TabsTrigger value="contact">
							<AddressBook className="mr-2 h-4 w-4" />
							AddressBook
						</TabsTrigger>
						<TabsTrigger value="platform">
							<GridFour className="mr-2 h-4 w-4" />
							Platform
						</TabsTrigger>
					</TabsList>

					{/* Custom Link Form */}
					<TabsContent value="custom" className="space-y-4 pt-4">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title">Title</Label>
								<Input
									id="title"
									placeholder="e.g. My Portfolio"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="url">URL</Label>
								<Input
									id="url"
									placeholder="https://..."
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									required
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Display Mode</Label>
									<div className="grid grid-cols-2 gap-2 md:grid-cols-3">
										<button
											type="button"
											onClick={() => setDisplayMode("standard")}
											className={cn(
												"flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs transition-all",
												displayMode === "standard"
													? "border-primary bg-primary/10 text-primary"
													: "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
											)}
										>
											<TextAlignJustify className="h-4 w-4" />
											Standard
										</button>
										<button
											type="button"
											onClick={() => setDisplayMode("featured")}
											className={cn(
												"flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs transition-all",
												displayMode === "featured"
													? "border-primary bg-primary/10 text-primary"
													: "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
											)}
										>
											<Star className="h-4 w-4" />
											Featured
										</button>
										<button
											type="button"
											onClick={() => setDisplayMode("grid")}
											className={cn(
												"flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs transition-all",
												displayMode === "grid"
													? "border-primary bg-primary/10 text-primary"
													: "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
											)}
										>
											<Globe className="h-4 w-4" />
											Globe
										</button>
									</div>
								</div>
								<div className="space-y-2">
									<Label>Thumbnail (Optional)</Label>
									<LinkThumbnailUploader
										imageUrl={thumbnailUrl}
										onImageChange={setThumbnailUrl}
										onFileChange={setThumbnailFile}
									/>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={isSubmitting || isUploading}
							>
								{(isSubmitting || isUploading) && (
									<Spinner className="mr-2 h-4 w-4 animate-spin" />
								)}
								{isSubmitting || isUploading ? "Creating..." : "Add Link"}
							</Button>
						</form>
					</TabsContent>

					{/* AddressBook Link Form */}
					<TabsContent value="contact" className="space-y-4 pt-4">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label>Type</Label>
									<Select
										value={contactType}
										onValueChange={(value) => setContactType(value ?? "email")}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="email">
												<div className="flex items-center gap-2">
													<SquaresFour className="h-4 w-4" /> Email
												</div>
											</SelectItem>
											<SelectItem value="phone">
												<div className="flex items-center gap-2">
													<SquaresFour className="h-4 w-4" /> SquaresFour
												</div>
											</SelectItem>
											<SelectItem value="website">
												<div className="flex items-center gap-2">
													<Envelope className="h-4 w-4" /> Website
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="col-span-2 space-y-2">
									<Label htmlFor="contactValue">Value</Label>
									<Input
										id="contactValue"
										placeholder={
											contactType === "email"
												? "hello@example.com"
												: contactType === "phone"
													? "+1234567890"
													: "example.com"
										}
										value={contactValue}
										onChange={(e) => setContactValue(e.target.value)}
										required
										className="border-input bg-background"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="contactTitle">Title (Optional)</Label>
								<Input
									id="contactTitle"
									placeholder="e.g. AddressBook Me"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
								/>
							</div>

							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? "Creating..." : "Add AddressBook Info"}
							</Button>
						</form>
					</TabsContent>

					{/* Platform Link Selection */}
					<TabsContent value="platform" className="pt-4">
						<ScrollArea className="h-[400px] pr-4">
							<div className="space-y-6">
								{Object.entries(
									Object.values(SUPPORT_PLATFORMS).reduce(
										(acc, platform) => {
											const category = platform.category || "other";
											if (!acc[category]) acc[category] = [];
											acc[category].push(platform);
											return acc;
										},
										{} as Record<
											string,
											(typeof SUPPORT_PLATFORMS)[keyof typeof SUPPORT_PLATFORMS][]
										>,
									),
								).map(([category, platforms]) => (
									<div key={category} className="space-y-3">
										<div className="flex items-center justify-between px-1">
											<h3 className="font-medium text-muted-foreground text-sm capitalize">
												{category}
											</h3>
											{platforms.length > 4 && (
												<Button
													variant="ghost"
													size="sm"
													className="h-6 text-muted-foreground text-xs hover:text-foreground"
													onClick={() => toggleCategory(category)}
												>
													{expandedCategories[category]
														? "Show less"
														: `Show all (${platforms.length})`}
													<CaretDown
														className={cn(
															"ml-1 h-3 w-3 transition-transform",
															expandedCategories[category] && "rotate-180",
														)}
													/>
												</Button>
											)}
										</div>
										<div className="grid grid-cols-4 gap-4">
											{(expandedCategories[category]
												? platforms
												: platforms.slice(0, 4)
											).map((platform) => (
												<button
													key={platform.name}
													type="button"
													onClick={() => handlePlatformSelect(platform)}
													className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/50 hover:bg-accent"
												>
													<platform.icon className="h-6 w-6 text-muted-foreground" />
													<span className="w-full truncate text-center font-medium text-[10px] text-foreground">
														{platform.name}
													</span>
												</button>
											))}
										</div>
									</div>
								))}
							</div>
						</ScrollArea>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
