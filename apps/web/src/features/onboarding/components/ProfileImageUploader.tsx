import { CameraIcon, User2Icon } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

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

	return (
		<div className="space-y-2">
			<div
				className={cn(
					"group relative overflow-hidden rounded-md border border-zinc-800 bg-zinc-900/50",
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
							"flex items-center justify-center bg-zinc-900",
							aspectRatio,
						)}
					>
						<User2Icon className="h-8 w-8 text-zinc-700" />
					</div>
				)}

				<div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-white opacity-0 transition-all group-hover:opacity-100">
					<CameraIcon className="h-6 w-6" />
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileChange}
						className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
						accept="image/*"
					/>
				</div>
			</div>
		</div>
	);
};
