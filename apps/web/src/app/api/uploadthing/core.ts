import { db, eq, linkCustoms, profiles } from "@zaplink/db";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";
import { getSession } from "../../../lib/auth-server";

const f = createUploadthing();
const utapi = new UTApi();

// Helper to rename file
async function renameFile(
	fileKey: string,
	originalName: string,
	prefix: string,
	userId: string,
) {
	const ext = originalName.split(".").pop();
	const newName = `${prefix}-${userId}-${Date.now()}.${ext}`;
	try {
		await utapi.renameFiles({
			fileKey,
			newName,
		});
	} catch (error) {
		console.error(`Failed to rename ${prefix}:`, error);
	}
}

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
			await renameFile(file.key, file.name, "avatar", metadata.userId);

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
			await renameFile(file.key, file.name, "banner", metadata.userId);

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
		.input(z.object({ linkId: z.number().optional() }))
		.middleware(async ({ input }) => {
			const session = await getSession();
			if (!session?.user) throw new UploadThingError("Unauthorized");
			return { userId: session.user.id, linkId: input.linkId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			await renameFile(file.key, file.name, "thumbnail", metadata.userId);

			// If linkId is provided, check for existing thumbnail and delete it
			if (metadata.linkId) {
				const result = await db
					.select({ thumbnailUrl: linkCustoms.thumbnailUrl })
					.from(linkCustoms)
					.where(eq(linkCustoms.linkId, metadata.linkId));

				const prev = result[0];

				if (prev?.thumbnailUrl && prev.thumbnailUrl !== file.ufsUrl) {
					try {
						const fileKey = prev.thumbnailUrl.split("/").pop();
						if (fileKey) await utapi.deleteFiles([fileKey]);
					} catch (error) {
						console.error("Error deleting old thumbnail file:", error);
					}
				}
			}

			return { uploadedBy: metadata.userId };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
