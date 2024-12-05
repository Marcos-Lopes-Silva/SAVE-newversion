import { QuestionProps } from "../Question";

export function CreateText({ question, updateProp }: QuestionProps) {

    const handleChange = (value: string) => {
        const updatedQuestion = { ...question, title: value, name: question.name };
        updateProp(updatedQuestion);
    }

    return (
        <div className="flex gap-2 flex-col w-2/3">
            <input className="border-2 w-full border-zinc-300 rounded-xl p-2 outline-none" defaultValue={question.title} type="text" onBlur={(e) => handleChange(e.target.value)} />
            <input placeholder="Small Text" className="border-2 border-zinc-200 p-2 rounded-xl outline-none focus:outline-zinc-500" readOnly/>
        </div>
    )
}