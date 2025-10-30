import type { Profile } from "@zaplink/db";
import { useMemo, useState } from "react";

export interface ProfileFormState {
	displayName: string;
	username: string;
	bio: string;
}

export function useProfileForm(initialProfile: Profile) {
	const [formData, setFormData] = useState<ProfileFormState>({
		displayName: initialProfile.displayName ?? "",
		username: initialProfile.username ?? "",
		bio: initialProfile.bio ?? "",
	});

	const isDirty = useMemo(() => {
		return (
			formData.displayName !== (initialProfile.displayName ?? "") ||
			formData.username !== (initialProfile.username ?? "") ||
			formData.bio !== (initialProfile.bio ?? "")
		);
	}, [formData, initialProfile]);

	// Character counting logic
	const characterCount = {
		displayName: formData.displayName.length,
		username: formData.username.length,
		bio: formData.bio?.length || 0,
	};

	const limits = {
		displayName: { max: 50, warning: 40 },
		username: { max: 30, warning: 25 },
		bio: { max: 160, warning: 140 },
	};

	const getCharacterColor = (count: number, max: number, warning: number) => {
		if (count > max) return "text-red-500";
		if (count > warning) return "text-yellow-500";
		return "text-muted-foreground";
	};

	return {
		formData,
		setFormData,
		isDirty,
		characterCount,
		limits,
		getCharacterColor,
	};
}
