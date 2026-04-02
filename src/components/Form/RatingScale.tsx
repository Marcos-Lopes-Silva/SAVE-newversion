import { Radio } from "@nextui-org/react";
import { useFormContext } from "react-hook-form";
import { IOption } from "../../../models/surveyModel";


interface RatingScaleProps {
    name: string;
    options: IOption[];
}

export function RatingScale({ name, options }: RatingScaleProps) {
    const { register } = useFormContext();
    return (
        <div className="flex flex-col gap-4">
            {options.map((value) => (
                <label key={value.value} className="flex items-center">
                    <Radio
                        {...register(name)}
                        value={String(value.value)}
                        className="mr-2"
                    />
                    <span className="text-lg dark:text-white">
                        {value.label}
                    </span>
                </label>
            ))}
        </div>
    )
}