import { Sparkle } from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { DOMAIN_NAME } from "@/lib/constants/BRANDS";
import { ClaimUsernameForm } from "./ClaimUsernameForm";

export default function HeroSection() {
	return (
		<section className="relative flex min-h-screen w-full justify-center overflow-hidden bg-background px-4 py-0 pt-24 md:pt-48">
			<div className="flex flex-col items-center space-y-8 text-center lg:items-start lg:text-left">
				<Badge className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 backdrop-blur-sm">
					<Sparkle aria-hidden className="h-4 w-4 text-primary" />
					<span className="font-medium text-caption text-foreground">
						Free to start
					</span>
				</Badge>

				<h1 className="text-4xl text-foreground md:text-display">
					One link for everything you make
				</h1>

				{/*
				 * max-w-xl caps the measure at roughly 60 characters, so the
				 * paragraph breaks in an even shape instead of running wide.
				 */}
				<p className="max-w-xl text-balance text-body-lg text-muted-foreground md:text-lead">
					Claim a {DOMAIN_NAME} address, add your links, and see which ones
					people tap.
				</p>

				<ClaimUsernameForm />
			</div>
		</section>
	);
}
