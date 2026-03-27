import SearchBar from "@/components/layout/SearchBar";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { MdMenuBook, MdAccessTime, MdPeople, MdDelete, MdGraphicEq, MdInsights, MdEdit, MdContentCopy } from "react-icons/md";
import { useTranslation } from "react-i18next";
import Survey, { ISurveyDocument } from "../../../../models/surveyModel";
import Item from "@/components/Item";
import { connectToMongoDB } from "@/lib/db";
import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { timeAgoInHours } from "@/lib/utils/date";
import { Button, Pagination } from "@nextui-org/react";
import { api } from "@/lib/api";
import { toast } from "react-toastify";
import { useAppDispatch } from "@/lib/hooks";
import { saveSurveyId } from "../../../../redux/reducers/surveyId";
import { save } from "../../../../redux/reducers";
import { useDispatch } from "react-redux";
import { clear } from "../../../../redux/reducers/index";


interface Props {
    surveys: ISurveyDocument[]
}

const PageSize = 5;

export default function Dashboard({ surveys }: Props) {
    const { push } = useRouter();
    const { t } = useTranslation();
    const [filter, setFilter] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [search, setSearch] = useState<string>("");
    const [list, setList] = useState<ISurveyDocument[]>(surveys);

    const filters = [
        {
            label: t("admin.dashboard.filters.draft"),
            value: "draft",
        },
        {
            label: t("admin.dashboard.filters.active"),
            value: "active",
        },
        {
            label: t("admin.dashboard.filters.finished"),
            value: "finished",
        },
    ];

    const onPageChange = (page: number) => setCurrentPage(page);

    function testaBusca(title: string) {
        if (search === "") return true;
        const regex = new RegExp(search, 'i');
        return regex.test(title);
    }

    function testaFiltro(status: string) {
        if (filter !== "") return filter === status;
        return true;
    }

    const deleteSurvey = async (id: string) => {
        try {
            await api.delete(`/survey/${id}`);
            setList(list.filter((item) => item._id as string !== id));
        } catch (error) {
            toast.error(t('admin.dashboard.delete_error'));
        } finally {
            toast.success(t('admin.dashboard.delete_success'));
        }
    }

    const filteredList = useMemo(() => {
        return list.filter((item) => testaBusca(item.title) && testaFiltro(item.status));
    }, [search, filter, list]);

    const filteredListP = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * PageSize;
        const lastPageIndex = firstPageIndex + PageSize;
        return filteredList.slice(firstPageIndex, lastPageIndex);
    }, [filteredList, currentPage]);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(clear());
    }, [filteredListP, list]);

    return (
        <main className="flex flex-col px-40 py-14">
            <header className="flex flex-col rounded-xl shadow-2xl bg-zinc-200 dark:bg-zinc-900 px-40 py-16">
                <h1 className="mb-2 text-2xl font-medium dark:text-white">{t('admin.dashboard.title')}</h1>
                <a className="mb-4 dark:text-white">{t('admin.dashboard.subtitle')}</a>
                <div className="mb-2 rounded-2xl bg-zinc-600 dark:bg-zinc-700 w-24 h-3" />
                <div className="ml-4 rounded-2xl bg-zinc-300 w-24 h-3" />
            </header>

            <section className="flex py-20 w-full items-end flex-col px-24">
                <Button className="text-white bg-zinc-800" onClick={() => push(('/admin/survey/create'))}>{t('admin.dashboard.create-button')}</Button>
                <div className="flex w-full gap-3">
                    <ul className="flex w-full rounded-lg px-2">
                        {filters.map((item, index) => (
                            <li className={`${filter === item.value ? 'border-zinc-900' : 'border-zinc-200 text-zinc-400'} dark:text-white ${index == filters.length ? 'px-80' : ''} dark:hover:text-zinc-300 hover:text-zinc-500 hover:border-zinc-300 flex cursor-pointer w-40 items-center justify-center border-b-2`} key={index} onClick={() => setFilter(item.value)}>
                                {item.label}
                            </li>
                        ))}
                    </ul>
                </div>
                <SearchBar className="w-full mt-3 shadow-lg" iconSize={20} placeholder="Pesquisar questionário" search={search} setSearch={setSearch} />
                <div className="w-full py-10 px-5">
                    <ul className="w-full items-center flex flex-col gap-5">
                        {filteredListP.map((survey, index) => (
                            <Item<ISurveyDocument>
                                icon={
                                    <div className="p-7 dark:bg-zinc-950 bg-zinc-800 flex items-center justify-center rounded-2xl text-white">
                                        <MdMenuBook size={20} />
                                    </div>
                                }
                                options={
                                    <div className="flex">
                                        <Options survey={survey} />
                                    </div>
                                }
                                menu={
                                    <Menu survey={survey} deleteSurvey={deleteSurvey} />
                                }

                                key={index} className={"flex gap-12 dark:bg-zinc-800 shadow-2xl w-11/12 min-h-36 rounded-3xl p-9"} item={survey} />
                        ))}
                        <Pagination total={Math.ceil(surveys.length / PageSize)} initialPage={1} page={currentPage} onChange={onPageChange} showControls loop color="primary" classNames={{ item: "hover:bg-zinc-700 bg-zinc-900 text-white", next: "hover:bg-zinc-700 bg-zinc-900 text-white", prev: "hover:bg-zinc-500 bg-zinc-900 text-white" }} />
                    </ul>

                </div>
            </section>
        </main>
    )
}

const Menu = ({ survey, deleteSurvey }: IMenu) => {
    const { push } = useRouter();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const duplicateSurvey = async () => {
        const newSurvey = { ...survey };
        delete newSurvey._id;
    }

    const editSurvey = () => {
        dispatch(saveSurveyId(survey._id as string));
        dispatch(save(survey));
        push(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}admin/survey/edit/${survey._id}`);
    }

    return survey.status === 'draft' ?
        <div className="flex gap-5 flex-col py-5 px-4">
            <Button className="dark:bg-white bg-zinc-800 dark:text-black text-white" onClick={editSurvey}><MdEdit size={20} className="dark:text-black text-white" />{t('admin.dashboard.edit')}</Button>
            <Button className="dark:bg-white bg-zinc-800 dark:text-black text-white" onClick={duplicateSurvey}><MdContentCopy size={20} className="dark:text-black text-white" />{t('admin.dashboard.duplicate')}</Button>
            <Button className="dark:bg-white bg-zinc-800 dark:text-black text-white" onClick={() => deleteSurvey(survey._id as string)}><MdDelete size={20} className="dark:text-black text-white" />{t('admin.dashboard.delete')}</Button>
        </div>
        :
        <div className="flex gap-5 flex-col">
            <Button className="dark:bg-white bg-zinc-800 dark:text-black text-white"><MdInsights size={20} className="dark:text-black text-white" /> {t('admin.dashboard.results')}</Button>
            <Button className="dark:bg-white bg-zinc-800 dark:text-black text-white" onClick={() => deleteSurvey(survey._id as string)}>{t('admin.dashboard.delete')}</Button>
        </div>
}

interface IMenu extends IAux {
    deleteSurvey: (id: string) => void
}

interface IAux {
    survey: ISurveyDocument,
}

const Options = ({ survey }: IAux) => {


    return survey.status === 'draft' ? (
        <div className="flex gap-5">
            <label className="flex gap-2 items-center text-zinc-500 dark:text-white"><MdAccessTime size={20} /> {timeAgoInHours(survey.updatedAt.toString())}</label>
            <label className="flex gap-2 items-center text-zinc-500 dark:text-white"><MdPeople size={21} /> {`${survey.responses}/${survey.users}`}</label>
        </div>

    ) : null
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

Dashboard.auth = {
    role: 'admin',
    verified: true,
    unauthorized: '/user/dashboard'
};