import { Form } from "@/components/Form";
import { IQuestionProp } from ".";
import { LuAsterisk } from "react-icons/lu";
import { useFormContext } from "react-hook-form";
import { Input } from "@nextui-org/react";



export function Text({ question }: IQuestionProp) {

    const { register } = useFormContext();

    return (
        <Form.Field >
            <Form.Label className="py-2 px-2 font-bold flex gap-2 dark:text-white">{`${question.id}. ${question.title}`}{question.required ? <LuAsterisk size={10} /> : ""}</Form.Label>
            <Input required={question.required}
                {...register(question.name)} className="bg-transparent p-2 rounded-md dark:text-white" placeholder={question.placeholder ?? "Insira um texto"} />
            <Form.ErrorMessage field={question.name} />
        </Form.Field>
    )
}