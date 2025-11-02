import { CameraIcon, Loader2, User2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { UploadButton } from "@/utils/uploadthing";

export const UserAvatar = ({ avatarUrl }: { avatarUrl: string }) => {
	const router = useRouter();
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);

	return (
		<div className="group relative h-20 w-20 overflow-hidden rounded-full">
			{avatarUrl ? (
				<Image
					src={avatarUrl}
					alt="avatar"
					width={80}
					height={80}
					className="h-full w-full object-cover"
				/>
			) : (
				<div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100">
					<User2Icon className="h-8 w-8 text-muted-foreground" />
				</div>
			)}

			{isUploading && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
					<div className="flex flex-col items-center">
						<Loader2 className="mb-1 h-6 w-6 animate-spin" />
						<span className="text-xs">{progress}%</span>
					</div>
				</div>
			)}

			<div
				className={`absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-white opacity-0 transition-all group-hover:opacity-100 ${isUploading ? "opacity-100" : ""}`}
			>
				<CameraIcon className="h-5 w-5" />
				<UploadButton
					endpoint="avatarUploader"
					onUploadBegin={() => {
						setIsUploading(true);
						setProgress(0);
					}}
					onClientUploadComplete={() => {
						setIsUploading(false);
						setProgress(0);
						toast.success("Profile picture updated");
						router.refresh();
					}}
					onUploadError={(error: Error) => {
						setIsUploading(false);
						setProgress(0);
						toast.error(`Upload failed: ${error.message}`);
					}}
					onUploadProgress={(progress) => {
						setProgress(Math.round(progress));
					}}
					className="absolute inset-0 z-10 ut-allowed-content:hidden h-full ut-button:h-full ut-button:w-full w-full ut-button:cursor-pointer ut-button:bg-transparent ut-button:p-0 ut-button:text-transparent ut-button:ring-0 ut-button:focus-within:ring-0"
				/>
			</div>
		</div>
	);
};
