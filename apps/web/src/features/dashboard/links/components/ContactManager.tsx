import { PencilSimple, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { ProfileLink } from "@/types/api";
import { iconForLink } from "../lib/linkIcon";
import { LinksSection } from "./LinksSection";

interface ContactManagerProps {
	links: ProfileLink[];
	onAdd: () => void;
	onEdit: (link: ProfileLink) => void;
	onDelete: (id: number) => void;
}

export function ContactManager({
	links,
	onAdd,
	onEdit,
	onDelete,
}: ContactManagerProps) {
	return (
		<LinksSection
			title="Contact"
			description="Buttons pinned to the bottom of your page."
			actionLabel="Add contact"
			onAdd={onAdd}
		>
			{links.length === 0 ? (
				<p className="rounded-2xl border border-border border-dashed px-4 py-6 text-center text-body text-muted-foreground">
					No contact buttons yet. Add one so people can reach you directly.
				</p>
			) : (
				<ul className="grid gap-3 sm:grid-cols-2">
					{links.map((link) => {
						const Icon = iconForLink(link);

						return (
							<li
								key={link.id}
								className="group flex items-center gap-3 rounded-2xl border border-border bg-card/40 p-3 transition-[border-color,background-color] duration-150 ease-out hover:border-ring/40 hover:bg-card"
							>
								<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
									<Icon aria-hidden className="size-5" />
								</span>
								<span className="min-w-0 flex-1">
									<span className="block truncate font-medium text-body">
										{link.title || link.contact?.value}
									</span>
									<span className="block truncate text-caption text-muted-foreground">
										{link.contact?.value}
									</span>
								</span>
								<span className="flex shrink-0 items-center gap-1">
									<Button
										type="button"
										size="icon-sm"
										variant="ghost"
										onClick={() => onEdit(link)}
										aria-label={`Edit ${link.title}`}
									>
										<PencilSimple className="size-4" />
									</Button>
									<Button
										type="button"
										size="icon-sm"
										variant="ghost"
										onClick={() => onDelete(link.id)}
										className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
										aria-label={`Delete ${link.title}`}
									>
										<Trash className="size-4" />
									</Button>
								</span>
							</li>
						);
					})}
				</ul>
			)}
		</LinksSection>
	);
}
