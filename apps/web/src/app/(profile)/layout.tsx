import type { Metadata } from "next";
import { Geist } from "next/font/google";
import ProfileProviders from "@/components/ProfileProvider";
import "../../index.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "zaplink",
	description: "zaplink",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} antialiased`}>
				<ProfileProviders>{children}</ProfileProviders>
			</body>
		</html>
	);
}
