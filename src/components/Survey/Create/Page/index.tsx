import { useEffect } from "react"
import { IPages, IQuestion, ISurvey } from "../../../../../models/surveyModel"
import { updatePage } from "../../../../../redux/reducers";
import { useAppDispatch } from "@/lib/hooks";
import Question from "../Question";
import Button from "@/components/layout/Button";
import { updatePageAndSync } from "../../../../../redux/thunk";
import { setQuestionId } from "../../../../../redux/reducers/loading";
import { useTranslation } from "react-i18next";
import { getAllCountries } from "@/lib/utils/external";

interface Props {
    id: number,
    page: IPages,
    dispatch: ReturnType<typeof useAppDispatch>,
    data: ISurvey,
    surveyId?: string,
}

export default function Page({ id, page, dispatch, surveyId }: Props) {

    const { t } = useTranslation();

    const updatePageProps = (value: string, field: string, object?: IQuestion) => {
        let title = page.title;
        let description = page.description;
        let questions = page.questions;

        switch (field) {
            case 'title': title = value; break;
            case 'description': description = value; break;
            case 'question': questions = [...questions, object!!]; break;
            default: break;
        }

        const updatedPage = { title, description, questions };
        dispatch(updatePage({ pageId: id, updatedPage }));
    }

    const handleAddQuestion = () => {
        const sortedQuestions = page.questions.map(question => question.id).sort((a, b) => a - b);
        const id = sortedQuestions[sortedQuestions.length - 1] > 0 ? sortedQuestions[sortedQuestions.length - 1] + 1 : 1;

        const newQuestion: IQuestion = {
            id,
            title: '',
            name: `Question ${id}`,
            type: 'text',
            required: false,
        }
        updatePageProps('', 'question', newQuestion);
    }

    const deleteProp = (idQuestion: number) => {
        const updatedQuestions = page.questions.filter(question => question.id !== idQuestion);

        const updatedPage = { id: id, title: page.title, description: page.description, questions: updatedQuestions };
        dispatch(updatePageAndSync(updatedPage, id, surveyId!!));
    }

    const duplicateProp = (idQuestion: number) => {
        const question = page.questions.find(question => question.id === idQuestion);
        const sortedQuestions = page.questions.map(question => question.id).sort((a, b) => a - b);
        const id = sortedQuestions[sortedQuestions.length - 1] > 0 ? sortedQuestions[sortedQuestions.length - 1] + 1 : 1;
        if (!question) return;

        const updatedQuestions = [...page.questions, { ...question, id: id + 1 }];

        const updatedPage: IPages = { id: id, title: page.title, description: page.description, questions: updatedQuestions };
        dispatch(updatePageAndSync(updatedPage, id, surveyId!!));
    }


    const updateProp = async (question: IQuestion) => {
        dispatch(setQuestionId(question.id));
        if (question.region) {
            const questionCountry: IQuestion = { title: t('admin.survey.question.country'), name: 'country', type: 'select', required: true, options: await getAllCountries(), id: question.id };
            const questionStates: IQuestion = { title: t('admin.survey.question.state'), name: 'state', type: 'select', required: true, options: [], id: question.id + 1, dependsOn: 'country' };
            const questionCities: IQuestion = { title: t('admin.survey.question.city'), name: 'city', type: 'select', required: true, options: [], id: question.id + 2, dependsOn: 'state' };
            const updatedQuestions = page.questions.filter(q => q.id !== question.id);
            updatedQuestions.push(questionCountry, questionStates, questionCities);
            dispatch(updatePageAndSync({ id: id, title: page.title, description: page.description, questions: updatedQuestions }, id, surveyId!!));
        } else {
            const updatedQuestions = page.questions.map(q => q.id === question.id ? question : q);
            const updatedPage: IPages = { id: id, title: page.title, description: page.description, questions: updatedQuestions };
            dispatch(updatePageAndSync(updatedPage, id, surveyId!!));
        }
    }

    const syncSurvey = (question: IQuestion) => {
        const updatedQuestions = page.questions.map(q => q.id === question.id ? question : q);
        dispatch(setQuestionId(question.id));
        const updatedPage: IPages = { id: id, title: page.title, description: page.description, questions: updatedQuestions };
        dispatch(updatePageAndSync(updatedPage, id, surveyId!!));
    }

    const syncTitle = () => {
        const updatedPage: IPages = { ...page };
        return dispatch(updatePageAndSync(updatedPage, id, surveyId!!));
    }

    useEffect(() => {
    }, [dispatch, page]);

    return (
        <section className="p-20 flex flex-col gap-6">
            <div className="flex flex-col gap-3 w-full">
                <input type="text" value={page.title} className="w-2/3 px-3 py-1 outline-none rounded-lg border-2" placeholder={`Title ${id}`} onBlur={syncTitle}
                    onChange={(e) => updatePageProps(e.target.value, 'title')} />
                <input type="text" value={page.description} className="w-2/3 px-3 py-1 focus:outline-1 focus:outline-zinc-400  rounded-lg border-2" onBlur={syncTitle}
                    onChange={(e) => updatePageProps(e.target.value, 'description')} />
            </div>
            {page.questions.map((question, index) => (
                <Question key={index} idPage={id} question={question} deleteProp={deleteProp} questions={page.questions} duplicateProp={duplicateProp} updateProp={updateProp} syncSurvey={syncSurvey} />
            ))}
            <Button className="w-1/6 border-2 rounded-3xl" variant="tertiary" onClick={handleAddQuestion}>+</Button>
        </section>
    )
}