import { LuAsterisk } from "react-icons/lu";
import { IQuestionProp } from ".";
import { Form } from "@/components/Form";



export function TextArea({ question }: IQuestionProp) {

    return (
        <Form.Field>
            <Form.Label className="py-2 px-2 font-bold">{`${question.id}. ${question.title}`}{question.required ? <LuAsterisk /> : ""}</Form.Label>
            <Form.TextArea name={question.name} className="bg-transparent p-2 rounded-md" placeholder={question.placeholder ?? "Insira um texto"} />
            <Form.ErrorMessage field={question.name} />
        </Form.Field>
    )
}