import { Form } from "@/components/Form";
import { IQuestionProp } from ".";
import { useFormContext, useWatch } from "react-hook-form";
import { useState } from "react";
import { LuAsterisk } from "react-icons/lu";


export function Radio({ question }: IQuestionProp) {
    const { register, setValue } = useFormContext();
    const [valued, setValued] = useState<string>();

    return (
        <Form.Field>
            <Form.Label className="py-2 px-2 font-bold flex gap-2">{`${question.id}. ${question.title}`}{question.required ? <LuAsterisk size={10} /> : ""}</Form.Label>
            {question.options && question.options.map((option, index) => {
                const radioId = `${question.name}-${index}`;

                return (
                    <div key={index} className="flex flex-col gap-3">
                        <Form.Field key={index} className="flex gap-3">
                            <Form.Input
                                id={radioId}
                                className="w-10 h-10"
                                onClick={() => setValued(option.value)}
                                name={question.name}
                                value={option.value}
                                type="radio"
                            />
                            <Form.Label htmlFor={radioId}>{option.label}</Form.Label>
                        </Form.Field>

                        {(option.value.toLowerCase() === "outro" || option.value.toLowerCase() === "outra" || option.value.toLowerCase() === "outro:" || option.value.toLowerCase() === "outros" ||
                            option.value.toLowerCase() === "other") &&
                            valued && (<p>{valued} {option.value}</p>) &&
                            valued.toLowerCase() === option.value.toLowerCase() && (
                                <Form.Field className="mt-2">
                                    <Form.Input
                                        className="w-full p-2 rounded"
                                        {...register(`${question.name}Outro`)}
                                        type="text"
                                        placeholder="Digite aqui..."
                                        onChange={(e) => setValue(`${question.name}Outro`, e.target.value)}
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