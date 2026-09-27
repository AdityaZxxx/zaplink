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
		/*
		 * Read the hash during the initialiser rather than in an effect. An
		 * effect would render "account" first and swap to the linked section on
		 * the next tick, so a shared #seo link would flash the wrong panel.
		 */
		if (typeof window === "undefined") return DEFAULT_SECTION_ID;
		const fromHash = window.location.hash.slice(1);
		return isSettingsSectionId(fromHash) ? fromHash : DEFAULT_SECTION_ID;
	});

	/*
	 * Seeded from the server render, so the panel and the preview paint with
	 * real data on the first frame. The query still owns the value from here on,
	 * which is what lets a save in one section show up in the others and in the
	 * live preview without any cross-component wiring.
	 */
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

		// popstate covers Back and Forward between sections; hashchange covers
		// a hash edited in the address bar.
		window.addEventListener("popstate", syncFromLocation);
		window.addEventListener("hashchange", syncFromLocation);
		return () => {
			window.removeEventListener("popstate", syncFromLocation);
			window.removeEventListener("hashchange", syncFromLocation);
		};
	}, []);

	const selectSection = useCallback((id: SettingsSectionId) => {
		setActiveId(id);
		/*
		 * pushState, not `location.hash =`. Assigning the hash asks the browser
		 * to scroll to a matching element, which yanked the scroll area, and it
		 * pushed a history entry per click so Back had to be pressed six times
		 * to leave the page.
		 */
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
			// Wider than the max-w-2xl default. This page splits its column into a
			// nav and a panel, and at 2xl the panel was left around 380px once the
			// nav and the gap were taken out, which wrapped every section
			// description onto a second line.
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
					 * top-14, not top-0: the dashboard header in Sidebar.tsx is
					 * sticky and permanently occupies the first 3.5rem, so this
					 * section nav has to pin below it rather than under it. It
					 * takes no z-index of its own, which is enough to sit above the
					 * flowing content it covers, and keeps it out of the stacking
					 * contest with the header's deliberate z-[5].
					 *
					 * The negative margin and background are for the mobile case
					 * only, where the bar must span the full width of the scroll
					 * area rather than stop at the edge of the centred column.
					 */}
					<aside className="sticky top-14 -mx-4 shrink-0 bg-background px-4 py-2 lg:top-auto lg:mx-0 lg:w-52 lg:bg-transparent lg:px-0 lg:py-0">
						{/* One control on small screens, a list on large ones. Both read
						    the same state, so the section never disagrees with itself
						    across a resize. */}
						<div className="lg:hidden">
							<Select
								value={activeId}
								onValueChange={(value) => {
									// A select can be cleared, but this one always drives an
									// active section, so there is nothing to fall back to.
									if (!isSettingsSectionId(value)) return;
									selectSection(value);
								}}
							>
								<SelectTrigger
									className="w-full"
									/*
									 * Names the control and keeps the visible text inside
									 * the accessible name, which WCAG 2.5.3 requires so that
									 * "click Account" works with speech input. A bare
									 * "Settings section" would not contain it.
									 */
									aria-label={`Settings section: ${activeSection.title}`}
								>
									{/*
									 * Base UI renders the raw value unless the value is
									 * formatted, and this trigger's items carry an icon
									 * alongside their text, so nothing could infer a label
									 * from them. Left to itself the mobile trigger read
									 * "account".
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
															/*
															 * Mirrors SidebarMenuButton: 32px rows, 12px radius,
															 * and pl-2.5 rather than px-3 so the icon does not sit
															 * a pixel off the text's left edge.
															 */
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
											{/*
											 * Not a button. These sections do not exist, and the old
											 * build made them focusable only to open a placeholder
											 * panel, which spent a nav slot on a dead end. A plain
											 * row with a badge states the same thing and costs nothing
											 * when it is clicked.
											 */}
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
								{/*
								 * A hairline, not a border on the header: the header is inset by
								 * --card-spacing, so border-b would stop short of both edges
								 * and read as a floating rule. This is a divider, so it stays a
								 * border rather than becoming a shadow.
								 */}
								<div className="-mx-(--card-spacing) mt-4 h-px bg-border" />
							</CardHeader>

							{/*
							 * Every section stays mounted and the inactive ones are hidden,
							 * rather than rendering only the active one. Switching sections
							 * is a single click away from a half-typed description, and
							 * unmounting threw that work away. `hidden` also drops the
							 * sections from the tab order and the accessibility tree,
							 * which display:none alone would not do for a grid.
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
