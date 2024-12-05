import { FormProvider, useForm } from "react-hook-form";
import Sidebar from "../Create/Sidebar";
import Button from "@/components/layout/Button";
import { Form } from "@/components/Form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { t } from "i18next";
import { IPages, IQuestion, ISurvey, ISurveyDocument } from "../../../../models/surveyModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { toast } from "react-toastify";
import Page from "../Create/Page";
import { IoIosArrowDroprightCircle, IoMdEye } from "react-icons/io";
import { addPage, save, updateAuthor, updateDescription, updatePage, updateTitle } from "../../../../redux/reducers";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useSession } from "next-auth/react";
import { updatePageAndSync, updateSurveyAndSync } from "../../../../redux/thunk";
import { Spinner } from "@nextui-org/react";
import { MdDone, MdOutlineCancel } from "react-icons/md";
import SurveyBody from "../Body";
import { useRouter } from "next/router";
import DatabaseQuestion from "./DatabaseQuestion";
import { ISurveyQuestions, IPage } from "../../../../models/surveyQuestionsModel";
import { BiX } from "react-icons/bi";


const createSurveySchema = z.object({});

interface ICreateSurveyData {
    title: string;
    description: string;
}


interface Props {
    survey?: ISurveyDocument
}


type CreateSurveyData = z.infer<typeof createSurveySchema>;

export default function Manage({ survey }: Props) {

    const { push } = useRouter();
    const { data: session } = useSession();
    const [style, setStyle] = useState<string>("hidden");
    const [selectedPage, setSelectedPage] = useState<number>(0);
    const [viewSurvey, setViewSurvey] = useState<boolean>(false);
    const [showDatabase, setShowDatabase] = useState<boolean>(false);
    const [selectedQuestionsByDimension, setSelectedQuestionsByDimension] = useState<{ SurveyQuestions: ISurveyQuestions }>({ SurveyQuestions: { pages: [] } });

    const dispatch = useAppDispatch();
    const data = useAppSelector((state) => state.survey);
    const loader = useAppSelector((state) => state.loading);
    const surveyId = useAppSelector((state) => state.surveyId);

    const createSurveyForm = useForm<ICreateSurveyData>({
        resolver: zodResolver(createSurveySchema),
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
        control,
    } = createSurveyForm;

    const saveSurveyState = async (data: CreateSurveyData) => {
        try {
            const response = await api.post<ISurveyDocument>('/survey/create', {
                ...data
            });
            return response;
        } catch (error) {
            toast.error(error as string);
            return null;
        }
    }

    async function next(data: CreateSurveyData) {
        // const response = await saveSurveyState(data);
        push(`/admin/survey/${surveyId.value}/complete`);
        // if (!response) return;
    }

    function handleAddPage() {
        const sortedPages = data.pages.map(page => page.id).sort((a, b) => a - b);
        const id = sortedPages[sortedPages.length - 1] > 0 ? sortedPages[sortedPages.length - 1] + 1 : 1;

        const newPage = { id: id, title: "", description: "", questions: [] };

        setSelectedPage(id);
        dispatch(addPage(newPage));
        dispatch(updatePageAndSync(newPage, id, surveyId.value!!));

        return newPage;
    }

    function handleAddQuestion(item: Partial<IQuestion>) {
        let page: IPages | undefined;

        if (data.pages.length === 0) {
            page = handleAddPage();
        } else {
            page = data.pages.find(page => page.id === selectedPage);
        }

        if (!page) return;

        const sortedQuestions = page.questions.map(question => question.id).sort((a, b) => a - b);
        const id = sortedQuestions[sortedQuestions.length - 1] > 0 ? sortedQuestions[sortedQuestions.length - 1] + 1 : 1;


        const question: IQuestion = {
            id: id,
            title: item.title ?? "",
            name: `${"question"}.${id}.${page.id}`,
            options: item.options ?? [],
            type: item.type ?? "text",
            required: item.required ?? false,
            dependsOn: item.dependsOn ?? "",
            dependsValue: item.dependsValue ?? "",
            dependsOnOptions: item.dependsOnOptions ?? [],
            dependsOnValue: item.dependsOnValue ?? "",
            dependsOnType: item.dependsOnType ?? undefined
        };

        const updatedPage = {
            ...page,
            questions: [...page.questions, question]
        };

        const pageId = selectedPage === 0 ? 1 : selectedPage;
        dispatch(updatePage({ pageId: pageId, updatedPage }));
        dispatch(updatePageAndSync(updatedPage, pageId, surveyId.value!!));
    }

    async function findSurvey(id: string) {
        try {
            const response: ISurveyDocument = await api.get<ISurveyDocument>(`/survey/${id}`);

            dispatch(save(response));
            return response;
        } catch (error) {
            toast.error(error as string);
            return null;
        }
    }

    function updateProp(value: string, field: string) {
        switch (field) {
            case 'title': dispatch(updateTitle(value)); break;
            case 'description': dispatch(updateDescription(value)); break;
            default: break;
        }
    }

    function resendDataSync() {
        dispatch(updateSurveyAndSync(data, surveyId.value!!));
    }

    function showSurvey() {
        setViewSurvey(!viewSurvey);
    }

    useEffect(() => {
        if (!data.author && session && session.user._id) dispatch(updateAuthor(session?.user._id));

        if (survey) dispatch(save(survey));

        if (!loader.isLoading) {

            setStyle("flex");

            const timeout = setTimeout(() => {
                setStyle("hidden");
            }, 2000);

            return () => clearTimeout(timeout);
        }

    }, [loader.isLoading, data, dispatch, survey])

    return (
        <main className="h-auto min-h-svh flex mb-20">
            {viewSurvey ? (
                <section className="w-full">
                    <Button className="fixed bottom-5 left-5 hover:transition-opacity opacity-100 hover:opacity-90 duration-1000 bg-gradient-to-br from-zinc-800 to-zinc-950 text-white px-4 py-2 rounded-lg " onClick={showSurvey}><BiX size={34} /></Button>
                    <SurveyBody responses={{}} survey={data as ISurveyDocument} />
                </section>
            ) :
                (
                    <>
                        <Sidebar addQuestion={handleAddQuestion} />
                        <section className="flex flex-col w-full ml-[10%] px-28 py-20">
                            {showDatabase ? <DatabaseQuestion showDatabase={showDatabase} setShowDatabase={setShowDatabase} selectedQuestionsByDimension={selectedQuestionsByDimension} setSelectedQuestionsByDimension={setSelectedQuestionsByDimension} />
                                : (
                                    <>
                                        <header className="w-full gap-5">
                                            <FormProvider {...createSurveyForm} >
                                                <form onSubmit={handleSubmit(next)}>
                                                    <div className="flex gap-4 justify-end px-6">
                                                        <Button className="bg-zinc-800 px-2 rounded-2xl py-3 text-white justify-center flex items-center gap-3 group/preview w-36" onClick={showSurvey}>{t('admin.survey.create.preview')} <IoMdEye className="group-hover/preview:size-6 size-5" /></Button>
                                                        <Button className="bg-zinc-800 px-2 rounded-2xl py-3 text-white justify-center flex items-center gap-3 group/finish w-32" type="submit"><p className="group-hover/finish:translate-x-0.5">{t('admin.survey.create.finish')}</p> <IoIosArrowDroprightCircle className="group-hover/finish:translate-x-1 group-hover/finish:size-6 size-5" /></Button>
                                                    </div>
                                                    <div className="mt-4 flex justify-end pr-12">
                                                        <Button variant="primary" onClick={() => setShowDatabase(!showDatabase)}>{t('admin.survey.manage.add_question')}</Button>
                                                    </div>
                                                    <div className="rounded-3xl dark:bg-zinc-900 shadow-xl w-3/4 px-20 py-16 flex justify-between items-end gap-5">
                                                        <div className="flex flex-col w-full">
                                                            <Form.Field>
                                                                <input id="title" value={data.title} onBlur={(e) => updateProp(e.target.value, "title")} name="title" placeholder={t('admin.survey.create.title')} />
                                                                <Form.ErrorMessage field="title" />
                                                            </Form.Field>
                                                            <Form.Field>
                                                                <Form.TextArea value={data.description} onBlur={(e) => updateProp(e.target.value, "description")} placeholder={t('admin.survey.create.description.placeholder')} id="description" className="focus:outline focus:outline-2 focus:outline-zinc-500 border-none px-5 shadow-xl rounded-b-2xl h-52 resize-none overflow-auto w-full" name="description" />
                                                                <Form.ErrorMessage field="description" />
                                                            </Form.Field>
                                                        </div>

                                                        {(loader.isLoading && loader.questionId === 0) ? (
                                                            <Spinner size="sm" aria-label="Gray spinner medium sized" color="default" />
                                                        ) : (
                                                            <div className={`${style} ${loader.success ? 'text-green-600' : 'text-red-700'}`}>
                                                                {loader.success ? (
                                                                    <MdDone size={20} />
                                                                ) : (
                                                                    <MdOutlineCancel size={20} className="cursor-pointer" onClick={resendDataSync} />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </form>
                                            </FormProvider>
                                        </header>
                                        <div className="flex flex-col gap-5 mt-8">
                                            {data.pages.map((page, index) => (
                                                <div key={index} className={`shadow-2xl dark:bg-zinc-900 rounded-2xl w-3/5 ${page.id === selectedPage ? "border-zinc-300 border-2" : "border-zinc-100"}`} onClick={() => setSelectedPage(page.id)}>
                                                    <Page id={page.id} page={page} data={data} dispatch={dispatch} surveyId={surveyId.value} />
                                                </div>
                                            ))}
                                            <Button className="border-zinc-300 border-2 px-2 w-1/6 py-1 text-zinc-500 hover:shadow-lg rounded-xl mt-2 font-medium" variant="tertiary" onClick={handleAddPage}>{t('admin.survey.create.add_page')}</Button>
                                        </div>
                                    </>
                                )}
                        </section>
                    </>
                )}
        </main>
    )
}