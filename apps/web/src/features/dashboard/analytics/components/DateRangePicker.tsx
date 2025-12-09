"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange as DayPickerDateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const DATE_RANGES = [
	{ label: "Today", value: "today" },
	{ label: "Yesterday", value: "yesterday" },
	{ label: "Last 7 Days", value: "last7" },
	{ label: "Last 30 Days", value: "last30" },
	{ label: "This Week", value: "thisWeek" },
	{ label: "This Month", value: "thisMonth" },
	{ label: "Custom Range", value: "custom" },
] as const;

export type DateRangeOption = (typeof DATE_RANGES)[number]["value"];

interface DateRangePickerProps {
	range: DateRangeOption;
	setRange: (range: DateRangeOption) => void;
	date: DayPickerDateRange | undefined;
	setDate: (date: DayPickerDateRange | undefined) => void;
}

export function DateRangePicker({
	range,
	setRange,
	date,
	setDate,
}: DateRangePickerProps) {
	return (
		<div className="flex items-center gap-1 rounded-lg border bg-background/50 p-1 shadow-sm">
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							"h-8 w-8 text-muted-foreground hover:text-foreground",
							range === "custom" &&
								"bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
						)}
					>
						<CalendarIcon className="h-4 w-4" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="end">
					<Calendar
						autoFocus
						mode="range"
						defaultMonth={date?.from}
						selected={date}
						onSelect={(newDate) => {
							setDate(newDate);
							if (newDate) {
								setRange("custom");
							}
						}}
						numberOfMonths={2}
					/>
				</PopoverContent>
			</Popover>
			<div className="h-4 w-px bg-border" />
			<Select
				value={range}
				onValueChange={(val) => setRange(val as DateRangeOption)}
			>
				<SelectTrigger className="h-8 w-[160px] border-none bg-transparent shadow-none focus:ring-0">
					<SelectValue placeholder="Select range" />
				</SelectTrigger>
				<SelectContent>
					{DATE_RANGES.map((r) => {
						if (r.value === "custom" && date?.from) {
							return (
								<SelectItem key={r.value} value={r.value}>
									{format(date.from, "MMM d")}
									{date.to ? ` - ${format(date.to, "MMM d, yyyy")}` : ""}
								</SelectItem>
							);
						}
						return (
							<SelectItem key={r.value} value={r.value}>
								{r.label}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</div>
	);
}
