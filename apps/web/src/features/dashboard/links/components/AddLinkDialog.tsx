"use client";

import {
	AlignJustify,
	ChevronDown,
	Contact,
	Globe,
	Grid,
	LayoutGrid,
	Link as LinkIcon,
	Mail,
	Phone,
	Plus,
	Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import { cn } from "@/lib/utils";

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

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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

	// Reset tab when dialog opens/closes or initialTab changes
	useEffect(() => {
		if (isOpen) {
			setActiveTab(initialTab);
		}
	}, [isOpen, initialTab]);

	// Form States
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

				// Upload thumbnail if file exists
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

	const handlePlatformSelect = (platform: any) => {
		onAddLink({
			title: platform.name,
			url: platform.baseUrl,
			type: "platform",
			platformName: platform.name,
		});
		resetForm();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button className="bg-white text-black hover:bg-zinc-200">
					<Plus className="mr-2 h-4 w-4" />
					Add Link
				</Button>
			</DialogTrigger>
			<DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Add New Link</DialogTitle>
				</DialogHeader>
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-3 bg-zinc-900">
						<TabsTrigger
							value="custom"
							className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
						>
							<LinkIcon className="mr-2 h-4 w-4" />
							URL Link
						</TabsTrigger>
						<TabsTrigger
							value="contact"
							className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
						>
							<Contact className="mr-2 h-4 w-4" />
							Contact
						</TabsTrigger>
						<TabsTrigger
							value="platform"
							className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
						>
							<LayoutGrid className="mr-2 h-4 w-4" />
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
									className="border-zinc-800 bg-zinc-900"
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
									className="border-zinc-800 bg-zinc-900"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Display Mode</Label>
									<div className="grid grid-cols-3 gap-2">
										<button
											type="button"
											onClick={() => setDisplayMode("standard")}
											className={cn(
												"flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs transition-all",
												displayMode === "standard"
													? "border-white bg-zinc-800 text-white"
													: "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800",
											)}
										>
											<AlignJustify className="h-4 w-4" />
											Standard
										</button>
										<button
											type="button"
											onClick={() => setDisplayMode("featured")}
											className={cn(
												"flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs transition-all",
												displayMode === "featured"
													? "border-white bg-zinc-800 text-white"
													: "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800",
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
													? "border-white bg-zinc-800 text-white"
													: "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800",
											)}
										>
											<Grid className="h-4 w-4" />
											Grid
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
								className="w-full bg-white text-black hover:bg-zinc-200"
								disabled={isSubmitting || isUploading}
							>
								{(isSubmitting || isUploading) && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								{isSubmitting || isUploading ? "Creating..." : "Add Link"}
							</Button>
						</form>
					</TabsContent>

					{/* Contact Link Form */}
					<TabsContent value="contact" className="space-y-4 pt-4">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label>Type</Label>
									<Select value={contactType} onValueChange={setContactType}>
										<SelectTrigger className="border-zinc-800 bg-zinc-900">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="border-zinc-800 bg-zinc-900">
											<SelectItem value="email">
												<div className="flex items-center gap-2">
													<Mail className="h-4 w-4" /> Email
												</div>
											</SelectItem>
											<SelectItem value="phone">
												<div className="flex items-center gap-2">
													<Phone className="h-4 w-4" /> Phone
												</div>
											</SelectItem>
											<SelectItem value="website">
												<div className="flex items-center gap-2">
													<Globe className="h-4 w-4" /> Website
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
										className="border-zinc-800 bg-zinc-900"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="contactTitle">Title (Optional)</Label>
								<Input
									id="contactTitle"
									placeholder="e.g. Contact Me"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className="border-zinc-800 bg-zinc-900"
								/>
							</div>

							<Button
								type="submit"
								className="w-full bg-white text-black hover:bg-zinc-200"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Creating..." : "Add Contact Info"}
							</Button>
						</form>
					</TabsContent>

					{/* Platform Link Selection */}
					<TabsContent value="platform" className="pt-4">
						<div className="custom-scrollbar max-h-[400px] space-y-6 overflow-y-auto pr-2">
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
										<h3 className="font-medium text-sm text-zinc-400 capitalize">
											{category}
										</h3>
										{platforms.length > 4 && (
											<Button
												variant="ghost"
												size="sm"
												className="h-6 text-xs text-zinc-500 hover:text-zinc-300"
												onClick={() => toggleCategory(category)}
											>
												{expandedCategories[category]
													? "Show less"
													: `Show all (${platforms.length})`}
												<ChevronDown
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
												className="flex flex-col items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 transition-all hover:border-zinc-700 hover:bg-zinc-800"
											>
												<platform.icon className="h-6 w-6 text-zinc-400" />
												<span className="w-full truncate text-center font-medium text-[10px] text-zinc-300">
													{platform.name}
												</span>
											</button>
										))}
									</div>
								</div>
							))}
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
