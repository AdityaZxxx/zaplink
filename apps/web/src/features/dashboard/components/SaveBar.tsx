import { Spinner } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface SaveBarProps {
	isDirty: boolean;
	isSubmitting: boolean;
	onReset: () => void;
}

/*
 * The left slot holds the row height, so the note appearing on the first
 * keystroke does not slide the buttons.
 */
export function SaveBar({ isDirty, isSubmitting, onReset }: SaveBarProps) {
	return (
		<div className="flex items-center justify-between gap-3 border-t pt-4">
			<p aria-live="polite" className="text-muted-foreground text-xs">
				{isDirty ? "Unsaved changes" : null}
			</p>
			<div className="flex shrink-0 items-center gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={onReset}
					disabled={!isDirty || isSubmitting}
				>
					Reset
				</Button>
				<Button type="submit" disabled={!isDirty || isSubmitting}>
					{/*
					 * The label stays put, so the button keeps its width and the row does
					 * not reflow mid-submit.
					 */}
					{isSubmitting && <Spinner className="animate-spin" />}
					Save changes
				</Button>
			</div>
		</div>
	);
}
