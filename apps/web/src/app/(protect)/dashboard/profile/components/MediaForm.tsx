import { Camera, Image as ImageIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldContent,
	FieldGroup,
	FieldLabel,
	FieldTitle,
} from "@/components/ui/field";

export function MediaForm() {
	return (
		<FieldGroup className="space-y-6">
			<Field>
				<FieldContent>
					<FieldLabel>
						<FieldTitle className="flex items-center gap-2">
							<Camera className="h-5 w-5" />
							Profile Picture
						</FieldTitle>
					</FieldLabel>
					<div className="flex items-start gap-6">
						<div className="group relative">
							<div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-muted-foreground/25 border-dashed bg-gradient-to-br from-purple-100 to-blue-100">
								<div className="text-center">
									<User className="mx-auto mb-1 h-8 w-8 text-muted-foreground" />
									<p className="text-muted-foreground text-xs">Avatar</p>
								</div>
							</div>
							<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
								<Camera className="h-6 w-6 text-white" />
							</div>
						</div>
						<div className="flex-1 space-y-2">
							<p className="text-muted-foreground text-sm">
								Upload a profile picture to make your account more recognizable.
							</p>
							<Button variant="outline" size="sm" disabled className="gap-2">
								<ImageIcon className="h-4 w-4" />
								Upload Image
							</Button>
							<p className="text-muted-foreground text-xs">
								Recommended: 400x400px, JPG or PNG
							</p>
						</div>
					</div>
				</FieldContent>
			</Field>

			<Field>
				<FieldContent>
					<FieldLabel>
						<FieldTitle className="flex items-center gap-2">
							<ImageIcon className="h-5 w-5" />
							Profile Banner
						</FieldTitle>
					</FieldLabel>
					<div className="space-y-4">
						<div className="group relative">
							<div className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-muted-foreground/25 border-dashed bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100">
								<div className="text-center">
									<ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
									<p className="text-muted-foreground text-sm">
										Profile Banner
									</p>
									<p className="text-muted-foreground text-xs">
										Drag & drop or click to upload
									</p>
								</div>
							</div>
							<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
								<Camera className="h-6 w-6 text-white" />
							</div>
						</div>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" disabled className="gap-2">
								<ImageIcon className="h-4 w-4" />
								Upload Banner
							</Button>
							<Button variant="ghost" size="sm" disabled>
								Remove
							</Button>
						</div>
						<p className="text-muted-foreground text-xs">
							Recommended: 1200x400px, JPG or PNG. Max 5MB.
						</p>
					</div>
				</FieldContent>
			</Field>
		</FieldGroup>
	);
}
