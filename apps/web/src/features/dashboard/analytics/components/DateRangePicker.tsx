"use client";

import { CalendarBlank, Check } from "@phosphor-icons/react";
import { cn } from "cn";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import type { DateRange as DayPickerDateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

export const DATE_RANGES = [
	{ label: "Today", value: "today" },
	{ label: "Yesterday", value: "yesterday" },
	{ label: "Last 7 Days", value: "last7" },
	{ label: "Last 30 Days", value: "last30" },
	{ label: "Last 90 Days", value: "last90" },
	{ label: "This Week", value: "thisWeek" },
	{ label: "This Month", value: "thisMonth" },
] as const;

export type DateRangeOption = (typeof DATE_RANGES)[number]["value"] | "custom";

interface DateRangePickerProps {
	range: DateRangeOption;
	setRange: (range: DateRangeOption) => void;
	date: DayPickerDateRange | undefined;
	setDate: (date: DayPickerDateRange | undefined) => void;
	align?: "start" | "center" | "end";
}

export function DateRangePicker({
	range,
	setRange,
	date,
	setDate,
	align = "end",
}: DateRangePickerProps) {
	const [open, setOpen] = useState(false);
	const isMobile = useIsMobile();
	const [calendarMonths, setCalendarMonths] = useState(2);

	useEffect(() => {
		const handleResize = () => {
			setCalendarMonths(window.innerWidth < 1024 ? 1 : 2);
		};
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Local state for temporary selection
	const [tempRange, setTempRange] = useState<DateRangeOption>(range);
	const [tempDate, setTempDate] = useState<DayPickerDateRange | undefined>(
		date,
	);

	const isCustomComplete = Boolean(tempDate?.from && tempDate?.to);

	const label =
		range === "custom"
			? !date?.from
				? "Custom range"
				: !date.to
					? format(date.from, "LLL dd, y")
					: `${format(date.from, "LLL dd, y")} – ${format(date.to, "LLL dd, y")}`
			: (DATE_RANGES.find((r) => r.value === range)?.label ?? "Select range");

	const trigger = (
		<Button
			variant="outline"
			size="sm"
			className="h-9 w-full justify-between sm:w-[260px]"
		>
			<div className="flex items-center gap-2 truncate">
				<CalendarBlank className="h-4 w-4" />
				<span className="truncate">{label}</span>
			</div>
		</Button>
	);

	const handlePresetSelect = (value: DateRangeOption) => {
		setRange(value);
		setDate(undefined);
		setOpen(false);
	};

	const handleApply = () => {
		setRange(tempRange);
		setDate(tempDate);
		setOpen(false);
	};

	const handleReset = () => {
		setTempDate(undefined);
		setTempRange("last7"); // Default fallback
	};

	// Reset the draft to the applied props each time the popover opens, so
	// cancelling never leaks an unapplied selection
	const handleOpenChange = (next: boolean) => {
		if (next) {
			setTempRange(range);
			setTempDate(date);
		}
		setOpen(next);
	};

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={handleOpenChange}>
				<DrawerTrigger render={trigger} />

				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Date range</DrawerTitle>
					</DrawerHeader>

					{/*
					 * Scrollable, because the drawer clips its own overflow and the
					 * preset grid plus a calendar overflows the capped sheet height
					 * on a short phone. Without this the calendar was simply cut off.
					 */}
					<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
						<div className="grid grid-cols-2 gap-2 px-4 pb-4">
							<PresetList
								currentRange={tempRange}
								onSelect={handlePresetSelect}
								onCustomSelect={() => setTempRange("custom")}
								isMobile
							/>
						</div>

						{tempRange === "custom" && (
							<div className="mx-auto px-4 pb-2">
								<Calendar
									mode="range"
									selected={tempDate}
									onSelect={setTempDate}
									numberOfMonths={1}
									disabled={{ after: new Date() }}
									className="rounded-md bg-muted/40"
								/>
							</div>
						)}
					</div>

					{/*
					 * Only for a custom range. A preset applies the moment it is
					 * tapped, so with a preset active the footer's Apply sat there
					 * permanently disabled next to a Cancel that only closed the
					 * sheet. The desktop branch already gated its actions the same
					 * way.
					 */}
					{tempRange === "custom" && (
						<DrawerFooter>
							<DrawerClose render={<Button variant="ghost">Cancel</Button>} />
							<Button disabled={!isCustomComplete} onClick={handleApply}>
								Apply
							</Button>
						</DrawerFooter>
					)}
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger render={trigger} />
			{/*
			 * `p-0` so the two panes meet, with `overflow-hidden` letting the
			 * popover's own 24px radius clip them. An inset pane would need a
			 * concentric 16px radius at this 8px padding; flush panes need none.
			 */}
			<PopoverContent align={align} className="w-auto overflow-hidden p-0">
				<div className="flex">
					{/* bg-muted, not bg-background: nested inside bg-popover the
					    latter is darker in dark mode and reads as a hole. */}
					<div className="flex flex-col gap-0.5 border-border border-r bg-muted/50 p-2">
						<PresetList
							currentRange={tempRange}
							onSelect={handlePresetSelect}
							onCustomSelect={() => setTempRange("custom")}
						/>
					</div>

					{/*
					 * No `autoFocus`: the calendar sits after the preset list in
					 * reading order, so focusing it on open skipped past every
					 * preset for keyboard users. Base UI moves focus to the first
					 * focusable in the popup, which is the first preset.
					 */}
					<div className="p-2">
						<Calendar
							mode="range"
							selected={tempDate}
							onSelect={(next) => {
								setTempDate(next);
								setTempRange("custom");
							}}
							numberOfMonths={calendarMonths}
							disabled={{ after: new Date() }}
						/>

						{tempRange === "custom" && (
							<CalendarActions
								onReset={handleReset}
								onApply={handleApply}
								canApply={isCustomComplete}
							/>
						)}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

interface PresetListProps {
	currentRange: DateRangeOption;
	onSelect: (value: DateRangeOption) => void;
	onCustomSelect: () => void;
	isMobile?: boolean;
}

function PresetList({
	currentRange,
	onSelect,
	onCustomSelect,
	isMobile,
}: PresetListProps) {
	return (
		<>
			{DATE_RANGES.map((item) => (
				<Button
					key={item.value}
					variant={
						currentRange === item.value
							? "secondary"
							: isMobile
								? "outline"
								: "ghost"
					}
					size="sm"
					className={cn(
						isMobile ? "w-full" : "justify-between",
						!isMobile && currentRange !== item.value && "font-normal",
					)}
					onClick={() => onSelect(item.value)}
				>
					{item.label}
					{!isMobile && currentRange === item.value && (
						<Check className="h-4 w-4" />
					)}
				</Button>
			))}

			<Button
				variant={
					currentRange === "custom"
						? "secondary"
						: isMobile
							? "outline"
							: "ghost"
				}
				size="sm"
				className={cn(
					isMobile ? "w-full" : "justify-between",
					!isMobile && currentRange !== "custom" && "font-normal",
				)}
				onClick={onCustomSelect}
			>
				Custom range
				{!isMobile && currentRange === "custom" && (
					<Check className="h-4 w-4" />
				)}
			</Button>
		</>
	);
}

interface CalendarActionsProps {
	onReset: () => void;
	onApply: () => void;
	canApply: boolean;
}

function CalendarActions({ onReset, onApply, canApply }: CalendarActionsProps) {
	return (
		<div className="mt-2 flex items-center justify-end gap-2 border-border border-t pt-2">
			<Button variant="ghost" size="sm" onClick={onReset}>
				Reset
			</Button>
			<Button size="sm" disabled={!canApply} onClick={onApply}>
				Apply
			</Button>
		</div>
	);
}
