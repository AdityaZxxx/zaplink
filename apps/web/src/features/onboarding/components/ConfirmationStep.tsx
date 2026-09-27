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
import type { LinksData, ProfileData } from "@/types/api";
import { trpc } from "@/utils/trpc/client";
import { useUploadThing } from "@/utils/uploadthing";
import type { OnboardingData } from "../page";

/*
 * Negative so a preview link can never be confused for a persisted row. Link
 * ids are a serial, so a negative one can never exist in the database, which
 * means wiring onLinkClick to this preview later fails loudly instead of
 * recording a click against link 0.
 */
const previewLinkId = (index: number) => -(index + 1);

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
				toast.error("Could not publish your profile", {
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

		const interval: ReturnType<typeof setInterval> = setInterval(() => {
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
			toast.error("Could not upload your images. Try again.");
			console.error(error);
		} finally {
			setIsUploading(false);
		}
	};

	const handleCopyLink = () => {
		const url = `${window.location.origin}/${data.username}`;
		navigator.clipboard.writeText(url);
		toast.success("Link copied");
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

	/*
	 * Memoized so a re-render that does not touch the preview, such as opening
	 * the success dialog, keeps the same objects and lets React.memo skip the
	 * card. Rebuilt inline, every one of those renders redrew the whole card.
	 */
	const previewProfile = useMemo<ProfileData>(
		() => ({
			id: 0,
			userId: "preview",
			username: data.username,
			displayName: data.displayName,
			bio: data.bio,
			avatarUrl: data.avatarFile ? previewAvatarUrl : data.avatarUrl,
			bannerUrl: data.bannerFile ? previewBannerUrl : data.bannerUrl,
			seoTitle: null,
			seoDescription: null,
			supportBanner: "none",
		}),
		[data, previewAvatarUrl, previewBannerUrl],
	);

	/*
	 * All three relations are filled in even though onboarding only makes
	 * custom and platform links. Drizzle types a `one()` join as always
	 * present when its key is not unique, and linkId is not unique in the join
	 * tables. The card only reads the relation matching `type`, so the rest
	 * are never observed.
	 */
	const previewLinks = useMemo<LinksData>(
		() =>
			data.links.map((link, index) => {
				const id = previewLinkId(index);
				return {
					id,
					profileId: 0,
					type: link.type,
					title: link.title,
					url: link.url,
					sortOrder: index,
					isHidden: false,
					platform: {
						linkId: id,
						name: link.platformName ?? "",
						category: link.platformCategory ?? "social",
						iconUrl: null,
					},
					custom: {
						linkId: id,
						displayMode: "standard",
						title: null,
						iconUrl: null,
						thumbnailUrl: null,
					},
					contact: {
						linkId: id,
						type: "",
						value: "",
					},
				};
			}),
		[data.links],
	);

	return (
		<div className="space-y-6">
			<ProfileCard profile={previewProfile} links={previewLinks} />

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
					{completeOnboardingMutation.isPending ? "Publishing" : "Publish"}
				</Button>
			</div>

			<Dialog open={showSuccessModal} onOpenChange={() => {}}>
				<DialogContent
					className="border-zinc-800 bg-zinc-900 text-center text-white sm:max-w-md"
					showCloseButton={false}
				>
					<DialogHeader>
						<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
							<CheckCircle aria-hidden className="h-10 w-10 text-green-500" />
						</div>
						<DialogTitle className="text-center text-title">
							Your profile is live
						</DialogTitle>
						<DialogDescription className="text-center text-zinc-400">
							Copy the link below, then add more links from the dashboard.
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-3 py-6">
						<Button
							variant="outline"
							className="h-12 w-full gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
							onClick={handleCopyLink}
						>
							<Copy aria-hidden className="h-4 w-4" />
							Copy link
						</Button>
						<Button
							variant="outline"
							className="h-12 w-full gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
							onClick={() => window.open(`/${data.username}`, "_blank")}
						>
							<ArrowSquareOut aria-hidden className="h-4 w-4" />
							View profile
						</Button>
						<Button
							className="h-12 w-full gap-2 bg-white text-black hover:bg-zinc-200"
							onClick={() => router.push("/dashboard")}
						>
							<Layout aria-hidden className="h-4 w-4" />
							Go to dashboard
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
