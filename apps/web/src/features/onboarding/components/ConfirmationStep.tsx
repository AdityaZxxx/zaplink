import {
	ArrowSquareOut,
	CheckCircle,
	Copy,
	Layout,
} from "@phosphor-icons/react/ssr";
import { useMutation } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ProfileCard } from "@/features/profile/components";
import { trpc } from "@/utils/trpc/client";
import { useUploadThing } from "@/utils/uploadthing";
import type { OnboardingData } from "../page";

// The preview is local-only and never persisted, so one stable timestamp is
// enough for every field. Allocating `new Date()` inside the memos changed the
// object identity on each recompute, which gave the memos no benefit and
// defeated React.memo on ProfileCard.
const PREVIEW_TIMESTAMP = new Date();

interface ConfirmationStepProps {
	onBack: () => void;
	data: OnboardingData;
}

export const ConfirmationStep = ({ onBack, data }: ConfirmationStepProps) => {
	const router = useRouter();
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [_isUploading, setIsUploading] = useState(false);

	const { startUpload: uploadAvatar } = useUploadThing("avatarUploader");
	const { startUpload: uploadBanner } = useUploadThing("bannerUploader");

	const completeOnboardingMutation = useMutation(
		trpc.onboarding.completeOnboarding.mutationOptions({
			onSuccess: () => {
				triggerConfetti();
				setShowSuccessModal(true);
			},
			onError: (error) => {
				toast.error("Something went wrong", {
					description: error.message,
				});
			},
		}),
	);

	const triggerConfetti = () => {
		const duration = 5 * 1000;
		const animationEnd = Date.now() + duration;
		const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

		const random = (min: number, max: number) => {
			return Math.random() * (max - min) + min;
		};

		const interval: any = setInterval(() => {
			const timeLeft = animationEnd - Date.now();

			if (timeLeft <= 0) {
				return clearInterval(interval);
			}

			const particleCount = 50 * (timeLeft / duration);
			confetti({
				...defaults,
				particleCount,
				origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 },
			});
			confetti({
				...defaults,
				particleCount,
				origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 },
			});
		}, 250);
	};

	const handleComplete = async () => {
		try {
			setIsUploading(true);
			let finalAvatarUrl = data.avatarUrl;
			let finalBannerUrl = data.bannerUrl;

			// Upload Avatar if file exists
			if (data.avatarFile) {
				const res = await uploadAvatar([data.avatarFile]);
				if (res?.[0]) {
					finalAvatarUrl = res[0].ufsUrl;
				}
			}

			// Upload Banner if file exists
			if (data.bannerFile) {
				const res = await uploadBanner([data.bannerFile]);
				if (res?.[0]) {
					finalBannerUrl = res[0].ufsUrl;
				}
			}

			completeOnboardingMutation.mutate({
				username: data.username,
				displayName: data.displayName,
				bio: data.bio,
				avatarUrl: finalAvatarUrl,
				bannerUrl: finalBannerUrl,
				links: data.links,
			});
		} catch (error) {
			toast.error("Failed to upload images");
			console.error(error);
		} finally {
			setIsUploading(false);
		}
	};

	const handleCopyLink = () => {
		const url = `${window.location.origin}/${data.username}`;
		navigator.clipboard.writeText(url);
		toast.success("Link copied to clipboard!");
	};

	const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
	const [previewBannerUrl, setPreviewBannerUrl] = useState<string | null>(null);

	// Object URLs are a side effect, so they are created in an effect rather
	// than during render. Each URL is revoked when its file is replaced and
	// again on unmount, so the Blob is never pinned for the page lifetime.
	useEffect(() => {
		if (!data.avatarFile) {
			setPreviewAvatarUrl(null);
			return;
		}

		const objectUrl = URL.createObjectURL(data.avatarFile);
		setPreviewAvatarUrl(objectUrl);

		// Cleanup
		return () => URL.revokeObjectURL(objectUrl);
	}, [data.avatarFile]);

	useEffect(() => {
		if (!data.bannerFile) {
			setPreviewBannerUrl(null);
			return;
		}

		const objectUrl = URL.createObjectURL(data.bannerFile);
		setPreviewBannerUrl(objectUrl);

		// Cleanup
		return () => URL.revokeObjectURL(objectUrl);
	}, [data.bannerFile]);

	const previewProfile = useMemo(
		() => ({
			id: "preview",
			userId: "preview",
			username: data.username,
			displayName: data.displayName,
			bio: data.bio,
			avatarUrl: data.avatarFile ? previewAvatarUrl : data.avatarUrl,
			bannerUrl: data.bannerFile ? previewBannerUrl : data.bannerUrl,
			themeId: null,
			createdAt: PREVIEW_TIMESTAMP,
			updatedAt: PREVIEW_TIMESTAMP,
		}),
		[data, previewAvatarUrl, previewBannerUrl],
	);

	const previewLinks = useMemo(
		() =>
			data.links.map((link, i) => ({
				id: `preview-${i}`,
				url: link.url,
				title: link.title,
				order: i,
				profileId: "preview",
				createdAt: PREVIEW_TIMESTAMP,
				updatedAt: PREVIEW_TIMESTAMP,
				type: link.type,
				platformName: link.platformName,
			})),
		[data.links],
	);

	return (
		<div className="space-y-6">
			<ProfileCard
				profile={previewProfile as any}
				links={previewLinks as any}
			/>

			<div className="sticky bottom-0 z-50 flex items-center justify-between border-zinc-800 border-t bg-zinc-950/80 px-6 py-4 backdrop-blur-xl">
				<Button
					type="button"
					variant="ghost"
					onClick={onBack}
					disabled={completeOnboardingMutation.isPending}
					className="text-zinc-400 hover:bg-zinc-800 hover:text-white"
				>
					Back
				</Button>
				<Button
					onClick={handleComplete}
					disabled={completeOnboardingMutation.isPending}
					className="bg-white px-8 text-black hover:bg-zinc-200"
				>
					{completeOnboardingMutation.isPending
						? "Publishing..."
						: "Publish Profile"}
				</Button>
			</div>

			<Dialog open={showSuccessModal} onOpenChange={() => {}}>
				<DialogContent
					className="border-zinc-800 bg-zinc-900 text-center text-white sm:max-w-md"
					showCloseButton={false}
				>
					<DialogHeader>
						<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
							<CheckCircle className="h-10 w-10 text-green-500" />
						</div>
						<DialogTitle className="text-center font-bold text-2xl">
							Your Zaplink is Live!
						</DialogTitle>
						<DialogDescription className="text-center text-zinc-400">
							Congratulations! Your profile has been successfully created and is
							ready to share with the world.
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-3 py-6">
						<Button
							variant="outline"
							className="h-12 w-full gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
							onClick={handleCopyLink}
						>
							<Copy className="h-4 w-4" />
							Copy Link
						</Button>
						<Button
							variant="outline"
							className="h-12 w-full gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
							onClick={() => window.open(`/${data.username}`, "_blank")}
						>
							<ArrowSquareOut className="h-4 w-4" />
							Visit Page
						</Button>
						<Button
							className="h-12 w-full gap-2 bg-white text-black hover:bg-zinc-200"
							onClick={() => router.push("/dashboard")}
						>
							<Layout className="h-4 w-4" />
							Go to Editor
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
