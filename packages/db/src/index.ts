import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as authSchema from "./schema/auth";
import * as linkSchema from "./schema/link";
import * as profileSchema from "./schema/profile";

dotenv.config({
	path: "../../apps/server/.env",
});

const schema = { ...authSchema, ...linkSchema, ...profileSchema };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "drizzle-orm";

export * from "./schema/auth";
export * from "./schema/link";
export * from "./schema/profile";
