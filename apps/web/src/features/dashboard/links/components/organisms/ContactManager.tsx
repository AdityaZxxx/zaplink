"use client";

import type { links } from "@zaplink/db";
import {
	Contact,
	Mail,
	Pencil,
	Phone,
	Plus,
	Smartphone,
	Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Link = typeof links.$inferSelect & {
	contact?: { type: string; value: string } | null;
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
			case "whatsapp":
				return Smartphone;
			default:
				return Contact;
		}
	};

	return (
		<div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg text-white">Contact Info</h3>
					<p className="text-sm text-zinc-500">
						Sticky buttons for quick actions.
					</p>
				</div>
				<Button onClick={onAdd} size="sm" variant="outline" className="gap-2">
					<Plus className="h-4 w-4" /> Add Contact
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{links.map((link) => {
					const Icon = getIcon(link.contact?.type || "other");
					return (
						<div
							key={link.id}
							className="group flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 transition-all hover:border-zinc-700 hover:bg-zinc-900"
						>
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
								<Icon className="h-5 w-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-sm text-zinc-200">
									{link.title || link.contact?.value}
								</p>
								<p className="truncate text-xs text-zinc-500">
									{link.contact?.value}
								</p>
							</div>
							<div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
								<Button
									size="icon"
									variant="ghost"
									className="h-8 w-8 text-zinc-500 hover:text-white"
									onClick={() => onEdit(link)}
								>
									<Pencil className="h-4 w-4" />
								</Button>
								<Button
									size="icon"
									variant="ghost"
									className="h-8 w-8 text-zinc-500 hover:text-red-500"
									onClick={() => onDelete(link.id)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</div>
					);
				})}
				{links.length === 0 && (
					<div className="col-span-full flex h-20 items-center justify-center rounded-xl border border-zinc-800 border-dashed text-sm text-zinc-600">
						No contact info added
					</div>
				)}
			</div>
		</div>
	);
}
