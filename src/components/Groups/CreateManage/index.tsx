import { useEffect, useMemo, useState } from "react";
import Group, { IGroupDocument } from "../../../../models/groupModel";
import Button from "@/components/layout/Button";
import { FaClipboardList, FaPen, FaRegTrashAlt } from "react-icons/fa";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FaGear } from "react-icons/fa6";
import { FiUserPlus } from "react-icons/fi";
import { HiOutlineClipboardCheck } from "react-icons/hi";
import { t } from "i18next";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/Form";
import { UserRegistration } from "./CreateUser";
import { MdGroups } from "react-icons/md";
import SearchBar from "@/components/layout/SearchBar";
import { Modal, ModalBody, ModalContent, ModalHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, user } from "@nextui-org/react";
import { CiMail } from "react-icons/ci";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const createGroupSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string(),
});

interface ICreateGroupData {
  name: string;
  description?: string;
}

interface ICreateUserData {
  name: string;
  email: string;
  cpf?: string;
}

interface Props {
  groups?: IGroupDocument;
}

export default function Create({ groups }: Props) {
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState<string>("");
  const [firstLetter, setFirstLetter] = useState("G");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [groupData, setGroupData] = useState<ICreateGroupData>();
  const [userData, setUserData] = useState<ICreateUserData[]>([]);
  const [editingUserIndex, setEditingUserIndex] = useState<number | null>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const createGroupForm = useForm<ICreateGroupData>({
    resolver: zodResolver(createGroupSchema),
  });

  const editUserForm = useForm<ICreateUserData>({
    resolver: zodResolver(z.object({
      name: z.string().min(3).max(100),
      email: z.string().email(),
      cpf: z.string().optional(),
    })),
  });


  const { handleSubmit } = createGroupForm;

  function createGroup(data: ICreateGroupData) {
    setGroupData(data);
    console.log(data);
    setStep(step + 1);
  }

  const handleNextStep = (users: ICreateUserData[]) => {
    if (step > 1) {
      setUserData(users);
    }

    setStep(step + 1);
  };

  useEffect(() => {
    if (step === 1 && groupData) {
      setGroupData(groupData);
    }

    if (step === 2 && userData.length > 0) {
      setUserData(userData);
    }
  }, [step, groupData, userData]);

  const handleBackStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleBackPage = () => {
    window.history.back();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setProgress(100);
    }
  };

  const handleSubmitGroup = async () => {

    const payload = {
      name: groupData?.name,
      firstLetter: firstLetter,
      description: groupData?.description || "Grupo sem descrição",
      members: userData.map((user, index) => ({
        id: (index + 1).toString(),
        name: user.name,
        email: user.email,
        cpf: user.cpf,
      })),
      author: session?.user._id
    };

    try {
      const response = await api.post(`/group`, payload);
      toast.success('Group created successfully');
      localStorage.removeItem('users');
      router.push("/admin/groups");
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Error creating group');
    }
  };

  const filteredItems = useMemo(() => {
    return userData.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [userData, search]);

  const handleEditUser = (index: number) => {
    setEditingUserIndex(index);
    const UserToEdit = userData[index];
    editUserForm.reset(UserToEdit);
    openEditUserModal();
  };

  const handleSaveUser = (updatedUser: ICreateUserData) => {
    if (editingUserIndex !== null) {
      setUserData((prevUsers) => {
        const newUsers = [...prevUsers];
        newUsers[editingUserIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(newUsers));
        return newUsers;
      });
      closeEditUserModal();
    }
  };

  const handleDeleteUser = (index: number) => {
    const userToDelete = filteredItems[index];
    setUserData((prevUsers) => {
      const newUsers = prevUsers.filter((user) => user !== userToDelete);
      localStorage.setItem('users', JSON.stringify(newUsers));
      return newUsers;
    });
  };

  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUserData(JSON.parse(storedUsers));
    }
  }, []);

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setFile(null);
    setProgress(0);
  };

  const openEditUserModal = () => setIsEditUserModalOpen(true);
  const closeEditUserModal = () => {
    setIsEditUserModalOpen(false);
    setEditingUserIndex(null);
  };

  const renderFormContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col items-center py-6">
            <FormProvider {...createGroupForm}>
              <form onSubmit={handleSubmit(createGroup)}>
                <label className="font-bold">{t("admin.create.section.title")}</label>
                <Form.Field>
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center justify-center w-32 h-32 shadow-xl text-4xl bg-zinc-300 rounded-full">
                      {firstLetter}
                    </div>
                  </div>
                </Form.Field>
                <Form.Field>
                  <Form.Label htmlFor="name" className="mt-4">
                    {t("admin.create.section.group_name")}
                  </Form.Label>
                  <Form.Input
                    name="name"
                    type="text"
                    className="mt-0"
                    required
                    onChange={(e) => {
                      const letter = e.target.value.substring(0, 1);
                      setFirstLetter(letter === "" ? "G" : letter.toUpperCase());
                    }}
                  />
                  <Form.ErrorMessage field="name" />
                </Form.Field>
                <Form.Field>
                  <Form.Label htmlFor="description" className="mt-4">
                    {t("admin.create.section.description")}
                  </Form.Label>
                  <Form.Input name="description" type="text" className="mt-0 mb-6" />
                </Form.Field>
                <Button type="submit">{t("admin.create.section.continue")}</Button>
              </form>
            </FormProvider>
          </div>
        );
      case 2:
        return (
          <UserRegistration
            search={search}
            setSearch={setSearch}
            isModalOpen={isModalOpen}
            openModal={openModal}
            closeModal={closeModal}
            file={file}
            progress={progress}
            handleFileChange={handleFileChange}
            handleBackStep={handleBackStep}
            handleNextStep={handleNextStep}
            setUserData={setUserData}
          />
        );
      case 3:
        return (
          <div>
            <div className="mb-2 mt-2">
              <h1 className="flex items-center flex-col ">
                Revise e confirme as informações do seu grupo antes de finalizar
              </h1>
              <div className="mb-4">
                <div className="px-48 ">
                  <FormProvider {...createGroupForm}>
                    <form onSubmit={handleSubmit(createGroup)}>
                      <label className="font-bold"></label>
                      <Form.Field>
                        <div className="flex items-center justify-center py-4">
                          <div className="flex items-center justify-center w-32 h-32 shadow-xl text-4xl bg-zinc-300 rounded-full">
                            {firstLetter}
                          </div>
                        </div>
                      </Form.Field>
                      <Form.Field>
                        <Form.Label htmlFor="name" className="mt-4">
                          {t("admin.create.section.group_name")}
                        </Form.Label>
                        <Form.Input name="name" type="text" className="mt-0" required
                          onChange={(e) => {
                            const letter = e.target.value.substring(0, 1);
                            setFirstLetter(letter === "" ? "G" : letter.toUpperCase());
                          }} />
                        <Form.ErrorMessage field="name" />
                      </Form.Field>
                      <Form.Field>
                        <Form.Label htmlFor="description" className="mt-4">
                          {t("admin.create.section.description")}
                        </Form.Label>
                        <Form.Input name="description" type="text" className="mt-0 mb-6" />
                      </Form.Field>
                    </form>
                  </FormProvider>
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
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
                          <Button variant="secondary" onClick={() => handleEditUser(index)}><FaPen /></Button>
                          <Button variant="secondary" onClick={() => handleDeleteUser(index)}><FaRegTrashAlt /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="flex items-center justify-center mb-2 gap-2">
              <Button onClick={handleBackStep}>{t("admin.create.section.return")}</Button>
              <Button onClick={handleSubmitGroup}>Terminar</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <>
      <main>
        <header className="flex items-center">
          <div className="px-1">
            <Button variant="primary" onClick={handleBackPage}>
              <h1>{"<"}</h1>
            </Button>
          </div>
          <div className="px-28 py-20">
            <div className="bg-slate-300 px-14 py-6 rounded-t-2xl shadow-2xl mb-1 flex items-center justify-between">
              <div className="flex items-center">
                <FaClipboardList className="size-6 mr-1" />
                <h1 className="font-bold">{t("admin.create.header.title")}</h1>
              </div>
              <AiOutlineExclamationCircle className="size-6" />
            </div>
            <div className="shadow-xl bg-gray-50 px-14 py-6 rounded-b-2xl">
              <h1 className="font-bold">{t("admin.create.header.description")}</h1>
            </div>
          </div>
        </header>

        <section className="px-60">
          <div className="flex flex-col items-center font-bold">
            <div className="flex items-center space-x-0 mb-6">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 1 ? "border-black bg-black text-white" : "border-gray-300 bg-white"
                  }`}
              >
                <FaGear className="size-5" />
              </div>
              <div className="relative w-96 h-2 bg-gray-300">
                <div
                  className="absolute top-0 left-0 h-full bg-black transition-all duration-500"
                  style={{ width: `${(step === 2 || step === 3 ? 100 : 0)}%` }}
                />
              </div>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 2 ? "border-black bg-black text-white" : "border-gray-300 bg-white"
                  }`}
              >
                <FiUserPlus className="size-5" />
              </div>
              <div className="relative w-96 h-2 bg-gray-300">
                <div
                  className="absolute top-0 left-0 h-full bg-black transition-all duration-500"
                  style={{ width: `${step === 3 ? 100 : 0}%` }}
                />
              </div>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step === 3 ? "border-black bg-black text-white" : "border-gray-300 bg-white"
                  }`}
              >
                <HiOutlineClipboardCheck className="size-6" />
              </div>
            </div>
          </div>
          <div className="font-bold border-2 border-gray-300 shadow-lg rounded">{renderFormContent()}</div>
        </section>
      </main>

      <Modal
        isOpen={isEditUserModalOpen}
        onOpenChange={(open) => {
          if (!open) closeEditUserModal();
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Editar Participante</ModalHeader>
              <ModalBody>
                <FormProvider {...editUserForm}>
                  <form onSubmit={editUserForm.handleSubmit((data) => {
                    handleSaveUser(data);
                    onClose();
                  })}>
                    <div>
                      <Form.Field>
                        <Form.Label htmlFor="name" className="px-1">
                          {t("admin.create.second_section.name")}
                        </Form.Label>
                        <Form.Input
                          type="text"
                          className="px-0 mb-4"
                          id="name"
                          {...editUserForm.register("name")}
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
                          className="px-0 mb-6"
                          id="email"
                          {...editUserForm.register("email")}
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
                          type="text"
                          className="px-0 mb-6"
                          id="cpf"
                          {...editUserForm.register("cpf")}
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
}