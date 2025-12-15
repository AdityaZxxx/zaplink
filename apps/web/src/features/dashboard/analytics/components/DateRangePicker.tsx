"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";

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

	// Sync props to local state when opening
	useEffect(() => {
		if (open) {
			setTempRange(range);
			setTempDate(date);
		}
	}, [open, range, date]);

	const isCustomComplete = Boolean(tempDate?.from && tempDate?.to);

	const label = useMemo(() => {
		if (range === "custom") {
			if (!date?.from) return "Custom range";
			if (!date.to) return format(date.from, "LLL dd, y");
			return `${format(date.from, "LLL dd, y")} – ${format(
				date.to,
				"LLL dd, y",
			)}`;
		}
		return DATE_RANGES.find((r) => r.value === range)?.label ?? "Select range";
	}, [range, date]);

	const trigger = (
		<Button
			variant="outline"
			size="sm"
			className="h-9 w-full justify-between sm:w-[260px]"
		>
			<div className="flex items-center gap-2 truncate">
				<CalendarIcon className="h-4 w-4" />
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

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerTrigger asChild>{trigger}</DrawerTrigger>

				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Date range</DrawerTitle>
					</DrawerHeader>

					<div className="grid grid-cols-2 gap-2 px-4 pb-4">
						<PresetList
							currentRange={tempRange}
							onSelect={handlePresetSelect}
							onCustomSelect={() => setTempRange("custom")}
							isMobile
						/>
					</div>

					{/* Calendar */}
					{tempRange === "custom" && (
						<div className="mx-auto px-4 pb-2">
							<Calendar
								mode="range"
								selected={tempDate}
								onSelect={setTempDate}
								numberOfMonths={1}
								disabled={{ after: new Date() }}
								className="rounded-md border"
							/>
						</div>
					)}

					<DrawerFooter>
						<DrawerClose asChild>
							<Button variant="ghost">Cancel</Button>
						</DrawerClose>
						<Button disabled={!isCustomComplete} onClick={handleApply}>
							Apply
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>{trigger}</PopoverTrigger>

			<PopoverContent
				align={align}
				className="w-auto p-0"
				collisionPadding={16}
			>
				<div className="flex">
					<div className="flex flex-col gap-1 border-r p-2">
						<PresetList
							currentRange={tempRange}
							onSelect={handlePresetSelect}
							onCustomSelect={() => setTempRange("custom")}
						/>
					</div>

					<div className="bg-background p-2">
						<Calendar
							mode="range"
							selected={tempDate}
							onSelect={(next) => {
								setTempDate(next);
								setTempRange("custom");
							}}
							numberOfMonths={calendarMonths}
							disabled={{ after: new Date() }}
							className="rounded-md border"
							autoFocus
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
		<div className="mt-2 flex justify-end gap-2 border-t pt-2">
			<Button variant="ghost" size="sm" onClick={onReset}>
				Reset
			</Button>
			<Button size="sm" disabled={!canApply} onClick={onApply}>
				Apply
			</Button>
		</div>
	);
}
