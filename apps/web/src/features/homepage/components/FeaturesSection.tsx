import { ArrowUpRight, Github, Globe, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FeaturesSection() {
	return (
		<section className="relative overflow-hidden border-primary/5 border-t bg-background px-4 py-32">
			{/* Ambient Background Glow */}
			<div className="-translate-x-1/2 pointer-events-none absolute top-0 left-1/2 h-[500px] w-[1000px] rounded-full bg-primary/20 opacity-20 blur-[120px]" />

			<div className="relative z-10 mx-auto max-w-7xl">
				<div className="mb-16 text-center">
					<h2 className="mb-4 font-bold text-3xl text-primary md:text-5xl">
						Everything you need. <br /> Nothing you don't.
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
						We stripped away the clutter. What's left is a tool focused purely
						on speed, aesthetics, and conversion.
					</p>
				</div>

				<div className="grid auto-rows-[minmax(300px,auto)] grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
					{/* Card 1: Analytics (Large - Spans 7 cols) */}
					<div className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-secondary/50 p-8 backdrop-blur-md transition-all duration-500 hover:bg-secondary/80 md:col-span-7 md:p-12">
						<div className="relative z-10 flex h-full flex-col justify-between">
							<div>
								<h3 className="mb-3 font-semibold text-3xl text-primary">
									Privacy-first Analytics
								</h3>
								<p className="max-w-sm text-lg text-muted-foreground">
									Real-time insights without the cookies. Know your audience,
									not their secrets.
								</p>
							</div>

							{/* Abstract Chart Visual */}
							<div className="relative mt-12 h-48 w-full">
								<div className="absolute right-0 bottom-0 left-0 flex h-full items-end gap-2 opacity-80">
									{[35, 55, 40, 70, 50, 85, 60, 95, 75].map((h, i) => (
										<div
											key={h}
											className="flex-1 rounded-t-lg bg-primary/20 transition-colors duration-700 group-hover:bg-primary/80"
											style={{
												height: `${h}%`,
												transitionDelay: `${i * 50}ms`,
											}}
										/>
									))}
								</div>
								{/* Overlay Line */}
								<svg
									aria-hidden="true"
									className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
									preserveAspectRatio="none"
								>
									<path
										d="M0,150 C50,120 100,160 150,100 C200,40 250,80 300,50 C350,20 400,60 450,10"
										fill="none"
										stroke="url(#gradient)"
										strokeWidth="4"
										className="opacity-0 transition-opacity delay-300 duration-700 group-hover:opacity-100"
									/>
									<defs>
										<linearGradient
											id="gradient"
											x1="0%"
											y1="0%"
											x2="100%"
											y2="0%"
										>
											<stop offset="0%" stopColor="#fff" stopOpacity="0" />
											<stop offset="50%" stopColor="#fff" stopOpacity="0.5" />
											<stop offset="100%" stopColor="#fff" stopOpacity="1" />
										</linearGradient>
									</defs>
								</svg>
							</div>
						</div>
					</div>

					{/* Card 2: Speed (Tall - Spans 5 cols) */}
					<div className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-secondary/50 p-8 backdrop-blur-md transition-all duration-500 hover:bg-secondary/80 md:col-span-5 md:p-12">
						<div className="-right-20 -top-20 absolute h-64 w-64 rounded-full bg-yellow-500/20 opacity-0 blur-[80px] transition-opacity duration-700 group-hover:opacity-100" />

						<div className="relative z-10">
							<h3 className="mb-3 font-semibold text-3xl text-primary">
								Instant Load
							</h3>
							<p className="text-lg text-muted-foreground">
								Built on the edge.{" "}
								<span className="font-medium text-primary">0ms</span> layout
								shift. Your profile loads before they blink.
							</p>
						</div>

						<div className="absolute right-0 bottom-0 h-1/2 w-full bg-linear-to-t from-background/50 to-transparent" />

						{/* Speedometer Abstract */}
						<div className="absolute right-8 bottom-8 h-32 w-32 rotate-45 rounded-full border-4 border-primary/20 border-t-yellow-500/50 transition-transform duration-1000 ease-out group-hover:rotate-225" />
					</div>

					{/* Card 3: Mobile (Spans 5 cols) */}
					<div className="group relative min-h-[400px] overflow-hidden rounded-[2.5rem] border border-border bg-secondary/50 p-8 backdrop-blur-md transition-all duration-500 hover:bg-secondary/80 md:col-span-5 md:p-12">
						<div className="relative z-10">
							<h3 className="mb-3 font-semibold text-3xl text-primary">
								Mobile Native
							</h3>
							<p className="text-lg text-muted-foreground">
								Thumb-friendly zones. Haptic-feel interactions.
							</p>
						</div>

						{/* Phone Mockup */}
						<div className="-bottom-24 -translate-x-1/2 group-hover:-translate-y-4 absolute left-1/2 h-80 w-48 rounded-4xl border-4 border-border bg-background shadow-2xl transition-transform duration-500">
							<div className="relative h-full w-full overflow-hidden rounded-[1.7rem] bg-muted/50">
								<div className="-translate-x-1/2 absolute top-4 left-1/2 h-4 w-16 rounded-full bg-foreground/10" />
								<div className="mt-12 space-y-3 px-4">
									<div className="h-8 w-full animate-pulse rounded-lg bg-muted/50" />
									<div className="h-24 w-full rounded-lg bg-muted/50" />
									<div className="h-12 w-full rounded-lg bg-blue-500/20" />
								</div>
							</div>
						</div>
					</div>

					{/* Card 4: Ecosystem (Spans 7 cols) */}
					<div className="group relative flex flex-col justify-center overflow-hidden rounded-[2.5rem] border border-border bg-secondary/50 p-8 backdrop-blur-md transition-all duration-500 hover:bg-secondary/80 md:col-span-7 md:p-12">
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

						<div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center">
							<div className="flex-1">
								<div className="mb-6 flex gap-3">
									<div className="rounded-lg border border-primary/5 bg-muted/50 p-2">
										<Github className="h-5 w-5 text-primary" />
									</div>
									<div className="rounded-lg border border-primary/5 bg-muted/50 p-2">
										<Globe className="h-5 w-5 text-primary" />
									</div>
									<div className="rounded-lg border border-primary/5 bg-muted/50 p-2">
										<Layers className="h-5 w-5 text-primary" />
									</div>
								</div>
								<h3 className="mb-3 font-semibold text-3xl text-primary">
									Open Ecosystem
								</h3>
								<p className="text-lg text-muted-foreground">
									Connect your favorite platforms. Show your identity to the
									world.
								</p>
							</div>

							<div className="shrink-0">
								<Button className="relative flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 font-medium">
									<span className="relative z-10">Explore Integrations</span>
									<ArrowUpRight className="group-hover/btn:-translate-y-0.5 relative z-10 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
									<div className="absolute inset-0 translate-y-full bg-primary/20 transition-transform duration-300 group-hover/btn:translate-y-0" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
