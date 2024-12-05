import Select from "@/components/layout/Select";
import { useState } from "react";
import { QuestionProps } from "../Question";
import { IOption } from "../../../../../models/surveyModel";


export function CreateSelect({ question, updateProp }: QuestionProps) {

    const [value, setValue] = useState<string>('');

    const handleChange = (value: string) => {
        const updatedQuestion = { ...question, title: value };
        updateProp(updatedQuestion);
    }


    return (
        <div className="flex flex-col gap-3 w-2/3">
            <input className="border-2 w-full border-zinc-300 rounded-xl p-2 outline-none" defaultValue={question.title} type="text" onBlur={(e) => handleChange(e.target.value)} />
            <Select<IOption> className="" options={question.options!!} getLabel={(item) => item.label} onChange={(item) => setValue(item.value)}/>
        </div>
    )
}