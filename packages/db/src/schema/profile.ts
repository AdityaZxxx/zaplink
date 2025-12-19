import {
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const supportBannerEnum = pgEnum("support_banner_type", [
	"none",
	"stop_genocide",
	"black_lives_matter",
	"climate_action",
	"mental_health",
]);

export const profiles = pgTable("profiles", {
	id: serial("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	username: varchar("username", { length: 30 }).notNull().unique(),
	displayName: varchar("display_name", { length: 30 }),
	bio: text("bio"),
	avatarUrl: text("avatar_url"),
	bannerUrl: text("banner_url"),
	supportBanner: supportBannerEnum("support_banner").default("none"),
	onboardingCompletedAt: timestamp("onboarding_completed_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
