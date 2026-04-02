import { Form } from "@/components/Form";
import { IQuestionProp } from ".";
import { LuAsterisk } from "react-icons/lu";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { Input } from "@nextui-org/react";

export function Checkbox({ question }: IQuestionProp) {
    const { setValue, watch } = useFormContext();
    const watchedValue = watch(question.name);

    const isOtherOptionValue = (val: string) => 
        ["outro", "outra", "outro:", "outros", "other"].includes(val.toLowerCase()) || 
        val.toLowerCase().startsWith("outro:");

    const handleCheckboxChange = (name: string, value: string, checked: boolean, isOtherOption: boolean) => {
        const currentValues = Array.isArray(watchedValue) ? watchedValue : [];

        if (isOtherOption) {
            const newValues = checked
                ? [...currentValues, value]
                : currentValues.filter((v: string) => !isOtherOptionValue(v));

            const cleanedNewValues = new Set(newValues);

            setValue(name, Array.from(cleanedNewValues), { shouldValidate: true, shouldDirty: true });
        } else {
            const newValues = checked
                ? [...currentValues, value]
                : currentValues.filter((v: string) => v !== value);

            const cleanedNewValues = new Set(newValues);

            setValue(name, Array.from(cleanedNewValues), { shouldValidate: true, shouldDirty: true });
        }
    };

    const handleCheckboxOtherChange = (name: string, value: string) => {
        const currentValues = Array.isArray(watchedValue) ? watchedValue : [];

        const existingOther = currentValues.find((v: string) => isOtherOptionValue(v));

        let newValues;

        if (existingOther) {
            newValues = currentValues.map((v: string) =>
                isOtherOptionValue(v) ? `Outro: ${value}` : v
            );
        } else {
            newValues = [...currentValues, `Outro: ${value}`];
        }

        const cleanedNewValues = new Set(newValues);
        setValue(name, Array.from(cleanedNewValues), { shouldValidate: true, shouldDirty: true });
    };

    return (
        <Form.Field>
            <Form.Label className="py-2 px-2 font-bold flex gap-2 dark:text-white">
                {`${question.id}. ${question.title}`}
                {question.required ? <LuAsterisk size={10} /> : ""}
            </Form.Label>
            {question.options &&
                question.options.map((option, index) => {
                    const checkboxId = `${question.name}-${index}`;
                    const isOtherOption = ["outro", "outra", "outro:", "outros", "other"].includes(
                        option.value.toLowerCase());
                    const otherEntry = Array.isArray(watchedValue) ? watchedValue.find((v: string) => isOtherOptionValue(v)) : null;
                    const isOtherSelected = !!otherEntry;

                    return (
                        <div key={index} className="flex flex-col gap-3">
                            <Form.Field className="flex items-center gap-3">
                                <Input
                                    id={checkboxId}
                                    className="w-10 h-10 flex-shrink-0"
                                    type="checkbox"
                                    value={option.value}
                                    checked={isOtherOption ? isOtherSelected : Array.isArray(watchedValue) && watchedValue?.includes(option.value)}
                                    name={question.name}
                                    onChange={(e) =>
                                        handleCheckboxChange(question.name, option.value, e.target.checked, isOtherOption)
                                    }
                                />
                                <Form.Label htmlFor={checkboxId} className="flex-1 font-bold text-sm dark:text-white">{option.label}</Form.Label>
                            </Form.Field>

                            {
                                isOtherOption && isOtherSelected && (
                                    <Form.Field className="mt-4">
                                        <Form.Label htmlFor={`${question.name}`} className="py-2 px-2 dark:text-white">
                                            Especifique:
                                        </Form.Label>
                                        <Input
                                            id={`${question.name}`}
                                            variant="underlined"
                                            className="dark:text-white"
                                            placeholder="Digite aqui..."
                                            value={otherEntry?.toLowerCase().startsWith("outro:") ? otherEntry.split(":")[1].trim() : ""}
                                            onChange={(e) => handleCheckboxOtherChange(question.name, e.target.value)}
                                        />
                                    </Form.Field>
                                )}
                        </div>
                    );
                })}
            <Form.ErrorMessage field={question.name} />
        </Form.Field>
    );
}
