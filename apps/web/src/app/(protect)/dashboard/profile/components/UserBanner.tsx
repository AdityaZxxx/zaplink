import { CameraIcon, Loader2, User2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { UploadButton } from "@/utils/uploadthing";

export const UserBanner = ({ bannerUrl }: { bannerUrl: string }) => {
	const router = useRouter();
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);

	return (
		<div className="group relative h-full w-full overflow-hidden rounded-t-xl">
			{bannerUrl ? (
				<Image src={bannerUrl} alt="banner" fill className="object-cover" />
			) : (
				<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
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
					endpoint="bannerUploader"
					onUploadBegin={() => {
						setIsUploading(true);
						setProgress(0);
					}}
					onClientUploadComplete={() => {
						setIsUploading(false);
						setProgress(0);
						toast.success("Profile banner updated");
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
