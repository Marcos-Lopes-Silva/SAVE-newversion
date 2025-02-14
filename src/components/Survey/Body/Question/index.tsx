import { toast } from "react-toastify";
import { IQuestion } from "../../../../../models/surveyModel";
import { QuestionsBody } from "../Questions";
import { useFormContext, useWatch } from "react-hook-form";
import React, { useEffect } from "react";

interface Props {
    id: string;
    question: IQuestion;
}

const QuestionBody = React.memo(({ id, question }: Props) => {
    const { control } = useFormContext();

    const questionAnswer = useWatch({
        control,
        name: question.dependsOn!,
    });

    const shouldShowQuestion = question.dependsOn
        ? question.dependsOnValue !== undefined
            ? questionAnswer === question.dependsOnValue
            : Boolean(questionAnswer) &&
            (Array.isArray(questionAnswer) ? questionAnswer.length > 0 : true)
        : true;

    useEffect(() => {
        console.log('Dependency Answer:', questionAnswer, 'Should Show:', shouldShowQuestion);
    }, [questionAnswer, shouldShowQuestion]);


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
                return <QuestionsBody.DateQuestion question={question} />;
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

    if (!shouldShowQuestion) return null;

    return (
        <div id={id} className="bg-zinc-100 dark:bg-zinc-800 p-10 rounded-2xl shadow-lg">
            {handleType(question.type)}
        </div>
    );
});

QuestionBody.displayName = "QuestionBody";

export default QuestionBody;