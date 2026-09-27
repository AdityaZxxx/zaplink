"use client";

import { CaretDown, CaretUp, Globe } from "@phosphor-icons/react";
import { cn } from "cn";
import { useEffect, useState } from "react";
import { SUPPORT_CAUSES, type SupportCause } from "./causes";

interface SupportBannerProps {
	cause: SupportCause;
}

export function SupportBanner({ cause }: SupportBannerProps) {
	const [isMinimized, setIsMinimized] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (cause !== "none") {
			const timer = setTimeout(() => setIsVisible(true), 500);
			return () => clearTimeout(timer);
		}
	}, [cause]);

	if (cause === "none" || !(cause in SUPPORT_CAUSES)) {
		return null;
	}

	const content = SUPPORT_CAUSES[cause as Exclude<SupportCause, "none">];
	const Icon = content.icon;

	return (
		<div
			className={cn(
				"absolute right-0 bottom-0 left-0 z-50 px-4 pb-0 transition-all duration-300 ease-in-out",
				isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
			)}
		>
			<div
				className={cn(
					"relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-500",
					content.color,
					content.textColor,
				)}
			>
				<button
					type="button"
					onClick={() => setIsMinimized(!isMinimized)}
					className="absolute top-3 right-3 z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
					aria-label={isMinimized ? "Expand banner" : "Minimize banner"}
				>
					{isMinimized ? (
						<CaretUp aria-hidden className="h-4 w-4" />
					) : (
						<CaretDown aria-hidden className="h-4 w-4" />
					)}
				</button>

				<div className="relative flex flex-col p-4">
					<div
						className={cn(
							"flex transition-all duration-500",
							isMinimized
								? "flex-row items-center gap-3 pr-10"
								: "flex-1 flex-col items-center gap-3 py-2 text-center",
						)}
					>
						<div
							className={cn(
								"flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-500",
								isMinimized ? "h-8 w-8" : "h-16 w-16",
							)}
						>
							<Icon
								className={cn(
									"transition-all duration-500",
									isMinimized ? "h-4 w-4" : "h-8 w-8",
								)}
							/>
						</div>
						<span
							className={cn(
								"font-semibold transition-all duration-500",
								isMinimized ? "text-body" : "text-heading",
							)}
						>
							{content.title}
						</span>
					</div>

					<div
						className={cn(
							"grid transition-all duration-500",
							isMinimized
								? "grid-rows-[0fr] opacity-0"
								: "mt-2 grid-rows-[1fr] opacity-100",
						)}
					>
						<div className="flex flex-col items-center overflow-hidden">
							<p className="max-w-[280px] text-center text-body opacity-90">
								{content.description}
							</p>
							{/*
							  biome-ignore lint/a11y/noAmbiguousAnchorText: the rule
							  matches the anchor's text against a fixed word list and
							  does not consider aria-label, so it cannot see that the
							  accessible name is already "Learn more about <cause>".
							  Keeping the visible text short is deliberate; every banner
							  renders one link at a time, so the cause is adjacent.
							*/}
							<a
								href={content.link}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`Learn more about ${content.title}`}
								className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 font-semibold text-black text-caption transition-transform hover:scale-105 active:scale-95"
							>
								Learn more
								<Globe aria-hidden className="h-3.5 w-3.5" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
