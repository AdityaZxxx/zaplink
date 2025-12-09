"use client";

import type {
	linkContacts,
	linkCustoms,
	linkPlatforms,
	links,
} from "@zaplink/db";
import {
	Contact,
	Globe,
	Mail,
	Pencil,
	Phone,
	Plus,
	Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Link = typeof links.$inferSelect & {
	platform?: typeof linkPlatforms.$inferSelect | null;
	custom?: typeof linkCustoms.$inferSelect | null;
	contact?: typeof linkContacts.$inferSelect | null;
};

interface ContactManagerProps {
	links: Link[];
	onAdd: () => void;
	onEdit: (link: Link) => void;
	onDelete: (id: number) => void;
}

export function ContactManager({
	links,
	onAdd,
	onEdit,
	onDelete,
}: ContactManagerProps) {
	const getIcon = (type: string) => {
		switch (type) {
			case "email":
				return Mail;
			case "phone":
				return Phone;
			case "website":
				return Globe;
			default:
				return Contact;
		}
	};

	return (
		<div className="rounded-2xl border border-border bg-card/50 p-6">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-foreground text-lg">
						Contact Info
					</h3>
					<p className="text-muted-foreground text-sm">
						Sticky buttons for quick actions.
					</p>
				</div>
				<Button onClick={onAdd} size="sm" variant="outline" className="gap-2">
					<Plus className="h-4 w-4" />{" "}
					<span className="hidden md:inline">Add Contact</span>
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{links.map((link) => {
					const Icon = getIcon(link.contact?.type || "other");
					return (
						<div
							key={link.id}
							className="group flex items-center gap-3 rounded-xl border border-border bg-card/30 p-3 transition-all hover:border-border/70 hover:bg-card"
						>
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
								<Icon className="h-5 w-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-foreground text-sm">
									{link.title || link.contact?.value}
								</p>
								<p className="truncate text-muted-foreground text-xs">
									{link.contact?.value}
								</p>
							</div>
							<div className="flex gap-1">
								<Button
									size="icon"
									variant="ghost"
									className="h-8 w-8 text-muted-foreground hover:text-foreground"
									onClick={() => onEdit(link)}
								>
									<Pencil className="h-4 w-4" />
								</Button>
								<Button
									size="icon"
									variant="ghost"
									className="h-8 w-8 text-muted-foreground hover:text-destructive"
									onClick={() => onDelete(link.id)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</div>
					);
				})}
				{links.length === 0 && (
					<div className="col-span-full flex h-20 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground text-sm">
						No contact info added
					</div>
				)}
			</div>
		</div>
	);
}
