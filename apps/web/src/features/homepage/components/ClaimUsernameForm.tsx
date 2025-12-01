"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DOMAIN_NAME } from "@/lib/constants/BRANDS";

export const ClaimUsernameForm = () => {
	const [username, setUsername] = useState("");

	return (
		<div className="w-full max-w-md space-y-4">
			<div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
				<div className="group relative flex-1">
					<div className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 select-none text-base text-primary">
						{DOMAIN_NAME}/
					</div>
					<Input
						placeholder="my-profile"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="h-12 border-input bg-background/50 pl-[110px] text-base transition-all placeholder:text-base focus:border-primary/50"
					/>
				</div>
				<Button className="h-12 w-full rounded-full px-8 font-medium text-base md:w-auto">
					Claim Now <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};
