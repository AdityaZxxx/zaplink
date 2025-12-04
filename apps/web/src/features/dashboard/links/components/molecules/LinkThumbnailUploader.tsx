"use client";

import { Image as ImageIcon, UploadCloud } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface LinkThumbnailUploaderProps {
	imageUrl: string | null;
	onImageChange: (url: string) => void;
	onFileChange: (file: File) => void;
}

export function LinkThumbnailUploader({
	imageUrl,
	onImageChange,
	onFileChange,
}: LinkThumbnailUploaderProps) {
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

			// Validate file size (e.g., 4MB)
			if (file.size > 4 * 1024 * 1024) {
				toast.error("File size must be less than 4MB");
				return;
			}

			// Create preview
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}

			const objectUrl = URL.createObjectURL(file);
			setPreviewUrl(objectUrl);

			// Pass file to parent
			onFileChange(file);
			onImageChange(objectUrl);
		}
	};

	const displayUrl = previewUrl || imageUrl;

	return (
		<div className="space-y-2">
			<Button
				className="group relative flex h-32 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-zinc-800 border-dashed bg-zinc-900/50 transition-all hover:border-zinc-700 hover:bg-zinc-900"
				onClick={() => fileInputRef.current?.click()}
			>
				{displayUrl ? (
					<>
						<Image
							src={displayUrl}
							alt="Thumbnail"
							fill
							className="object-cover transition-opacity group-hover:opacity-50"
						/>
						<div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
							<UploadCloud className="h-8 w-8 text-white" />
						</div>
					</>
				) : (
					<div className="flex flex-col items-center justify-center gap-2 text-zinc-500 transition-colors group-hover:text-zinc-400">
						<ImageIcon className="h-8 w-8" />
						<span className="text-xs">Click to upload thumbnail</span>
					</div>
				)}

				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileChange}
					className="hidden"
					accept="image/*"
				/>
			</Button>
			{displayUrl && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						setPreviewUrl(null);
						onImageChange("");
						// Reset file input
						if (fileInputRef.current) {
							fileInputRef.current.value = "";
						}
					}}
					className="text-red-500 text-xs hover:underline"
				>
					Remove thumbnail
				</button>
			)}
		</div>
	);
}
