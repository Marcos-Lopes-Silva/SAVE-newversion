import { Form } from '@/components/Form';
import { Controller, useFormContext } from 'react-hook-form';
import { IQuestionProp } from '.';
import { useState } from 'react';
import { LuAsterisk } from 'react-icons/lu';

export function Radio({ question }: IQuestionProp) {
    const { control, setValue } = useFormContext();
    const [showOther, setShowOther] = useState(false);

    return (
        <Form.Field>
            <Form.Label className="py-2 px-2 font-bold flex gap-2 dark:text-white">{`${question.id}. ${question.title}`}{question.required ? <LuAsterisk size={10} /> : ""}</Form.Label>
            <Controller
                name={question.name}
                control={control}
                render={({ field }) => (
                    <>
                        {question.options?.map((option, index) => (
                            <div key={index} className='flex gap-2 px-2 items-center'>
                                <input
                                    type="radio"
                                    id={`${question.name}-${index}`}
                                    {...field}
                                    value={option.value}
                                    checked={field.value === option.value}
                                    onChange={(e) => {
                                        const isOther = option.value.toLowerCase().includes("outro");
                                        setShowOther(isOther);
                                        field.onChange(e.target.value);
                                    }}
                                />
                                <Form.Label htmlFor={`${question.name}-${index}`}>{option.label}</Form.Label>
                            </div>
                        ))}
                        {showOther && (
                            <Form.Input
                                name={`${question.name}[other]`}
                                onChange={(e) =>
                                    setValue(question.name, `Outro: ${e.target.value}`)
                                }
                            />
                        )}
                    </>
                )}
            />
            <Form.ErrorMessage field={question.name} />
        </Form.Field>
    )
}