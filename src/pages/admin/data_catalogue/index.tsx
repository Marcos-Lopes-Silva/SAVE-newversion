import { api } from "@/lib/api";
import { t } from "i18next";
import { useEffect, useState } from 'react';
import { getSession } from "next-auth/react";
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
    const [recentSurvey, setRecentSurvey] = useState<ISurveyDocument[] | null>([]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        console.log('Página alterada para:', page);
    };

    const pageSize = 4;

    const openSurvey = (id: string) => {
        if (typeof window !== 'undefined') {
            const surveysList: string[] = JSON.parse(localStorage.getItem("last_surveys_list")!!);

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
                    setRecentSurvey(surveys.map(response => response.data));
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
        <main className="flex flex-col px-32">
            <header className="flex flex-col bg-slate-100 m-12 shadow-lg shadow-slate-300 rounded-3xl p-32 py-12">
                <div className="flex gap-4 mt-5">
                    <Image src={ImageHeader} className="w-10 -mt-24" alt="imageHeader" />
                    <div className="flex flex-col">
                        <h1 className="font-semibold text-3xl mb-3">
                            {t('admin.data_catalogue.visualize_data')}
                        </h1>
                        <div className="flex">
                            <p className="font-semibold text-lg pl-1 mb-3">
                                {t('admin.data_catalogue.informations')}
                            </p>
                        </div>
                    </div>
                </div>
            </header>
            <section className="flex-col m-10">
                {recentSurvey && recentSurvey.length > 0 ? (
                    <>
                        <label className="font-semibold text-sm px-2 border-b-2 border-slate-300">
                            {t('admin.data_catalogue.recently_open')}
                        </label>
                        <div className="h-72 w-full pl-2 overflow-x-auto">
                            <ul className="flex gap-4">
                                {recentSurvey.map((survey) => survey.status == "finished" && (
                                    <Card key={survey._id as string} className="mt-5 shadow-lg shadow-slate-300 rounded-3xl w-1/3 min-w-[375px]">
                                        <div className="flex flex-col border-t-slate-200 border-t-8 rounded-3xl py-8 w-full">
                                            <div className="flex ml-10 gap-5">
                                                <FaFileInvoice
                                                    size={58}
                                                    style={{
                                                        color: "white",
                                                        backgroundColor: "rgb(15 23 42)",
                                                        padding: "15px",
                                                        borderTopRightRadius: "0.4rem",
                                                        borderBottomLeftRadius: "0.4rem",
                                                        borderBottomRightRadius: "1rem",
                                                        borderTopLeftRadius: "1rem"
                                                    }}
                                                />
                                                <label className="font-semibold text-sm ml-2">
                                                    {survey.title}
                                                </label>
                                            </div>
                                            <div className="flex flex-col mt-3.5 ml-32">
                                                <button
                                                    className="text-sm bg-slate-900 text-white rounded-3xl w-20 py-0.5 shadow-slate-400 hover:shadow-md"
                                                    onClick={() => openSurvey(survey._id as string)}>
                                                    {t('admin.data_catalogue.view_button')}
                                                </button>
                                            </div>
                                            <div className="flex mt-5 -mb-2">
                                                <div className="flex ml-10 w-32">
                                                    <GiBackwardTime size={20} />
                                                    <p className="text-sm ml-1 font-semibold">
                                                        {lastSurveyCalendar ? timeAgoInHours(lastSurveyCalendar) : "Não disponível"}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 ml-24">
                                                    {(verifiedPublic(survey._id as string)) ? (
                                                        <BiSolidLockOpen size={20} />
                                                    ) : <BiSolidLock size={20} />}
                                                    <HiUserGroup size={20} />
                                                    <p className="mt-0.5 text-sm font-bold">{survey.users}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </ul>
                        </div>
                    </>
                ) : null}
                <div className="flex flex-col mt-8 pl-2 gap-12">
                    <label className="font-semibold text-sm">
                        {t('admin.data_catalogue.reports')} <br />
                        {t('admin.data_catalogue.click_reports')}
                    </label>
                </div>
                <ul className="flex flex-col gap-14">
                    {survey.map((survey, index) => survey.status == "finished" && (
                        <li key={index} className="flex mt-5 border-t-slate-200 border-t-8 shadow-lg shadow-slate-200 rounded-3xl py-8">
                            <div className="flex ml-14 gap-5">
                                <FaFileInvoice
                                    size={58}
                                    style={{
                                        color: "white",
                                        backgroundColor: "rgb(15 23 42)",
                                        padding: "15px",
                                        borderTopRightRadius: "0.4rem",
                                        borderBottomLeftRadius: "0.4rem",
                                        borderBottomRightRadius: "1rem",
                                        borderTopLeftRadius: "1rem"
                                    }}
                                />
                                <label className="font-semibold text-sm break-all">
                                    {survey.title}
                                </label>
                            </div>
                            <div className="flex mt-20 -ml-12 gap-1.5">
                                {(verifiedPublic(survey._id as string)) ? (
                                    <BiSolidLockOpen size={20} />
                                ) : <BiSolidLock size={20} />}
                                <HiUserGroup size={20} />
                                <p className="mt-0.5 text-sm font-bold">{survey.users}</p>
                            </div>
                            <div className="flex items-center ml-auto">
                                <button
                                    className="text-sm text-white w-24 py-1 rounded-3xl mr-10 bg-slate-900 border-slate-300 shadow-sm shadow-slate-400 hover:shadow-md"
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
                            item: "w-8 text-small text-slate-900 rounded-3xl bg-slate-100 shadow-sm shadow-slate-400 hover:shadow-md",
                        }}
                    />
                ) : null}
            </section>
        </main>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    await connectToMongoDB();

    const session = await getSession(context);
    const surveys = await api.get(`user/survey?userId=${session?.user?._id}`);
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


