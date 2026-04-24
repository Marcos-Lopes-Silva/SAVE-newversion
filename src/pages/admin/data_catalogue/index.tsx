import { api } from "@/lib/api";
import { t } from "i18next";
import { useEffect, useState } from 'react';
import { ISurveyDocument } from "../../../../models/surveyModel";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { connectToMongoDB } from "@/lib/db";
import { timeAgoInHours } from "@/lib/utils/date";
import { FaFileInvoice } from "react-icons/fa";
import { Card } from "@nextui-org/card"
import { BiSolidLock } from "react-icons/bi";
import { BiSolidLockOpen } from "react-icons/bi";
import { HiUserGroup } from "react-icons/hi";
import { GiBackwardTime } from "react-icons/gi";
import { Pagination } from "@nextui-org/pagination";
import Image from "next/image"
import ImageHeader from "@/static/images/shape_117.svg";

interface Props {
    survey: ISurveyDocument[];
}

export default function Catalogue({ survey }: Props) {
    const { push } = useRouter();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [lastSurveyCalendar, setLastSurveyCalendar] = useState<string | null>(null);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        console.log('Página alterada para:', page);
    };

    const pageSize = 4;

    const openSurvey = (id: string) => {
        if (typeof window !== 'undefined') {
            const surveysList: string[] = JSON.parse(localStorage.getItem("last_surveys_list") || "[]");

            const verifiedSurveysIds = surveysList.filter(s => s !== id);
            verifiedSurveysIds.push(id);

            if (verifiedSurveysIds.length > 5) {
                verifiedSurveysIds.shift();
            }

            localStorage.setItem('last_surveys_list', JSON.stringify(verifiedSurveysIds));
            const calendar = new Date();
            localStorage.setItem('last_survey_date', calendar!!.toString());
            push(`/admin/report/${id}`);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedSurveyIds = JSON.parse(localStorage.getItem("last_surveys_list") || "[]");

            const fetchRecentSurveys = async () => {
                try {
                    const surveyPromises = storedSurveyIds.map((id: string) => api.get<ISurveyDocument>(`survey/${id}`));
                    const surveys = await Promise.all(surveyPromises);
                } catch (error) {
                    console.error("Erro ao buscar surveys:", error);
                }
            };
            fetchRecentSurveys();
        }
    }, []);

    const verifiedPublic = (id: string) => {
        /*const response = api.get<ISurveyDocument>(`report/${id}`)
        // reformular a lógica de verificação
        if (!response)
            return false;*/
        return true;
    }

    return (
        <main className="flex flex-col px-40 py-28">
            <header className="flex flex-col rounded-xl shadow-2xl bg-zinc-200 dark:bg-zinc-900 px-40 py-16">
                <h1 className="mb-2 text-2xl font-medium dark:text-white">
                    {t('admin.data_catalogue.visualize_data')}
                </h1>
                <a className="mb-4 dark:text-white">
                    {t('admin.data_catalogue.informations')}
                </a>
                <div className="mb-2 rounded-2xl bg-zinc-600 dark:bg-zinc-700 w-24 h-3" />
                <div className="ml-4 rounded-2xl bg-zinc-300 w-24 h-3" />
            </header>
            <section className="flex flex-col py-20 w-full px-24">
                
                <div className="flex flex-col mt-8 pl-2 gap-2">
                    <h2 className="text-xl font-semibold dark:text-white">
                        {t('admin.data_catalogue.reports')}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-white">
                        {t('admin.data_catalogue.click_reports')}
                    </p>
                </div>
                <ul className="flex flex-col gap-14">
                    {survey.length === 0 && (
                        <div className="flex flex-col items-center gap-4 mt-20">
                            <p className="text-zinc-500 dark:text-white text-sm">
                                Não existem relatórios disponíveis. Aplique um novo questionário para gerar relatórios e visualizá-los aqui.
                            </p>
                        </div>
                    )}
                    {survey.map((survey, index) => (
                        <li key={index} className="flex mt-5 shadow-lg shadow-zinc-800 rounded-3xl py-8 transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-zinc-800">
                            <div className="flex ml-14 gap-5 items-center">
                                <FaFileInvoice
                                    size={20}
                                    className="p-7 dark:bg-zinc-950 bg-zinc-800 flex items-center justify-center rounded-2xl text-white"
                                />
                                <label className="font-medium text-lg break-all dark:text-white">
                                    {survey.title}
                                </label>
                            </div>
                            <div className="flex mt-20 -ml-12 gap-1.5 items-center">
                                {(verifiedPublic(survey._id as string)) ? (
                                    <BiSolidLockOpen size={20} className="text-zinc-500 dark:text-white" />
                                ) : <BiSolidLock size={20} className="text-zinc-500 dark:text-white" />}
                                <HiUserGroup size={20} className="text-zinc-500 dark:text-white" />
                                <p className="text-sm text-zinc-500 dark:text-white">{survey.users}</p>
                            </div>
                            <div className="flex items-center ml-auto">
                                <button
                                    className="dark:bg-white bg-zinc-800 dark:text-black text-white rounded-3xl w-24 py-1 mr-10 shadow-md hover:shadow-lg transition-all duration-300"
                                    onClick={() => openSurvey(survey._id as string)}>
                                    {t('admin.data_catalogue.view_button')}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                {survey.length > pageSize ? (
                    <Pagination
                        total={Math.ceil(survey.length / pageSize)}
                        page={currentPage}
                        onChange={handlePageChange}
                        size={"md"}
                        initialPage={1}
                        siblings={3}
                        showControls={true}
                        dotsJump={3}
                        classNames={{
                            wrapper: "mt-20 gap-3 justify-end",
                            item: "w-8 text-small hover:bg-zinc-700 bg-zinc-900 text-white rounded-3xl",
                            next: "hover:bg-zinc-700 bg-zinc-900 text-white",
                            prev: "hover:bg-zinc-500 bg-zinc-900 text-white",
                        }}
                    />
                ) : null}
            </section>
        </main>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    await connectToMongoDB();

    const surveys = await api.get('survey');
    console.log("Surveys:", surveys);
    return {
        props: {
            survey: JSON.parse(JSON.stringify(surveys))
        }
    };
};

Catalogue.auth = {
    role: 'admin',
    verified: true,
    unauthorized: '/'
};


