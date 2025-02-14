import { IQuestionProp } from ".";
import { Controller, useFormContext } from "react-hook-form";
import { Form } from "@/components/Form";
import { LuAsterisk } from "react-icons/lu";
import { I18nProvider } from "@react-aria/i18n";
import { CalendarDate, DatePicker } from "@nextui-org/react";
import { CalendarDateTime, parseDate, ZonedDateTime } from "@internationalized/date";

export function DateQuestion({ question }: IQuestionProp) {
    const { control } = useFormContext();


    const handleChangeDate = (e: CalendarDate | CalendarDateTime | ZonedDateTime, onChange: (...event: any[]) => void) => {
        const value = e.toString();
        const date = new Date(value);
        onChange(date.toISOString());
    }

    return (
        <div className="flex font-bold flex-col gap-5">
            <Form.Label className="py-2 px-2 font-bold flex gap-2 dark:text-white">{`${question.id}. ${question.title}`}{question.required ? <LuAsterisk size={10} /> : ""}</Form.Label>
            <Controller
                name={question.name}
                control={control}
                defaultValue={control._defaultValues[question.name]}
                rules={{ required: question.required ? true : false }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                    <I18nProvider locale="en-GB">
                        <DatePicker onChange={(e) => handleChangeDate(e, onChange)} onBlur={onBlur} value={parseDate(value ? value.split("T")[0] : "2024-09-01")} ref={ref} />
                    </I18nProvider>
                )}
            />
            <Form.ErrorMessage field={question.name} />
        </div>
    )
}   