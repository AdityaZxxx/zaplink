"use client";

import { useMutation } from "@tanstack/react-query";
import {
	ArrowRight,
	Link2,
	Loader2,
	Plus,
	Share2,
	Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SUPPORT_PLATFORMS from "@/lib/constants/SUPPORT_PLATFORMS";
import { trpc } from "../../../../utils/trpc/client";

export function StarterLinkForm() {
	const router = useRouter();
	const [customLinks, setCustomLinks] = useState([{ title: "", url: "" }]);
	const [socialHandles, setSocialHandles] = useState<Record<string, string>>(
		{},
	);
	const [activeTab, setActiveTab] = useState("social");

	const createLinkMutation = useMutation(
		trpc.links.createLink.mutationOptions({
			onSuccess: (_, vars) => {
				toast.success(`Successfully added ${vars.title}!`, {
					icon: "✅",
				});
			},
			onError: (error) =>
				toast.error("Failed to save link", {
					description: error.message,
				}),
		}),
	);

	const handleSocialChange = (platformKey: string, value: string) => {
		setSocialHandles((prev) => ({ ...prev, [platformKey]: value }));
	};

	const handleSaveSocials = async () => {
		const entries = Object.entries(socialHandles).filter(
			([, handle]) => handle.trim().length > 0,
		);

		if (!entries.length) {
			toast.error("No social handles added", {
				description: "Please add at least one social media username",
			});
			return;
		}

		try {
			await Promise.all(
				entries.map(async ([key, handle]) => {
					const platform =
						SUPPORT_PLATFORMS[key as keyof typeof SUPPORT_PLATFORMS];
					await createLinkMutation.mutateAsync({
						title: platform.name,
						url: `${platform.baseUrl}${handle}`,
					});
				}),
			);

			toast.success("Social links saved successfully!", {
				description: `Added ${entries.length} social profile${entries.length > 1 ? "s" : ""}`,
			});

			setActiveTab("custom");
		} catch (_error) {}
	};

	const handleCustomChange = (index: number, field: string, value: string) => {
		setCustomLinks((prev) =>
			prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
		);
	};

	const handleAddCustomLink = () => {
		setCustomLinks((prev) => [...prev, { title: "", url: "" }]);
	};

	const removeCustomLink = (index: number) => {
		if (customLinks.length > 1) {
			setCustomLinks((prev) => prev.filter((_, i) => i !== index));
		}
	};

	const handleSaveCustom = async (e: React.FormEvent) => {
		e.preventDefault();
		const validLinks = customLinks.filter(
			(l) => l.title.trim() && l.url.trim(),
		);

		if (!validLinks.length) {
			toast.error("No valid links added", {
				description: "Please add at least one link with title and URL",
			});
			return;
		}

		try {
			await Promise.all(
				validLinks.map((link) => createLinkMutation.mutateAsync(link)),
			);

			toast.success("Custom links saved successfully!", {
				description: `Added ${validLinks.length} custom link${validLinks.length > 1 ? "s" : ""}`,
			});

			router.push("/dashboard");
		} catch (_error) {}
	};

	const handleSaveAll = async () => {
		const socialEntries = Object.entries(socialHandles).filter(
			([, handle]) => handle.trim().length > 0,
		);

		const validCustomLinks = customLinks.filter(
			(l) => l.title.trim() && l.url.trim(),
		);

		if (!socialEntries.length && !validCustomLinks.length) {
			toast.error("No links to save", {
				description: "Please add at least one social handle or custom link",
			});
			return;
		}

		try {
			if (socialEntries.length) {
				await Promise.all(
					socialEntries.map(async ([key, handle]) => {
						const platform =
							SUPPORT_PLATFORMS[key as keyof typeof SUPPORT_PLATFORMS];
						await createLinkMutation.mutateAsync({
							title: platform.name,
							url: `${platform.baseUrl}${handle}`,
						});
					}),
				);
			}

			if (validCustomLinks.length) {
				await Promise.all(
					validCustomLinks.map((link) => createLinkMutation.mutateAsync(link)),
				);
			}

			toast.success("All links saved successfully!", {
				description: "Ready to share your profile with the world! 🌟",
			});

			router.push("/dashboard");
		} catch (_error) {}
	};

	const getSocialCount = () => {
		return Object.values(socialHandles).filter(
			(handle) => handle.trim().length > 0,
		).length;
	};

	const getCustomCount = () => {
		return customLinks.filter((link) => link.title.trim() && link.url.trim())
			.length;
	};

	const isLoading = createLinkMutation.isPending;

	return (
		<div className="flex w-full flex-col gap-6">
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="social" className="flex items-center gap-2">
						<Share2 className="h-4 w-4" />
						Social Profiles
						{getSocialCount() > 0 && (
							<Badge
								variant="secondary"
								className="h-5 w-5 rounded-full p-0 text-xs"
							>
								{getSocialCount()}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="custom" className="flex items-center gap-2">
						<Link2 className="h-4 w-4" />
						Custom Links
						{getCustomCount() > 0 && (
							<Badge
								variant="secondary"
								className="h-5 w-5 rounded-full p-0 text-xs"
							>
								{getCustomCount()}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="social">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Share2 className="h-5 w-5" />
								Connect Social Profiles
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								{Object.entries(SUPPORT_PLATFORMS).map(([key, platform]) => (
									<div key={key} className="space-y-2">
										<Label
											htmlFor={key}
											className="flex items-center gap-2 text-sm"
										>
											<platform.icon className="h-4 w-4" />
											{platform.name}
										</Label>
										<div className="flex gap-2">
											<Input
												id={key}
												placeholder={`${platform.name} username`}
												value={socialHandles[key] || ""}
												onChange={(e) =>
													handleSocialChange(key, e.target.value)
												}
												disabled={isLoading}
												className="flex-1"
											/>
										</div>
										{platform.baseUrl && (
											<p className="text-muted-foreground text-xs">
												{platform.baseUrl}
												{socialHandles[key] || "username"}
											</p>
										)}
									</div>
								))}
							</div>

							<div className="flex gap-3 pt-4">
								<Button
									onClick={handleSaveSocials}
									disabled={isLoading || getSocialCount() === 0}
									className="flex-1 gap-2"
								>
									{isLoading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : null}
									Save Social Links
									{getSocialCount() > 0 && ` (${getSocialCount()})`}
								</Button>

								<Button
									type="button"
									variant="outline"
									onClick={() => setActiveTab("custom")}
									className="gap-2"
								>
									Next
									<ArrowRight className="h-4 w-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="custom">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Link2 className="h-5 w-5" />
								Add Custom Links
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSaveCustom} className="space-y-4">
								{customLinks.map((link, index) => (
									<div key={index} className="rounded-lg border p-4">
										<div className="mb-3 flex items-start justify-between">
											<Label className="font-medium text-sm">
												Link #{index + 1}
											</Label>
											{customLinks.length > 1 && (
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeCustomLink(index)}
													disabled={isLoading}
													className="h-8 text-red-500 hover:bg-red-50 hover:text-red-700"
												>
													Remove
												</Button>
											)}
										</div>

										<div className="grid gap-3">
											<div className="space-y-2">
												<Label htmlFor={`title-${index}`}>Title</Label>
												<Input
													id={`title-${index}`}
													placeholder="e.g., My Portfolio, Blog, Store"
													value={link.title}
													onChange={(e) =>
														handleCustomChange(index, "title", e.target.value)
													}
													disabled={isLoading}
													required
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor={`url-${index}`}>URL</Label>
												<Input
													id={`url-${index}`}
													placeholder="https://example.com"
													type="url"
													value={link.url}
													onChange={(e) =>
														handleCustomChange(index, "url", e.target.value)
													}
													disabled={isLoading}
													required
												/>
											</div>
										</div>
									</div>
								))}

								<div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
									<Button
										type="button"
										variant="outline"
										onClick={handleAddCustomLink}
										disabled={isLoading}
										className="gap-2"
									>
										<Plus className="h-4 w-4" />
										Add Another Link
									</Button>

									<div className="flex gap-3">
										<Button
											type="button"
											variant="outline"
											onClick={() => setActiveTab("social")}
										>
											Back
										</Button>

										<Button
											type="submit"
											disabled={isLoading || getCustomCount() === 0}
											className="gap-2"
										>
											{isLoading ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : null}
											Save Custom Links
											{getCustomCount() > 0 && ` (${getCustomCount()})`}
										</Button>
									</div>
								</div>
							</form>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{(getSocialCount() > 0 || getCustomCount() > 0) && (
				<Card className="bg-muted/50">
					<CardContent className="pt-6">
						<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
							<div>
								<h3 className="font-semibold">Ready to publish?</h3>
								<p className="text-muted-foreground text-sm">
									{getSocialCount() + getCustomCount()} links will be added to
									your profile
								</p>
							</div>

							<Button
								onClick={handleSaveAll}
								disabled={isLoading}
								size="lg"
								className="gap-2"
							>
								{isLoading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Sparkles className="h-4 w-4" />
								)}
								Publish All Links
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
