import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Header from "@/features/layout/components/Header";
import Providers from "@/features/layout/providers/Providers";
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
				<Providers>
					<Header />
					{children}
				</Providers>
			</body>
		</html>
	);
}
