import { useState } from "react";
import { QuestionProps } from "../Question";



export function CreateNumber({ question, updateProp, syncSurvey }: QuestionProps) {
    const [number, setNumber] = useState<string>("");

    const handleChange = (value: string) => {
        const updatedQuestion = { ...question, title: value };
        updateProp(updatedQuestion);
    }

    const handleNumber = (value: string) => {
        if (value.match(/[^0-9]/gm)) return;
        setNumber(value);
    }

    const handleBlur = () => {
        syncSurvey(question);
    }


    return (
        <div className="flex flex-col gap-3 w-2/3">
            <input className="border-2 w-full border-zinc-300 rounded-xl p-2 outline-none" value={question.title} type="text" onChange={(e) => handleChange(e.target.value)} onBlur={handleBlur} />
            <input className="border-2 w-2/5 rounded-xl px-2 py-1" value={number} onChange={(e) => handleNumber(e.target.value)}/>
        </div>
    )
}