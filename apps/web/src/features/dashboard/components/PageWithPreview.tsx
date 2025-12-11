"use client";

import { Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../../../components/ui/scroll-area";

interface PageWithPreviewProps {
	children: React.ReactNode;
	preview: React.ReactNode;
	className?: string;
}

export default function PageWithPreview({
	children,
	preview,
	className,
}: PageWithPreviewProps) {
	const [showPreview, setShowPreview] = useState(false);

	return (
		<div
			className={cn(
				"flex h-[calc(100vh-3.5rem)] w-full overflow-hidden",
				className,
			)}
		>
			{/* Main Content Area (Left) */}
			<ScrollArea className="h-[calc(100vh-3.5rem)] flex-1">
				<div className="p-4 md:p-8">
					<div className="mx-auto max-w-2xl space-y-8">{children}</div>
				</div>
			</ScrollArea>

			{/* Desktop Preview Area (Right) */}
			<div className="hidden w-[450px] border-l bg-muted/30 lg:flex lg:flex-col">
				<div className="flex items-center justify-center border-b p-4">
					<p className="font-medium text-muted-foreground text-sm">
						Live Preview
					</p>
				</div>
				<div className="flex-1 overflow-hidden p-8">
					<div className="mx-auto h-[700px] w-[340px] overflow-hidden rounded-[2.5rem] border-8 border-zinc-900 bg-background shadow-2xl ring-1 ring-zinc-900/5">
						<div className="h-full w-full overflow-hidden rounded-4xl bg-background">
							{preview}
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Preview Button */}
			<div className="fixed right-6 bottom-6 z-50 lg:hidden">
				<Dialog open={showPreview} onOpenChange={setShowPreview}>
					<DialogTrigger asChild>
						<Button size="lg" className="rounded-full shadow-xl">
							<Eye className="mr-2 h-4 w-4" />
							Preview
						</Button>
					</DialogTrigger>
					<DialogTitle className="sr-only">Preview</DialogTitle>
					<DialogContent className="h-[90vh] w-[90vw] max-w-md overflow-hidden rounded-3xl p-0">
						{preview}
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
