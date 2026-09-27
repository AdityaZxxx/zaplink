"use client";

import { Camera } from "@phosphor-icons/react";
import { cn } from "cn";
import Image from "next/image";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ProfileImageUploaderProps {
	imageUrl: string | null;
	onImageChange: (url: string) => void;
	onFileChange?: (file: File) => void;
	endpoint: "avatarUploader" | "bannerUploader";
	label: string;
	sizeClass: string;
	aspectRatio?: string;
}

export const ProfileImageUploader = ({
	imageUrl,
	onImageChange,
	onFileChange,
	label,
	sizeClass,
	aspectRatio = "aspect-square",
}: ProfileImageUploaderProps) => {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Clean up preview URL when component unmounts
	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.match("image.*")) {
				toast.error("Please select an image file");
				return;
			}

			// Create preview
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}

			const objectUrl = URL.createObjectURL(file);
			setPreviewUrl(objectUrl);

			// Pass file to parent
			if (onFileChange) {
				onFileChange(file);
			}

			// Also update the string URL for immediate feedback if needed,
			// though for deferred upload we mainly care about the file.
			// We can pass the objectUrl as a temporary "image url"
			onImageChange(objectUrl);
		}
	};

	// Use preview URL if available, otherwise use the provided imageUrl
	const displayUrl = previewUrl || imageUrl;

	/*
	 * The scrim used to appear on group-hover only, which left the file input
	 * reachable by keyboard with nothing drawn: tabbing onto it produced no
	 * ring and no overlay. group-focus-within brings the scrim up for keyboard
	 * focus, and has-[:focus-visible] on the frame draws the same ring every
	 * other control in the app uses.
	 *
	 * The frame is also token-coloured now. It was pinned to zinc-900, so the
	 * empty state was a near-black tile in light mode and in dark mode alike.
	 */
	return (
		<div className="space-y-2">
			<div
				className={cn(
					"group relative overflow-hidden rounded-2xl border border-border bg-muted transition-[border-color,box-shadow] duration-150 ease-out has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30",
					sizeClass,
				)}
			>
				{displayUrl ? (
					<Image
						src={displayUrl}
						alt={label}
						fill
						className={cn("object-cover", aspectRatio)}
					/>
				) : (
					<div
						className={cn(
							"flex items-center justify-center bg-muted text-muted-foreground",
							aspectRatio,
						)}
					>
						<Camera className="size-6" />
					</div>
				)}

				<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 text-white opacity-0 transition-opacity duration-150 ease-out group-focus-within:opacity-100 group-hover:opacity-100">
					<Camera className="size-5" />
					<span className="px-2 text-center font-medium text-xs">
						Change {label.toLowerCase()}
					</span>
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileChange}
						className="pointer-events-auto absolute inset-0 z-10 size-full cursor-pointer opacity-0"
						accept="image/*"
						aria-label={`Change ${label.toLowerCase()}`}
					/>
				</div>
			</div>
		</div>
	);
};
