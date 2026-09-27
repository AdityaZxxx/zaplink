import type { Metadata } from "next";
import ProfileProviders from "@/features/layout/providers/ProfileProvider";
import { APP_NAME } from "@/lib/constants/BRANDS";
import { geistMono, geistSans } from "@/lib/fonts";
import "../../index.css";

/*
 * Defaults only. The route's own generateMetadata replaces these per profile.
 */
export const metadata: Metadata = {
	title: {
		default: APP_NAME,
		template: `%s | ${APP_NAME}`,
	},
	description: "A profile on Zaplink.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable}`}
			suppressHydrationWarning
		>
			<body>
				<ProfileProviders>{children}</ProfileProviders>
			</body>
		</html>
	);
}
