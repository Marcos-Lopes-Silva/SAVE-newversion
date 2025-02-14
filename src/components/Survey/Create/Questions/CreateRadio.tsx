import { Radio, RadioGroup } from "@nextui-org/react";
import { IQuestion } from "../../../../../models/surveyModel"
import Button from "@/components/layout/Button";
import { MdRemove } from "react-icons/md";
import { QuestionProps } from "../Question";
import { useState } from "react";



export function CreateRadio({ question, updateProp, syncSurvey }: QuestionProps) {

    const [value, setValue] = useState<string>();

    const handleChange = (value: string) => {
        const updatedQuestion = { ...question, title: value };
        updateProp(updatedQuestion);
    }

    const add = () => {
        const options = question.options == undefined ? [] : question.options;

        if (options === undefined) return;

        const updatedQuestion = {
            ...question, options: [
                ...question.options === undefined ? [] : question.options,
                { label: `Option ${question.options?.length!! + 1}`, value: `Option ${question.options?.length!! + 1}` }]
        };
        updateProp(updatedQuestion);
        syncSurvey(updatedQuestion);
    }

    const handleOptionChange = (value: string, index: number) => {

        if (!question.options) return;

        const option = question.options?.find((op, i) => i === index)!!

        const updatedOption = { label: value, value: option.value };
        const newOptions = question.options.map((item, i) => i === index ? updatedOption : item);

        const updatedQuestion: IQuestion = {
            ...question,
            options: newOptions
        }

        updateProp(updatedQuestion);
    }

    const remove = (index: number) => {
        if (!question.options) return;

        const updatedQuestion = { ...question, options: question.options?.filter((op, i) => i != index) };
        updateProp(updatedQuestion);
        syncSurvey(updatedQuestion);
    }

    return (
        <div className="flex flex-col gap-3 w-2/3">
            <input className="border-2 w-full border-zinc-300 rounded-xl p-2 outline-none" defaultValue={question.title} type="text" onBlur={(e) => handleChange(e.target.value)} />
            <RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
                {question.options?.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <Radio value={item.value}>
                        </Radio>
                        <input className="border-1 rounded px-3" type="text" defaultValue={item.label} onBlur={(e) => handleOptionChange(e.target.value, index)} />
                        <MdRemove className="cursor-pointer bg-zinc-50 hover:bg-zinc-100 shadow-md rounded-2xl p-3 w-auto h-auto" onClick={() => remove(index)} />
                    </div>
                ))}
            </RadioGroup>
            <div>
                <Button className="flex items-center justify-center bg-zinc-50 shadow-md hover:bg-zinc-100 rounded-2xl" variant="tertiary" onClick={add}>+</Button>
            </div>
        </div>
    )
}