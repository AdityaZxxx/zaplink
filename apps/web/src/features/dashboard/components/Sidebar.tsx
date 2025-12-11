"use client";

import {
	Bell,
	ChartAreaIcon,
	HomeIcon,
	LinkIcon,
	MenuIcon,
	Settings,
	UserIcon,
} from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
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
import { Button } from "@/components/ui/button";
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
		icon: HomeIcon,
	},
	{
		title: "Profile",
		url: "/dashboard/profile",
		icon: UserIcon,
	},
	{
		title: "Links",
		url: "/dashboard/links",
		icon: LinkIcon,
	},
	{
		title: "Analytics",
		url: "/dashboard/analytics",
		icon: ChartAreaIcon,
	},
];

function SidebarLogo() {
	return (
		<div className="flex items-center gap-2 px-2">
			<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
				<Image src="/logo.jpg" alt={APP_NAME} width={40} height={40} />
			</div>
			<span className="font-bold text-lg group-data-[collapsible=icon]:hidden">
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
			<SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
				<Link href={item.url}>
					<item.icon />
					<span className="group-data-[collapsible=icon]:hidden">
						{item.title}
					</span>
				</Link>
			</SidebarMenuButton>
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
				<MenuIcon className="h-5 w-5" />
				<span className="sr-only">Toggle Menu</span>
			</Button>
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerContent className="h-[80vh]">
					<DrawerHeader>
						<DrawerTitle>Navigation Menu</DrawerTitle>
					</DrawerHeader>
					<div className="flex flex-col gap-2 p-4">
						{menuItems.map((item) => {
							const isActive = pathname === item.url;
							return (
								<Button
									key={item.title}
									variant={isActive ? "default" : "ghost"}
									className="justify-start gap-2"
									asChild
								>
									<Link href={item.url} onClick={() => setOpen(false)}>
										<item.icon className="h-5 w-5" />
										{item.title}
									</Link>
								</Button>
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
				<header className="flex h-14 items-center gap-4 border-b bg-background px-4">
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
						<Link href="/dashboard/notifications">
							<Bell className="h-5 w-5" />
						</Link>
						<Link href="/dashboard/settings">
							<Settings className="h-5 w-5" />
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
