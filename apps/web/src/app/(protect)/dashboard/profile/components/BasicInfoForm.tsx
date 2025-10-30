import { Badge } from "@/components/ui/badge";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileFormState } from "../hooks/useProfileForm";

interface BasicInfoFormProps {
	formData: ProfileFormState;
	setFormData: (data: ProfileFormState) => void;
	characterCount: {
		displayName: number;
		username: number;
		bio: number;
	};
	limits: {
		displayName: { max: number; warning: number };
		username: { max: number; warning: number };
		bio: { max: number; warning: number };
	};
	getCharacterColor: (count: number, max: number, warning: number) => string;
}

export function BasicInfoForm({
	formData,
	setFormData,
	characterCount,
	limits,
	getCharacterColor,
}: BasicInfoFormProps) {
	return (
		<FieldGroup className="space-y-6">
			<Field>
				<FieldContent>
					<div className="mb-2 flex items-center justify-between">
						<FieldLabel>
							<FieldTitle className="flex items-center gap-2">
								Display Name
								{formData.displayName && (
									<Badge variant="secondary" className="text-xs">
										{characterCount.displayName}/{limits.displayName.max}
									</Badge>
								)}
							</FieldTitle>
						</FieldLabel>
						{characterCount.displayName > limits.displayName.warning && (
							<span
								className={getCharacterColor(
									characterCount.displayName,
									limits.displayName.max,
									limits.displayName.warning,
								)}
							>
								{limits.displayName.max - characterCount.displayName} left
							</span>
						)}
					</div>
					<Input
						value={formData.displayName}
						onChange={(e) =>
							setFormData({
								...formData,
								displayName: e.target.value,
							})
						}
						maxLength={limits.displayName.max}
						placeholder="Enter your display name"
						className="font-medium text-lg"
					/>
					<FieldDescription>
						This will be your public display name. Make it memorable!
					</FieldDescription>
				</FieldContent>
			</Field>

			<Field>
				<FieldContent>
					<div className="mb-2 flex items-center justify-between">
						<FieldLabel>
							<FieldTitle className="flex items-center gap-2">
								Username
								{formData.username && (
									<Badge variant="secondary" className="text-xs">
										{characterCount.username}/{limits.username.max}
									</Badge>
								)}
							</FieldTitle>
						</FieldLabel>
						{characterCount.username > limits.username.warning && (
							<span
								className={getCharacterColor(
									characterCount.username,
									limits.username.max,
									limits.username.warning,
								)}
							>
								{limits.username.max - characterCount.username} left
							</span>
						)}
					</div>
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-sm">zaplink.com/</span>
						<Input
							value={formData.username}
							onChange={(e) =>
								setFormData({
									...formData,
									username: e.target.value
										.toLowerCase()
										.replace(/[^a-z0-9-_]/g, ""),
								})
							}
							maxLength={limits.username.max}
							placeholder="your-username"
							className="flex-1 font-mono"
						/>
					</div>
					<FieldDescription>
						This will be your unique URL. Only letters, numbers, hyphens and
						underscores.
					</FieldDescription>
				</FieldContent>
			</Field>

			<Field>
				<FieldContent>
					<div className="mb-2 flex items-center justify-between">
						<FieldLabel>
							<FieldTitle className="flex items-center gap-2">
								Bio
								{formData.bio && (
									<Badge variant="secondary" className="text-xs">
										{characterCount.bio}/{limits.bio.max}
									</Badge>
								)}
							</FieldTitle>
						</FieldLabel>
						{characterCount.bio > limits.bio.warning && (
							<span
								className={getCharacterColor(
									characterCount.bio,
									limits.bio.max,
									limits.bio.warning,
								)}
							>
								{limits.bio.max - characterCount.bio} left
							</span>
						)}
					</div>
					<Textarea
						value={formData.bio}
						onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
						maxLength={limits.bio.max}
						placeholder="Tell people about yourself..."
						rows={4}
						className="resize-none"
					/>
					<FieldDescription>
						A short description about yourself. This appears on your profile
						page.
					</FieldDescription>
				</FieldContent>
			</Field>
		</FieldGroup>
	);
}
