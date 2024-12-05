import { QuestionProps } from "../Question";

export function CreateTextArea({ question, updateProp, syncSurvey }: QuestionProps) {

    const handleChange = (value: string) => {
        const updatedQuestion = { ...question, title: value };
        updateProp(updatedQuestion);
    }

    const handleBlur = () => {
        syncSurvey(question);
    }

    return (
        <div className="flex flex-col gap-2 w-2/3">
            <input className="border-2 w-full border-zinc-300 rounded-xl p-2 outline-none" value={question.title} type="text" onChange={(e) => handleChange(e.target.value)} onBlur={handleBlur} />
            <textarea className="border-2 border-zinc-200 p-2 rounded-xl outline-none focus:outline-zinc-500" readOnly />
        </div>
    )
}