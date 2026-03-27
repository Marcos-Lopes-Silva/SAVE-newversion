import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React, { useMemo, useState } from "react";
import { t } from "i18next";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
  Card,
  CardBody,
  Divider,
  Badge
} from "@nextui-org/react";
import { MdGroups, MdPersonAdd, MdFileUpload } from "react-icons/md";
import { ImportModal } from "../Modal";
import SearchBar from "@/components/layout/SearchBar";
import { ParticipantsTable } from "./ParticipantsTable";

interface ICreateUserData {
  name: string;
  email: string;
  cpf?: string;
}

interface Props {
  search: string;
  setSearch: (value: string) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  handleBackStep: () => void;
  handleNextStep: (users: ICreateUserData[]) => void;
  setUserData: React.Dispatch<React.SetStateAction<ICreateUserData[]>>;
  users: ICreateUserData[];
}

const registerUserSchema = z.object({
  name: z.string().min(4).max(120),
  email: z.string().email().min(4).max(120),
  cpf: z.string().optional().refine(val => !val || /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(val), {
    message: "CPF inválido"
  }),
});

export const UserRegistration = ({
  search,
  setSearch,
  isModalOpen,
  openModal,
  closeModal,
  handleBackStep,
  handleNextStep,
  setUserData,
  users,
}: Props) => {
  const [showValidation, setShowValidation] = useState(false);
  const [editingUserIndex, setEditingUserIndex] = useState<number | null>(null);

  const filteredItems = useMemo(() => {
    if (!search) return users;
    return users.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, users]);

  const registerUserForm = useForm<ICreateUserData>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      name: "",
      email: "",
      cpf: ""
    }
  });

  const editUserForm = useForm<ICreateUserData>({
    resolver: zodResolver(registerUserSchema),
  });

  const createUser = (data: ICreateUserData) => {
    const updatedUsers = [...users, data];
    setUserData(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    registerUserForm.reset({
      name: "",
      email: "",
      cpf: ""
    });
  };

  const handleImportData = (data: any[]) => {
    setUserData((prevUsers) => {
      const newUsers = [...prevUsers, ...data];
      localStorage.setItem("users", JSON.stringify(newUsers));
      return newUsers;
    });
  };

  const handleEditUser = (index: number) => {
    setEditingUserIndex(index);
    editUserForm.reset(users[index]);
  };

  const handleSaveUser = (data: ICreateUserData) => {
    if (editingUserIndex !== null) {
      setUserData((prevUsers) => {
        const updatedUsers = [...prevUsers];
        updatedUsers[editingUserIndex] = data;
        localStorage.setItem("users", JSON.stringify(updatedUsers));
        return updatedUsers;
      });
      setEditingUserIndex(null);
    }
  };

  const handleDeleteUser = (index: number) => {
    const userToDelete = filteredItems[index];
    setUserData((prevUsers) => {
      const updatedUsers = prevUsers.filter((user) => user !== userToDelete);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header section style like dashboard but within the step */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-white">{t("admin.create.second_section.title")}</h2>
        <div className="w-16 h-1 bg-zinc-800 dark:bg-white rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Form */}
        <div className="lg:col-span-5">
          <Card shadow="sm" className="p-4 border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
            <CardBody className="gap-4">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2 dark:text-white">
                <MdPersonAdd /> {t("admin.create.second_section.add_participants")}
              </h3>
              <FormProvider {...registerUserForm}>
                <form onSubmit={registerUserForm.handleSubmit(createUser)} className="flex flex-col gap-4">
                  <Input
                    label={t("admin.create.second_section.name")}
                    placeholder="Nome completo"
                    variant="bordered"
                    {...registerUserForm.register("name")}
                    isInvalid={!!registerUserForm.formState.errors.name}
                    errorMessage={registerUserForm.formState.errors.name?.message}
                    classNames={{
                      label: "dark:text-zinc-400",
                      input: "dark:text-white"
                    }}
                  />
                  <Input
                    type="email"
                    label={t("admin.create.second_section.email")}
                    placeholder="exemplo@email.com"
                    variant="bordered"
                    {...registerUserForm.register("email")}
                    isInvalid={!!registerUserForm.formState.errors.email}
                    errorMessage={registerUserForm.formState.errors.email?.message}
                    classNames={{
                      label: "dark:text-zinc-400",
                      input: "dark:text-white"
                    }}
                  />
                  <Input
                    label={t("admin.create.second_section.cpf")}
                    placeholder="000.000.000-00"
                    variant="bordered"
                    {...registerUserForm.register("cpf")}
                    isInvalid={!!registerUserForm.formState.errors.cpf}
                    errorMessage={registerUserForm.formState.errors.cpf?.message}
                    classNames={{
                      label: "dark:text-zinc-400",
                      input: "dark:text-white"
                    }}
                  />

                  <Button
                    type="submit"
                    color="primary"
                    className="mt-2 font-bold"
                    startContent={<MdPersonAdd size={20} />}
                  >
                    {t("admin.create.second_section.add_participants")}
                  </Button>
                </form>
              </FormProvider>
            </CardBody>
          </Card>
        </div>

        {/* Right Side: List and Import */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg dark:text-white">{t("admin.create.second_section.participants_list")}</h3>
              <Badge color="primary" content={users.length} variant="flat" size="lg">
                <div className="p-1 dark:text-white"><MdGroups size={24} /></div>
              </Badge>
            </div>
            <Button
              variant="flat"
              color="primary"
              onPress={openModal}
              startContent={<MdFileUpload size={20} />}
            >
              {t("admin.create.second_section.import_participants")}
            </Button>
          </div>

          <SearchBar
            iconSize={18}
            placeholder={t("admin.groups.body.searchbar_placeholder")}
            setSearch={setSearch}
            search={search}
            className="w-full shadow-sm"
          />

          <ParticipantsTable
            participants={filteredItems}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </div>
      </div>

      <Divider className="my-4 dark:bg-zinc-800" />

      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <Button variant="bordered" onPress={handleBackStep} className="px-10 dark:text-white dark:border-zinc-600">
          {t("admin.create.section.return")}
        </Button>
        <Button color="primary" onPress={() => handleNextStep(users)} className="px-10 font-bold">
          {t("admin.create.section.continue")}
        </Button>
      </div>

      <ImportModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onImportData={handleImportData}
      />

      {/* Edit User Modal */}
      <Modal
        isOpen={editingUserIndex !== null}
        onOpenChange={() => setEditingUserIndex(null)}
        size="lg"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Editar Participante</ModalHeader>
          <ModalBody>
            <FormProvider {...editUserForm}>
              <form onSubmit={editUserForm.handleSubmit(handleSaveUser)} className="flex flex-col gap-4 py-4">
                <Input
                  label={t("admin.create.second_section.name")}
                  variant="bordered"
                  {...editUserForm.register("name")}
                  isInvalid={!!editUserForm.formState.errors.name}
                  errorMessage={editUserForm.formState.errors.name?.message}
                />
                <Input
                  type="email"
                  label={t("admin.create.second_section.email")}
                  variant="bordered"
                  {...editUserForm.register("email")}
                  isInvalid={!!editUserForm.formState.errors.email}
                  errorMessage={editUserForm.formState.errors.email?.message}
                />
                <Input
                  label={t("admin.create.second_section.cpf")}
                  variant="bordered"
                  {...editUserForm.register("cpf")}
                  isInvalid={!!editUserForm.formState.errors.cpf}
                  errorMessage={editUserForm.formState.errors.cpf?.message}
                />
                <ModalFooter className="px-0 pt-6">
                  <Button variant="light" onPress={() => setEditingUserIndex(null)}>
                    Cancelar
                  </Button>
                  <Button color="primary" type="submit">
                    Salvar Alterações
                  </Button>
                </ModalFooter>
              </form>
            </FormProvider>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
