import SearchBar from "@/components/layout/SearchBar";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { MdMenuBook, MdAccessTime, MdPeople, MdDelete, MdGraphicEq, MdInsights, MdEdit, MdContentCopy, MdShare } from "react-icons/md";
import { useTranslation } from "react-i18next";
import Survey, { ISurveyDocument } from "../../../../models/surveyModel";
import Item from "@/components/Item";
import { connectToMongoDB } from "@/lib/db";
import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { timeAgoInHours } from "@/lib/utils/date";
import { Button, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Checkbox, CheckboxGroup, Spinner } from "@nextui-org/react";
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

export default function Dashboard({ surveys, userId }: Props & { userId: string }) {
    const { push } = useRouter();
    const { t } = useTranslation();
    const [filter, setFilter] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [search, setSearch] = useState<string>("");
    const [list, setList] = useState<ISurveyDocument[]>(surveys);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedSurvey, setSelectedSurvey] = useState<ISurveyDocument | null>(null);

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

    const handleShare = (survey: ISurveyDocument) => {
        setSelectedSurvey(survey);
        onOpen();
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
                                    <Menu survey={survey} deleteSurvey={deleteSurvey} isOwner={survey.author === userId} onShare={() => handleShare(survey)} />
                                }

                                key={index} className={"flex gap-12 dark:bg-zinc-800 shadow-2xl w-11/12 min-h-36 rounded-3xl p-9"} item={survey} />
                        ))}
                        <Pagination total={Math.ceil(surveys.length / PageSize)} initialPage={1} page={currentPage} onChange={onPageChange} showControls loop color="primary" classNames={{ item: "hover:bg-zinc-700 bg-zinc-900 text-white", next: "hover:bg-zinc-700 bg-zinc-900 text-white", prev: "hover:bg-zinc-500 bg-zinc-900 text-white" }} />
                    </ul>

                </div>
            </section>
            {selectedSurvey && (
                <ShareModal 
                    isOpen={isOpen} 
                    onOpenChange={onOpenChange} 
                    survey={selectedSurvey}
                />
            )}
        </main>
    )
}

const Menu = ({ survey, deleteSurvey, isOwner, onShare }: IMenu & { isOwner: boolean, onShare: () => void }) => {
    const { push } = useRouter();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const duplicateSurvey = async () => {
        const newSurvey = { ...survey };
        delete (newSurvey as any)._id;
    }

    const editSurvey = () => {
        dispatch(saveSurveyId(survey._id as string));
        dispatch(save(survey));
        push(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}admin/survey/edit/${survey._id}`);
    }

    return survey.status === 'draft' ?
        <div className="flex gap-5 flex-col py-5 px-4">
            <Button className="dark:bg-zinc-800 bg-zinc-800 dark:text-black text-white" onClick={editSurvey}><MdEdit size={20} className="dark:text-black text-white" />{t('admin.dashboard.edit')}</Button>
            <Button className="dark:bg-white bg-zinc-800 dark:text-black text-white" onClick={duplicateSurvey}><MdContentCopy size={20} className="dark:text-black text-white" />{t('admin.dashboard.duplicate')}</Button>
            <Button className="dark:bg-white bg-zinc-800 dark:text-black text-white" onClick={() => deleteSurvey(survey._id as string)}><MdDelete size={20} className="dark:text-black text-white" />{t('admin.dashboard.delete')}</Button>
        </div>
        :
        <div className="flex gap-5 flex-col">
            <Button className="dark:bg-zinc-800 bg-zinc-800 dark:text-white text-white" onClick={() => push(`/admin/survey/${survey._id}/respondents`)}><MdPeople size={20} className="dark:text-white" /> {t('admin.dashboard.view_respondents')}</Button>
            <Button className="dark:bg-zinc-800 bg-zinc-800 dark:text-white text-white" onClick={() => push(`/results?id=${survey._id}`)}><MdInsights size={20} className="dark:text-white" /> {t('admin.dashboard.results')}</Button>
            {isOwner && (
                <>
                    <Button className="dark:bg-zinc-800 bg-zinc-800 dark:text-white text-white" onClick={onShare}><MdShare size={20} className="dark:text-white" /> Compartilhar</Button>
                    <Button className="dark:bg-zinc-800 bg-zinc-800 dark:text-white text-white" onClick={() => deleteSurvey(survey._id as string)}>{t('admin.dashboard.delete')}</Button>
                </>
            )}
        </div>
}

interface IShareModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    survey: ISurveyDocument;
}

const ShareModal = ({ isOpen, onOpenChange, survey }: IShareModalProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && survey._id) {
            fetchSharedUsers();
        }
    }, [isOpen, survey._id]);

    const fetchSharedUsers = async () => {
        try {
            const response = await api.get(`/admin/survey/share?id=${survey._id}`);
            setSelectedUsers(response.data.map((u: any) => u._id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (term.length < 2) {
            setUsers([]);
            return;
        }
        setLoading(true);
        try {
            const response = await api.get(`/admin/users?role=admin&search=${term}`);
            setUsers(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (userId: string) => {
        setSelectedUsers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post(`/admin/survey/share?id=${survey._id}`, { userIds: selectedUsers });
            toast.success("Compartilhamento atualizado!");
            onOpenChange();
        } catch (error) {
            toast.error("Erro ao compartilhar survey");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 dark:text-white">
                            Compartilhar Questionário
                            <span className="text-sm font-normal text-zinc-500">{survey.title}</span>
                        </ModalHeader>
                        <ModalBody>
                            <Input
                                label="Buscar administradores"
                                placeholder="Nome ou e-mail..."
                                value={searchTerm}
                                onValueChange={handleSearch}
                                endContent={loading && <Spinner size="sm" />}
                            />
                            <div className="mt-4 flex flex-col gap-2 max-h-60 overflow-y-auto">
                                {users.length > 0 ? (
                                    users.map(user => (
                                        <div key={user._id} className="flex items-center justify-between p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                            <div>
                                                <p className="font-medium dark:text-white">{user.name}</p>
                                                <p className="text-xs text-zinc-500">{user.email}</p>
                                            </div>
                                            <Checkbox 
                                                isSelected={selectedUsers.includes(user._id)} 
                                                onValueChange={() => toggleUser(user._id)}
                                            />
                                        </div>
                                    ))
                                ) : searchTerm.length >= 2 ? (
                                    <p className="text-center text-sm text-zinc-500">Nenhum administrador encontrado.</p>
                                ) : (
                                    <p className="text-center text-sm text-zinc-500">Busque por outros admins para compartilhar.</p>
                                )}
                            </div>
                            
                            {selectedUsers.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs font-bold uppercase text-zinc-500 mb-2">Compartilhado com {selectedUsers.length} admin(s)</p>
                                    {/* Lista resumida de quem já está selecionado/compartilhado */}
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>Cancelar</Button>
                            <Button className="bg-zinc-900 text-white" onPress={handleSave} isLoading={saving}>
                                Salvar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

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

    const surveys = await Survey.find({
        $or: [
            { author: session?.user._id as string },
            { sharedWith: session?.user._id as string }
        ]
    }).sort({ updatedAt: -1 }) || [];

    return {
        props: {
            surveys: JSON.parse(JSON.stringify(surveys)),
            userId: session?.user._id as string
        }
    }
}

Dashboard.auth = {
    role: 'admin',
    verified: true,
    unauthorized: '/user/dashboard'
};