import FeaturesSection from "./components/FeaturesSection";
import HeroSection from "./components/HeroSection";
import HowItWorksSection from "./components/HowItWorksSection";

export default function HomePage() {
	return (
		<main className="min-h-screen overflow-x-hidden bg-background">
			<HeroSection />
			<FeaturesSection />
			<HowItWorksSection />
		</main>
	);
}
