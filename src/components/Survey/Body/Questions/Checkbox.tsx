import { Form } from "@/components/Form";
import { IQuestionProp } from ".";
import { LuAsterisk } from "react-icons/lu";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { Input } from "@nextui-org/react";

export function Checkbox({ question }: IQuestionProp) {
    const { setValue, getValues } = useFormContext();

    const handleCheckboxChange = (name: string, value: string, checked: boolean, isOtherOption: boolean) => {
        const currentValues = getValues(name) || [];

        if (isOtherOption) {
            const newValues = checked
                ? [...currentValues, value]
                : currentValues.filter((v: string) => !v.includes("Outro:"));

            const cleanedNewValues = new Set(newValues);

            setValue(name, Array.from(cleanedNewValues));
        } else {
            const newValues = checked
                ? [...currentValues, value]
                : currentValues.filter((v: string) => v !== value);

            const cleanedNewValues = new Set(newValues);

            setValue(name, Array.from(cleanedNewValues));
        }
    };

    const handleCheckboxOtherChange = (name: string, value: string) => {
        const currentValues = getValues(name) || [];

        const existingOther = currentValues.find((v: string) =>
            v.toLowerCase().startsWith("outro:")
        );

        let newValues;

        if (existingOther) {
            newValues = currentValues.map((v: string) =>
                v.toLowerCase().startsWith("outro:") ? `Outro: ${value}` : v
            );
        } else {
            newValues = [...currentValues, `Outro: ${value}`];
        }

        const cleanedNewValues = new Set(newValues);
        console.log(Array.from(cleanedNewValues));
        console.log(newValues);
        setValue(name, Array.from(cleanedNewValues));
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
                    const watchedValue = getValues(question.name);
                    const isOtherOption = ["outro", "outra", "outro:", "outros", "other"].includes(
                        option.value.toLowerCase());
                    const isOtherSelected = watchedValue ? watchedValue.find((v: string) => v.toLowerCase().startsWith(`outro:`)) : false;

                    return (
                        <>
                            <Form.Field key={index} className="flex items-center gap-3">
                                <Input
                                    id={checkboxId}
                                    className="w-10 h-10 flex-shrink-0"
                                    type="checkbox"
                                    value={option.value}
                                    checked={isOtherOption ? isOtherSelected : getValues(question.name)?.includes(option.value)}
                                    name={question.name}
                                    onChange={(e) =>
                                        handleCheckboxChange(question.name, option.value, e.target.checked, isOtherOption)
                                    }
                                />
                                <Form.Label htmlFor={checkboxId} className="flex-1 font-bold text-sm">{option.label}</Form.Label>
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
                                            placeholder="Digite aqui..."
                                            onChange={(e) => handleCheckboxOtherChange(question.name, e.target.value)}
                                        />
                                    </Form.Field>
                                )}
                        </>
                    );
                })}
            <Form.ErrorMessage field={question.name} />
        </Form.Field>
    );
}
