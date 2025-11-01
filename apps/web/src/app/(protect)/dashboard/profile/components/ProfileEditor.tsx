import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import type { profiles } from "@zaplink/db";
import { Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, trpc } from "@/utils/trpc/client";
import { UserAvatar } from "./UserAvatar";

type Profile = typeof profiles.$inferSelect;

export const ProfileEditor = ({ profile }: { profile: Profile }) => {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	const { mutate, isPending } = useMutation(
		trpc.profile.updateProfile.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.profile.getProfile.queryFilter());
				toast.success("Profile updated");
				setIsOpen(false);
				router.refresh();
			},
			onError: (error) => {
				toast.error("Failed to update profile", { description: error.message });
			},
		}),
	);

	const DISPLAY_NAME_MAX_LENGTH = 30;
	const BIO_MAX_LENGTH = 160;

	const form = useForm({
		defaultValues: {
			displayName: profile.displayName ?? "",
			bio: profile.bio ?? "",
		},
		onSubmit: async ({ value }) => {
			if (value.displayName.length > DISPLAY_NAME_MAX_LENGTH) {
				toast.error(
					`Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters`,
				);
				return;
			}

			if (value.bio.length > BIO_MAX_LENGTH) {
				toast.error(`Bio must be at most ${BIO_MAX_LENGTH} characters`);
				return;
			}

			mutate({
				displayName: value.displayName,
				bio: value.bio,
			});
		},
	});

	return (
		<div className="group flex cursor-pointer items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50">
			<UserAvatar avatarUrl={profile.avatarUrl ?? ""} />

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<h1 className="truncate font-semibold text-lg">
								{profile.displayName || "Your Name"}
							</h1>
							<Edit3 className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
						</div>
						<p className="line-clamp-2 break-words text-muted-foreground text-sm">
							{profile.bio || "Add a bio to describe yourself..."}
						</p>
					</div>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Profile</DialogTitle>
						<DialogDescription>
							Update your display name and bio
						</DialogDescription>
					</DialogHeader>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<form.Field
							name="displayName"
							children={(field) => (
								<Field>
									<FieldLabel className="flex items-center justify-between">
										<span>Display Name</span>
										<Badge variant="outline" className="text-xs">
											{field.state.value.length}/{DISPLAY_NAME_MAX_LENGTH}
										</Badge>
									</FieldLabel>
									<FieldContent>
										<Input
											placeholder="Enter your name"
											value={field.state.value}
											onChange={(e) => {
												if (e.target.value.length <= DISPLAY_NAME_MAX_LENGTH) {
													field.handleChange(e.target.value);
												}
											}}
											maxLength={DISPLAY_NAME_MAX_LENGTH}
										/>
									</FieldContent>
								</Field>
							)}
						/>

						<form.Field
							name="bio"
							children={(field) => (
								<Field>
									<FieldLabel className="flex items-center justify-between">
										<span>Bio</span>
										<Badge variant="outline" className="text-xs">
											{field.state.value.length}/{BIO_MAX_LENGTH}
										</Badge>
									</FieldLabel>
									<FieldContent>
										<Textarea
											placeholder="Tell people about yourself..."
											value={field.state.value}
											onChange={(e) => {
												if (e.target.value.length <= BIO_MAX_LENGTH) {
													field.handleChange(e.target.value);
												}
											}}
											rows={3}
											maxLength={BIO_MAX_LENGTH}
										/>
									</FieldContent>
								</Field>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
								disabled={isPending}
								className="w-full gap-2"
							>
								{isPending ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
};
