import type { links } from "@zaplink/db";
import { Edit3, GripVertical } from "lucide-react";
import SUPPORT_PLATFORMS from "@/lib/constants/SUPPORT_PLATFORMS";

type Link = typeof links.$inferSelect;
type SupportedPlatform = keyof typeof SUPPORT_PLATFORMS;

export const SocialPlatformCard = ({
	platform,
	existingLink,
	onClick,
	dragHandleAttributes,
	dragHandleListeners,
}: {
	platform: SupportedPlatform;
	existingLink?: Link;
	onClick: () => void;
	// biome-ignore lint: false positive
	dragHandleAttributes: any;
	// biome-ignore lint: false positive
	dragHandleListeners: any;
}) => {
	const platformInfo = SUPPORT_PLATFORMS[platform];
	const Icon = platformInfo.icon;

	return (
		<div
			className={`flex items-center gap-3 rounded-xl border p-2.5 ${
				!existingLink && "opacity-50"
			}`}
		>
			<div
				{...dragHandleAttributes}
				{...dragHandleListeners}
				className="cursor-grab touch-none p-2"
			>
				<GripVertical className="h-5 w-5 text-muted-foreground" />
			</div>
			<button
				type="button"
				onClick={onClick}
				className="flex min-w-0 flex-1 items-center gap-3 text-left"
			>
				<div
					className={`flex h-12 w-12 items-center justify-center rounded-full ${
						existingLink ? "bg-primary/10" : "bg-muted"
					}`}
				>
					<Icon
						className={`h-6 w-6 ${
							existingLink ? "text-primary" : "text-muted-foreground"
						}`}
					/>
				</div>
				<div className="min-w-0 flex-1">
					<div className="font-medium">{platformInfo.name}</div>
					<div className="truncate text-muted-foreground text-sm">
						{existingLink
							? existingLink.url.replace(platformInfo.baseUrl, "")
							: "Not connected"}
					</div>
				</div>
				<div
					className={`rounded-full p-1 ${
						existingLink ? "text-primary" : "text-muted-foreground"
					}`}
				>
					<Edit3 className="h-4 w-4" />
				</div>
			</button>
		</div>
	);
};
