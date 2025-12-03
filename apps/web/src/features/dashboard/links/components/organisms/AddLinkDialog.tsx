"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SUPPORT_PLATFORMS } from "@/lib/constants/SUPPORT_PLATFORMS";

interface AddLinkDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onAddLink: (title: string, url: string) => void;
	isSubmitting: boolean;
}

export function AddLinkDialog({
	isOpen,
	onOpenChange,
	onAddLink,
	isSubmitting,
}: AddLinkDialogProps) {
	const [newLinkTitle, setNewLinkTitle] = useState("");
	const [newLinkUrl, setNewLinkUrl] = useState("");
	const [activeTab, setActiveTab] = useState("custom");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newLinkUrl) return;
		onAddLink(newLinkTitle || "New Link", newLinkUrl);
		setNewLinkTitle("");
		setNewLinkUrl("");
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Add Link
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add New Link</DialogTitle>
				</DialogHeader>
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="custom">Custom Link</TabsTrigger>
						<TabsTrigger value="platform">Social Platform</TabsTrigger>
					</TabsList>

					<TabsContent value="custom" className="space-y-4 pt-4">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title">Title</Label>
								<Input
									id="title"
									placeholder="e.g. My Portfolio"
									value={newLinkTitle}
									onChange={(e) => setNewLinkTitle(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="url">URL</Label>
								<Input
									id="url"
									placeholder="https://..."
									value={newLinkUrl}
									onChange={(e) => setNewLinkUrl(e.target.value)}
									required
								/>
							</div>
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? "Creating..." : "Add Custom Link"}
							</Button>
						</form>
					</TabsContent>

					<TabsContent value="platform" className="pt-4">
						<div className="grid grid-cols-4 gap-4">
							{Object.values(SUPPORT_PLATFORMS).map((platform) => (
								<button
									key={platform.name}
									type="button"
									onClick={() => {
										setNewLinkTitle(platform.name);
										setNewLinkUrl(platform.baseUrl);
										setActiveTab("custom");
									}}
									className="flex flex-col items-center gap-2 rounded-xl border p-3 transition-all hover:border-primary/50 hover:bg-muted/50"
								>
									<platform.icon className="h-6 w-6" />
									<span className="w-full truncate text-center font-medium text-xs">
										{platform.name}
									</span>
								</button>
							))}
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
