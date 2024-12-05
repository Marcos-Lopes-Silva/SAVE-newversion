import { Form } from "@/components/Form";
import { IQuestionProp } from ".";
import { LuAsterisk } from "react-icons/lu";



export function Checkbox({ question }: IQuestionProp) {
    return (
        <Form.Field>
            <Form.Label className="py-2 px-2 font-bold">{`${question.id}. ${question.title}`}{question.required ? <LuAsterisk /> : ""}</Form.Label>
            {question.options && question.options.map((option, index) => {
                const checkboxId = `${question.name}-${index}`;

                return (
                    <Form.Field key={index} className="flex gap-3">
                        <Form.Input
                            id={checkboxId}
                            className="w-10 h-10"
                            name={question.name}
                            value={option.value}
                            type="checkbox"
                        />
                        <Form.Label htmlFor={checkboxId}>{option.label}</Form.Label>
                    </Form.Field>
                );
            })}
            <Form.ErrorMessage field={question.name} />
        </Form.Field>
    )
}