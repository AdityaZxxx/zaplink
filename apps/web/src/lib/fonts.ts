import { Geist, Geist_Mono } from "next/font/google";

/*
 * One declaration for the three root layouts, so the app cannot end up with a
 * body that loads a face no rule asks for. The variables land on <html>, not
 * <body>: `--font-sans` resolves on the html element itself, and a variable
 * defined further down the tree is out of scope there.
 */
export const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

export const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});
