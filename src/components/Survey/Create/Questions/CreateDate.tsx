import { t } from "i18next";
import { QuestionProps } from "../Question";
import { now } from "@internationalized/date";
import { DatePicker } from "@nextui-org/react";
import { I18nProvider } from "@react-aria/i18n";

export function CreateDate({ question, updateProp, syncSurvey }: QuestionProps) {


    const handleChange = (value: string) => {
        const updatedQuestion = { ...question, title: value };
        updateProp(updatedQuestion);
    }

    const handleBlur = () => {
        syncSurvey(question);
    }

    return (
        <div className="w-1/3 flex flex-col gap-2">
            <input className="border-2 w-full border-zinc-300 rounded-xl p-2 outline-none" value={question.title} type="text" onChange={(e) => handleChange(e.target.value)} onBlur={handleBlur} />
            <I18nProvider locale="en-GB">
                <DatePicker />
            </I18nProvider>
        </div>
    )
}
