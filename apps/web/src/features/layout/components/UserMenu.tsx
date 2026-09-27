import { Monitor, Moon, SignOut, Sun } from "@phosphor-icons/react/ssr";
import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc/client";

export default function UserMenu() {
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();
	const { data: profile, isPending: isProfilePending } = useQuery(
		trpc.profile.getProfile.queryOptions(undefined, {
			enabled: !!session?.user,
		}),
	);

	if (!session || !profile) {
		return (
			<Link href="/login" className={buttonVariants({ variant: "outline" })}>
				Sign in
			</Link>
		);
	}

	const isPending = isSessionPending || isProfilePending;

	if (isPending) {
		return <Skeleton className="h-9 w-9 rounded-full" />;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="ghost" className="relative h-9 w-9 rounded-full">
						<Avatar className="h-9 w-9 cursor-pointer">
							<AvatarImage
								src={profile.avatarUrl ?? undefined}
								alt={profile.displayName ?? "Profile photo"}
							/>
							<AvatarFallback>{profile.displayName?.charAt(0)}</AvatarFallback>
						</Avatar>
					</Button>
				}
			/>
			<DropdownMenuContent className="w-64 bg-card" align="end">
				<div className="flex items-center gap-3 p-2">
					<Avatar className="h-12 w-12">
						{/*
						 * Empty alt, unlike the trigger above: the display name is
						 * already the visible text here, so naming it twice reads
						 * as "Aditya, Aditya".
						 */}
						<AvatarImage src={profile.avatarUrl ?? undefined} alt="" />
						<AvatarFallback>{profile.displayName?.charAt(0)}</AvatarFallback>
					</Avatar>
					<div className="grid flex-1 text-left text-body leading-tight">
						<span className="truncate font-semibold">
							{profile.displayName}
						</span>
						<span className="truncate text-body text-muted-foreground">
							@{profile.username}
						</span>
					</div>
				</div>

				<DropdownMenuSeparator />

				{/*
				 * DropdownMenuGroup is required, not decorative: it is the only
				 * thing that provides MenuGroupContext, and DropdownMenuLabel
				 * reads that context to wire up aria-labelledby. Rendered bare,
				 * Base UI throws "MenuGroupContext is missing" -- in production
				 * too, not just dev. It also supplies role="group", so the
				 * visually hidden "Theme" label now actually names the control.
				 */}
				<DropdownMenuGroup>
					<DropdownMenuLabel className="sr-only">Theme</DropdownMenuLabel>
					<div className="grid grid-cols-3 gap-1 p-2">
						<Button
							variant={theme === "light" ? "default" : "outline"}
							size="sm"
							className={cn(
								"flex h-8 flex-col items-center justify-center gap-1 px-2 py-1",
								theme === "light" && "bg-primary text-primary-foreground",
							)}
							onClick={() => setTheme("light")}
						>
							<Sun aria-hidden className="h-4 w-4" />
						</Button>
						<Button
							variant={theme === "dark" ? "default" : "outline"}
							size="sm"
							className={cn(
								"flex h-8 flex-col items-center justify-center gap-1 px-2 py-1",
								theme === "dark" && "bg-primary text-primary-foreground",
							)}
							onClick={() => setTheme("dark")}
						>
							<Moon aria-hidden className="h-4 w-4" />
						</Button>
						<Button
							variant={theme === "system" ? "default" : "outline"}
							size="sm"
							className={cn(
								"flex h-8 flex-col items-center justify-center gap-1 px-2 py-1",
								theme === "system" && "bg-primary text-primary-foreground",
							)}
							onClick={() => setTheme("system")}
						>
							<Monitor aria-hidden className="h-4 w-4" />
						</Button>
					</div>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				{/*
				 * Styled in place rather than wrapping a <Button> in `render`.
				 * MenuPrimitive.Item is nativeButton={false} and expects a div,
				 * so handing it a real <button> made Base UI stamp role="menuitem"
				 * and aria-disabled onto a button and warn about the mismatch.
				 * Keeping the item as the one interactive element also keeps it in
				 * the menu's own keyboard navigation, which a nested button
				 * would sit outside of.
				 */}
				<DropdownMenuItem
					className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
					onClick={() => {
						authClient.signOut({
							fetchOptions: {
								onSuccess: () => {
									router.push("/");
								},
							},
						});
					}}
				>
					<SignOut aria-hidden className="h-4 w-4" />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
