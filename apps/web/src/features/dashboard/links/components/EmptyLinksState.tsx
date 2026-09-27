import { CursorClick } from "@phosphor-icons/react";

export function EmptyLinksState() {
	return (
		<div className="flex flex-col items-center justify-center rounded-2xl border border-border border-dashed px-6 py-10 text-center">
			<span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
				<CursorClick aria-hidden className="size-5" />
			</span>
			<p className="mt-3 font-medium text-sm">No links yet</p>
			<p className="mt-1 max-w-[40ch] text-muted-foreground text-sm">
				Add a block and it will appear here and on your public profile.
			</p>
		</div>
	);
}
