import { db, eq, profiles } from "@zaplink/db";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { getSession } from "../../../lib/auth-server";

const f = createUploadthing();
const utapi = new UTApi();

export const ourFileRouter = {
	avatarUploader: f({
		image: { maxFileSize: "4MB", maxFileCount: 1 },
	})
		.middleware(async () => {
			const session = await getSession();
			if (!session?.user) throw new UploadThingError("Unauthorized");
			return { userId: session.user.id };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			const result = await db
				.select({ avatarUrl: profiles.avatarUrl })
				.from(profiles)
				.where(eq(profiles.userId, metadata.userId));

			const prev = result[0];

			await db
				.update(profiles)
				.set({ avatarUrl: file.ufsUrl, updatedAt: new Date() })
				.where(eq(profiles.userId, metadata.userId));

			if (prev?.avatarUrl && prev.avatarUrl !== file.ufsUrl) {
				try {
					const fileKey = prev.avatarUrl.split("/").pop();
					if (fileKey) await utapi.deleteFiles([fileKey]);
				} catch (error) {
					console.error("Error deleting old avatar file:", error);
				}
			}

			return { uploadedBy: metadata.userId };
		}),

	bannerUploader: f({
		image: { maxFileSize: "4MB", maxFileCount: 1 },
	})
		.middleware(async () => {
			const session = await getSession();
			if (!session?.user) throw new UploadThingError("Unauthorized");
			return { userId: session.user.id };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			const result = await db
				.select({ bannerUrl: profiles.bannerUrl })
				.from(profiles)
				.where(eq(profiles.userId, metadata.userId));

			const prev = result[0];

			await db
				.update(profiles)
				.set({ bannerUrl: file.ufsUrl, updatedAt: new Date() })
				.where(eq(profiles.userId, metadata.userId));

			if (prev?.bannerUrl && prev.bannerUrl !== file.ufsUrl) {
				try {
					const fileKey = prev.bannerUrl.split("/").pop();
					if (fileKey) await utapi.deleteFiles([fileKey]);
				} catch (error) {
					console.error("Error deleting old banner file:", error);
				}
			}

			return { uploadedBy: metadata.userId };
		}),

	linkThumbnailUploader: f({
		image: { maxFileSize: "4MB", maxFileCount: 1 },
	})
		.middleware(async () => {
			const session = await getSession();
			if (!session?.user) throw new UploadThingError("Unauthorized");
			return { userId: session.user.id };
		})
		.onUploadComplete(async ({ metadata }) => {
			return { uploadedBy: metadata.userId };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
