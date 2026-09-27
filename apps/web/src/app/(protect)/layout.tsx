import type { Metadata } from "next";
import AuthGuard from "@/features/auth/components/AuthGuard";
import Providers from "@/features/layout/providers/Providers";
import { APP_NAME } from "@/lib/constants/BRANDS";
import { geistMono, geistSans } from "@/lib/fonts";
import "../../index.css";

export const metadata: Metadata = {
	title: {
		default: APP_NAME,
		template: `%s | ${APP_NAME}`,
	},
	description: "Your Zaplink dashboard.",
	robots: { index: false, follow: false },
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
				<Providers>
					<AuthGuard>{children}</AuthGuard>
				</Providers>
			</body>
		</html>
	);
}
