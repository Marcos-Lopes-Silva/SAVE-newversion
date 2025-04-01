import Button from '@/components/layout/Button';
import { api } from '@/lib/api';
import { Accordion, AccordionItem, button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch, useDisclosure } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { CiUnlock } from 'react-icons/ci';
import { FaEye } from 'react-icons/fa';
import { ISurveyAnalytics } from '../../../../models/surveyAnalytics';
import { getSession, useSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { connectToMongoDB } from '@/lib/db';
import Survey, { ISurveyDocument } from '../../../../models/surveyModel';
import { toast } from 'react-toastify';

export default function ShowData({ surveys }: { surveys: ISurveyDocument[] }) {
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [surveyAnalytics, setSurveyAnalytics] = useState<ISurveyAnalytics | null>(null);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const { data: session } = useSession();
    const userId = session?.user?._id;
    
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const surveyId = surveys.find(s => s.author === userId)?._id;
                if(!surveyId) return;
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

    const handleConfirm = async () => {
        try {
            const surveyId = surveys.find(s => s.author === userId)?._id;
            if(!surveyId) return;

            const updatedQuestions = surveyAnalytics?.pages.flatMap(page =>
                page.questions
                    .filter(q => ["checkbox", "radio", "table", "select"].includes(q.type))
                    .map(q => ({
                        name: q.name,
                        isPublic: selectedQuestions.includes(q.name)
                    }))
            );
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
                <header className='px-52 py-6'>
                    <div className="px-12 py-6 flex items-start flex-col border-1 bg-gray-200 rounded-xl shadow-lg">
                        <div className='flex items-center gap-96'>
                            <h1 className='text-xl'>Disponibilizando Informações ao Público</h1>
                        </div>
                        <h1 className='py-4 text-base'>Personalize a visualização dos dados que serão acessíveis ao público em geral.</h1>
                    </div>
                    <div className='items-end flex justify-end py-4'>
                        <Button>
                            <FaEye className='size-4'/>
                            Preview
                        </Button>
                    </div>
                </header>
                <section>
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

    return (
        <main>
            <header className='px-52 py-6'>
                <div className="px-12 py-6 flex items-start flex-col border-1 bg-gray-200 rounded-xl shadow-lg">
                    <h1 className='text-xl'>Disponibilizando Informações ao Público</h1>
                    <h1 className='py-4 text-base'>Personalize a visualização dos dados que serão acessíveis ao público em geral.</h1>
                </div>
            </header>
            <section>
                <div className='text-center text-xl mb-8 mt-4'>
                    <h1>Pronto para compartilhar? Selecione os gráficos que serão exibidos publicamente</h1>
                </div>
                <div className='px-56 py-6 text-start flex flex-col items-start'>
                    {surveys.length === 0 ? (
                        <div>Sem questionário no momento</div>
                    ) : (
                        surveys.map((survey) => (
                            <div className='flex items-center flex-col justify-center px-20 mb-6'>
                                <Accordion key={survey._id as string} variant='shadow'>
                                    <AccordionItem
                                        title={survey.title}
                                        subtitle={`Aberto: ${formatDate(survey.openDate)} | Fechado: ${formatDate(survey.endDate)}`}
                                    >
                                        <Accordion variant='splitted' className='mb-6 mt-6'>
                                            {survey.pages.map((page, pageIndex) => {
                                                const filteredQuestions = page.questions.filter(q => ["checkbox", "radio", "select", "table"].includes(q.type));
                                                const allSelected = filteredQuestions.every(q => selectedQuestions.includes(q.name));
                                                const handleToggleAll = () => {
                                                    if (allSelected) {
                                                        setSelectedQuestions(selectedQuestions.filter(q => !filteredQuestions.some(fq => fq.name === q)));
                                                    } else {
                                                        setSelectedQuestions([...selectedQuestions, ...filteredQuestions.map(q => q.name)]);
                                                    }
                                                };
                                                return (
                                                    <AccordionItem
                                                        key={pageIndex}
                                                        title={page.title}
                                                        variant='splitted'
                                                        className='bg-gray-50'
                                                    >
                                                        <div className='mb-6 mt-2 items-start flex justify-start'>
                                                            <Switch 
                                                                color='success' 
                                                                isSelected={allSelected}
                                                                onChange={handleToggleAll}
                                                            >
                                                                Selecionar tudo
                                                            </Switch>
                                                        </div>
                                                        {page.questions.map((question, questionIndex) => {
                                                            if(!["checkbox", "radio", "table", "select"].includes(question.type)) {
                                                                return null;
                                                            }
                                                            return (
                                                            <div key={questionIndex} className='py-2 w-full flex items-center justify-between'>
                                                                <div className='px-2'>
                                                                    <Checkbox 
                                                                        classNames={{ icon : 'text-white' }}
                                                                        color='success' 
                                                                        isSelected={selectedQuestions.includes(question.name)}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setSelectedQuestions([...selectedQuestions, question.name]);
                                                                            } else {
                                                                                setSelectedQuestions(selectedQuestions.filter(q => q !== question.name));
                                                                            }
                                                                        }}
                                                                    >
                                                                        <h1 className='rounded-lg px-2 py-0'>
                                                                            {question.title.split(':')[0]}
                                                                        </h1>
                                                                    </Checkbox>
                                                                </div>
                                                                <div>
                                                                    <button className={'flex items-center gap-2 mr-2 rounded-lg px-4 py-1 bg-zinc-900 text-white'}>
                                                                        <FaEye className='size-4'/>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            );
                                                            }
                                                        )}
                                                    </AccordionItem>
                                                );
                                            })}
                                        </Accordion>
                                        <div className='py-4'>
                                            <Button variant='primary' onClick={onOpen}>
                                                <CiUnlock className='size-5' />
                                                Tornar Público
                                            </Button>
                                        </div>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onclose) => (
                        <>
                            <ModalHeader>
                                Confirmar ação!
                            </ModalHeader>
                            <ModalBody>
                                <p>Ao confirmar, os gráficos selecionados serão visíveis para o público em geral. Deseja prosseguir?</p>
                            </ModalBody>
                            <ModalFooter className='flex justify-start'>
                                <Button variant='secondary' onClick={onclose}>Cancelar</Button>
                                <Button variant='primary' onClick={handleConfirm}>Continuar</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
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
