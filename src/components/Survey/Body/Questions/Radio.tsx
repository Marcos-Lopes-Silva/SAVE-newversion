import { Form } from "@/components/Form";
import { IQuestionProp } from ".";
import { useFormContext } from "react-hook-form";
import { LuAsterisk } from "react-icons/lu";
import { Input } from "@nextui-org/react";


export function Radio({ question }: IQuestionProp) {
    const { setValue, watch, register } = useFormContext();
    const watchedValue = String(watch(question.name) ?? "");

    const isOtherOptionValue = (val: string) => 
        ["outro", "outra", "outro:", "outros", "other"].includes(val.toLowerCase()) || 
        val.toLowerCase().startsWith("outro:");

    return (
        <Form.Field>
            <Form.Label className="py-2 px-2 font-bold flex gap-2 dark:text-white">{`${question.id}. ${question.title}`}{question.required ? <LuAsterisk size={10} /> : ""}</Form.Label>
            {question.options && question.options.map((option, index) => {
                const radioId = `${question.name}-${index}`;
                const isOtherOption = ["outro", "outra", "outro:", "outros", "other"].includes(option.value.toLowerCase());
                const isOtherSelected = isOtherOptionValue(watchedValue);

                return (
                    <div key={index} className="flex flex-col gap-3">
                        <Form.Field key={index} className="flex items-center gap-3">
                            <Input
                                id={radioId}
                                className="w-10 h-10 shrink-0"
                                {...register(question.name)}
                                value={option.value}
                                checked={isOtherOption ? isOtherSelected : watchedValue === option.value}
                                onChange={() => setValue(question.name, option.value, { shouldValidate: true, shouldDirty: true })}
                                type="radio"
                            />
                            <Form.Label htmlFor={radioId} className="flex-1 font-bold text-sm dark:text-white">{option.label}</Form.Label>
                        </Form.Field>

                        {isOtherOption && isOtherSelected && (
                            <Form.Field className="mt-2">
                                <Input
                                    className="w-full p-2 rounded dark:text-white"
                                    variant="underlined"
                                    value={watchedValue.toLowerCase().startsWith("outro:") ? watchedValue.split(":")[1].trim() : ""}
                                    type="text"
                                    placeholder="Digite aqui..."
                                    onChange={(e) => setValue(question.name, 'Outro: ' + e.target.value, { shouldValidate: true, shouldDirty: true })}
                                />
                            </Form.Field>
                        )}
                    </div>
                );
            })}
            <Form.ErrorMessage field={question.name} />
        </Form.Field>
    )
}