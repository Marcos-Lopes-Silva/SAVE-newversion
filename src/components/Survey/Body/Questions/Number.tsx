import { Form } from "@/components/Form";
import { IQuestionProp } from ".";
import { LuAsterisk } from "react-icons/lu";


export function Number({ question }: IQuestionProp) {
    return (
        <Form.Field>
            <Form.Label className="py-2 px-2 font-bold">{`${question.id}. ${question.title}`}{question.required ? <LuAsterisk /> : ""}</Form.Label>
            <Form.Input type="text" pattern="[0-9]*[.,]?[0-9]*" inputMode="decimal" name={question.name} />
        </Form.Field>
    )
}