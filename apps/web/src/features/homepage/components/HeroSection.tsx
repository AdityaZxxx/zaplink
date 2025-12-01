import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClaimUsernameForm } from "./ClaimUsernameForm";

export default function HeroSection() {
	return (
		<section className="relative flex min-h-screen w-full justify-center overflow-hidden bg-background px-4 py-0 pt-24 md:pt-48">
			<div className="flex flex-col items-center space-y-8 text-center lg:items-start lg:text-left">
				<Badge className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 backdrop-blur-sm">
					<Sparkles className="h-4 w-4 text-primary" />
					<span className="font-medium text-foreground text-xs">
						The new standard for creators
					</span>
				</Badge>

				<h1 className="font-bold text-4xl text-foreground leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
					Your Digital Identity, Simplified.
				</h1>

				<p className="max-w-xl text-balance text-lg text-muted-foreground md:text-xl">
					Stop tweaking themes. Start sharing links. The fastest way to launch
					your bio page.
				</p>

				<ClaimUsernameForm />
			</div>
		</section>
	);
}
