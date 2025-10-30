"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@zaplink/db";
import { CheckCircle2, Edit3, Eye, Image, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/utils/trpc/client";
import { BasicInfoForm } from "./components/BasicInfoForm";
import { FormFooter } from "./components/FormFooter";
import { MediaForm } from "./components/MediaForm";
import { ProfilePreview } from "./components/ProfilePreview";
import { useProfileForm } from "./hooks/useProfileForm";

type TRPCError = {
	message: string;
};

export function ProfileForm({ profile }: { profile: Profile }) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("basic");

	const { mutate, isPending } = useMutation(
		trpc.profile.updateProfile.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(
					trpc.profile.getProfile.queryFilter(),
				);
				toast.success("Profile updated successfully", {
					description: "Your profile has been saved and is live!",
					icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
				});
				router.refresh();
			},
			onError: (error: TRPCError) => {
				toast.error("Failed to update profile", {
					description: error.message,
				});
			},
		}),
	);

	const {
		formData,
		setFormData,
		isDirty,
		characterCount,
		limits,
		getCharacterColor,
	} = useProfileForm(profile);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!isDirty) return;
		mutate({
			displayName: formData.displayName,
			username: formData.username,
			bio: formData.bio,
		});
	};

	const handleReset = () => {
		setFormData({
			displayName: profile.displayName ?? "",
			username: profile.username ?? "",
			bio: profile.bio ?? "",
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-6"
			>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="basic" className="flex items-center gap-2">
						<User className="h-4 w-4" />
						Basic Info
					</TabsTrigger>
					<TabsTrigger value="media" className="flex items-center gap-2">
						<Image className="h-4 w-4" />
						Media
					</TabsTrigger>
					<TabsTrigger value="preview" className="flex items-center gap-2">
						<Eye className="h-4 w-4" />
						Preview
					</TabsTrigger>
				</TabsList>

				<TabsContent value="basic">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Edit3 className="h-5 w-5" />
								Basic Information
							</CardTitle>
							<CardDescription>
								This information will be displayed on your public profile
							</CardDescription>
						</CardHeader>
						<CardContent>
							<BasicInfoForm
								formData={formData}
								setFormData={setFormData}
								characterCount={characterCount}
								limits={limits}
								getCharacterColor={getCharacterColor}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="media">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Image className="h-5 w-5" />
								Profile Media
							</CardTitle>
							<CardDescription>
								Customize your profile with images (coming soon)
							</CardDescription>
						</CardHeader>
						<CardContent>
							<MediaForm />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="preview">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Eye className="h-5 w-5" />
								Profile Preview
							</CardTitle>
							<CardDescription>
								This is how your profile will appear to others
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ProfilePreview formData={formData} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<FormFooter
				isDirty={isDirty}
				isPending={isPending}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				handleReset={handleReset}
				handleSubmit={handleSubmit}
			/>
		</form>
	);
}
