import { Form } from "@/components/Form";
import { IQuestionProp } from ".";
import { useFormContext } from "react-hook-form";
import { LuAsterisk } from "react-icons/lu";
import { Input } from "@nextui-org/react";


export function Radio({ question }: IQuestionProp) {
    const { setValue, getValues, register } = useFormContext();

    console.log(question.name);
    return (
        <Form.Field>
            <Form.Label className="py-2 px-2 font-bold flex gap-2 dark:text-white">{`${question.id}. ${question.title}`}{question.required ? <LuAsterisk size={10} /> : ""}</Form.Label>
            {question.options && question.options.map((option, index) => {
                const radioId = `${question.name}-${index}`;
                const watchedValue = String(getValues(question.name) ?? "");
                const isOtherOption = ["outro", "outra", "outro:", "outros", "other"].includes(option.value.toLowerCase());
                const isOtherSelected = watchedValue?.startsWith("Outro:");

                return (
                    <div key={index} className="flex flex-col gap-3">
                        <Form.Field key={index} className="flex items-center gap-3">
                            <Input
                                id={radioId}
                                className="w-10 h-10 shrink-0"
                                {...register(question.name)}
                                value={option.value}
                                checked={isOtherOption ? isOtherSelected : watchedValue === option.value}
                                onChange={() => setValue(question.name, option.value)}
                                type="radio"
                            />
                            <Form.Label htmlFor={radioId} className="flex-1 font-bold text-sm">{option.label}</Form.Label>
                        </Form.Field>

                        {isOtherOption && isOtherSelected && (
                            <Form.Field className="mt-2">
                                <Input
                                    className="w-full p-2 rounded"
                                    variant="underlined"
                                    value={watchedValue.replace("Outro:", "")}
                                    type="text"
                                    placeholder="Digite aqui..."
                                    onChange={(e) => setValue(question.name, 'Outro:' + e.target.value, { shouldValidate: true })}
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