import { Control, useController } from 'react-hook-form'
import { InputProps, Input as NextInput } from '@nextui-org/react'
import InputMask from "react-input-mask";

interface Props extends InputProps {
    name: string
    control: Control<any, any>
    mask?: string
    maskChar?: string
    disabled?: boolean
}

export function MaskedInput({ disabled = false, ...props }: Props) {
    const { field } = useController({ name: props.name, control: props.control })

    return (
        <InputMask
            mask={props.mask || ""}
            maskChar={props.maskChar}
            value={field.value || ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            disabled={disabled}
        >
            {() => (
                <NextInput
                    id={props.id}
                    {...props}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={disabled}
                />
            )}
        </InputMask>

    )
}