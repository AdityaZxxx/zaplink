"use client";

import { CloudArrowUp, Image as ImageIcon } from "@phosphor-icons/react";
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
				toast.error("Choose an image file.");
				return;
			}

			// Validate file size (e.g., 4MB)
			if (file.size > 4 * 1024 * 1024) {
				toast.error("Use an image under 4 MB.");
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
							alt=""
							fill
							className="object-cover transition-opacity group-hover:opacity-50"
						/>
						<div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
							<CloudArrowUp aria-hidden className="h-8 w-8 text-primary" />
						</div>
					</>
				) : (
					<div className="flex flex-col items-center justify-center gap-2 text-muted transition-colors group-hover:text-muted">
						<ImageIcon aria-hidden className="h-8 w-8" />
						<span className="text-caption">Choose an image</span>
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
					className="text-caption text-red-500 hover:underline"
				>
					Remove image
				</button>
			)}
		</div>
	);
}
