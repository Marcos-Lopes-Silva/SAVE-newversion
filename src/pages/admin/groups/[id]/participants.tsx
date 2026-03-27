"use client";

import SearchBar from "@/components/layout/SearchBar";
import { useEffect, useMemo, useState } from "react";
import { FaUserPlus, FaPen } from "react-icons/fa";
import { IoMdTrash } from "react-icons/io";
import { MdGroups } from "react-icons/md";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Input,
    Pagination
} from "@nextui-org/react";
import { IGroup, IUsers } from "../../../../../models/groupModel";

const PageSize = 5;

export default function GroupUsers({ id, group }: { id: string; group: IGroup }) {
    const [users, setUsers] = useState<IUsers[]>([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteChange } = useDisclosure();
    const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddChange } = useDisclosure();

    const [editingUser, setEditingUser] = useState<IUsers | null>(null);
    const [groupState, setGroupState] = useState<IGroup>(group);

    // 🔥 CENTRAL FETCH
    const fetchGroup = async () => {
        const response = await api.get<IGroup>(`/group/${id}`);
        setGroupState(response);
        setUsers(response.members);
    };

    useEffect(() => {
        fetchGroup();
    }, []);

    const filteredList = useMemo(() => {
        return users.filter((user) =>
            user.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

    const paginatedList = useMemo(() => {
        const first = (currentPage - 1) * PageSize;
        return filteredList.slice(first, first + PageSize);
    }, [filteredList, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    // ================= ACTIONS =================

    const handleEdit = (user: IUsers) => {
        setEditingUser(user);
        onOpen();
    };

    const handleDelete = (user: IUsers) => {
        setEditingUser(user);
        onDeleteOpen();
    };

    const confirmDelete = async () => {
        const updatedMembers = groupState.members.filter(
            (u) => u.email !== editingUser?.email
        );

        await api.patch(`/group/${id}`, {
            ...groupState,
            members: updatedMembers,
        });

        await fetchGroup();
        onDeleteChange();
    };

    const handleSaveUser = async () => {
        const updatedMembers = groupState.members.map((u) =>
            u.email === editingUser?.email ? editingUser : u
        );

        await api.patch(`/group/${id}`, {
            ...groupState,
            members: updatedMembers,
        });

        await fetchGroup();
        onOpenChange();
    };

    const handleAdd = async (data: IUsers) => {
        const cleanCpf = data?.cpf?.replace(/\D/g, '');
        data.cpf = cleanCpf;
        const updatedMembers = [...groupState.members, data];

        await api.patch(`/group/${id}`, {
            ...groupState,
            members: updatedMembers,
        });

        await fetchGroup();
    };

    // ================= UI =================

    return (
        <main className="flex flex-col px-40 py-14">
            {/* HEADER */}
            <header className="flex flex-col rounded-xl shadow-2xl bg-zinc-200 dark:bg-zinc-900 px-40 py-16">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MdGroups className="size-6" />
                        <h1 className="text-2xl font-medium dark:text-white">
                            Participantes do Grupo
                        </h1>
                    </div>
                    <AiOutlineExclamationCircle className="size-6 text-zinc-500" />
                </div>

                <p className="mt-4 dark:text-white">
                    Gerencie os usuários deste grupo.
                </p>
            </header>

            {/* CONTEÚDO */}
            <section className="flex py-20 w-full items-end flex-col px-24">
                <div className="w-full flex justify-between mb-6">
                    <button
                        onClick={onAddOpen}
                        className="flex items-center gap-2 bg-zinc-800 text-white px-6 py-2 rounded-lg hover:bg-zinc-700"
                    >
                        <FaUserPlus />
                        Adicionar
                    </button>

                    <span>{filteredList.length} usuários</span>
                </div>

                <SearchBar
                    iconSize={18}
                    placeholder="Pesquisar"
                    setSearch={setSearch}
                    search={search}
                    className="w-full mb-8"
                />

                {/* LISTA */}
                <div className="w-full flex flex-col items-center gap-5">
                    {paginatedList.map((user) => (
                        <div
                            key={user.email}
                            className="flex justify-between w-11/12 bg-white dark:bg-zinc-800 shadow-2xl rounded-3xl p-6"
                        >
                            <div>
                                <h1 className="font-semibold">{user.name}</h1>
                                <p className="text-sm text-zinc-500">{user.email}</p>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => handleEdit(user)}>
                                    <FaPen />
                                </button>
                                <button onClick={() => handleDelete(user)}>
                                    <IoMdTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* PAGINAÇÃO */}
                <Pagination
                    total={Math.ceil(filteredList.length / PageSize)}
                    page={currentPage}
                    onChange={(page) => setCurrentPage(page)}
                    showControls
                    loop
                    className="self-center pt-14"
                    color="primary"
                    classNames={{
                        item: "hover:bg-zinc-700 bg-zinc-900 text-white",
                        next: "hover:bg-zinc-700 bg-zinc-900 text-white",
                        prev: "hover:bg-zinc-500 bg-zinc-900 text-white"
                    }}
                />
            </section>

            <EditModal {...{ isOpen, onOpenChange, editingUser, setEditingUser, handleSaveUser }} />
            <DeleteModal {...{ isDeleteOpen, onDeleteChange, confirmDelete, editingUser }} />
            <AddModal {...{ isAddOpen, onAddChange, handleAdd }} />
        </main>
    );
}

export async function getServerSideProps(context: { params: { id: string } }) {
    const { id } = context.params;

    const group = await fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}api/group/${id}`).then(res => res.json());

    return {
        props: {
            id,
            group
        }
    }
}


const DeleteModal = ({ isDeleteOpen, onDeleteChange, confirmDelete, editingUser }: { isDeleteOpen: boolean; onDeleteChange: () => void; confirmDelete: () => void; editingUser: any }) => {

    return (

        <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteChange}>
            <ModalContent>
                <>
                    <ModalHeader>Confirmar exclusão</ModalHeader>
                    <ModalBody>
                        <p>
                            Tem certeza que deseja remover{" "}
                            <strong>{editingUser?.name}</strong> do grupo?
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <button
                            className="px-4 py-2 rounded-lg bg-zinc-300"
                            onClick={onDeleteChange}
                        >
                            Cancelar
                        </button>
                        <button
                            className="px-4 py-2 rounded-lg bg-red-600 text-white"
                            onClick={confirmDelete}
                        >
                            Excluir
                        </button>
                    </ModalFooter>
                </>
            </ModalContent>
        </Modal>
    )
}

const EditModal = ({ isOpen, onOpenChange, editingUser, setEditingUser, handleSaveUser }: { isOpen: boolean; onOpenChange: () => void; editingUser: any; setEditingUser: any; handleSaveUser: () => void }) => {

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                <>
                    <ModalHeader>Editar participante</ModalHeader>
                    <ModalBody>
                        <Input
                            label="Nome"
                            value={editingUser?.name || ""}
                            onChange={(e) =>
                                setEditingUser({ ...editingUser!, name: e.target.value })
                            }
                        />
                        <Input
                            label="Email"
                            value={editingUser?.email || ""}
                            onChange={(e) =>
                                setEditingUser({ ...editingUser!, email: e.target.value })
                            }
                        />
                        <div>
                            <p className="text-xs opacity-40 text-muted-foreground">
                                Este é o email do participante. Ele será usado para contato e login.
                            </p>
                            <p className="text-xs opacity-40 text-muted-foreground">
                                Não é possível editar o CPF por questões de segurança.
                            </p>
                        </div>

                    </ModalBody>
                    <ModalFooter>
                        <button
                            className="px-4 py-2 rounded-lg hover:bg-zinc-200 bg-zinc-300"
                            onClick={onOpenChange}
                        >
                            Cancelar
                        </button>
                        <button
                            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white"
                            onClick={handleSaveUser}
                        >
                            Salvar
                        </button>
                    </ModalFooter>
                </>
            </ModalContent>
        </Modal>
    )
}

import { FormProvider, useForm } from "react-hook-form";
import Button from "@/components/layout/Button";
import { useTranslation } from "react-i18next";
import { Form } from "@/components/Form";
import { api } from "@/lib/api";

interface AddModalProps {
    isAddOpen: boolean;
    onAddChange: (open: boolean) => void;
    handleAdd: (data: any) => void;
    title?: string;
}

export const AddModal = ({
    isAddOpen,
    onAddChange,
    handleAdd,
    title = "Adicionar Participante",
}: AddModalProps) => {
    const { t } = useTranslation();

    const form = useForm({
        defaultValues: {
            name: "",
            email: "",
            cpf: ""
        }
    });

    const {
        control
    } = form;



    return (
        <Modal
            isOpen={isAddOpen}
            onOpenChange={onAddChange}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <h1 className="text-lg font-semibold">{title}</h1>
                        </ModalHeader>

                        <ModalBody>
                            <FormProvider {...form}>
                                <form
                                    onSubmit={form.handleSubmit((data: any) => {
                                        handleAdd(data);
                                        onClose();
                                        form.reset();
                                    })}
                                    className="flex flex-col gap-2"
                                >
                                    {/* NOME */}
                                    <Form.Field>
                                        <Form.Label htmlFor="name" className="px-1">
                                            {t("admin.create.second_section.name")}
                                        </Form.Label>
                                        <Form.Input
                                            type="text"
                                            id="name"
                                            className="mb-2"
                                            {...form.register("name")}
                                        />
                                        <Form.ErrorMessage field="name" />
                                    </Form.Field>

                                    {/* EMAIL */}
                                    <Form.Field>
                                        <Form.Label htmlFor="email" className="px-1">
                                            {t("admin.create.second_section.email")}
                                        </Form.Label>
                                        <Form.Input
                                            type="email"
                                            id="email"
                                            className="mb-2"
                                            {...form.register("email")}
                                        />
                                        <Form.ErrorMessage field="email" />
                                    </Form.Field>

                                    {/* CPF */}
                                    <Form.Field>
                                        <Form.Label htmlFor="cpf" className="px-1">
                                            {t("admin.create.second_section.cpf")}
                                        </Form.Label>
                                        <Form.MaskedInput
                                            mask="999.999.999-99"
                                            maskChar=""
                                            control={control}
                                            className="mb-4"
                                            name="cpf"
                                        />
                                        <Form.ErrorMessage field="cpf" />
                                    </Form.Field>

                                    {/* BOTÕES */}
                                    <ModalFooter className="px-0">
                                        <div className="flex justify-between w-full">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => {
                                                    onClose();
                                                    form.reset();
                                                }}
                                            >
                                                Cancelar
                                            </Button>

                                            <Button type="submit" variant="primary">
                                                {t("admin.create.second_section.add_participants")}
                                            </Button>
                                        </div>
                                    </ModalFooter>
                                </form>
                            </FormProvider>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};