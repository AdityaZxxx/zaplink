"use client";

import { Spinner } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface SettingsSaveBarProps {
	isDirty: boolean;
	isSubmitting: boolean;
	onReset: () => void;
}

/**
 * Shared by every editable settings section so they all read the same way: a
 * hairline, a plain-language note about unsaved work, and a pair of buttons
 * that stay inert until there is something to save.
 *
 * `justify-between` with a left slot is deliberate. Rendering the note only
 * when dirty would slide the buttons left on the first keystroke; an empty
 * paragraph holds the row height without moving anything.
 */
export function SettingsSaveBar({
	isDirty,
	isSubmitting,
	onReset,
}: SettingsSaveBarProps) {
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
					 * The label never swaps to "Saving...". A spinner beside a
					 * stable label keeps the button the same width, so the row
					 * does not reflow mid-submit, and the disabled state is
					 * already the cue that the save is in flight.
					 */}
					{isSubmitting && <Spinner className="animate-spin" />}
					Save changes
				</Button>
			</div>
		</div>
	);
}
