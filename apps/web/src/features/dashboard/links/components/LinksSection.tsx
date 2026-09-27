import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface LinksSectionProps {
	title: string;
	description: string;
	actionLabel: string;
	onAdd: () => void;
	children: React.ReactNode;
}

export function LinksSection({
	title,
	description,
	actionLabel,
	onAdd,
	children,
}: LinksSectionProps) {
	return (
		<section className="rounded-2xl border border-border bg-card/50 p-5 md:p-6">
			<header className="mb-4 flex flex-wrap items-start justify-between gap-3">
				<div className="min-w-0 space-y-1">
					<h2 className="font-semibold text-lg">{title}</h2>
					<p className="text-muted-foreground text-sm">{description}</p>
				</div>
				<Button
					type="button"
					onClick={onAdd}
					size="sm"
					variant="outline"
					className="shrink-0 gap-1.5"
				>
					<Plus className="size-4" />
					{actionLabel}
				</Button>
			</header>
			{children}
		</section>
	);
}
