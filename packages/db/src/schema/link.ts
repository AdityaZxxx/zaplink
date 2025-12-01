import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { profiles } from "./profile";

export const linkTypeEnum = pgEnum("links_type", [
	"custom",
	"platform",
	"contact",
	"embed",
]);
export const displayModeEnum = pgEnum("links_display_mode", [
	"standard",
	"featured",
	"grid",
]);

export const platformCategoryEnum = pgEnum("link_platform_category", [
	"social",
	"business",
	"music",
	"entertainment",
	"lifestyle",
	"news",
]);

export const links = pgTable("links", {
	id: serial("id").primaryKey(),
	profileId: integer("profile_id")
		.notNull()
		.references(() => profiles.id, { onDelete: "cascade" }),
	type: linkTypeEnum("type").notNull().default("custom"),
	title: varchar("title", { length: 60 }).notNull(),
	url: text("url").notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	isHidden: boolean("is_hidden").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const linkPlatforms = pgTable("link_platforms", {
	linkId: integer("link_id")
		.notNull()
		.references(() => links.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	category: platformCategoryEnum("category").default("social"),
	iconUrl: text("icon_url"),
});

export const linkCustoms = pgTable("link_customs", {
	linkId: integer("link_id")
		.notNull()
		.references(() => links.id, { onDelete: "cascade" }),
	displayMode: displayModeEnum("display_mode").default("standard"),
	title: text("title"),
	iconUrl: text("icon_url"),
	thumbnailUrl: text("thumbnail_url"),
});

export const linkContacts = pgTable("link_contacts", {
	linkId: integer("link_id")
		.notNull()
		.references(() => links.id, { onDelete: "cascade" }),
	type: text("type").notNull(), // phone/email/website
	value: text("value").notNull(),
});
