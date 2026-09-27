"use client";

import {
	Bell,
	ChartLineUp,
	Gear,
	House,
	Link as LinkIcon,
	List,
	Rabbit,
	User,
} from "@phosphor-icons/react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import UserMenu from "@/features/layout/components/UserMenu";
import { APP_NAME } from "@/lib/constants/BRANDS";

type MenuItem = {
	title: string;
	url: Route<string>;
	icon: React.ComponentType<{ className?: string }>;
};

const menuItems: MenuItem[] = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: House,
	},
	{
		title: "Profile",
		url: "/dashboard/profile",
		icon: User,
	},
	{
		title: "Links",
		url: "/dashboard/links",
		icon: LinkIcon,
	},
	{
		title: "Analytics",
		url: "/dashboard/analytics",
		icon: ChartLineUp,
	},
];

function SidebarLogo() {
	return (
		// No padding of its own. SidebarHeader already supplies it, and adding
		// px-2 here pushed the tile onto a third leading edge that matched
		// neither the group label below nor the menu icons.
		<div className="flex items-center gap-2">
			<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
				<Rabbit
					weight="fill"
					className="h-5 w-5 text-primary-foreground"
					// Decorative: the app name sits right next to it, so
					// announcing the icon too would read "Zaplink Zaplink".
					aria-hidden
					focusable={false}
				/>
			</div>
			<span className="text-heading group-data-[collapsible=icon]:hidden">
				{APP_NAME}
			</span>
		</div>
	);
}

function SidebarMenuItemComponent({ item }: { item: MenuItem }) {
	const pathname = usePathname();
	const isActive = pathname === item.url;

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				render={
					<Link href={item.url}>
						<item.icon />
						<span className="group-data-[collapsible=icon]:hidden">
							{item.title}
						</span>
					</Link>
				}
				isActive={isActive}
				tooltip={item.title}
			/>
		</SidebarMenuItem>
	);
}

function MobileMenu() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				className="md:hidden"
				onClick={() => setOpen(true)}
			>
				<List className="h-5 w-5" />
				<span className="sr-only">Open navigation menu</span>
			</Button>
			<Drawer open={open} onOpenChange={setOpen}>
				{/*
				  h-[80vh] pinned the sheet to a fixed height regardless of content,
				  so it carried a large empty area and would clip if the nav grew.
				  A max-height lets it size to the items and still cap.
				*/}
				<DrawerContent className="h-auto max-h-[80vh]">
					<DrawerHeader>
						{/* Same word the desktop group label uses for this region. */}
						<DrawerTitle>Navigation</DrawerTitle>
					</DrawerHeader>
					<div className="flex flex-col gap-2 p-4">
						{menuItems.map((item) => {
							const isActive = pathname === item.url;
							return (
								<Link
									key={item.title}
									href={item.url}
									onClick={() => setOpen(false)}
									className={buttonVariants({
										variant: isActive ? "default" : "ghost",
										className: "justify-start gap-2",
									})}
								>
									<item.icon className="h-5 w-5" />
									{item.title}
								</Link>
							);
						})}
					</div>
				</DrawerContent>
			</Drawer>
		</>
	);
}

function AppSidebar() {
	return (
		<Sidebar collapsible="icon" className="group">
			<SidebarHeader>
				<SidebarLogo />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
						Navigation
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItemComponent key={item.title} item={item} />
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}

export function DashboardSidebar({
	children,
	defaultOpen = false,
}: {
	children: React.ReactNode;
	defaultOpen?: boolean;
}) {
	const pathname = usePathname();

	const pathSegments = pathname.split("/").filter((segment) => segment);
	const currentPage = pathSegments[pathSegments.length - 1] || "dashboard";
	const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar />
			<main className="flex w-full flex-1 flex-col">
				{/*
				 * Sticky so the breadcrumb and account controls stay put while a
				 * long page scrolls. bg-background is already opaque, so nothing
				 * shows through the bar as content passes under it.
				 *
				 * z-[5] is a deliberate sandwich, not a default. It has to clear
				 * page content that brings its own stacking context -- the
				 * dashboard cards use `relative z-10` -- while staying under the
				 * sidebar, which is `fixed z-10` on desktop and a `z-50` Sheet on
				 * mobile. A plain z-10 would tie with the desktop sidebar and,
				 * being later in the DOM, paint the bar over it.
				 */}
				<header className="sticky top-0 z-[5] flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4">
					<div className="flex items-center gap-2">
						<SidebarTrigger className="hidden md:flex" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
								</BreadcrumbItem>
								{pathname !== "/dashboard" && (
									<>
										<BreadcrumbSeparator className="hidden md:block" />
										<BreadcrumbItem>
											<BreadcrumbPage>{pageTitle}</BreadcrumbPage>
										</BreadcrumbItem>
									</>
								)}
							</BreadcrumbList>
						</Breadcrumb>
					</div>
					<div className="flex-1" />
					<div className="flex items-center gap-4">
						{/*
						  Bare <Link><Icon/></Link> gave these a 23px target in a
						  row whose other controls are 32-36px, with no background,
						  no focus ring and no accessible name. buttonVariants puts
						  them in the same control zone as everything else. The link
						  is styled rather than wrapped in Button, because Button
						  would put role="button" on a navigation link.
						*/}
						<Link
							href="/dashboard/notifications"
							aria-label="Notifications"
							className={buttonVariants({ variant: "ghost", size: "icon" })}
						>
							<Bell />
						</Link>
						<Link
							href="/dashboard/settings"
							aria-label="Settings"
							className={buttonVariants({ variant: "ghost", size: "icon" })}
						>
							<Gear />
						</Link>
						<MobileMenu />
						<UserMenu />
					</div>
				</header>
				<div className="flex-1">{children}</div>
			</main>
		</SidebarProvider>
	);
}
