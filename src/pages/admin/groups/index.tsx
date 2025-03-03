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
import { Menu } from "@nextui-org/react";
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

    const filteredList = useMemo(() => {
        return groups.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    }, [groups, search])


    const Menu = ({ group }: { group: IGroupDocument }) => {
        const duplicateGroup = async () => {
            const newGroup = { ...group };
            delete newGroup._id;
        }

        const showParticipants = () => {

        }

        const editGroup = () => {
            push(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}admin/groups/create/${group._id}`);
        }

        return (
            <div className="flex gap-1 font-bold flex-col text-tiny items-start">
                <div className="flex items-center gap-1">
                    <MdOutlineRemoveRedEye className="size-4" />
                    <Button className="py-2" variant="tertiary" onClick={showParticipants}>{t('admin.groups.dropdown.view_participants')}</Button>
                </div>
                <div className="flex items-center gap-1">
                    <FaPen className="size-3" />
                    <Button className="px-1 py-1 pr-24" variant="tertiary" onClick={editGroup}>{t('admin.groups.dropdown.edit')}</Button>
                </div>
                <div className="flex items-center gap-1">
                    <MdOutlineFilterNone className="size-3" />
                    <Button className="px-1 py-1 pr-20" variant="tertiary" onClick={duplicateGroup}>{t('admin.groups.dropdown.duplicate')}</Button>
                </div>
                <div className="flex items-center gap-1">
                    <IoMdTrash />
                    <Button className="px-1 py-1 pr-24" variant="tertiary" onClick={() => deleteGroup(group._id as string)}>{t('admin.groups.dropdown.delete')}</Button>
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
    }, [])
    return (
        <main>
            <header className="px-28 py-20">
                <div className="bg-slate-300 px-14 py-6 rounded-t-2xl shadow-2xl mb-1 flex items-center justify-between">
                    <div className="flex items-center">
                        <FaClipboardList className="size-6 mr-1" />
                        <h1 className="font-bold">{t('admin.groups.header.title')}</h1>
                    </div>
                    <AiOutlineExclamationCircle className="size-6" />
                </div>
                <div className="shadow-xl bg-gray-50 px-14 py-6 rounded-b-2xl">
                    <h1 className="font-bold">{t('admin.groups.header.description')}</h1>
                </div>
            </header>
            <section className="px-28 mr-72">
                <Button onClick={() => window.location.href = '/admin/groups/create'}>{t('admin.groups.placeholder.button_text')}</Button>
                <div className="border-b-2 border-zinc-800 font-bold flex items-center justify-between">
                    <h1 className="px-2 py-2">{t('admin.groups.body.text')}</h1>
                    <div className="flex justify-center items-center gap-2">
                        <h1>{filteredList.length}</h1>
                        <MdGroups className="size-6" />
                    </div>
                </div>
                <div className="py-2">
                    <SearchBar placeholder={t('admin.groups.body.searchbar_placeholder')}
                        setSearch={setSearch}
                        search={search}
                        iconSize={25}
                        className="w-full mt-1 shadow-lg"></SearchBar>
                </div>
                <ul>
                    {filteredList.map((group, index) => (
                        <li key={index} className="bg-slate-300 font-bold mb-1 gap-2 py-4 px-2 rounded-lg shadow-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <MdGroup className="rounded-full border-4 size-8 border-black bg-black text-white" />
                                    {group.name}
                                </div>
                                <div className="flex items-center">
                                    <Item<IGroupDocument>
                                        icon={null}
                                        menu={
                                            <div className="">
                                                <Menu group={group} />
                                            </div>
                                        }
                                        key={index} className="" item={group} />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    )
}

Groups.auth = {
    role: 'admin',
    verified: true,
    unauthorized: '/'
}