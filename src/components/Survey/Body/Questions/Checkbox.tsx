import { Form } from "@/components/Form";
import { IQuestionProp } from ".";
import { LuAsterisk } from "react-icons/lu";
import { useFormContext, Controller } from "react-hook-form";
import { useState } from "react";

export function Checkbox({ question }: IQuestionProp) {
    const { control } = useFormContext();
    const [showOtherInput, setShowOtherInput] = useState(false);

    return (
        <Form.Field>
            <Form.Label className="py-2 px-2 font-bold flex gap-2 dark:text-white">
                {`${question.id}. ${question.title}`}
                {question.required ? <LuAsterisk size={10} /> : ""}
            </Form.Label>
            <Controller
                name={question.name}
                control={control}
                rules={{
                    validate: (value: string[] = []) => {
                        // Validação de campo obrigatório
                        if (question.required && value.length === 0) {
                            return "Por favor, selecione ao menos uma opção.";
                        }

                        // Validação do campo "Outro"
                        const otherValue = value.find(v => /^outro[s]?[:]?|^outra[s]?[:]?/i.test(v));
                        if (otherValue && otherValue.length <= 7) {
                            return "Por favor, preencha o campo 'Outros'.";
                        }

                        return true;
                    }
                }}
                render={({ field }) => (
                    <>
                        {question.options?.map((option, index) => {
                            const checkboxId = `${question.name}-${index}`;
                            const isOtherOption = /^outro[s]?[:]?|^outra[s]?[:]?/i.test(option.value);

                            return (
                                <div key={index} className="flex flex-col gap-3">
                                    <Form.Field className="flex gap-3">
                                        <input
                                            type="checkbox"
                                            id={checkboxId}
                                            checked={field.value?.some((v: string) =>
                                                isOtherOption
                                                    ? /^outro[s]?[:]?|^outra[s]?[:]?/i.test(v)
                                                    : v === option.value
                                            )}
                                            onChange={(e) => {
                                                let newValues = [...(field.value || [])];

                                                if (e.target.checked) {
                                                    newValues.push(isOtherOption ? "Outro" : option.value);
                                                } else {
                                                    newValues = newValues.filter(v =>
                                                        v !== option.value &&
                                                        !/^outro[s]?[:]?|^outra[s]?[:]?/i.test(v)
                                                    );
                                                }

                                                field.onChange(newValues);
                                                setShowOtherInput(
                                                    newValues.some(v => /^outro[s]?[:]?|^outra[s]?[:]?/i.test(v))
                                                );
                                            }}
                                        />
                                        <Form.Label htmlFor={checkboxId}>
                                            {option.label}
                                        </Form.Label>
                                    </Form.Field>

                                    {/* Campo "Outro" condicional */}
                                    {isOtherOption && showOtherInput && (
                                        <Form.Field className="mt-2">
                                            <Form.Input
                                                placeholder="Digite aqui..."
                                                name={`${question.name}[other]`}
                                                value={(field.value?.find((v: string) => /^outro[s]?[:]?|^outra[s]?[:]?/i.test(v))?.split(":"))[1]?.trim() || ""}
                                                onChange={(e) => {
                                                    const newValue = `Outro: ${e.target.value}`;
                                                    const newValues = field.value?.map((v: string) =>
                                                        /^outro[s]?[:]?|^outra[s]?[:]?/i.test(v) ? newValue : v
                                                    ) || [newValue];
                                                    field.onChange(newValues);
                                                }}
                                            />
                                        </Form.Field>
                                    )}
                                </div>
                            )
                        })}
                    </>
                )}
            />
            <Form.ErrorMessage field={question.name} />
        </Form.Field>
    );
}
