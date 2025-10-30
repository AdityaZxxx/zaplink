import { Link, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProfileFormState } from "../hooks/useProfileForm";

interface ProfilePreviewProps {
	formData: ProfileFormState;
}

export function ProfilePreview({ formData }: ProfilePreviewProps) {
	return (
		<div className="rounded-lg border bg-card p-6">
			<div className="mb-4 h-24 w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500" />

			<div className="flex items-start gap-4">
				<div className="-mt-12 relative">
					<div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-background bg-muted">
						<User className="h-8 w-8 text-muted-foreground" />
					</div>
				</div>

				<div className="flex-1 pt-2">
					<div className="flex items-start justify-between">
						<div>
							<h3 className="font-bold text-xl">
								{formData.displayName || "Your Display Name"}
							</h3>
							<p className="text-muted-foreground">
								@{formData.username || "username"}
							</p>
						</div>
						<Badge variant="secondary" className="gap-1">
							<Link className="h-3 w-3" />
							zaplink.com/{formData.username || "username"}
						</Badge>
					</div>

					{formData.bio && (
						<p className="mt-3 text-muted-foreground text-sm">{formData.bio}</p>
					)}

					{!formData.bio && (
						<p className="mt-3 text-muted-foreground text-sm italic">
							Your bio will appear here...
						</p>
					)}
				</div>
			</div>

			<div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
				<div className="text-center">
					<div className="font-bold text-lg">0</div>
					<div className="text-muted-foreground text-xs">Links</div>
				</div>
				<div className="text-center">
					<div className="font-bold text-lg">0</div>
					<div className="text-muted-foreground text-xs">Views</div>
				</div>
				<div className="text-center">
					<div className="font-bold text-lg">0</div>
					<div className="text-muted-foreground text-xs">Clicks</div>
				</div>
			</div>
		</div>
	);
}
