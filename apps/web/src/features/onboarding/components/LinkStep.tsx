import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SUPPORT_PLATFORMS } from "@/lib/constants/SUPPORT_PLATFORMS";
import type { OnboardingData } from "../page";

interface LinkStepProps {
	onNext: () => void;
	onBack: () => void;
	initialLinks: OnboardingData["links"];
	onUpdate: (links: OnboardingData["links"]) => void;
}

export const LinkStep = ({
	onNext,
	onBack,
	initialLinks,
	onUpdate,
}: LinkStepProps) => {
	const [step, setStep] = useState<"selection" | "input">(() => {
		return initialLinks.length > 0 ? "input" : "selection";
	});

	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(() => {
		const platforms = initialLinks
			.map((link) =>
				link.type === "custom" ? "custom" : link.platformName || "",
			)
			.filter(Boolean);
		return platforms;
	});

	const [linkInputs, setLinkInputs] = useState<
		Record<string, { value: string; title?: string }>
	>(() => {
		const inputs: Record<string, { value: string; title?: string }> = {};

		initialLinks.forEach((link) => {
			if (link.type === "custom") {
				inputs.custom = {
					value: link.url,
					title: link.title,
				};
			} else if (link.platformName) {
				const platform =
					SUPPORT_PLATFORMS[
						link.platformName as keyof typeof SUPPORT_PLATFORMS
					];
				if (platform) {
					// Extract username from URL if possible, otherwise use empty string
					// The URL is stored as `${platform.baseUrl}${input.value}`
					const username = link.url.replace(platform.baseUrl, "").trim();
					inputs[link.platformName] = {
						value: username,
					};
				}
			}
		});

		return inputs;
	});

	// Helper to check if custom link is selected
	const isCustomSelected = selectedPlatforms.includes("custom");

	const togglePlatform = (key: string) => {
		setSelectedPlatforms((prev) =>
			prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
		);
	};

	const handleSelectionContinue = () => {
		if (selectedPlatforms.length === 0) {
			// Skip if nothing selected
			onUpdate([]);
			onNext();
			return;
		}
		setStep("input");
	};

	const handleInputChange = (
		key: string,
		field: "value" | "title",
		value: string,
	) => {
		setLinkInputs((prev) => ({
			...prev,
			[key]: {
				...prev[key],
				value: field === "value" ? value : prev[key]?.value || "",
				title: field === "title" ? value : prev[key]?.title || "",
			},
		}));
	};

	const handleFinalSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const newLinks: OnboardingData["links"] = [];

		// Process Platform Links
		selectedPlatforms.forEach((key) => {
			if (key === "custom") return;

			const input = linkInputs[key];
			if (input?.value?.trim()) {
				const platform =
					SUPPORT_PLATFORMS[key as keyof typeof SUPPORT_PLATFORMS];
				if (platform) {
					newLinks.push({
						title: platform.name,
						url: `${platform.baseUrl}${input.value} `,
						type: "platform",
						platformName: key,
						platformCategory: platform.category,
					});
				}
			}
		});

		// Process Custom Link
		if (isCustomSelected) {
			const customInput = linkInputs.custom;
			if (customInput?.title?.trim() && customInput?.value?.trim()) {
				newLinks.push({
					title: customInput.title,
					url: customInput.value,
					type: "custom",
				});
			}
		}

		onUpdate(newLinks);
		onNext();
	};

	if (step === "selection") {
		return (
			<div className="space-y-6">
				<Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
					<CardContent className="p-6">
						<div className="mb-6 text-center">
							<h2 className="mb-2 font-semibold text-white text-xl">
								Add your links
							</h2>
							<p className="text-sm text-zinc-400">
								Select the platforms you want to add to your profile.
							</p>
						</div>

						<div className="custom-scrollbar grid max-h-[400px] grid-cols-4 gap-4 overflow-y-auto pr-2">
							{/* Custom Link Option - First Item */}
							<button
								type="button"
								className={`group flex aspect-square flex-col items-center justify-center rounded-xl border transition-all active:scale-95 ${
									isCustomSelected
										? "border-green-500 bg-zinc-800/80"
										: "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800"
								}`}
								onClick={() => togglePlatform("custom")}
							>
								<Plus
									className={`h-8 w-8 transition-colors ${isCustomSelected ? "text-green-500" : "text-zinc-400 group-hover:text-white"}`}
								/>
								<span className="mt-2 font-medium text-xs text-zinc-500 group-hover:text-zinc-300">
									Custom
								</span>
							</button>

							{/* Platform Options */}
							{Object.entries(SUPPORT_PLATFORMS).map(([key, platform]) => {
								const isSelected = selectedPlatforms.includes(key);
								return (
									<button
										type="button"
										key={key}
										className={`group flex aspect-square flex-col items-center justify-center rounded-xl border transition-all active:scale-95 ${
											isSelected
												? "border-green-500 bg-zinc-800/80"
												: "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800"
										}`}
										onClick={() => togglePlatform(key)}
									>
										<platform.icon
											className={`h-8 w-8 transition-colors ${isSelected ? "text-white" : "text-zinc-400 group-hover:text-white"}`}
										/>
									</button>
								);
							})}
						</div>

						<div className="mt-2 flex items-center justify-between border-zinc-800 border-t pt-4">
							<Button
								type="button"
								variant="ghost"
								onClick={onBack}
								className="text-zinc-400 hover:bg-zinc-800 hover:text-white"
							>
								Back
							</Button>
							<Button
								onClick={handleSelectionContinue}
								className="bg-white px-8 text-black hover:bg-zinc-200"
							>
								{selectedPlatforms.length > 0 ? "Continue" : "Skip"}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
				<CardContent className="p-6">
					<div className="mb-6 text-center">
						<h2 className="mb-2 font-semibold text-white text-xl">
							Enter your details
						</h2>
						<p className="text-sm text-zinc-400">
							Fill in the links you want to display.
						</p>
					</div>

					<form onSubmit={handleFinalSubmit} className="space-y-6">
						<div className="flex flex-col gap-6">
							{selectedPlatforms.map((key) => {
								if (key === "custom") {
									return (
										<div
											key="custom"
											className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/30 p-4"
										>
											<div className="mb-2 flex items-center justify-between">
												<Label className="font-medium text-white">
													Custom Link
												</Label>
												<button
													type="button"
													onClick={() => togglePlatform("custom")}
													className="text-zinc-500 hover:text-red-400"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
											<div className="space-y-3">
												<Input
													placeholder="Link Title (e.g. My Portfolio)"
													value={linkInputs.custom?.title || ""}
													onChange={(e) =>
														handleInputChange("custom", "title", e.target.value)
													}
													className="border-zinc-800 bg-zinc-950/50 focus:border-white/20 focus:ring-0"
												/>
												<Input
													placeholder="URL (https://...)"
													value={linkInputs.custom?.value || ""}
													onChange={(e) =>
														handleInputChange("custom", "value", e.target.value)
													}
													className="border-zinc-800 bg-zinc-950/50 focus:border-white/20 focus:ring-0"
												/>
											</div>
										</div>
									);
								}

								const platform =
									SUPPORT_PLATFORMS[key as keyof typeof SUPPORT_PLATFORMS];
								if (!platform) return null;

								return (
									<div key={key} className="space-y-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<platform.icon className="h-4 w-4 text-zinc-400" />
												<Label className="text-zinc-300">{platform.name}</Label>
											</div>
											<button
												type="button"
												onClick={() => togglePlatform(key)}
												className="text-zinc-500 hover:text-red-400"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
										<div className="relative">
											<div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
												<span className="max-w-[150px] truncate text-sm text-zinc-500">
													{platform.baseUrl.replace("https://", "")}
												</span>
											</div>
											<Input
												placeholder="username"
												value={linkInputs[key]?.value || ""}
												onChange={(e) =>
													handleInputChange(key, "value", e.target.value)
												}
												className="h-12 border-zinc-800 bg-zinc-950/50 pl-[160px] focus:border-white/20 focus:ring-0"
											/>
										</div>
									</div>
								);
							})}
						</div>

						<div className="mt-8 flex gap-3 border-zinc-800 border-t pt-6">
							<Button
								type="button"
								variant="ghost"
								onClick={() => setStep("selection")}
								className="flex-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
							>
								Back to Selection
							</Button>
							<Button
								type="submit"
								className="flex-2 bg-white font-medium text-black hover:bg-zinc-200"
							>
								Continue
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
