import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React, { useEffect, useMemo, useState } from "react";
import { t } from "i18next";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import Button from "@/components/layout/Button";
import { MdGroups } from "react-icons/md";
import { ImportModal } from "../Modal";
import SearchBar from "@/components/layout/SearchBar";
import { Form } from "@/components/Form";
import { CiMail } from "react-icons/ci";
import { FaPen, FaRegTrashAlt } from "react-icons/fa";

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
  file: File | null;
  progress: number;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBackStep: () => void;
  handleNextStep: () => void;
  setUserData: React.Dispatch<React.SetStateAction<ICreateUserData[]>>;
}

const registerUserSchema = z.object({
  name: z.string().min(4).max(120),
  email: z.string().email().min(4).max(120),
  cpf: z.string().max(11).regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/).optional(),
});

export const UserRegistration = ({
  search,
  setSearch,
  isModalOpen,
  openModal,
  closeModal,
  file,
  progress,
  handleFileChange,
  handleBackStep,
  handleNextStep,
}: Props) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [filterValue, setFilterValue] = useState<string>("");
  const [users, setUsers] = useState<ICreateUserData[]>(JSON.parse(localStorage.getItem("users") || "[]"));
  const [userData, setUserData] = useState<ICreateUserData[]>([]);
  const [editingUserIndex, setEditingUserIndex] = useState<number | null>(null);
  const [modalData, setModalData] = useState<ICreateUserData | null>(null);

  const filteredItems = useMemo(() => {
    if (!filterValue) return users;
    return users.filter((user) =>
      user.name.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [filterValue, users]);

  useEffect(() => {
    setFilterValue(search);
  }, [search]);

  const registerUserForm = useForm<ICreateUserData>({
    resolver: zodResolver(registerUserSchema),
  });

  const { handleSubmit } = registerUserForm;

  function createUser(data: ICreateUserData) {
    setUsers((prevUsers) => {
      const updatedUsers = [...prevUsers, data];
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  }
  
  useEffect(() => {
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  const sendUserData = () => {
    setUserData(users);
    console.log(users);
    localStorage.setItem("users", JSON.stringify(users));
    handleNextStep();
  };

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target;
    if (checked) {
      setSelectedOptions([...selectedOptions, id]);
    } else {
      setSelectedOptions(selectedOptions.filter((option) => option !== id));
    }
  };

  const handleImportData = (data: any[]) => {
    const formattedData: ICreateUserData[] = data.map((user: any) => ({
      name: user.name,
      email: user.email,
      cpf: user.cpf ? user.cpf : undefined,
    }));
    setUsers((prevUsers) => [...prevUsers, ...formattedData]);
  };

  const handleEditUser = (index: number) => {
    setEditingUserIndex(index);
    setModalData(users[index]);
  };

  const handleSaveUser = (data: ICreateUserData) => {
    if (editingUserIndex !== null) {
      setUsers((prevUsers) => {
        const updatedUsers = [...prevUsers];
        updatedUsers[editingUserIndex] = data;
        return updatedUsers;
      });
      setEditingUserIndex(null);
      setModalData(null);
    }
  };

  const handleDeleteUser = (index: number) => {
    const userToDelete = filteredItems[index];
    setUsers((prevUsers) => prevUsers.filter((user) => user !== userToDelete));
  };

  return (
    <>
      <div className="px-6 py-6">
        <h1>{t("admin.create.second_section.title")}</h1>
        <div className="py-6">
          <div className="border-2 p-6 rounded-lg shadow-md">
            <FormProvider {...registerUserForm}>
              <form onSubmit={handleSubmit(createUser)}>
                <div>
                  <Form.Field>
                    <Form.Label htmlFor="name" className="px-1">
                      {t("admin.create.second_section.name")}
                    </Form.Label>
                    <Form.Input
                      type="text"
                      id="name"
                      className="px-0 mb-4"
                      placeholder="Nome do participante"
                      {...registerUserForm.register("name")}
                    />
                    <Form.ErrorMessage field="name" />
                  </Form.Field>
                </div>
                <div className="py-2">
                  <Form.Field>
                    <Form.Label htmlFor="email" className="px-1 py-2">
                      {t("admin.create.second_section.email")}
                    </Form.Label>
                    <Form.Input
                      type="email"
                      id="email"
                      className="px-0 mb-6"
                      placeholder="Email do participante"
                      {...registerUserForm.register("email")}
                    />
                    <Form.ErrorMessage field="email" />
                  </Form.Field>
                </div>
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setShowOptions(!showOptions)}
                  >
                    {t("admin.create.second_section.add_validation")}
                  </Button>
                  <Button type="submit" variant="primary">
                    {t("admin.create.second_section.add_participants")}
                  </Button>
                </div>

                {showOptions && (
                  <div className="flex items-center py-4 px-1">
                    <Form.Field>
                      <Form.Label htmlFor="cpf">
                        <Form.Input
                          type="checkbox"
                          name="cpf"
                          onChange={handleOptionChange}
                        />
                        {t("admin.create.second_section.cpf")}
                      </Form.Label>
                    </Form.Field>
                  </div>
                )}

                {selectedOptions.includes("cpf") && (
                  <div className="px-1">
                    <Form.Field>
                      <Form.Label htmlFor="cpf" className="px-1">
                        {t("admin.create.second_section.cpf")}
                      </Form.Label>
                      <Form.Input
                        id="cpf"
                        className="px-0 mb-6"
                        placeholder="CPF do participante"
                        {...registerUserForm.register("cpf")}
                      />
                      <Form.ErrorMessage field="cpf" />
                    </Form.Field>
                  </div>
                )}
              </form>
            </FormProvider>
          </div>
        </div>

        <div className="py-2 mb-2">
          <h1 className="mb-2">
            {t("admin.create.second_section.participants_list")}
          </h1>
          <Button variant="primary" onClick={openModal}>
            {t("admin.create.second_section.import_participants")}
          </Button>
          <ImportModal
            isOpen={isModalOpen}
            onClose={closeModal}
            file={file}
            progress={progress}
            onFileChange={handleFileChange}
            onImportData={handleImportData}
          />
        </div>

        <div className="border-b-2 border-zinc-800 font-bold flex items-center justify-between">
          <h1 className="px-2 py-2">
            {t("admin.create.second_section.added_participants")}
          </h1>
          <div className="flex justify-center items-center gap-2">
            <h1>{filteredItems.length}</h1>
            <MdGroups className="size-6" />
          </div>
        </div>

        <SearchBar
          placeholder={t("admin.groups.body.searchbar_placeholder")}
          setSearch={setSearch}
          search={search}
          iconSize={25}
          className="w-full mt-1 shadow-lg"
        ></SearchBar>

        <div className="flex">
          <Table aria-label="ParticipantsTable" className="mt-4">
            <TableHeader>
              <TableColumn className="text-left text-black">
                {t("admin.create.second_section.name")}
              </TableColumn>
              <TableColumn className="text-left flex items-center gap-2 text-black">
                <CiMail size={16} color="black" />
                {t("admin.create.second_section.email")}
              </TableColumn>
              <TableColumn className="text-black px-10">Options</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredItems.map((user, index) => (
                <TableRow key={index}>
                  <TableCell className="flex items-center mt-1 gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                    {user.name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="secondary" onClick={() => handleEditUser(index)}><FaPen/></Button>
                    <Button variant="secondary" onClick={() => handleDeleteUser(index)}><FaRegTrashAlt/></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center gap-2 mt-4">
        <Button onClick={handleBackStep}>
          {t("admin.create.section.return")}
        </Button>
        <Button onClick={handleSubmit(sendUserData)}>{t("admin.create.section.continue")}</Button>
      </div>
      </div>

      <Modal
        isOpen={editingUserIndex !== null}
        onOpenChange={() => {
          setEditingUserIndex(null);
          setModalData(null);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit user</ModalHeader>
              <ModalBody>
                <FormProvider {...registerUserForm}>
                  <form onSubmit={handleSubmit(handleSaveUser)}>
                    <div>
                      <Form.Field>
                        <Form.Label htmlFor="name" className="px-1">
                          {t("admin.create.second_section.name")}
                        </Form.Label>
                        <Form.Input
                          type="text"
                          id="name"
                          className="px-0 mb-4"
                          placeholder="Nome do participante"
                          {...registerUserForm.register("name")}
                          defaultValue={modalData?.name}
                        />
                        <Form.ErrorMessage field="name" />
                      </Form.Field>
                    </div>
                    <div className="py-2">
                      <Form.Field>
                        <Form.Label htmlFor="email" className="px-1 py-2">
                          {t("admin.create.second_section.email")}
                        </Form.Label>
                        <Form.Input
                          type="email"
                          id="email"
                          className="px-0 mb-6"
                          placeholder="Email do participante"
                          {...registerUserForm.register("email")}
                          defaultValue={modalData?.email}
                        />
                        <Form.ErrorMessage field="email" />
                      </Form.Field>
                    </div>
                    <div className="py-2">
                      <Form.Field>
                        <Form.Label htmlFor="cpf" className="px-1 py-2">
                          {t("admin.create.second_section.cpf")}
                        </Form.Label>
                        <Form.Input
                          type="cpf"
                          id="cpf"
                          className="px-0 mb-6"
                          placeholder="cpf do participante"
                          {...registerUserForm.register("cpf")}
                          defaultValue={modalData?.cpf}
                        />
                        <Form.ErrorMessage field="cpf" />
                      </Form.Field>
                    </div>
                    <div className="flex justify-between">
                      <Button type="submit" variant="primary">
                        {t("admin.create.second_section.add_participants")}
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
