import Button from "@/components/layout/Button";
import SearchBar from "@/components/layout/SearchBar";
import { t } from "i18next";
import Survey, { ISurveyDocument } from "../../../../models/surveyModel";
import { useEffect, useMemo, useState } from "react";
import { MdGroups, MdOutlineFilterNone, MdOutlineRemoveRedEye } from "react-icons/md";
import { MdGroup } from "react-icons/md";
import { FaClipboardList, FaPen } from "react-icons/fa";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { IGroupDocument } from "../../../../models/groupModel";
import { api } from "@/lib/api";
import Item from "@/components/Item";
import { Menu, Pagination } from "@nextui-org/react";
import { useRouter } from "next/router";
import { IoMdTrash } from "react-icons/io";

export default function Groups(survey: ISurveyDocument[]) {
    const { push } = useRouter();
    const [search, setSearch] = useState<string>("");
    const [groups, setGroups] = useState<IGroupDocument[]>([]);
    async function handleGroupsData() {
        const response = await api.get<IGroupDocument[]>('group');
        console.log(response);
        setGroups(response);
    }

    const PageSize = 5;

    const [currentPage, setCurrentPage] = useState<number>(1);

    const onPageChange = (page: number) => setCurrentPage(page);

    const Menu = ({ group }: { group: IGroupDocument }) => {
        const duplicateGroup = async () => {
            const newGroup = { ...group };
            delete newGroup._id;
        }

        const showParticipants = () => {
            push(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}admin/groups/${group._id}/participants`);
        }

        const editGroup = () => {
            push(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}admin/groups/create/${group._id}`);
        }

        return (
            <div className="flex gap-1 font-bold flex-col text-tiny items-start">
                <div className="flex bg-opacity-hover items-center gap-1">
                    <MdOutlineRemoveRedEye className="size-4 dark:text-white" />
                    <Button className="py-1 dark:text-white" variant="tertiary" onClick={showParticipants}>{t('admin.groups.dropdown.view_participants')}</Button>
                </div>
                <div className="flex items-center gap-1">
                    <FaPen className="size-3 dark:text-white" />
                    <Button className="px-1 py-1 pr-24 dark:text-white" variant="tertiary" onClick={editGroup}>{t('admin.groups.dropdown.edit')}</Button>
                </div>
                <div className="flex items-center gap-1">
                    <MdOutlineFilterNone className="size-3 dark:text-white" />
                    <Button className="px-1 py-1 pr-20 dark:text-white" variant="tertiary" onClick={duplicateGroup}>{t('admin.groups.dropdown.duplicate')}</Button>
                </div>
                <div className="flex items-center gap-1">
                    <IoMdTrash className="size-4 dark:text-white" />
                    <Button className="px-1 py-1 pr-24 dark:text-white" variant="tertiary" onClick={() => deleteGroup(group._id as string)}>{t('admin.groups.dropdown.delete')}</Button>
                </div>
            </div>
        )
    }

    const deleteGroup = async (id: string) => {
        await api.delete(`group/${id}`);
        handleGroupsData();
    }

    interface IMenu extends IAux {
        deleteGroup: (id: string) => void
    }
    interface IAux {
        group: IGroupDocument,
    }

    useEffect(() => {
        handleGroupsData();
        console.log(groups);
    }, []);

    const filteredList = useMemo(() => {
        return groups.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [groups, search]);

    const paginatedList = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * PageSize;
        const lastPageIndex = firstPageIndex + PageSize;
        return filteredList.slice(firstPageIndex, lastPageIndex);
    }, [filteredList, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    return (
        <main className="flex flex-col px-40 py-14">
            {/* HEADER PADRÃO */}
            <header className="flex flex-col rounded-xl shadow-2xl bg-zinc-200 dark:bg-zinc-900 px-40 py-16">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-medium dark:text-white">
                            {t('admin.groups.header.title')}
                        </h1>
                    </div>
                    <AiOutlineExclamationCircle className="size-6 text-zinc-500" />
                </div>

                <p className="mt-4 dark:text-white">
                    {t('admin.groups.header.description')}
                </p>

                <div className="mt-4 flex flex-col gap-1">
                    <div className="rounded-2xl bg-zinc-600 dark:bg-zinc-700 w-24 h-3" />
                    <div className="ml-4 rounded-2xl bg-zinc-300 w-24 h-3" />
                </div>
            </header>

            {/* CONTEÚDO */}
            <section className="flex py-20 w-full items-end flex-col px-24">
                {/* AÇÕES */}
                <div className="w-full flex justify-between items-center mb-6">
                    <button
                        onClick={() => push('/admin/groups/create')}
                        className="bg-zinc-800 text-white px-6 py-2 rounded-lg hover:bg-zinc-700 transition"
                    >
                        {t('admin.groups.placeholder.button_text')}
                    </button>

                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                        <span className="font-semibold">{filteredList.length}</span>
                        <MdGroups className="size-6" />
                    </div>
                </div>

                {/* SEARCH */}
                <SearchBar
                    placeholder={t('admin.groups.body.searchbar_placeholder')}
                    setSearch={setSearch}
                    search={search}
                    iconSize={20}
                    className="w-full mt-1 shadow-lg mb-8"
                />

                {/* LISTA */}
                <div className="w-full flex flex-col items-center gap-5">
                    {paginatedList.length === 0 ? (
                        <div className="text-zinc-500 dark:text-zinc-300">
                            Nenhum grupo encontrado
                        </div>
                    ) : (
                        paginatedList.map((group, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center w-11/12 bg-white dark:bg-zinc-800 shadow-2xl rounded-3xl p-6"
                            >
                                {/* ESQUERDA */}
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-zinc-800 text-white">
                                        <MdGroup size={20} />
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="font-semibold text-lg dark:text-white">
                                            {group.name}
                                        </span>
                                        <span className="text-sm text-zinc-500">
                                            ID: {group._id as string}
                                        </span>
                                    </div>
                                </div>

                                {/* DIREITA */}
                                <div className="flex items-center">
                                    <Item<IGroupDocument>
                                        icon={null}
                                        menu={
                                            <Menu group={group} />
                                        }
                                        item={group}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                    <div className="flex justify-center mt-10">
                        <Pagination
                            total={Math.ceil(filteredList.length / PageSize)}
                            page={currentPage}
                            onChange={onPageChange}
                            showControls
                            loop
                            color="primary"
                            classNames={{
                                item: "hover:bg-zinc-700 bg-zinc-900 text-white",
                                next: "hover:bg-zinc-700 bg-zinc-900 text-white",
                                prev: "hover:bg-zinc-500 bg-zinc-900 text-white"
                            }}
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}

Groups.auth = {
    role: 'admin',
    verified: true,
    unauthorized: '/'
}