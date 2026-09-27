"use client";

import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ProfileCard } from "@/features/profile/components";
import type { LinksData, ProfileData } from "@/types/api";
import { trpc } from "@/utils/trpc/client";
import PageWithPreview from "../components/PageWithPreview";
import { AccountSettings } from "./components/AccountSettings";
import { SeoSettings } from "./components/SeoSettings";
import { SupportBannerSettings } from "./components/SupportBannerSettings";
import {
	DEFAULT_SECTION_ID,
	isSettingsSectionId,
	PLANNED_NAV_GROUP,
	SECTION_TITLES,
	SETTINGS_NAV_GROUPS,
	SETTINGS_SECTIONS,
	type SettingsSectionId,
} from "./nav";

interface SettingsPageProps {
	initialProfile: ProfileData;
	initialLinks: LinksData;
}

export default function SettingsPage({
	initialProfile,
	initialLinks,
}: SettingsPageProps) {
	const [activeId, setActiveId] = useState<SettingsSectionId>(() => {
		// In the initialiser, not an effect: an effect would paint "account"
		// before swapping to the linked section.
		if (typeof window === "undefined") return DEFAULT_SECTION_ID;
		const fromHash = window.location.hash.slice(1);
		return isSettingsSectionId(fromHash) ? fromHash : DEFAULT_SECTION_ID;
	});

	const { data: profile } = useQuery({
		...trpc.profile.getProfile.queryOptions(),
		initialData: initialProfile,
	});

	const { data: links = initialLinks } = useQuery({
		...trpc.links.getAllLinks.queryOptions(),
		initialData: initialLinks,
	});

	useEffect(() => {
		const syncFromLocation = () => {
			const fromHash = window.location.hash.slice(1);
			if (isSettingsSectionId(fromHash)) setActiveId(fromHash);
		};

		// popstate for Back/Forward, hashchange for a hand-edited hash.
		window.addEventListener("popstate", syncFromLocation);
		window.addEventListener("hashchange", syncFromLocation);
		return () => {
			window.removeEventListener("popstate", syncFromLocation);
			window.removeEventListener("hashchange", syncFromLocation);
		};
	}, []);

	const selectSection = useCallback((id: SettingsSectionId) => {
		setActiveId(id);
		// pushState, not `location.hash =`, which scrolls the panel and
		// pushes an entry per click.
		window.history.pushState(null, "", `#${id}`);
	}, []);

	const activeSection =
		SETTINGS_SECTIONS.find((section) => section.id === activeId) ??
		SETTINGS_SECTIONS[0];

	const renderSection = (id: SettingsSectionId) => {
		switch (id) {
			case "account":
				return <AccountSettings key={id} profile={profile} />;
			case "seo":
				return <SeoSettings key={id} profile={profile} />;
			case "support-banner":
				return <SupportBannerSettings key={id} profile={profile} />;
		}
	};

	return (
		<PageWithPreview
			// This page splits its column into a nav and a panel, so it needs
			// more than the single-column default.
			contentClassName="max-w-3xl"
			preview={
				<ProfileCard
					profile={profile}
					links={links}
					className="h-full max-w-none rounded-none border-none shadow-none ring-0"
				/>
			}
		>
			{/* pb-20, not md:pb-0: the preview button is hidden at lg but still
			    shown from md up, so dropping the padding at md let the last row
			    of a section sit under it. */}
			<div className="space-y-6 pb-20 lg:space-y-8 lg:pb-0">
				<div className="space-y-1">
					<h1 className="font-bold text-3xl tracking-tight">Settings</h1>
					<p className="text-muted-foreground">
						Manage how your profile appears to visitors and in search results.
					</p>
				</div>

				<div className="flex w-full flex-col gap-8 lg:flex-row lg:gap-10">
					{/*
					 * top-14 clears the sticky 3.5rem header in Sidebar.tsx.
					 */}
					<aside className="sticky top-14 -mx-4 shrink-0 bg-background px-4 py-2 lg:top-auto lg:mx-0 lg:w-52 lg:bg-transparent lg:px-0 lg:py-0">
						{/* One control on small screens, a list on large ones. Both read
						    the same state, so the section never disagrees with itself
						    across a resize. */}
						<div className="lg:hidden">
							<Select
								value={activeId}
								onValueChange={(value) => {
									if (!isSettingsSectionId(value)) return;
									selectSection(value);
								}}
							>
								<SelectTrigger
									className="w-full"
									/* The label must contain the visible text for speech
									input, which is what WCAG 2.5.3 asks for. */
									aria-label={`Settings section: ${activeSection.title}`}
								>
									{/*
									 * Base UI shows the raw value unless the items are
									 * formatted, and these carry an icon, so it reads
									 * "account" without this.
									 */}
									<SelectValue>
										{(value: SettingsSectionId) =>
											SECTION_TITLES[value] ?? null
										}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{SETTINGS_SECTIONS.map((section) => (
										<SelectItem key={section.id} value={section.id}>
											<div className="flex items-center gap-2">
												<section.icon className="size-4" />
												<span>{section.title}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<nav
							aria-label="Settings sections"
							className="hidden lg:block lg:space-y-6"
						>
							{SETTINGS_NAV_GROUPS.map((group) => (
								<div key={group.label}>
									<h2 className="px-2.5 pb-2 font-medium text-muted-foreground text-xs">
										{group.label}
									</h2>
									<ul className="flex flex-col gap-0.5">
										{group.items.map((item) => {
											const isActive = item.id === activeId;

											return (
												<li key={item.id}>
													<button
														type="button"
														aria-current={isActive ? "true" : undefined}
														onClick={() => selectSection(item.id)}
														className={cn(
															"flex h-8 w-full items-center gap-2 overflow-hidden rounded-xl py-2 pr-3 pl-2.5 text-left text-sm",
															"outline-none transition-[color,background-color] duration-150 ease-out",
															"focus-visible:ring-3 focus-visible:ring-ring/30",
															isActive
																? "bg-accent font-medium text-accent-foreground"
																: "text-muted-foreground hover:bg-muted hover:text-foreground",
														)}
													>
														{/* Outline by default, fill when selected, so the active
														    section is marked by the icon itself and not only by
														    a background tint. */}
														<item.icon
															weight={isActive ? "fill" : "regular"}
															className="size-4 shrink-0"
														/>
														<span className="truncate">{item.title}</span>
													</button>
												</li>
											);
										})}
									</ul>
								</div>
							))}

							<div>
								<h2 className="px-2.5 pb-2 font-medium text-muted-foreground text-xs">
									Coming soon
								</h2>
								<ul className="flex flex-col gap-0.5">
									{PLANNED_NAV_GROUP.map((item) => (
										<li key={item.id}>
											<div className="flex h-8 items-center gap-2 overflow-hidden rounded-xl py-2 pr-3 pl-2.5 text-muted-foreground/50 text-sm">
												<item.icon className="size-4 shrink-0" />
												<span className="truncate">{item.title}</span>
												{/* The badge keeps the Badge component's own text-xs.
												    Shrinking it to 10px to fit a 32px row put it
												    below the size at which the word stays legible. */}
												<Badge
													variant="secondary"
													className="ml-auto shrink-0 px-1.5"
												>
													Soon
												</Badge>
											</div>
										</li>
									))}
								</ul>
							</div>
						</nav>
					</aside>

					<div className="min-w-0 flex-1">
						<Card>
							<CardHeader>
								<CardTitle>{activeSection.title}</CardTitle>
								<CardDescription>{activeSection.description}</CardDescription>
								<div className="-mx-(--card-spacing) mt-4 h-px bg-border" />
							</CardHeader>

							{/*
							 * Inactive sections stay mounted, so switching does not
							 * discard a half-typed field. `hidden` rather than
							 * display:none, which leaves a grid in the tab order.
							 */}
							{SETTINGS_SECTIONS.map((section) => (
								<div
									key={section.id}
									hidden={section.id !== activeId}
									className="px-(--card-spacing)"
								>
									{renderSection(section.id)}
								</div>
							))}
						</Card>
					</div>
				</div>
			</div>
		</PageWithPreview>
	);
}
