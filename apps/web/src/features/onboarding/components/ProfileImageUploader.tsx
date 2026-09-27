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
			if (!file.type.match("image.*")) {
				toast.error("Choose an image file.");
				return;
			}

			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}

			const objectUrl = URL.createObjectURL(file);
			setPreviewUrl(objectUrl);

			if (onFileChange) {
				onFileChange(file);
			}

			onImageChange(objectUrl);
		}
	};

	const displayUrl = previewUrl || imageUrl;

	/*
	 * group-focus-within, so the scrim also appears for keyboard focus: a
	 * hover-only scrim left the file input focusable with nothing drawn.
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
					<span className="px-2 text-center font-medium text-caption">
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
