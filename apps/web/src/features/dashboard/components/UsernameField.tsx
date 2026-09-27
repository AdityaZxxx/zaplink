"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { DOMAIN_NAME } from "@/lib/constants/BRANDS";

/*
 * The domain prefix sits inside the same surface, so there is no single control
 * to hang the id and aria wiring on.
 */
export function UsernameField({ field }: { field: AnyFieldApi }) {
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	const id = field.name;

	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={id}>Username</FieldLabel>
			<div
				className="flex items-center rounded-2xl bg-input/50 transition-[color,box-shadow] duration-200 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30"
				aria-describedby={isInvalid ? `${id}-error` : `${id}-description`}
			>
				<span className="select-none ps-3 font-medium text-muted-foreground text-sm">
					{DOMAIN_NAME}/
				</span>
				<Input
					id={id}
					name={field.name}
					value={field.state.value}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
					placeholder="username"
					aria-invalid={isInvalid}
					className="min-w-0 flex-1 bg-transparent ps-0 focus-visible:border-0! focus-visible:ring-0!"
				/>
			</div>
			<FieldDescription id={`${id}-description`}>
				Your profile lives at this address. Changing it breaks any link already
				shared.
			</FieldDescription>
			{isInvalid && (
				<FieldError id={`${id}-error`} errors={field.state.meta.errors} />
			)}
		</Field>
	);
}
