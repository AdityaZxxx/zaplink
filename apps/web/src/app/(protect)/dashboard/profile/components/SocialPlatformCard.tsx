import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { links } from "@zaplink/db";
import { Edit3, Eye, EyeOff, GripVertical } from "lucide-react";
import { toast } from "sonner";
import SUPPORT_PLATFORMS from "@/lib/constants/SUPPORT_PLATFORMS";
import { trpc } from "@/utils/trpc/client";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";

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

	const queryClient = useQueryClient();

	const { mutate: updateLink, isPending: isUpdating } = useMutation(
		trpc.links.updateLink.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.links.getAllLinks.queryFilter());
				toast.success("Link visibility updated");
			},
			onError: (error) => {
				toast.error("Failed to update link", { description: error.message });
			},
		}),
	);

	const handleToggleVisibility = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!existingLink) return;

		updateLink({
			id: existingLink.id,
			isHidden: !existingLink.isHidden,
		});
	};

	const handleEditClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onClick();
	};

	const getDisplayUrl = () => {
		if (!existingLink) return "Not connected";
		return existingLink.url.replace(platformInfo.baseUrl, "");
	};

	const getStatusText = () => {
		if (!existingLink) return "Not connected";
		return existingLink.isHidden ? "Hidden from profile" : "Visible on profile";
	};

	return (
		<div className="flex items-center gap-3 rounded-xl border bg-card p-2.5">
			<div
				{...dragHandleAttributes}
				{...dragHandleListeners}
				className="cursor-grab touch-none p-2"
			>
				<GripVertical className="h-5 w-5 text-muted-foreground" />
			</div>
			<div className="flex min-w-0 flex-1 items-center gap-3 text-left">
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					<Icon className="h-6 w-6 text-muted-foreground" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<span className="font-medium text-foreground">
							{platformInfo.name}
						</span>
						{existingLink?.isHidden && (
							<Badge className="rounded-full bg-yellow-100 px-2 py-0.5 font-medium text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
								Hidden
							</Badge>
						)}
					</div>
					<div className="flex items-center gap-2">
						<p className="truncate text-muted-foreground text-sm">
							{getDisplayUrl()}
						</p>
						<span className="text-muted-foreground/70 text-xs">•</span>
						<p className="text-muted-foreground text-xs">{getStatusText()}</p>
					</div>
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="secondary"
						onClick={handleToggleVisibility}
						disabled={isUpdating}
						className="rounded-lg p-2 transition-all duration-200 hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
						title={existingLink?.isHidden ? "Show link" : "Hide link"}
					>
						{existingLink?.isHidden ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</Button>
					<Button
						variant="secondary"
						onClick={handleEditClick}
						className="rounded-lg p-2 transition-all duration-200 hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
						title="Edit link"
					>
						<Edit3 className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
};
