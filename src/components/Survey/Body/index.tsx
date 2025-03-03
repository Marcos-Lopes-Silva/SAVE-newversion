
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
import { Button, ButtonGroup, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { RiSideBarFill } from "react-icons/ri";
import { api } from "@/lib/api";
import { toast } from "react-toastify";
import { ISurveyResult } from "../../../../models/surveyResults";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

interface Props {
    survey: ISurveyDocument;
    responses: Object;
}

const createSurveySchema = (survey: ISurvey) => {
    const schema = z.object(
        survey.pages.reduce((acc, page) => {
            page.questions.forEach((question) => {
                let fieldSchema: z.ZodTypeAny;

                switch (question.type) {
                    case 'number':
                    case 'text':
                    case 'textarea':
                        fieldSchema = z.string({ invalid_type_error: "Digite aqui" }).optional();
                        break;
                    case 'radio':
                        fieldSchema = z.string().optional().nullable();
                        break;
                    case 'checkbox':
                        fieldSchema = z.array(z.string({ invalid_type_error: "Selecione no mínimo uma opção." })).optional().nullable();
                        break;
                    case 'table':
                        fieldSchema = z.object(
                            question.rows!.reduce((rowAcc, row) => {
                                rowAcc[row.text] = z
                                    .string({ required_error: `Selecione uma opção para ${row.text}` })
                                    .min(1, `Selecione uma opção para ${row.text}`);
                                return rowAcc;
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
                        case 'number':
                        case 'text':
                        case 'textarea':
                            fieldSchema = fieldSchema.refine(val => !!val && val.trim() !== '', {
                                message: `A pergunta ${question.id} é obrigatória`,
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
                        case 'table':
                            fieldSchema = fieldSchema.refine(
                                val => val && Object.values(val).every(v => !!v),
                                { message: `Todas as linhas da pergunta ${question.id} são obrigatórias.` }
                            );
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
                    case 'table':
                        if (!val || Object.values(val).every(v => !!v)) {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                path: [question.name],
                                message: `Preencha todas as opções na pergunta ${question.id}`,
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
    const [allowedToSend, setAllowedToSend] = useState<boolean>(false);
    const { onOpen, onOpenChange, isOpen } = useDisclosure();
    const router = useRouter();
    const { onOpen: onOpen2, onOpenChange: onOpenChange2, isOpen: isOpen2 } = useDisclosure();
    const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const { data: session } = useSession();

    const createSurveyForm = useForm<Record<string, any>>({
        defaultValues: responses,
        mode: "all",
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
            const elementRect = questionElement.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.scrollY;
            const middleOfScreen = window.innerHeight / 2;

            window.scrollTo({
                top: absoluteElementTop - middleOfScreen + (elementRect.height / 2),
                behavior: "smooth",
            });
        }
    };

    const submitSurvey = async (data: any) => {

        if (!allowedToSend) {
            onOpen();
            return;
        }

        const surveyResult: ISurveyResult = {
            currentPage: currentPage,
            surveyId: survey._id as string,
            userId: session?.user._id as string,
            surveyResult: data,
        }
        try {
            await api.post("/user/survey/submit", surveyResult);
            toast.success('Questionário enviado com sucesso!');
            onOpen2();

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

            let pageIdWithError: number | null = null;
            let questionIndexWithError: number | null = null;
            console.log(errors);
            survey.pages.forEach((page) => {
                page.questions.forEach((question, index) => {
                    if (question.name === firstError) {
                        pageIdWithError = page.id;
                        questionIndexWithError = index;
                    }
                });
            });

            if (pageIdWithError !== null && questionIndexWithError !== null) {

                setCurrentPage(pageIdWithError);

                setTimeout(() => {
                    scrollToQuestion(questionIndexWithError!);
                }, 100);
            }

            toast.error('Por favor, verifique se você respondeu todas as perguntas.');
        }
    }, [errors]);

    useEffect(() => {
        survey.pages.map((page, index) => {
            if (index === 0 && page.id !== currentPage) {
                setCurrentPage(page.id);
            }
        });

        setLoaded(true);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth <= 768;
            setShowSidebar(!isMobile);
            setShowProgress(!isMobile);
        };

        if (typeof window !== "undefined") {
            handleResize();
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    const handleAllowedToSend = () => {
        setAllowedToSend(true);
        onOpenChange();
        handleSubmit(submitSurvey)();
    }

    const handleInitialPage = () => {
        onOpenChange2();
        router.push('/user/dashboard');
    }

    return loaded && (
        <main className="w-full flex">
            <ButtonGroup className="fixed right-5 bottom-5">
                <Button variant="bordered" className="bg-zinc-900 text-white" onClick={() => setShowSidebar(!showSidebar)}><RiSideBarFill size={20} /></Button>
                <Button variant="bordered" className="bg-zinc-600 text-white" onClick={() => setShowProgress(!showProgress)}></Button>
            </ButtonGroup>
            <Sidebar pages={survey.pages} currentPage={currentPage} setCurrentPage={setCurrentPage} show={showSidebar} />
            <section className="sm:p-20 w-full px-3 flex items-center flex-col gap-10">
                <header className="flex flex-col p-10 gap-4 sm:w-4/6 w-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                    <h1 className="font-bold text-medium sm:text-lg sm:px-14 dark:text-white">{survey.title}</h1>
                    <p className="sm:px-14 dark:text-white">{survey.pages.find(page => page.id === currentPage)!.description}</p>
                </header>
                <FormProvider {...createSurveyForm}>
                    <form onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                        }
                    }} onSubmit={handleSubmit(submitSurvey)} className="sm:w-1/2 flex flex-col gap-3">
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
            <Modal isOpen={isOpen} placement={'auto'} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Verificação de Envio</ModalHeader>
                            <ModalBody>
                                <p className="sm:text-lg text-medium dark:text-white">Tem certeza que deseja enviar o questionário?</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Fechar
                                </Button>
                                <Button className="bg-zinc-900 text-white" onPress={handleAllowedToSend}>
                                    Enviar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <Modal isOpen={isOpen2} placement={'auto'} onOpenChange={onOpenChange2}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Mensagem de Finalização</ModalHeader>
                            <ModalBody>
                                <p className="sm:text-lg text-medium dark:text-white">{survey.completeMessage ? survey.completeMessage : "Obrigado por responder o questionário! Sua resposta foi enviada com sucesso."}</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button className="bg-zinc-900 text-white" onPress={handleInitialPage}>
                                    Voltar a Página Inicial
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
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

    const checkDependencies = (question: IQuestion, answeredValues: Record<string, any>) => {
        if (!question.dependsOn || !question.dependsOnValue) return true;

        const dependentValue = answeredValues[question.dependsOn];

        return Array.isArray(dependentValue)
            ? dependentValue.includes(question.dependsOnValue)
            : dependentValue === question.dependsOnValue ? true : question.dependsOnValue.includes("Outro") && typeof dependentValue === "string" ? dependentValue.includes("Outro") : false;
    };

    const isQuestionAnswered = (question: IQuestion, currentValue: any) => {
        if (question.type === 'table' && question.rows) {
            return question.rows.every(row => currentValue[row.text] && currentValue[row.text].length > 0);
        }

        return currentValue !== undefined && currentValue !== null && currentValue !== '' && currentValue !== false;
    };

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

    useEffect(() => {
        updateVisibleQuestions();
        const subscription = watch(() => updateVisibleQuestions());
        return () => subscription.unsubscribe();
    }, [updateVisibleQuestions, watch]);

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
                {`Q${question.id}`}
            </li>
        );
    };

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
        <aside className={`${show ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'} max-h-[400px] sm:h-full transform transition-all duration-700 z-50 sm:w-1/6 fixed bg-gradient-black p-10 pb-36 rounded-r-2xl`}>
            <div className="flex justify-between py-5 h-auto">
                <h2 className="font-bold text-lg items-center text-white">{t('user.survey.sidebar.title')}</h2>
            </div>
            <ul className="flex flex-col gap-5 mt-5">
                {pages.map((page, index) => (
                    <li className={`${page.id === currentPage ? 'bg-gradient-gray text-white' : 'hover:bg-zinc-700 text-white'} px-8 py-4 rounded-lg cursor-pointer`}
                        onClick={() => {
                            setCurrentPage(page.id)
                            window.scrollTo(0, 0);
                        }} key={index}>
                        <span className="text-sm font-bold cursor-pointer" >{`${page.id} - ${page.title}`}</span>
                    </li>
                ))}
            </ul>
        </aside>
    )
}