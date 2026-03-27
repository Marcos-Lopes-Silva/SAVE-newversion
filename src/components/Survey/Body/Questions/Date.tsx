import { IQuestionProp } from ".";
import { Controller, useFormContext } from "react-hook-form";
import { Form } from "@/components/Form";
import { LuAsterisk } from "react-icons/lu";
import { I18nProvider } from "@react-aria/i18n";
import { DatePicker } from "@nextui-org/react";

export function Date({ question }: IQuestionProp) {
    const { control } = useFormContext();

    return (
        <div className="flex font-bold flex-col gap-5">
            <label>{`${question.id}. ${question.title}`}{question.required ? <LuAsterisk /> : ""}</label>
            <Controller
                name={question.name}
                control={control}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                    <I18nProvider locale="en-GB">
                        <DatePicker onChange={onChange} onBlur={onBlur} value={value} ref={ref} />
                    </I18nProvider>
                )}
            />
            <Form.ErrorMessage field={question.name} />
        </div>
    )
}   