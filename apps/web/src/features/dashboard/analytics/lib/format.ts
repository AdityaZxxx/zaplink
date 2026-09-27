const compactFormatter = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 1,
});

/**
 * One formatter for every figure on the page. The KPI tiles and the chart's
 * Y axis used to disagree, so a reader saw `12.0 K` above the chart and `12000`
 * below it for the same quantity.
 */
export function formatCompact(value: number): string {
	return compactFormatter.format(value);
}

/**
 * The analytics table buckets rows by UTC hour, so every timestamp arrives as
 * `YYYY-MM-DD HH24:00:00` in UTC with no zone suffix. Appending `Z` is what
 * makes it a real instant instead of a local-time guess.
 */
export function parseUtcBucket(bucket: string): Date {
	return new Date(`${bucket} Z`);
}

/**
 * Buckets and `now` are both rendered in the same local zone, so comparing
 * their `toDateString()` is stable across offsets -- verified in UTC, both US
 * zones, Kolkata and Auckland. Comparing the raw UTC day instead would read as
 * "today" for a bucket that is still yesterday locally.
 */
export function isTodayBucket(bucket: string): boolean {
	return parseUtcBucket(bucket).toDateString() === new Date().toDateString();
}

const timeFormatter = new Intl.DateTimeFormat("en-US", {
	hour: "numeric",
	minute: "2-digit",
	hour12: true,
});

const dayFormatter = new Intl.DateTimeFormat("en-US", {
	weekday: "short",
	month: "short",
	day: "numeric",
});

const shortDayFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
});

/** Axis ticks stay short so the plot keeps its width. */
export function formatBucketTick(bucket: string): string {
	const date = parseUtcBucket(bucket);
	return isTodayBucket(bucket)
		? timeFormatter.format(date)
		: shortDayFormatter.format(date);
}

/** The tooltip has room for the weekday, which makes the point identifiable. */
export function formatBucketLong(bucket: string): string {
	const date = parseUtcBucket(bucket);
	const day = isTodayBucket(bucket) ? "Today" : dayFormatter.format(date);
	return `${day} · ${timeFormatter.format(date)}`;
}
