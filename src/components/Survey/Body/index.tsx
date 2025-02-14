
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    IPages,
    IQuestion,
    ISurvey,
    ISurveyDocument,
} from "../../../../models/surveyModel";
import QuestionBody from "./Question";
import { t } from "i18next";
import { Control, FormProvider, useForm, UseFormWatch } from "react-hook-form";
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

export const createSurveySchema = (survey: ISurvey) => {
    const schema = z.object(
        survey.pages.reduce((acc, page) => {
            page.questions.forEach((question) => {
                let fieldSchema: z.ZodTypeAny;

                switch (question.type) {
                    case 'text':
                    case 'textarea':
                        fieldSchema = z.string().optional();
                        break;
                    case 'radio':
                        fieldSchema = z.string().optional();
                        break;
                    case 'checkbox':
                        fieldSchema = z.array(z.string()).optional();
                        break;
                    case 'table':
                        fieldSchema = z.object(
                            question.rows!.reduce((acc, row) => {
                                acc[row.id] = z.array(z.string()).min(1, `Selecione pelo menos uma opção na pergunta ${question.id}, linha ${row.id}`);
                                return acc;
                            }, {} as Record<string, z.ZodTypeAny>)
                        ).optional();
                        break;
                    case 'select':
                    case 'dropdown':
                        fieldSchema = z.string().optional();
                        break;
                    default:
                        fieldSchema = z.any();
                }

                if (!question.dependsOn && question.required) {
                    switch (question.type) {
                        case 'text':
                        case 'textarea':
                            fieldSchema = fieldSchema.refine(val => !!val && val.trim() !== '', {
                                message: `Pergunta ${question.id} é obrigatória`,
                            });
                            break;
                        case 'radio':
                            fieldSchema = fieldSchema.refine(val => !!val, {
                                message: `Selecione uma opção na pergunta ${question.id}`,
                            });
                            break;
                        case 'checkbox':
                            fieldSchema = fieldSchema.refine(val => !!val && val.length > 0, {
                                message: `Selecione pelo menos uma opção na pergunta ${question.id}`,
                            });
                            break;
                    }
                }

                if (question.type === "checkbox" || question.type === "radio") {
                    fieldSchema = fieldSchema.refine((val) => {
                        if (Array.isArray(val)) {
                            return !val.includes('other') || val.some(v => v.startsWith('other:') && v.length > 7);
                        }
                        return val !== 'other' || (val.startsWith('other:') && val.length > 7);
                    }, "Preencha o campo 'Outro'");
                }



                acc[question.name] = fieldSchema;
            });

            return acc;
        }, {} as Record<string, z.ZodTypeAny>)
    ).superRefine((data, ctx) => {
        survey.pages.flatMap(page => page.questions).forEach(question => {
            if (!question.dependsOn) return;
            if (data[question.dependsOn] !== question.dependsOnValue) return;

            const val = data[question.name];

            if (question.required) {

                switch (question.type) {
                    case 'text':
                    case 'textarea':
                    case 'select':
                    case 'dropdown':
                        if (!val || val.trim() === '') {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                path: [question.name],
                                message: `Pergunta ${question.id} é obrigatória`,
                            });
                        }
                        break;
                    case 'radio':
                        if (!val) {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                path: [question.name],
                                message: `Selecione uma opção na pergunta ${question.id}`,
                            });
                        }
                        break;
                    case 'checkbox':
                        if (!Array.isArray(val) || val.length === 0) {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                path: [question.name],
                                message: `Selecione pelo menos uma opção na pergunta ${question.id}`,
                            });
                        }
                        break;
                }
            }
        });
    });

    return schema;
};



export default function SurveyBody({ survey, responses }: Props) {

    const [showSidebar, setShowSidebar] = useState<boolean>(true);
    const [showProgress, setShowProgress] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const { data: session } = useSession();

    const createSurveyForm = useForm<Record<string, any>>({
        defaultValues: responses,
        mode: "onBlur",
        resolver: zodResolver(createSurveySchema(survey)),
    });


    const {
        handleSubmit,
        formState: { errors },
        watch,
        control
    } = createSurveyForm;


    const scrollToQuestion = (questionId: number) => {
        const questionElement = questionRefs.current[questionId - 1];
        if (questionElement) {
            questionElement.scrollIntoView({ behavior: "smooth" });
        }
    };

    const submitSurvey = async (data: any) => {

        const surveyResult: ISurveyResult = {
            currentPage: currentPage,
            surveyId: survey._id as string,
            userId: session?.user._id as string,
            surveyResult: data,
        }
        try {
            toast.success('Questionário enviado com sucesso!');
            await api.post("/user/survey/submit", surveyResult);

        } catch (error) {
            console.error(error);
            toast.error('Error submitting survey');
        }
    }

    const handlePageChange = () => {
        setCurrentPage(p => p + 1);
        window.scrollTo(0, 0);
    }

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const firstError = Object.keys(errors)[0];
            const questionId = survey.pages.flatMap(page => page.questions).map(q => q.name).map(q => q).indexOf(firstError);
            scrollToQuestion(questionId!);
        }
    }, [errors]);

    useEffect(() => {
        survey.pages.map((page, index) => {
            if (index === 0 && page.id !== currentPage) {
                setCurrentPage(page.id);
            }
        });

        setLoaded(true);

        console.log(errors);
    }, [errors]);


    return loaded && (
        <main className="w-full flex">
            <ButtonGroup className="fixed right-5 bottom-5">
                <Button variant="bordered" className="bg-zinc-900 text-white" onClick={() => setShowSidebar(!showSidebar)}><RiSideBarFill size={20} /></Button>
                <Button variant="bordered" className="bg-zinc-600 text-white" onClick={() => setShowProgress(!showProgress)}></Button>
            </ButtonGroup>
            <Sidebar pages={survey.pages} currentPage={currentPage} setCurrentPage={setCurrentPage} show={showSidebar} />
            <section className="p-20 w-full flex items-center flex-col gap-10">
                <header className="flex flex-col p-10 gap-4 w-4/6 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                    <h1 className="font-bold text-lg px-14 dark:text-white">{survey.title}</h1>
                    <p className="px-14 dark:text-white">{survey.pages.find(page => page.id === currentPage)!.description}</p>
                </header>
                <FormProvider {...createSurveyForm}>
                    <form onSubmit={handleSubmit(submitSurvey)} className="w-1/2 flex flex-col gap-3">
                        {survey.pages && survey.pages.find(page => page.id === currentPage)!.questions.map((question, index) => {

                            return (
                                <div ref={(el) => { questionRefs.current[index] = el; }}
                                    key={index}
                                >
                                    <QuestionBody id={question.id.toString()} question={question} />
                                </div>
                            )
                        })}
                        <Button type="submit" className={`bg-zinc-900 text-white w-1/2 self-end ${currentPage !== survey.pages.length ? 'hidden' : ''}`}>Enviar</Button>
                        <Button onClick={() => {
                            handlePageChange();
                            window.scrollTo(0, 0);
                        }} className={`bg-zinc-900 self-end mt-5 text-white w-1/2 ${currentPage === survey.pages.length ? 'hidden' : ''}`}>Próxima página</Button>
                    </form>
                </FormProvider>
            </section>
            <QuestionsProgress control={control} show={showProgress} scroll={scrollToQuestion} watch={watch} questions={survey.pages.find(page => page.id === currentPage)!.questions} />
        </main>
    )
}

interface IQuestionsProgress {
    questions: IQuestion[];
    scroll: (questionId: number) => void;
    show: boolean;
    watch: UseFormWatch<Record<string, any>>;
    control: Control<Record<string, any>>;
}

const QuestionsProgress = ({ questions, scroll, show, watch }: IQuestionsProgress) => {
    const [visibleQuestions, setVisibleQuestions] = useState<number[]>([]);

    // Função para verificar dependências de questões
    const checkDependencies = (question: IQuestion, answeredValues: Record<string, any>) => {
        if (!question.dependsOn || !question.dependsOnValue) return true;

        const dependentValue = answeredValues[question.dependsOn];
        return Array.isArray(dependentValue)
            ? dependentValue.includes(question.dependsOnValue)
            : dependentValue === question.dependsOnValue;
    };

    // Verifica se uma questão está completamente respondida
    const isQuestionAnswered = (question: IQuestion, currentValue: any) => {
        if (question.type === 'table') {
            return question.rows?.every(row =>
                currentValue?.[row.id] !== undefined &&
                currentValue[row.id] !== null &&
                currentValue[row.id] !== ''
            );
        }
        return currentValue !== undefined && currentValue !== null && currentValue !== '';
    };

    // Atualiza a lista de questões visíveis
    const updateVisibleQuestions = useCallback(() => {
        const answeredValues = questions.reduce((acc, question) => ({
            ...acc,
            [question.name]: watch(question.name as keyof Object)
        }), {});

        const filteredQuestions = questions
            .filter(question => checkDependencies(question, answeredValues))
            .map(q => q.id);

        setVisibleQuestions(filteredQuestions);
    }, [questions, watch]);

    // Efeitos para atualizar quando valores mudam
    useEffect(() => {
        updateVisibleQuestions();
        const subscription = watch(() => updateVisibleQuestions());
        return () => subscription.unsubscribe();
    }, [updateVisibleQuestions, watch]);

    // Componente de item de progresso individual
    const ProgressItem = ({ question }: { question: IQuestion }) => {
        const currentValue = watch(question.name as keyof Object);
        const answered = isQuestionAnswered(question, currentValue);

        return (
            <li
                onClick={() => scroll(question.id)}
                className={`cursor-pointer hover:bg-zinc-100 w-10 h-10 p-2 flex items-center justify-center rounded-lg transition-colors
                    ${answered ? 'bg-lime-600 text-white' :
                        question.required ? 'bg-slate-200' : 'bg-slate-50'}`}
            >
                {question.type === 'table' ? `T${question.id}` : `Q${question.id}`}
            </li>
        );
    };

    // Agrupa questões em linhas de 3 itens
    const chunkedQuestions = useMemo(() => {
        const chunk = (arr: number[], size: number) =>
            Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
                arr.slice(i * size, i * size + size)
            );
        return chunk(visibleQuestions, 3);
    }, [visibleQuestions]);

    return (
        <aside className={`fixed right-0 bg-gradient-black px-10 py-5 max-w-[420px] rounded-lg
            transform transition-all duration-1000 ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>

            <div className="text-white font-bold flex justify-between mb-5">
                <h3>Progresso</h3>
            </div>

            <ul className="flex flex-col gap-4 w-full items-center">
                {chunkedQuestions.map((row, rowIndex) => (
                    <ul key={rowIndex} className="flex gap-4">
                        {row.map(questionId => {
                            const question = questions.find(q => q.id === questionId);
                            return question ? <ProgressItem key={question.id} question={question} /> : null;
                        })}
                    </ul>
                ))}
            </ul>
        </aside>
    );
};



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