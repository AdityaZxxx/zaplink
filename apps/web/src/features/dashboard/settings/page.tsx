"use client";

import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { CreditCard, FileText, Flag, Search, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ProfileCard } from "@/features/profile/components";
import { trpc } from "@/utils/trpc/client";
import PageWithPreview from "../components/PageWithPreview";
import { AccountSettings } from "./components/AccountSettings";
import { SeoSettings } from "./components/SeoSettings";
import { SupportBannerSettings } from "./components/SupportBannerSettings";

const SETTINGS_NAV_ITEMS = [
	{
		title: "Account",
		icon: User,
		id: "account",
		description: "Manage your account settings and preferences.",
	},
	{
		title: "SEO",
		icon: Search,
		id: "seo",
		description: "Manage your SEO settings.",
	},
	{
		title: "Support Banner",
		icon: Flag,
		id: "support-banner",
		description: "Manage your support banner settings.",
	},
	{
		title: "Billing",
		icon: CreditCard,
		id: "billing",
		description: "Manage your billing information and subscription.",
	},
	{
		title: "Terms & Conditions",
		icon: FileText,
		id: "terms",
		description: "Read our terms and conditions.",
	},
	{
		title: "Privacy Policy",
		icon: Shield,
		id: "privacy",
		description: "Read our privacy policy.",
	},
];

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState("account");

	const { data: profile, isLoading: isProfileLoading } = useQuery(
		trpc.profile.getProfile.queryOptions(),
	);
	const { data: links = [] } = useQuery(trpc.links.getAllLinks.queryOptions());

	useEffect(() => {
		const handleHashChange = () => {
			const hash = window.location.hash.replace("#", "");
			if (hash && SETTINGS_NAV_ITEMS.some((item) => item.id === hash)) {
				setActiveTab(hash);
			}
		};

		// Initial check
		handleHashChange();

		window.addEventListener("hashchange", handleHashChange);
		return () => window.removeEventListener("hashchange", handleHashChange);
	}, []);

	const activeItem = SETTINGS_NAV_ITEMS.find((item) => item.id === activeTab);

	const renderContent = () => {
		switch (activeTab) {
			case "account":
				return <AccountSettings />;
			case "seo":
				return <SeoSettings />;
			case "support-banner":
				return <SupportBannerSettings />;
			default:
				return (
					<div className="fade-in-50 flex h-[400px] animate-in items-center justify-center rounded-md border border-dashed p-8 text-center">
						<div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
							<div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
								{activeItem && <activeItem.icon className="h-10 w-10" />}
							</div>
							<h3 className="mt-4 font-semibold text-lg">
								{activeItem?.title} Settings
							</h3>
							<p className="mt-2 mb-4 text-muted-foreground text-sm">
								This section is under construction. You will be able to
								configure your {activeItem?.title.toLowerCase()} settings here
								soon.
							</p>
						</div>
					</div>
				);
		}
	};

	if (isProfileLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (!profile) return null;

	return (
		<PageWithPreview
			preview={
				<ProfileCard
					// @ts-expect-error - Date vs string mismatch from API
					profile={profile}
					// @ts-expect-error - Date vs string mismatch from API
					links={links}
					className="h-full max-w-none rounded-none border-none shadow-none ring-0"
				/>
			}
		>
			<div className="space-y-6 pb-20 md:space-y-8 md:pb-0">
				<div className="space-y-0.5">
					<h2 className="font-bold text-2xl tracking-tight">Settings</h2>
					<p className="text-muted-foreground">
						Manage information you use to log in and personalize your account.
					</p>
				</div>
				<div className="flex w-full flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
					<aside className="-mx-4 sticky top-0 z-10 bg-background px-4 py-2 lg:static lg:z-auto lg:mx-0 lg:w-64 lg:shrink-0 lg:bg-transparent lg:px-0 lg:py-0">
						<div className="lg:hidden">
							<Select
								value={activeTab}
								onValueChange={(value) => {
									setActiveTab(value);
									window.location.hash = value;
								}}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select setting" />
								</SelectTrigger>
								<SelectContent>
									{SETTINGS_NAV_ITEMS.map((item) => (
										<SelectItem key={item.id} value={item.id}>
											<div className="flex items-center gap-2">
												<item.icon className="h-4 w-4" />
												<span>{item.title}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<nav className="hidden lg:flex lg:flex-col lg:space-x-0 lg:space-y-1">
							{SETTINGS_NAV_ITEMS.map((item) => (
								<Button
									key={item.id}
									variant="ghost"
									className={cn(
										"justify-start hover:bg-transparent hover:underline",
										activeTab === item.id
											? "bg-muted hover:bg-muted"
											: "hover:bg-transparent hover:underline",
										"whitespace-nowrap",
									)}
									onClick={() => {
										setActiveTab(item.id);
										window.location.hash = item.id;
									}}
								>
									<item.icon className="mr-2 h-4 w-4" />
									{item.title}
								</Button>
							))}
						</nav>
					</aside>
					<div className="min-w-0 flex-1">
						<Card>
							<CardContent className="p-6">{renderContent()}</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</PageWithPreview>
	);
}
