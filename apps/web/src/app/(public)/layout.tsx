import type { Metadata } from "next";
import Header from "@/features/layout/components/Header";
import Providers from "@/features/layout/providers/Providers";
import { APP_NAME } from "@/lib/constants/BRANDS";
import { geistMono, geistSans } from "@/lib/fonts";
import "../../index.css";

export const metadata: Metadata = {
	title: {
		default: `${APP_NAME}: one link for everything you make`,
		template: `%s | ${APP_NAME}`,
	},
	description:
		"Claim a profile, add your links, and see who taps them. Free to start.",
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
					<Header />
					{children}
				</Providers>
			</body>
		</html>
	);
}
