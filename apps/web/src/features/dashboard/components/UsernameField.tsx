"use client";

import {
	FormDescription,
	FormItem,
	FormLabel,
	FormMessage,
	useFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DOMAIN_NAME } from "@/lib/constants/BRANDS";

/**
 * The username field, shared by the two forms that write the profile row.
 *
 * The prop is typed structurally rather than as react-hook-form's
 * ControllerRenderProps: that type is generic over the form values, and
 * TypeScript cannot prove that a field path of "username" is valid for an
 * arbitrary TValues. All this needs is a controlled string field, which
 * ControllerRenderProps satisfies.
 */
export interface UsernameFieldProps {
	field: {
		name: string;
		value: string;
		onChange: (...event: never[]) => void;
		onBlur: (...event: never[]) => void;
		ref: (instance: HTMLInputElement | null) => void;
		disabled?: boolean;
	};
}

export function UsernameField({ field }: UsernameFieldProps) {
	return (
		<FormItem>
			<FormLabel>Username</FormLabel>
			<UsernameInput field={field} />
			<FormDescription>
				Your profile lives at this address. Changing it breaks any link already
				shared.
			</FormDescription>
			<FormMessage />
		</FormItem>
	);
}

/*
 * FormControl puts the id and aria-describedby on the wrapper div rather than
 * the input, and the pl-[95px] prefix this replaces was narrower than
 * "zaplink.com/" at this font. The useFormField read is a hook, so it needs its
 * own component inside FormItem.
 */
function UsernameInput({ field }: UsernameFieldProps) {
	const { formItemId, formDescriptionId, formMessageId, error } =
		useFormField();

	return (
		<div className="flex items-center rounded-2xl bg-input/50 transition-[color,box-shadow] duration-200 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30">
			<span className="select-none ps-3 font-medium text-muted-foreground text-sm">
				{DOMAIN_NAME}/
			</span>
			<Input
				{...field}
				id={formItemId}
				aria-describedby={
					error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId
				}
				aria-invalid={!!error}
				placeholder="username"
				className="min-w-0 flex-1 bg-transparent ps-0 focus-visible:border-0! focus-visible:ring-0!"
			/>
		</div>
	);
}
