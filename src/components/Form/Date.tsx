import { parseDateTime } from "@internationalized/date";
import { DatePicker, DatePickerProps } from "@nextui-org/react";
import { Controller, useFormContext } from "react-hook-form";
import { I18nProvider } from "@react-aria/i18n";

interface Props extends DatePickerProps {
    name: string;
}

export function Date({ name, ...props }: Props) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => {
                const value = typeof field.value === 'string'
                    ? parseDateTime(field.value.replace(/Z$/, "")) // Converter para CalendarDateTime
                    : field.value;

                return (
                    <I18nProvider locale="en-GB">
                        <DatePicker  {...props} value={value} onChange={(newValue) => field.onChange(newValue?.toString())} />
                    </I18nProvider>
                )
            }}
        />
    )
}
