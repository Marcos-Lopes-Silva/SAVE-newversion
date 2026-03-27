import Button from '@/components/layout/Button';
import { api } from '@/lib/api';
import { Accordion, AccordionItem, button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch, useDisclosure } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { CiUnlock } from 'react-icons/ci';
import { FaEye } from 'react-icons/fa';
import SurveyAnalytics, { ISurveyAnalytics } from '../../../../models/surveyAnalytics';
import { getSession, useSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { connectToMongoDB } from '@/lib/db';
import Survey, { ISurveyDocument } from '../../../../models/surveyModel';
import { toast } from 'react-toastify';
import Graphics from '@/components/Graphics';

export default function ShowData({ surveys }: { surveys: ISurveyDocument[] }) {
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [selectedChartTypes, setSelectedChartTypes] = useState<Record<string, string>>({});
    const [surveyAnalytics, setSurveyAnalytics] = useState<ISurveyAnalytics | null>(null);
    const [managerPreview, setManagerPreview] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { data: session } = useSession();
    const userId = session?.user?._id;

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const surveyId = surveys.find(s => s.author === userId)?._id;
                if (!surveyId) return;
                const response = await api.get<ISurveyAnalytics>(`/survey/${surveyId}/results`);
                setSurveyAnalytics(response);
            } catch (error) {
                console.error(error);
            }
        };
        fetchAnalytics();
    }, [surveys, userId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredAnalytics = {
        ...surveyAnalytics,
        pages: surveyAnalytics?.pages.map(page => ({
            ...page,
            questions: page.questions.filter(question => selectedQuestions.includes(question.name))
        })).filter(page => page.questions.length > 0)
    }

    useEffect(() => {
        console.log("selectedChartTypes atualizado:", selectedChartTypes);
    }, [selectedChartTypes]);

    const handleConfirm = async () => {
        try {
            const surveyId = surveys.find(s => s.author === userId)?._id;
            if (!surveyId) return;

            const updatedQuestions = surveyAnalytics?.pages.flatMap(page =>
                page.questions
                    .filter(q => ["checkbox", "radio", "table", "select"].includes(q.type))
                    .map(q => ({
                        name: q.name,
                        isPublic: selectedQuestions.includes(q.name),
                        chart: selectedChartTypes[q.name] || q.chart,
                    }))
            );

            console.log(updatedQuestions);

            await api.patch(`survey/${surveyId}/results`, { questions: updatedQuestions, hasPublic: true });

            toast.success('Gráficos disponibilizados com sucesso!', {
                position: 'top-right',
                autoClose: 4000,
            });

            onOpenChange();

        } catch (error) {
            console.error(error);
        }
    }

    if (surveyAnalytics === null) {
        return (
            <main>
                <header className="flex flex-col rounded-xl shadow-2xl bg-zinc-200 dark:bg-zinc-900 px-40 py-16">
                    <h1 className="mb-2 text-2xl font-medium dark:text-white">Disponibilizando Informações ao Público</h1>
                    <a className="mb-4 dark:text-white">Personalize a visualização dos dados que serão acessíveis ao público em geral.</a>
                    <div className="mb-2 rounded-2xl bg-zinc-600 dark:bg-zinc-700 w-24 h-3" />
                    <div className="ml-4 rounded-2xl bg-zinc-300 w-24 h-3" />
                </header>                <section>
                    <div className='text-center text-xl mb-4'>
                        <h1>Pronto para compartilhar? Selecione os gráficos que serão exibidos publicamente</h1>
                    </div>
                    <div className='px-56 py-6 text-center flex flex-col items-center'>
                        <h1>Sem questionário no momento</h1>
                    </div>
                </section>
            </main>
        );
    }

    if (managerPreview === true) {
        return (
            <main>
                <header className="flex flex-col rounded-xl shadow-2xl bg-zinc-200 dark:bg-zinc-900 px-40 py-16">
                    <h1 className="mb-2 text-2xl font-medium dark:text-white">Preview</h1>
                    <a className="mb-4 dark:text-white">Visualize os gráficos que serão disponibilizados ao público.</a>
                    <div className="mb-2 rounded-2xl bg-zinc-600 dark:bg-zinc-700 w-24 h-3" />
                    <div className="ml-4 rounded-2xl bg-zinc-300 w-24 h-3" />
                </header>                <section>
                    <Graphics
                        data={filteredAnalytics}
                        selectedPageIndex={0}
                        lastUpdate={true}
                        download={false}
                        modal={true}
                        selectCharts={true}
                        selectedChartTypes={selectedChartTypes}
                        setSelectedChartTypes={setSelectedChartTypes}
                    />
                </section>
            </main>
        );
    }

    return (
        <main className="flex flex-col px-40 py-28">
            {/* HEADER PADRÃO */}
            <header className="flex flex-col rounded-xl shadow-2xl bg-zinc-200 dark:bg-zinc-900 px-40 py-16">
                <h1 className="mb-2 text-2xl font-medium dark:text-white">
                    Disponibilizando Informações ao Público
                </h1>
                <p className="mb-4 dark:text-white">
                    Personalize a visualização dos dados que serão acessíveis ao público em geral.
                </p>
                <div className="mb-2 rounded-2xl bg-zinc-600 dark:bg-zinc-700 w-24 h-3" />
                <div className="ml-4 rounded-2xl bg-zinc-300 w-24 h-3" />
            </header>

            {/* CONTEÚDO */}
            <section className="flex py-20 w-full items-end flex-col px-24">
                <div className="w-full text-center text-xl mb-8">
                    <h1>
                        Pronto para compartilhar? Selecione os gráficos que serão exibidos publicamente
                    </h1>
                </div>

                <div className="w-full flex flex-col items-center gap-6">
                    {surveys.length === 0 ? (
                        <div className="text-zinc-500 dark:text-zinc-300">
                            Sem questionário no momento
                        </div>
                    ) : (
                        surveys.map((survey) => (
                            <div
                                key={survey._id as string}
                                className="w-11/12 bg-white dark:bg-zinc-800 shadow-2xl rounded-3xl p-9"
                            >
                                <Accordion variant="shadow">
                                    <AccordionItem
                                        title={survey.title}
                                        subtitle={`Aberto: ${formatDate(survey.openDate)} | Fechado: ${formatDate(survey.endDate)}`}
                                    >
                                        <Accordion variant="splitted" className="mb-6 mt-6">
                                            {survey.pages.map((page, pageIndex) => {
                                                const filteredQuestions = page.questions.filter(q =>
                                                    ["checkbox", "radio", "select", "table"].includes(q.type)
                                                );

                                                const allSelected = filteredQuestions.every(q =>
                                                    selectedQuestions.includes(q.name)
                                                );

                                                const handleToggleAll = () => {
                                                    if (allSelected) {
                                                        setSelectedQuestions(
                                                            selectedQuestions.filter(
                                                                q => !filteredQuestions.some(fq => fq.name === q)
                                                            )
                                                        );
                                                    } else {
                                                        setSelectedQuestions([
                                                            ...selectedQuestions,
                                                            ...filteredQuestions.map(q => q.name)
                                                        ]);
                                                    }
                                                };

                                                return (
                                                    <AccordionItem
                                                        key={pageIndex}
                                                        title={page.title}
                                                        className="bg-zinc-50 dark:bg-zinc-900 rounded-xl"
                                                    >
                                                        <div className="mb-6 mt-2 flex">
                                                            <Switch
                                                                color="success"
                                                                isSelected={allSelected}
                                                                onChange={handleToggleAll}
                                                            >
                                                                Selecionar tudo
                                                            </Switch>
                                                        </div>

                                                        {page.questions.map((question, questionIndex) => {
                                                            if (!["checkbox", "radio", "table", "select"].includes(question.type)) {
                                                                return null;
                                                            }

                                                            return (
                                                                <div
                                                                    key={questionIndex}
                                                                    className="py-3 px-4 w-full flex items-center justify-between rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                                                                >
                                                                    <Checkbox
                                                                        classNames={{ icon: "text-white" }}
                                                                        color="success"
                                                                        isSelected={selectedQuestions.includes(question.name)}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setSelectedQuestions([...selectedQuestions, question.name]);
                                                                            } else {
                                                                                setSelectedQuestions(
                                                                                    selectedQuestions.filter(q => q !== question.name)
                                                                                );
                                                                            }
                                                                        }}
                                                                    >
                                                                        {question.title.split(":")[0]}
                                                                    </Checkbox>

                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedQuestion(question.name);
                                                                            onOpen();
                                                                        }}
                                                                        className="flex items-center gap-2 rounded-lg px-4 py-2 bg-zinc-800 text-white hover:bg-zinc-700 transition"
                                                                    >
                                                                        <FaEye size={14} />
                                                                        Visualizar
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </AccordionItem>
                                                );
                                            })}
                                        </Accordion>

                                        <div className="pt-4">
                                            <button
                                                onClick={onOpen}
                                                className="flex items-center gap-2 bg-zinc-800 text-white px-6 py-2 rounded-lg hover:bg-zinc-700 transition"
                                            >
                                                <CiUnlock size={18} />
                                                Tornar Público
                                            </button>
                                        </div>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {

    await connectToMongoDB();

    const session = await getSession(context);

    const surveys = await Survey.find({ author: session?.user._id as string }) || [];

    return {
        props: {
            surveys: JSON.parse(JSON.stringify(surveys))
        }
    }
}
