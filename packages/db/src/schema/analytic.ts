import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { links } from "./link";
import { profiles } from "./profile";

export const analytics = pgTable("analytics", {
	id: serial("id").primaryKey(),
	profileId: integer("profile_id")
		.notNull()
		.references(() => profiles.id, { onDelete: "cascade" }),
	linkId: integer("link_id").references(() => links.id, {
		onDelete: "cascade",
	}),
	type: text("type").notNull(), // 'view' | 'click'
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
