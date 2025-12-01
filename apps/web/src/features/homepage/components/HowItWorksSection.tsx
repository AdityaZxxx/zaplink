import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, DOMAIN_NAME } from "@/lib/constants/BRANDS";

export default function HowItWorksSection() {
	return (
		<section className="relative overflow-hidden border-border/5 border-t bg-background px-4 py-32">
			{/* Ambient Background Glow */}
			<div className="-translate-x-1/2 pointer-events-none absolute top-0 left-1/2 h-[500px] w-[1000px] rounded-full bg-primary/20 opacity-20 blur-[120px]" />

			<div className="relative z-10 mx-auto max-w-7xl">
				<div className="mb-20 text-center">
					<h2 className="mb-6 font-bold text-3xl text-foreground tracking-tight md:text-5xl">
						From Zero to Live in 30 Seconds
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
						Within a minute, you can create a link for your profile. Just pure
						efficiency.
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-3">
					{/* Step 1: Claim */}
					<div className="group relative overflow-hidden rounded-4xl border border-border/5 bg-card/40 p-8 transition-all duration-500 hover:bg-card/60">
						<div className="absolute top-0 right-0 select-none p-8 font-bold text-8xl text-foreground opacity-10 transition-opacity group-hover:opacity-20">
							1
						</div>

						<div className="relative z-10 flex h-full flex-col">
							<div className="group-hover:-translate-y-2 mb-8 w-full max-w-[240px] rounded-xl border border-border/5 bg-background/50 p-4 shadow-xl backdrop-blur-sm transition-transform duration-500">
								<div className="mb-3 flex items-center gap-2">
									<div className="h-2 w-2 rounded-full bg-red-500/50" />
									<div className="h-2 w-2 rounded-full bg-yellow-500/50" />
									<div className="h-2 w-2 rounded-full bg-green-500/50" />
								</div>
								<div className="flex h-8 items-center rounded bg-muted/50 px-3 font-mono text-muted-foreground text-xs">
									{DOMAIN_NAME}/
									<span className="animate-pulse text-foreground">|</span>
								</div>
							</div>

							<h3 className="mt-auto mb-3 font-semibold text-2xl text-foreground">
								Claim Username
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Secure your unique URL. Short, memorable, and yours forever.
							</p>
						</div>
					</div>

					{/* Step 2: Add Links */}
					<div className="group relative overflow-hidden rounded-4xl border border-border/5 bg-card/40 p-8 transition-all duration-500 hover:bg-card/60">
						<div className="absolute top-0 right-0 select-none p-8 font-bold text-8xl text-foreground opacity-10 transition-opacity group-hover:opacity-20">
							2
						</div>

						<div className="relative z-10 flex h-full flex-col">
							<div className="group-hover:-translate-y-2 relative mb-8 h-24 w-full max-w-[240px] transition-transform duration-500">
								<div className="absolute top-0 left-0 z-30 flex h-10 w-full items-center gap-3 rounded-lg border border-border/5 bg-muted px-3 shadow-lg">
									<div className="h-6 w-6 rounded bg-blue-500/20" />
									<div className="h-2 w-20 rounded bg-muted-foreground/20" />
								</div>
								<div className="absolute top-4 left-2 z-20 flex h-10 w-full items-center gap-3 rounded-lg border border-border/5 bg-muted/80 px-3 shadow-lg">
									<div className="h-6 w-6 rounded bg-pink-500/20" />
									<div className="h-2 w-20 rounded bg-muted-foreground/20" />
								</div>
								<div className="absolute top-8 left-4 z-10 flex h-10 w-full items-center gap-3 rounded-lg border border-border/5 bg-muted/60 px-3 shadow-lg">
									<div className="h-6 w-6 rounded bg-green-500/20" />
									<div className="h-2 w-20 rounded bg-muted-foreground/20" />
								</div>
							</div>

							<h3 className="mt-auto mb-3 font-semibold text-2xl text-foreground">
								Stack Your Links
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Paste your social profiles, portfolio, or products. We
								auto-fetch the metadata.
							</p>
						</div>
					</div>

					{/* Step 3: Launch */}
					<div className="group relative overflow-hidden rounded-4xl border border-border/5 bg-card/40 p-8 transition-all duration-500 hover:bg-card/60">
						<div className="absolute top-0 right-0 select-none p-8 font-bold text-8xl text-foreground opacity-10 transition-opacity group-hover:opacity-20">
							3
						</div>

						<div className="relative z-10 flex h-full flex-col">
							<div className="group-hover:-translate-y-2 mb-8 flex h-24 w-full max-w-[240px] items-center justify-center transition-transform duration-500">
								<div className="relative">
									<div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
									<Button className="relative rounded-full bg-primary px-6 py-2 font-bold text-primary-foreground text-sm shadow-xl transition-transform hover:scale-105">
										Publish Now
									</Button>
									<div
										className="-top-4 -right-4 absolute h-2 w-2 animate-bounce rounded-full bg-yellow-400"
										style={{ animationDelay: "0.1s" }}
									/>
									<div
										className="-bottom-2 -left-6 absolute h-2 w-2 animate-bounce rounded-full bg-blue-400"
										style={{ animationDelay: "0.3s" }}
									/>
									<div
										className="-right-8 absolute top-8 h-2 w-2 animate-bounce rounded-full bg-purple-400"
										style={{ animationDelay: "0.5s" }}
									/>
								</div>
							</div>

							<h3 className="mt-auto mb-3 font-semibold text-2xl text-foreground">
								Share Anywhere
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								One link for your Instagram, TikTok, and many more platform.
								Track analytics instantly.
							</p>
						</div>
					</div>
				</div>

				<div className="mt-20 text-center">
					<Button className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-8 py-4 font-medium text-base text-foreground transition-all hover:border-border/80 hover:bg-muted">
						Claim {APP_NAME} for free
						<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
					</Button>
				</div>
			</div>
		</section>
	);
}
