import { useEffect } from "react";
import { QuestionProps } from "../Question";


export function CreateRating({ question, updateProp, syncSurvey }: QuestionProps) {

    const handleChange = (value: string) => {
        const updatedQuestion = { ...question, title: value };
        updateProp(updatedQuestion);
    }

    const handleBlur = () => {
        syncSurvey(question);
    }

    const add = () => {
        const options = question.options == undefined ? [] : question.options;

        if (options === undefined) return;

        const sortedOptions = options.map(option => option.id).sort((a, b) => a - b);
        const id = sortedOptions[sortedOptions.length - 1] > 0 ? sortedOptions[sortedOptions.length - 1] + 1 : 1;

        const updatedQuestion = {
            ...question, options: [
                ...question.options === undefined ? [] : question.options,
                { id: id, label: `Option ${id}`, value: id.toString() }]
        };

        updateProp(updatedQuestion);
        syncSurvey(question);
    }

    const remove = () => {

        if (question.options === undefined || question.options?.length < 2) return;

        const sortedOptions = question.options!!.map(option => option.id).sort((a, b) => a - b);
        const id = sortedOptions[sortedOptions.length - 1] > 0 ? sortedOptions[sortedOptions.length - 1] + 1 : 1;

        const updatedQuestion = { ...question, options: [...question.options?.filter(op => op.id != id - 1)] };
        updateProp(updatedQuestion);
        syncSurvey(question);
    }

    useEffect(() => {
    }, [question])
    return (
        <div className="flex flex-col gap-2 w-2/3">
            <input className="border-2 w-full border-zinc-300 rounded-xl p-2 outline-none" value={question.title} type="text" onChange={(e) => handleChange(e.target.value)} onBlur={handleBlur} />
            <div className="flex gap-2">
                {question.options?.map((option, index) => (
                    <div key={index} className="rounded-full w-auto h-auto px-3 py-2 hover:bg-slate-600 cursor-pointer text-white bg-slate-700" onClick={() => alert(option.value)}>
                        {option.label}
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <p className="cursor-pointer hover:bg-zinc-700 rounded-full bg-zinc-800 p-2 w-8 h-8 text-white font-semibold flex items-center justify-center" onClick={remove}> - </p>
                <p className="cursor-pointer hover:bg-zinc-700 rounded-full bg-zinc-800 p-2 w-8 h-8 text-white font-semibold flex items-center justify-center" onClick={add}> + </p>
            </div>
        </div>
    )
}