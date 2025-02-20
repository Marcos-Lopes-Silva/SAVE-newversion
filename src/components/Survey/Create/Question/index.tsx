import { toast } from "react-toastify";
import { IQuestion } from "../../../../../models/surveyModel";
import { Questions } from "../Questions";
import { MdContentCopy, MdDelete, MdSettings, MdDone, MdOutlineCancel, MdDragIndicator, MdSort } from "react-icons/md";
import Select from "@/components/layout/Select";
import { useEffect, useRef, useState } from "react";
import Configurations from "./Configurations";
import { useAppSelector } from "@/lib/hooks";
import { Spinner, useDisclosure } from "@nextui-org/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
    idPage: number,
    question: IQuestion,
    questions: IQuestion[],
    deleteProp: (idQuestion: number) => void,
    updateProp: (question: IQuestion) => void,
    duplicateProp: (idQuestion: number) => void,
    syncSurvey: (questions: IQuestion) => void
}

interface Options {
    label: string,
    value: IQuestion["type"]
}

export interface QuestionProps {
    question: IQuestion,
    updateProp: (question: IQuestion) => void,
    syncSurvey: (question: IQuestion) => void
}

export default function Question({ idPage, question, deleteProp, updateProp, duplicateProp, questions, syncSurvey }: Props) {
    const { isOpen, onOpenChange, onOpen } = useDisclosure();
    const [syncStyle, setSyncStyle] = useState<string>("hidden");

    const ref = useRef(null);
    const data = useAppSelector(state => state.loading);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    function handleType(type: IQuestion["type"]) {
        switch (type) {
            case 'text':
                return <Questions.CreateText question={question} updateProp={updateProp} syncSurvey={syncSurvey} />
            case 'radio':
                return <Questions.CreateRadio question={question} updateProp={updateProp} syncSurvey={syncSurvey} />
            case 'checkbox':
                return <Questions.CreateCheckbox question={question} updateProp={updateProp} syncSurvey={syncSurvey} />
            case 'dropdown':
                return <Questions.CreateDropdown question={question} updateProp={updateProp} syncSurvey={syncSurvey} />
            case 'date':
                return <Questions.CreateDate question={question} updateProp={updateProp} syncSurvey={syncSurvey} />
            case 'number':
                return <Questions.CreateNumber question={question} updateProp={updateProp} syncSurvey={syncSurvey} />
            case 'textarea':
                return <Questions.CreateTextArea question={question} updateProp={updateProp} syncSurvey={syncSurvey} />
            case 'rating':
                return <Questions.CreateRating question={question} updateProp={updateProp} syncSurvey={syncSurvey} />
            case 'select':
                return <Questions.CreateSelect question={question} updateProp={updateProp} syncSurvey={syncSurvey} />
            case 'table':
                return <Questions.CreateTable question={question} updateProp={updateProp} syncSurvey={syncSurvey} />
            default:
                toast.error("Invalid question type")
                deleteProp(question.id)
        }
    }

    const questionsType: Options[] = [
        { label: "Text", value: "text" },
        { label: "Radio", value: "radio" },
        { label: "Checkbox", value: "checkbox" },
        { label: "Date", value: "date" },
        { label: "Number", value: "number" },
        { label: "Select", value: "select" },
        { label: "Textarea", value: "textarea" },
        { label: "Dropdown", value: "dropdown" },
        { label: "Rating", value: "rating" },
        { label: "Table", value: "table" }
    ];

    const changeType = (option: Options) => {
        const updatedQuestion = { ...question, type: option.value, options: option.value === "table" ? [{id: 1, label: "Perguntas", value:"perguntas"}] :  
        option.value === "radio" || option.value === "checkbox" || option.value === "select" ? question.options : [] };
        updateProp(updatedQuestion)
    }

    const resendDataSync = () => {
        syncSurvey(question);
    }

    const sortOptions = () => {
        if (question.options && question.options.length > 1) {
            const sortedOptions = [...question.options].sort((a, b) => {
                if (a.value.toLowerCase() === "outro") return 1;
                if (b.value.toLowerCase() === "outro") return -1;
                return a.label.localeCompare(b.label);
            });
            
            const updatedQuestion = { ...question, options: sortedOptions };
            updateProp(updatedQuestion);
        }
    }

    useEffect(() => {
        if (!data.isLoading && data.questionId === question.id) {
            setSyncStyle("flex");

            const timeout = setTimeout(() => {
                setSyncStyle("hidden");
            }, 3500);

            return () => clearTimeout(timeout);
        } else {
            setSyncStyle("hidden");
        }
    }, [data.isLoading, data.success, data, question.id]);

    return (
        <div ref={setNodeRef} style={style} className="flex flex-col gap-2 shadow-md px-10 rounded-lg py-5">
            {handleType(question.type)}
            <div className="flex gap-3 justify-between">
                <div className="w-20">
                    <Select<Options> className="w-40" onChange={(value: Options) => changeType(value)} getLabel={(option) => option.label} placeholder={question.type.charAt(0).toUpperCase() + question.type.slice(1).toLowerCase()} options={questionsType}></Select>
                </div>
                <div className="flex gap-2 items-center">
                    <div {...attributes} {...listeners} className="cursor-move">
                        <MdDragIndicator aria-label="Drag to reorder" />
                    </div>
                    <button onClick={() => deleteProp(question.id)} className="size-14 items-center justify-center rounded-3xl border-2 flex p-1 hover:bg-zinc-100" ><MdDelete /></button>
                    <button onClick={onOpen} className="size-14 items-center justify-center rounded-3xl border-2 flex p-1 hover:bg-zinc-100" ><MdSettings /></button>
                    <button onClick={() => duplicateProp(question.id)} className="size-14 items-center justify-center rounded-3xl border-2 flex p-1 hover:bg-zinc-100" ><MdContentCopy /></button>
                    {question.options && question.options.length > 1 && (
                        <button onClick={sortOptions} className="size-14 items-center justify-center rounded-3xl border-2 flex p-1 hover:bg-zinc-100" title="Sort options"><MdSort /></button>
                    )}
                    <div className="mr-4">
                        {(data.isLoading && data.questionId === question.id) ? (
                            <Spinner size="sm" color="default" />
                        ) : (
                            <div className={`${syncStyle} ${data.success ? 'text-green-600' : 'text-red-700'}`}>
                                {data.success ? (
                                    <MdDone size={20} />
                                ) : (
                                    <MdOutlineCancel size={20} className="cursor-pointer" onClick={resendDataSync} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Configurations isOpen={isOpen} onOpenChange={onOpenChange} useRef={ref} question={question} updateProp={updateProp} syncSurvey={syncSurvey} questions={questions} />
        </div>
    )
}

