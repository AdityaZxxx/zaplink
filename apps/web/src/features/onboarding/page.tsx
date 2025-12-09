"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Loader from "@/components/shared/Loader";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc/client";
import { ConfirmationStep } from "./components/ConfirmationStep";
import { LinkStep } from "./components/LinkStep";
import { UsernameAndProfileStep } from "./components/UsernameAndProfileStep";

export type OnboardingData = {
	username: string;
	displayName: string;
	bio: string;
	avatarUrl: string | null;
	bannerUrl: string | null;
	avatarFile?: File;
	bannerFile?: File;
	links: {
		title: string;
		url: string;
		type: "custom" | "platform";
		platformName?: string;
		platformCategory?:
			| "social"
			| "business"
			| "music"
			| "entertainment"
			| "lifestyle"
			| "news";
	}[];
};

export default function OnboardingPage() {
	const session = authClient.useSession();
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(0);

	// Centralized State
	const [formData, setFormData] = useState<OnboardingData>({
		username: "",
		displayName: "",
		bio: "",
		avatarUrl: null,
		bannerUrl: null,
		links: [],
	});

	const { data: onboardingState, isLoading: isOnboardingLoading } = useQuery(
		trpc.onboarding.getOnboardingState.queryOptions(),
	);

	useEffect(() => {
		if (!session.isPending && !session.data?.user) {
			router.replace("/login");
		}
	}, [session, router]);

	useEffect(() => {
		if (!isOnboardingLoading && onboardingState?.isOnboardingComplete) {
			router.replace("/dashboard");
		}
	}, [isOnboardingLoading, onboardingState, router]);

	// Auth Check
	if (
		session.isPending ||
		isOnboardingLoading ||
		!session.data?.user ||
		onboardingState?.isOnboardingComplete
	) {
		return <Loader />;
	}

	const steps = [
		{
			title: "Profile Setup",
			description: "Set your username and profile details",
		},
		{ title: "First Link", description: "Add your first link to get started" },
		{
			title: "Confirm",
			description: "Review your information before submitting",
		},
	];

	const _progressValue = ((currentStep + 1) / steps.length) * 100;

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handleBack = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const updateFormData = (data: Partial<OnboardingData>) => {
		setFormData((prev) => ({ ...prev, ...data }));
	};

	const renderCurrentStep = () => {
		switch (currentStep) {
			case 0:
				return (
					<UsernameAndProfileStep
						onNext={handleNext}
						initialData={formData}
						onUpdate={(data) => updateFormData(data)}
					/>
				);
			case 1:
				return (
					<LinkStep
						onNext={handleNext}
						onBack={handleBack}
						initialLinks={formData.links}
						onUpdate={(links) => updateFormData({ links })}
					/>
				);
			case 2:
				return <ConfirmationStep onBack={handleBack} data={formData} />;
			default:
				return null;
		}
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
			<div className="fade-in slide-in-from-bottom-4 w-full max-w-xl animate-in duration-700">
				{/* Header */}
				<div className="mb-8 text-center">
					<h1 className="mb-2 font-bold text-3xl text-white tracking-tight">
						{steps[currentStep].title}
					</h1>
					<p className="text-zinc-400">{steps[currentStep].description}</p>
				</div>

				{/* Progress Indicator */}
				<div className="mb-8 flex gap-2">
					{steps.map((_, index) => (
						<div
							key={index}
							className={`h-1 flex-1 rounded-full transition-all duration-500 ${
								index <= currentStep ? "bg-white" : "bg-zinc-800"
							}`}
						/>
					))}
				</div>

				{/* Content Card */}
				<div className="relative">{renderCurrentStep()}</div>
			</div>
		</div>
	);
}
