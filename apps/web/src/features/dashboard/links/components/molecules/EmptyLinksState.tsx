import { MousePointerClick } from "lucide-react";

export function EmptyLinksState() {
	return (
		<div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed text-center text-muted-foreground">
			<MousePointerClick className="mb-2 h-8 w-8 text-muted-foreground/30" />
			<p>No links yet.</p>
			<p className="text-sm">Click "Add Link" to get started.</p>
		</div>
	);
}
