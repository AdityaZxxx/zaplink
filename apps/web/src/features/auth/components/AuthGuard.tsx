"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/shared/Loader";
import { authClient } from "@/lib/auth-client";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!isPending && !session) {
			// Encode the current path to redirect back after login
			const callbackUrl = encodeURIComponent(pathname);
			router.replace(`/login?callbackUrl=${callbackUrl}`);
		}
	}, [session, isPending, router, pathname]);

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<Loader />
			</div>
		);
	}

	if (!session) {
		return null; // Will redirect via useEffect
	}

	return <>{children}</>;
}
