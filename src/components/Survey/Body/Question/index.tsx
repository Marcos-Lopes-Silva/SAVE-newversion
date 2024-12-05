import { toast } from "react-toastify";
import { IQuestion } from "../../../../../models/surveyModel";
import { QuestionsBody } from "../Questions";
import { useFormContext, useWatch } from "react-hook-form";
import axios from "axios";
import { useEffect, useState } from "react";

interface Props {
    id: string;
    question: IQuestion;
}

export default function QuestionBody({ id, question }: Props) {
    const { control } = useFormContext();

    const questionAnswer = useWatch({
        control,
        name: question.dependsOn!,
    });

    const shouldShowQuestion = question.dependsOn
        ? question.dependsOnValue
            ? questionAnswer === question.dependsOnValue
            : questionAnswer !== "" && questionAnswer !== null && questionAnswer !== undefined
        : true;




    useEffect(() => {
    }, [questionAnswer, control]);

    if (!shouldShowQuestion) return null;

    function handleType(type: IQuestion["type"]) {
        switch (type) {
            case "text":
                return <QuestionsBody.Text question={question} />;
            case "radio":
                return <QuestionsBody.Radio question={question} />;
            case "checkbox":
                return <QuestionsBody.Checkbox question={question} />;
            case "dropdown":
                return <QuestionsBody.Dropdown question={question} />;
            case "date":
                return <QuestionsBody.Date question={question} />;
            case "number":
                return <QuestionsBody.Number question={question} />;
            case "textarea":
                return <QuestionsBody.TextArea question={question} />;
            case "rating":
                return <QuestionsBody.Rating question={question} />;
            case "select":
                return <QuestionsBody.Select question={question} />;
            case "table":
                return <QuestionsBody.TableSurvey question={question} />;
            default:
                toast.error("Invalid question type");
        }
    }

    return (
        <div id={id} className="bg-zinc-100 p-10 rounded-2xl shadow-lg">
            {handleType(question.type)}
        </div>
    );
}
