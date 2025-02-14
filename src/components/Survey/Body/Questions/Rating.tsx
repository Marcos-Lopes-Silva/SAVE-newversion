import { Form } from "@/components/Form";
import { IQuestionProp } from ".";
import { LuAsterisk } from "react-icons/lu";


export function Rating({ question }: IQuestionProp) {

    return (
        <Form.Field>
            <Form.Label htmlFor={question.name} className="py-2 px-2 font-bold dark:text-white">{`${question.id}. ${question.title}`}{question.required ? <LuAsterisk /> : ""}</Form.Label>
            {/* <Form.RatingScale
                name="rating"
                options={question.options ? question.options : []}
            /> */}
        </Form.Field>
    )
}
