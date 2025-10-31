import { CameraIcon, User2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadButton } from "@/utils/uploadthing";

export const UserAvatar = ({ avatarUrl }: { avatarUrl: string }) => {
	const router = useRouter();
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
			<div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-white opacity-0 transition-all group-hover:opacity-100">
				<CameraIcon className="h-5 w-5" />
				<UploadButton
					endpoint="avatarUploader"
					onClientUploadComplete={() => {
						toast.success("Profile picture updated");
						router.refresh();
					}}
					onUploadError={(error: Error) => {
						toast.error(`Upload failed: ${error.message}`);
					}}
					className="absolute inset-0 z-10 ut-allowed-content:hidden h-full ut-button:h-full ut-button:w-full w-full ut-button:cursor-pointer ut-button:bg-transparent ut-button:p-0 ut-button:text-transparent ut-button:ring-0 ut-button:focus-within:ring-0"
				/>
			</div>
		</div>
	);
};
