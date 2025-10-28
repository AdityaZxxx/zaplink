import {
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { profiles } from "./profile";

export const links = pgTable(
	"links",
	{
		id: serial("id").primaryKey(),
		profileId: integer("profile_id")
			.notNull()
			.references(() => profiles.id, { onDelete: "cascade" }),
		title: varchar("title", { length: 200 }).notNull(),
		url: text("url").notNull(),
		description: text("description"),
		platform: text("platform").default("custom"),
		order: integer("order").default(0).notNull(),
		clicks: integer("clicks").default(0),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [index("link_profile_idx").on(table.profileId)],
);
