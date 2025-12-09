import { useQuery } from "@tanstack/react-query";
import { LogOut, Monitor, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
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
			<Button variant="outline" asChild>
				<Link href="/login">Sign In</Link>
			</Button>
		);
	}

	const isPending = isSessionPending || isProfilePending;

	if (isPending) {
		return <Skeleton className="h-9 w-9 rounded-full" />;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-9 w-9 rounded-full">
					<Avatar className="h-9 w-9 cursor-pointer">
						{/* biome-ignore lint: lint/style/noNonNullAssertion */}
						<AvatarImage src={profile.avatarUrl!} alt={profile.displayName!} />
						<AvatarFallback>{profile.displayName?.charAt(0)}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-64 bg-card" align="end">
				<div className="flex items-center gap-3 p-2">
					<Avatar className="h-12 w-12">
						{/* biome-ignore lint: lint/style/noNonNullAssertion */}
						<AvatarImage src={profile.avatarUrl!} alt={profile.displayName!} />
						<AvatarFallback>{profile.displayName?.charAt(0)}</AvatarFallback>
					</Avatar>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">
							{profile.displayName}
						</span>
						<span className="truncate text-muted-foreground text-sm">
							@{profile.username}
						</span>
					</div>
				</div>

				<DropdownMenuSeparator />

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
						<Sun className="h-4 w-4" />
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
						<Moon className="h-4 w-4" />
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
						<Monitor className="h-4 w-4" />
					</Button>
				</div>

				<DropdownMenuSeparator />

				<DropdownMenuItem asChild>
					<Button
						variant="secondary"
						className="w-full"
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
						<LogOut className="h-4 w-4" />
						Logout
					</Button>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
