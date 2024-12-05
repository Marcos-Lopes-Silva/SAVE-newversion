import { useEffect, useRef, useState } from "react";
import {
  IPages,
  IQuestion,
  ISurveyDocument,
} from "../../../../models/surveyModel";
import QuestionBody from "./Question";
import { t } from "i18next";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, ButtonGroup } from "@nextui-org/react";
import { RiSideBarFill } from "react-icons/ri";
import { api } from "@/lib/api";
import { toast } from "react-toastify";
import { ISurveyResult } from "../../../../models/surveyResults";
import { useSession } from "next-auth/react";
interface Props {
    survey: ISurveyDocument;
    responses: Object;
}


const generateSurveySchema = (survey: ISurveyDocument) => {
    const schemaShape: Record<string, any> = {};

    survey.pages.forEach((page) => {
        page.questions.forEach((question) => {
            switch (question.type) {
                case "text":
                    schemaShape[question.name] = question.required
                        ? z.string().min(1, `${question.title} é obrigatório`)
                        : z.string().optional();
                    break;
                case "number":
                    schemaShape[question.name] = question.required
                        ? z.number({ invalid_type_error: `${question.title} deve ser um número` })
                        : z.number().optional();
                    break;

                case "checkbox":
                    schemaShape[question.name] = question.required
                        ? z.array(z.string()).nonempty(`${question.title} é obrigatório`)
                        : z.array(z.string()).optional();
                    break;

                case "dropdown":
                    schemaShape[question.name] = question.required
                        ? z.string().min(1, `${question.title} é obrigatório`)
                        : z.string().optional();
                    break;

                default:
                    schemaShape[question.name] = z.any().optional();
                    break;
            }
        });
    });
    return z.object(schemaShape);
};


export default function SurveyBody({ survey, responses }: Props) {

    const [showSidebar, setShowSidebar] = useState<boolean>(true);
    const [showProgress, setShowProgress] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const { data: session } = useSession();

    const surveySchema = generateSurveySchema(survey);

    const scrollToQuestion = (questionId: number) => {
        const questionElement = questionRefs.current[questionId - 1]; // Assumindo que questionId começa em 1
        if (questionElement) {
            questionElement.scrollIntoView({ behavior: "smooth" });
        }
    };

    const submitSurvey = async (data: any) => {
        console.log("submitting survey", data);

        const surveyResult: ISurveyResult = {
            currentPage: currentPage,
            surveyId: survey._id as string,
            userId: session?.user._id as string,
            surveyResult: data,
        }
        try {
            toast.success('Questionário enviado com sucesso!');
            await api.post(`/user/survey/submit`, surveyResult);

        } catch (error) {
            console.error(error);
            toast.error('Error submitting survey');
        }
    }


    const createSurveyForm = useForm({
        defaultValues: responses,
        // resolver: zodResolver(surveySchema),
    });

    const {
        handleSubmit,
        formState: { errors },
    } = createSurveyForm;

    useEffect(() => {
        survey.pages.map((page, index) => {
            if (index === 0 && page.id !== currentPage) {
                setCurrentPage(page.id);
            }
        });

        setLoaded(true);
    }, [errors])

    return loaded && (
        <main className="w-full flex">
            <ButtonGroup className="fixed right-5 bottom-5">
                <Button variant="bordered" className="bg-zinc-900 text-white" onClick={() => setShowSidebar(!showSidebar)}><RiSideBarFill size={20} /></Button>
                <Button variant="bordered" className="bg-zinc-600 text-white" onClick={() => setShowProgress(!showProgress)}></Button>
            </ButtonGroup>
            <Sidebar pages={survey.pages} currentPage={currentPage} setCurrentPage={setCurrentPage} show={showSidebar} />
            <section className="p-20 w-full flex items-center flex-col gap-10">
                <header className="flex flex-col p-10 gap-4 w-4/6 bg-zinc-100 rounded-2xl">
                    <h1 className="font-bold text-lg px-14">{survey.title}</h1>
                    <p className="px-14">{survey.description}</p>
                </header>
                <FormProvider {...createSurveyForm}>
                    <form onSubmit={handleSubmit(submitSurvey)} className="w-1/2 flex flex-col gap-3">
                        {survey.pages && survey.pages.find(page => page.id === currentPage)!.questions.map((question, index) => (
                            <div ref={(el) => { questionRefs.current[index] = el; }}
                                key={index}
                            >
                                <QuestionBody id={question.id.toString()} question={question} />
                            </div>
                        ))}
                        <Button type="submit" className={`bg-zinc-900 text-white w-1/2 self-end ${currentPage !== survey.pages.length ? 'hidden' : ''}`}>Enviar</Button>
                        <Button onClick={() => setCurrentPage(currentPage + 1)} className={`bg-zinc-900 self-end mt-5 text-white w-1/2 ${currentPage === survey.pages.length ? 'hidden' : ''}`}>Próxima página</Button>
                    </form>
                </FormProvider>
            </section>
            <QuestionsProgress show={showProgress} scroll={scrollToQuestion} questions={survey.pages[currentPage - 1].questions} />
        </main>
    )
}

interface IQuestionsProgress {
    questions: IQuestion[];
    scroll: (questionId: number) => void;
    show: boolean;
}

const QuestionsProgress = ({ questions, scroll, show }: IQuestionsProgress) => {

    const chunkItems = (arr: IQuestion[], chunkSize: number) => {
        const result = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            result.push(arr.slice(i, i + chunkSize));
        }
        return result;
    };

    const rows = chunkItems(questions, 3);


    return (
        <aside className={`${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} transform transition-all duration-1000 fixed right-0 bg-gradient-black px-10 flex gap-2 flex-col py-5 max-w-[420px] rounded-lg`}>
            <div className="text-white font-bold flex-row-reverse flex justify-between">
                <h3>Progress</h3>
            </div>
            <ul className="flex flex-col gap-4 w-full items-center py-5">
                {rows.map((row, index) => (
                    <li key={index}>
                        <ul className="flex gap-4">
                            {row.map((question, index) => (
                                <li key={index} onClick={() => scroll(question.id)} className={`cursor-pointer hover:bg-zinc-100 max-w-14 p-2 flex items-center justify-center  rounded-lg bg-slate-50 ${question.required ? 'bg-gray-200' : 'bg-slate-50'}`}>{`Q${question.id}`}</li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </aside>
    )
}


interface ISidebar {
    currentPage: number,
    setCurrentPage: (page: number) => void,
    pages: IPages[],
    show: boolean;
}

const Sidebar = ({ currentPage, setCurrentPage, pages, show }: ISidebar) => {
    useEffect(() => {
    }, [currentPage])

    return (
        <aside className={`${show ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}  transform transition-all duration-700 w-1/6 fixed bg-gradient-black p-10 pb-36 rounded-r-2xl`}>
            <div className="flex justify-between py-5 h-auto">
                <h2 className="font-bold text-lg items-center text-white">{t('user.survey.sidebar.title')}</h2>
            </div>
            <ul className="flex flex-col gap-5 mt-5">
                {pages.map((page, index) => (
                    <li className={`${page.id === currentPage ? 'bg-gradient-gray text-white' : 'hover:bg-zinc-700 text-white'} px-8 py-4 rounded-lg cursor-pointer`} onClick={() => setCurrentPage(page.id)} key={index}>
                        <span className="text-sm font-bold cursor-pointer" >{`${page.id} - ${page.title}`}</span>
                    </li>
                ))}
            </ul>
        </aside>
    )
}
