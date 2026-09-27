import { Spinner } from "@phosphor-icons/react/ssr";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import {
	BIO_MAX,
	DISPLAY_NAME_MAX,
	USERNAME_MAX,
} from "@/lib/validation/profile";
import { trpc } from "@/utils/trpc/client";
import type { OnboardingData } from "../page";
import { ProfileImageUploader } from "./ProfileImageUploader";

interface UsernameAndProfileStepProps {
	onNext: () => void;
	initialData: OnboardingData;
	onUpdate: (data: Partial<OnboardingData>) => void;
}

export const UsernameAndProfileStep = ({
	onNext,
	initialData,
	onUpdate,
}: UsernameAndProfileStepProps) => {
	const [username, setUsername] = useState(initialData.username);
	const [displayName, setDisplayName] = useState(initialData.displayName);
	const [bio, setBio] = useState(initialData.bio);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(
		initialData.avatarUrl,
	);
	const [bannerUrl, setBannerUrl] = useState<string | null>(
		initialData.bannerUrl,
	);
	const [avatarFile, setAvatarFile] = useState<File | undefined>(
		initialData.avatarFile,
	);
	const [bannerFile, setBannerFile] = useState<File | undefined>(
		initialData.bannerFile,
	);

	// Persist avatar preview if file exists but url doesn't (e.g. on back navigation)
	useEffect(() => {
		if (initialData.avatarFile && !initialData.avatarUrl) {
			const objectUrl = URL.createObjectURL(initialData.avatarFile);
			setAvatarUrl(objectUrl);
			// Cleanup
			return () => URL.revokeObjectURL(objectUrl);
		}
	}, [initialData.avatarFile, initialData.avatarUrl]);

	// Debounced username for availability check
	const debouncedUsername = useDebounce(username, 500);

	// Check username availability
	const isUsernameValid =
		debouncedUsername.length >= 3 && /^[a-zA-Z0-9_]+$/.test(debouncedUsername);
	const { data: usernameCheck, isFetching: isCheckingUsername } = useQuery(
		trpc.onboarding.checkUsernameAvailability.queryOptions(
			{ username: debouncedUsername.toLowerCase() },
			{
				enabled: isUsernameValid,
				staleTime: 60000, // Cache for 1 minute
			},
		),
	);

	// Determine username status
	const usernameStatus = (() => {
		if (!username || username.length < 3) return "too_short";
		if (!/^[a-zA-Z0-9_]+$/.test(username)) return "invalid";
		if (username !== debouncedUsername) return "typing";
		if (isCheckingUsername) return "checking";
		if (usernameCheck?.available === true) return "available";
		if (usernameCheck?.available === false) return "taken";
		return "idle";
	})();

	const isUsernameAvailable = usernameStatus === "available";

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const profileSchema = z.object({
			username: z
				.string()
				.min(3, "Use at least 3 characters for the username")
				.max(USERNAME_MAX, `Shorten the username to ${USERNAME_MAX} characters`)
				.regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers and underscores only"),
			displayName: z
				.string()
				.min(1, "Enter a display name")
				.max(
					DISPLAY_NAME_MAX,
					`Shorten the display name to ${DISPLAY_NAME_MAX} characters`,
				),
			bio: z
				.string()
				.max(BIO_MAX, `Shorten the bio to ${BIO_MAX} characters`)
				.optional(),
		});

		const result = profileSchema.safeParse({
			username,
			displayName,
			bio,
		});

		if (!result.success) {
			const error = result.error;
			toast.error(error.message);
			return;
		}

		onUpdate({
			username,
			displayName,
			bio,
			// Don't save blob URLs to global state as they will be revoked
			avatarUrl: avatarUrl?.startsWith("blob:") ? null : avatarUrl,
			bannerUrl: bannerUrl?.startsWith("blob:") ? null : bannerUrl,
			avatarFile,
			bannerFile,
		});
		onNext();
	};

	return (
		<div className="space-y-6">
			<Card className="overflow-hidden border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
				{/* Banner Section */}
				<div className="group relative h-32 cursor-pointer bg-zinc-800/50 transition-colors hover:bg-zinc-800">
					<div className="absolute inset-0 flex items-center justify-center">
						{bannerUrl ? (
							/*
							 * `unoptimized` because this is always the blob URL of a
							 * file just picked, which the default loader rejects, and
							 * the browser already holds the bytes.
							 */
							<Image
								src={bannerUrl}
								alt="Banner preview"
								fill
								unoptimized
								sizes="100vw"
								className="object-cover"
							/>
						) : (
							<div className="flex items-center gap-2 font-medium text-body text-zinc-500">
								<svg
									aria-hidden="true"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
									<circle cx="9" cy="9" r="2" />
									<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
								</svg>
								Tap to add a banner image
							</div>
						)}
					</div>
					<input
						type="file"
						accept="image/*"
						className="absolute inset-0 cursor-pointer opacity-0"
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) {
								setBannerFile(file);
								setBannerUrl(URL.createObjectURL(file));
							}
						}}
					/>
				</div>

				<CardContent className="relative px-6 pt-0 pb-8">
					<form onSubmit={handleSubmit} className="flex flex-col items-center">
						{/* Avatar Section - Overlapping Banner */}
						<div className="relative z-10 -mt-12 mb-6">
							<ProfileImageUploader
								imageUrl={avatarUrl}
								onImageChange={setAvatarUrl}
								onFileChange={setAvatarFile}
								endpoint="avatarUploader"
								label="Photo"
								sizeClass="h-24 w-24 rounded-full border-4 border-zinc-950 shadow-xl"
							/>
						</div>

						{/*
						 * Each field keeps a visible label. The borderless, centered
						 * treatment reads as a profile preview, which is why the
						 * placeholder cannot be the only thing naming the field: it
						 * disappears on the first keystroke.
						 */}
						{/* Inputs Section */}
						<div className="w-full space-y-6 text-center">
							{/* Display Name & Username Group */}
							<div className="space-y-4">
								<div className="mx-auto max-w-xs">
									<div className="flex items-baseline justify-between gap-2 px-1">
										<label
											htmlFor="displayName"
											className="text-caption text-zinc-500"
										>
											Display name
										</label>
										<span className="text-caption text-zinc-600 tabular-nums">
											{displayName.length}/{DISPLAY_NAME_MAX}
										</span>
									</div>
									<Input
										id="displayName"
										placeholder="Your name"
										value={displayName}
										onChange={(e) => setDisplayName(e.target.value)}
										className="h-12 rounded-xl border-transparent bg-transparent text-center text-heading transition-all placeholder:text-zinc-600 hover:border-zinc-700 hover:bg-zinc-800/50 focus:border-zinc-700 focus:bg-zinc-800/50 focus:ring-0"
										maxLength={DISPLAY_NAME_MAX}
									/>
								</div>

								<div className="mx-auto max-w-[200px]">
									<div className="flex items-baseline justify-between gap-2 px-1">
										<label
											htmlFor="username"
											className="text-caption text-zinc-500"
										>
											Username
										</label>
										<span className="text-caption text-zinc-600 tabular-nums">
											{username.length}/{USERNAME_MAX}
										</span>
									</div>
									<div className="relative">
										<span className="absolute top-1/2 left-3 -translate-y-1/2 font-medium text-zinc-500">
											@
										</span>
										<Input
											id="username"
											placeholder="yourname"
											value={username}
											onChange={(e) => {
												const value = e.target.value;
												// Only allow letters, numbers, and underscores
												if (/^[a-zA-Z0-9_]*$/.test(value)) {
													setUsername(value);
												}
											}}
											className="h-10 rounded-lg border-transparent bg-transparent pr-8 pl-8 text-center font-medium transition-all placeholder:text-zinc-600 hover:border-zinc-700 hover:bg-zinc-800/50 focus:border-zinc-700 focus:bg-zinc-800/50 focus:ring-0"
											maxLength={USERNAME_MAX}
											aria-describedby="username-status"
										/>
									</div>
									{/* Status message */}
									<p
										id="username-status"
										aria-live="polite"
										className="mt-1 px-1 text-center text-caption"
									>
										{usernameStatus === "checking" && (
											<span className="text-zinc-500">
												Checking that name...
											</span>
										)}
										{usernameStatus === "available" && (
											<span className="text-emerald-500">
												That username is free
											</span>
										)}
										{usernameStatus === "taken" && (
											<span className="text-red-500">
												That username is taken. Try another.
											</span>
										)}
										{usernameStatus === "too_short" && username.length > 0 && (
											<span className="text-zinc-500">
												Use at least 3 characters
											</span>
										)}
										{(usernameStatus === "idle" ||
											usernameStatus === "typing" ||
											(usernameStatus === "too_short" &&
												username.length === 0)) && (
											<span className="text-zinc-600">
												Letters, numbers and underscores
											</span>
										)}
									</p>
								</div>
							</div>

							{/* Bio Section */}
							<div className="mx-auto max-w-sm">
								<div className="flex items-baseline justify-between gap-2 px-1">
									<label htmlFor="bio" className="text-caption text-zinc-500">
										Bio
									</label>
									<span className="text-caption text-zinc-600 tabular-nums">
										{bio.length}/{BIO_MAX}
									</span>
								</div>
								<Textarea
									id="bio"
									placeholder="One line about what you make"
									value={bio}
									onChange={(e) => setBio(e.target.value)}
									className="min-h-[80px] resize-none rounded-xl border-transparent bg-transparent text-center text-body text-zinc-300 transition-all placeholder:text-zinc-600 hover:border-zinc-700 hover:bg-zinc-800/50 focus:border-zinc-700 focus:bg-zinc-800/50 focus:ring-0"
									maxLength={BIO_MAX}
								/>
							</div>

							<div className="sticky bottom-0 z-50 -mx-6 -mb-8 border-zinc-800 border-t bg-zinc-950/80 px-6 py-4 backdrop-blur-xl">
								<Button
									type="submit"
									disabled={
										!username ||
										!displayName ||
										!isUsernameAvailable ||
										isCheckingUsername
									}
									className="h-12 w-full rounded-xl bg-white font-medium text-base text-black hover:bg-zinc-200 disabled:opacity-50"
								>
									{isCheckingUsername ? (
										<>
											<Spinner className="mr-2 h-4 w-4 animate-spin" />
											Checking...
										</>
									) : (
										"Continue"
									)}
								</Button>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
