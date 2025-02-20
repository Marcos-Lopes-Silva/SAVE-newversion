import { useFormContext } from 'react-hook-form'
import { Input as InputNext, InputProps } from "@nextui-org/react";

interface Props extends InputProps {
    name: string,
    min?: number | string
    max?: number | string
    valueAsNumber?: boolean
    rhfPattern?: any,
    validate?: any
}

export function Input(props: Props) {
    const { register } = useFormContext()

    return (
        <InputNext
            id={props.name}
            classNames={{
                input: "border-0 focus:outline-none focus:outline-none"
            }}
            variant="underlined"
            className="flex-1 focus:rounded-lg rounded-lg border-0 shadow-sm px-1 py-2 dark:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
            {...register(props.name,
                {
                    required: props.required && true,
                    min: props.min && { value: props.min, message: `Valor mínimo é ${props.min}` },
                    max: props.max && { value: props.max, message: `Valor máximo é ${props.max}` },
                    pattern: props.rhfPattern && props.rhfPattern,
                    validate: props.validate
                }
            )}
            {...props}
        />
    )
}