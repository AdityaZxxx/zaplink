"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	return (
		<nav className="container mx-auto flex h-16 max-w-5xl flex-row items-center justify-between border-b px-2 py-1">
			<div className="flex items-center">
				<Link href="/" className="flex items-center">
					<span className="font-bold text-2xl tracking-tight">Zaplink</span>
				</Link>
			</div>
			<div className="flex items-center gap-4">
				<ModeToggle />
				<UserMenu />
			</div>
		</nav>
	);
}
