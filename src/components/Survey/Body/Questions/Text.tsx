import { Form } from "@/components/Form";
import { IQuestionProp } from ".";
import { LuAsterisk } from "react-icons/lu";



export function Text({ question }: IQuestionProp) {

    return (
        <Form.Field >
            <Form.Label className="py-2 px-2 font-bold">{`${question.id}. ${question.title}`}{question.required ? <LuAsterisk /> : ""}</Form.Label>
            <Form.Input name={question.name} type="type" className="bg-transparent p-2 rounded-md" placeholder={question.placeholder ?? "Insira um texto"} />
            <Form.ErrorMessage field={question.name} />
        </Form.Field>
    )
}