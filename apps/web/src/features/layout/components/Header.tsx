"use client";

import Link from "next/link";
import { APP_NAME } from "@/lib/constants/BRANDS";
import UserMenu from "./UserMenu";

export default function Header() {
	return (
		<nav className="container mx-auto flex h-16 max-w-7xl flex-row items-center justify-between border-b px-2 py-1">
			<div className="flex items-center">
				<Link href="/" className="flex items-center">
					<span className="text-heading">{APP_NAME}</span>
				</Link>
			</div>
			<div className="flex items-center gap-4">
				<UserMenu />
			</div>
		</nav>
	);
}
