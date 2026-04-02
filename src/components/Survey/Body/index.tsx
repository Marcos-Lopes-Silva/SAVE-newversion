
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
                        const isOther = (v: string) => 
                            ["outro", "outra", "outro:", "outros", "other"].includes(v.toLowerCase());

                        if (Array.isArray(val)) {
                            const hasOther = val.some(v => isOther(v) || v.toLowerCase().startsWith("outro:"));
                            if (!hasOther) return true;
                            return val.some(v => v.toLowerCase().startsWith('outro:') && v.split(':')[1]?.trim().length > 0);
                        }
                        
                        if (typeof val === 'string') {
                            if (!isOther(val) && !val.toLowerCase().startsWith("outro:")) return true;
                            return val.toLowerCase().startsWith('outro:') && val.split(':')[1]?.trim().length > 0;
                        }
                        
                        return true;
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
        const questionElement = questionRefs.current[questionId];
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
            let questionIdWithError: number | null = null;
            console.log(errors);
            survey.pages.forEach((page) => {
                page.questions.forEach((question) => {
                    if (question.name === firstError) {
                        pageIdWithError = page.id;
                        questionIdWithError = question.id;
                    }
                });
            });

            if (pageIdWithError !== null && questionIdWithError !== null) {

                setCurrentPage(pageIdWithError);

                setTimeout(() => {
                    scrollToQuestion(questionIdWithError!);
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
        <main className="w-full min-h-screen flex flex-col items-center bg-zinc-50 dark:bg-zinc-950">
            {/* HEADER MODERNO */}
            <header className="w-full sticky top-0 z-50 backdrop-blur bg-white/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-3xl mx-auto px-6 py-4 flex flex-col gap-3">
                    <h1 className="font-bold text-lg text-zinc-800 dark:text-white">
                        {survey.title}
                    </h1>

                    {/* PROGRESS BAR */}
                    <ProgressBar watch={watch} questions={survey.pages.flatMap(p => p.questions)} />
                </div>
            </header>

            {/* STEPPER */}
            <div className="w-full max-w-3xl px-6 mt-6">
                <Stepper pages={survey.pages} currentPage={currentPage} />
            </div>

            {/* FORM */}
            <section className="w-full flex justify-center px-4 mt-6">
                <div className="w-full max-w-2xl flex flex-col gap-6">

                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {survey.pages.find(p => p.id === currentPage)?.description}
                    </div>

                    <FormProvider {...createSurveyForm}>
                        <form
                            onSubmit={handleSubmit(submitSurvey)}
                            className="flex flex-col gap-6"
                        >
                            {survey.pages
                                .find(p => p.id === currentPage)!
                                .questions.map((question) => {

                                    const value = watch(question.name as any);
                                    const answered =
                                        value !== undefined &&
                                        value !== null &&
                                        value !== '' &&
                                        !(Array.isArray(value) && value.length === 0);

                                    return (
                                        <div
                                            key={question.id}
                                            ref={(el: any) => (questionRefs.current[question.id] = el)}
                                            className={`p-6 rounded-2xl border transition-all duration-300
                      bg-white dark:bg-zinc-900
                      ${answered
                                                    ? "border-lime-500 ring-1 ring-lime-500/30"
                                                    : "border-zinc-200 dark:border-zinc-800"}
                      hover:shadow-md`}
                                        >
                                            <QuestionBody
                                                id={question.id.toString()}
                                                question={question}
                                            />
                                        </div>
                                    );
                                })}

                            {/* BOTÕES */}
                            <div className="flex justify-between mt-4">
                                {currentPage > 1 && (
                                    <Button
                                        variant="bordered"
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        Voltar
                                    </Button>
                                )}

                                {currentPage !== survey.pages.length ? (
                                    <Button
                                        onClick={handlePageChange}
                                        className="ml-auto bg-gradient-to-r from-lime-500 to-emerald-600 text-white font-semibold"
                                    >
                                        Próxima →
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        className="ml-auto bg-gradient-to-r from-lime-500 to-emerald-600 text-white font-semibold"
                                    >
                                        Enviar
                                    </Button>
                                )}
                            </div>
                        </form>
                    </FormProvider>
                </div>
            </section>
            <Sidebar show={showSidebar} pages={survey.pages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <QuestionsProgress control={control} show={showProgress} scroll={scrollToQuestion} watch={watch} questions={survey.pages.find(page => page.id === currentPage)!.questions} />
            <Modal isOpen={isOpen} placement={'auto'} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 dark:text-white">Verificação de Envio</ModalHeader>
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
                            <ModalHeader className="flex flex-col gap-1 dark:text-white">Mensagem de Finalização</ModalHeader>
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

const Stepper = ({ pages, currentPage }: any) => {
    return (
        <div className="flex items-center justify-center gap-2">
            {pages.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                    <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
              ${p.id <= currentPage
                                ? "bg-lime-600 text-white"
                                : "bg-zinc-300 text-zinc-600"}`}
                    >
                        {p.id}
                    </div>

                    {i < pages.length - 1 && (
                        <div className="w-8 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                    )}
                </div>
            ))}
        </div>
    );
};

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
        if (!currentValue) return false;

        if (question.type === 'table' && question.rows) {
            return question.rows.every(row => currentValue[row.text] && currentValue[row.text].length > 0);
        }

        const isOther = (v: string) => 
            ["outro", "outra", "outro:", "outros", "other"].includes(v.toLowerCase());

        if (question.type === 'checkbox') {
            if (!Array.isArray(currentValue) || currentValue.length === 0) return false;
            const hasOther = currentValue.some(v => isOther(v) || v.toLowerCase().startsWith("outro:"));
            if (hasOther) {
                return currentValue.some(v => v.toLowerCase().startsWith('outro:') && v.split(':')[1]?.trim().length > 0);
            }
            return true;
        }

        if (question.type === 'radio') {
            if (isOther(currentValue)) return false;
            if (currentValue.toLowerCase().startsWith("outro:")) {
                return currentValue.split(':')[1]?.trim().length > 0;
            }
            return true;
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
        <aside className={`fixed right-0 top-44 bg-gradient-black px-10 py-5 max-w-[420px] rounded-lg
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
        <aside className={`${show ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'} max-h-[400px] sm:h-full transform transition-all left-0 top-44 duration-700 z-50 sm:w-1/6 fixed bg-gradient-black p-10 pb-36 rounded-r-2xl`}>
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

const ProgressBar = ({ watch, questions }: any) => {
    const values = watch();

    const checkDependencies = (question: IQuestion, answeredValues: Record<string, any>) => {
        if (!question.dependsOn || !question.dependsOnValue) return true;

        const dependentValue = answeredValues[question.dependsOn];

        return Array.isArray(dependentValue)
            ? dependentValue.includes(question.dependsOnValue)
            : dependentValue === question.dependsOnValue ? true : question.dependsOnValue.includes("Outro") && typeof dependentValue === "string" ? dependentValue.includes("Outro") : false;
    };

    const isQuestionAnswered = (question: IQuestion, currentValue: any) => {
        if (!currentValue) return false;

        if (question.type === 'table' && question.rows) {
            return question.rows.every(row => currentValue[row.text] && currentValue[row.text].length > 0);
        }

        const isOther = (v: string) => 
            ["outro", "outra", "outro:", "outros", "other"].includes(v.toLowerCase());

        if (question.type === 'checkbox') {
            if (!Array.isArray(currentValue) || currentValue.length === 0) return false;
            const hasOther = currentValue.some(v => isOther(v) || v.toLowerCase().startsWith("outro:"));
            if (hasOther) {
                return currentValue.some(v => v.toLowerCase().startsWith('outro:') && v.split(':')[1]?.trim().length > 0);
            }
            return true;
        }

        if (question.type === 'radio') {
            if (isOther(currentValue)) return false;
            if (currentValue.toLowerCase().startsWith("outro:")) {
                return currentValue.split(':')[1]?.trim().length > 0;
            }
            return true;
        }

        return currentValue !== undefined && currentValue !== null && currentValue !== '' && currentValue !== false;
    };

    const visibleQuestions = questions.filter((q: any) => checkDependencies(q, values));
    const total = visibleQuestions.length;

    const answered = visibleQuestions.filter((q: any) => {
        const v = values[q.name];
        return isQuestionAnswered(q, v);
    }).length;

    const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs mb-1 text-zinc-500">
                <span>Progresso</span>
                <span>{progress}%</span>
            </div>

            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-lime-500 to-emerald-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};