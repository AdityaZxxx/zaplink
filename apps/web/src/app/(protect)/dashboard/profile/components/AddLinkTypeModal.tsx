import { LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import SUPPORT_PLATFORMS from "@/lib/constants/SUPPORT_PLATFORMS";

type SupportedPlatform = keyof typeof SUPPORT_PLATFORMS;

type AddLinkTypeModalState = {
	isOpen: boolean;
};

export const AddLinkTypeModal = ({
	isOpen,
	onClose,
	onSelectLinkType,
}: AddLinkTypeModalState & {
	onClose: () => void;
	onSelectLinkType: (type: "custom" | SupportedPlatform) => void;
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add New Link</DialogTitle>
					<DialogDescription>
						Choose the type of link you want to add.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3 py-4">
					<Button
						variant="outline"
						className="w-full justify-start gap-3"
						onClick={() => onSelectLinkType("custom")}
					>
						<LinkIcon className="h-5 w-5" />
						<span>Custom Link</span>
					</Button>

					<div className="border-t pt-2">
						<p className="mb-2 text-muted-foreground text-sm">
							Social Platforms
						</p>
						<div className="space-y-2">
							{Object.entries(SUPPORT_PLATFORMS).map(
								([platform, platformInfo]) => {
									const Icon = platformInfo.icon;
									return (
										<Button
											key={platform}
											variant="outline"
											className="w-full justify-start gap-3"
											onClick={() =>
												onSelectLinkType(platform as SupportedPlatform)
											}
										>
											<Icon className="h-5 w-5" />
											<span>{platformInfo.name}</span>
										</Button>
									);
								},
							)}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
