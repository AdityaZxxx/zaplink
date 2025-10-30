import { Edit3, RotateCcw, Save, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FormFooterProps {
	isDirty: boolean;
	isPending: boolean;
	activeTab: string;
	setActiveTab: (tab: string) => void;
	handleReset: () => void;
	handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function FormFooter({
	isDirty,
	isPending,
	activeTab,
	setActiveTab,
	handleReset,
	handleSubmit,
}: FormFooterProps) {
	const handleTabNavigation = () => {
		if (activeTab === "basic") {
			setActiveTab("media");
		} else if (activeTab === "media") {
			setActiveTab("preview");
		} else {
			setActiveTab("basic");
		}
	};

	return (
		<div className="flex items-center justify-between border-t pt-6">
			<div className="flex items-center gap-2">
				{isDirty && (
					<>
						<Badge variant="outline" className="gap-1">
							<Edit3 className="h-3 w-3" />
							Unsaved changes
						</Badge>
						<Button
							type="button"
							variant="ghost"
							onClick={handleReset}
							disabled={!isDirty || isPending}
							className="gap-2"
						>
							<RotateCcw className="h-4 w-4" />
							Reset
						</Button>
					</>
				)}
			</div>

			<div className="flex gap-3">
				<Button type="button" variant="outline" onClick={handleTabNavigation}>
					{activeTab === "basic"
						? "Next: Media"
						: activeTab === "media"
							? "Next: Preview"
							: "Back to Edit"}
				</Button>

				<Button
					type="submit"
					disabled={!isDirty || isPending}
					className="gap-2"
				>
					{isPending ? (
						<Save className="h-4 w-4 animate-pulse" />
					) : (
						<Sparkles className="h-4 w-4" />
					)}
					{isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		</div>
	);
}
