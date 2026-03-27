import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardBody,
  Divider,
  Progress
} from "@nextui-org/react";
import { FaClipboardList, FaRegTrashAlt, FaPen } from "react-icons/fa";
import { MdGroups, MdOutlineInfo } from "react-icons/md";
import { FaGear, FaArrowLeft } from "react-icons/fa6";
import { FiUserPlus } from "react-icons/fi";
import { HiOutlineClipboardCheck } from "react-icons/hi";
import { t } from "i18next";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserRegistration } from "./CreateUser";
import { ParticipantsTable } from "./ParticipantsTable";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import SearchBar from "@/components/layout/SearchBar";

const createGroupSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
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

export default function CreateManage() {
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState<string>("");
  const [firstLetter, setFirstLetter] = useState("G");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupData, setGroupData] = useState<ICreateGroupData>({ name: "", description: "" });
  const [userData, setUserData] = useState<ICreateUserData[]>([]);
  const { data: session } = useSession();
  const router = useRouter();

  const createGroupForm = useForm<ICreateGroupData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  const { handleSubmit, register, formState: { errors } } = createGroupForm;

  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUserData(JSON.parse(storedUsers));
    }
  }, []);

  const handleCreateGroup = (data: ICreateGroupData) => {
    setGroupData(data);
    setStep(2);
  };

  const handleNextStep = (users: ICreateUserData[]) => {
    setUserData(users);
    setStep(3);
  };

  const handleBackStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleBackPage = () => {
    router.back();
  };

  const handleSubmitGroup = async () => {
    const payload = {
      name: groupData.name,
      firstLetter: firstLetter,
      description: groupData.description || "Grupo sem descrição",
      members: userData.map((user, index) => ({
        id: (index + 1).toString(),
        name: user.name,
        email: user.email,
        cpf: user.cpf,
      })),
      author: session?.user._id
    };

    try {
      await api.post(`/group`, payload);
      toast.success('Grupo criado com sucesso');
      localStorage.removeItem('users');
      router.push("/admin/groups");
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Erro ao criar grupo');
    }
  };

  const filteredItems = useMemo(() => {
    return userData.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [userData, search]);

  const renderStepIndicator = () => {
    const steps = [
      { icon: <FaGear />, label: "Configuração" },
      { icon: <FiUserPlus />, label: "Participantes" },
      { icon: <HiOutlineClipboardCheck />, label: "Confirmação" },
    ];

    return (
      <div className="flex items-center justify-center w-full mb-12">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${step >= i + 1
                  ? "border-zinc-800 bg-zinc-800 text-white shadow-lg dark:border-white dark:bg-white dark:text-black"
                  : "border-zinc-300 bg-white text-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-600"
                  }`}
              >
                {s.icon}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${step >= i + 1 ? "text-zinc-800 dark:text-white" : "text-zinc-300 dark:text-zinc-600"}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-24 sm:w-40 h-[2px] bg-zinc-200 dark:bg-zinc-800 mx-4 -mt-6">
                <div
                  className="h-full bg-zinc-800 dark:bg-white transition-all duration-500"
                  style={{ width: `${step > i + 1 ? 100 : 0}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderFormContent = () => {
    switch (step) {
      case 1:
        return (
          <Card shadow="none" className="border border-zinc-200 dark:border-zinc-800 p-8 max-w-2xl mx-auto w-full bg-transparent">
            <CardBody>
              <form onSubmit={handleSubmit(handleCreateGroup)} className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-32 h-32 shadow-xl text-5xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white rounded-full border-4 border-white dark:border-zinc-700 font-bold">
                    {firstLetter}
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Avatar do Grupo</p>
                </div>

                <Input
                  label={t("admin.create.section.group_name")}
                  placeholder="Ex: Alunos de Computação 2024"
                  variant="bordered"
                  {...register("name")}
                  onChange={(e) => {
                    const val = e.target.value;
                    const letter = val.substring(0, 1);
                    setFirstLetter(letter === "" ? "G" : letter.toUpperCase());
                  }}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                />

                <Textarea
                  label={t("admin.create.section.description")}
                  placeholder="Breve descrição sobre o objetivo deste grupo..."
                  variant="bordered"
                  {...register("description")}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="mt-4 bg-zinc-600 font-bold"
                >
                  {t("admin.create.section.continue")}
                </Button>
              </form>
            </CardBody>
          </Card>
        );
      case 2:
        return (
          <UserRegistration
            search={search}
            setSearch={setSearch}
            isModalOpen={isModalOpen}
            openModal={() => setIsModalOpen(true)}
            closeModal={() => setIsModalOpen(false)}
            handleBackStep={handleBackStep}
            handleNextStep={handleNextStep}
            setUserData={setUserData}
            users={userData}
          />
        );
      case 3:
        return (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Revise e confirme as informações</h2>
              <div className="w-16 h-1 bg-zinc-800 dark:bg-white rounded-full" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4">
                <Card shadow="sm" className="border border-zinc-100 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
                  <CardBody className="flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-4xl font-bold shadow-inner dark:text-white">
                      {firstLetter}
                    </div>
                    <div className="w-full text-center">
                      <h3 className="font-bold text-xl dark:text-white">{groupData.name}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">{groupData.description || "Sem descrição"}</p>
                    </div>
                    <Divider className="dark:bg-zinc-800" />
                    <Button
                      variant="light"
                      color="primary"
                      startContent={<FaPen size={14} />}
                      onPress={() => setStep(1)}
                      className="w-full"
                    >
                      Editar Detalhes
                    </Button>
                  </CardBody>
                </Card>
              </div>

              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center gap-2 dark:text-white">
                    <MdGroups size={24} /> {t("admin.create.second_section.added_participants")}
                  </h3>
                  <span className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-sm font-bold dark:text-white">
                    {userData.length} Participantes
                  </span>
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
                  isReadOnly={true}
                />
              </div>
            </div>

            <Divider className="my-4 dark:bg-zinc-800" />

            <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <Button variant="bordered" onPress={handleBackStep} className="px-10 dark:text-white dark:border-zinc-600">
                {t("admin.create.section.return")}
              </Button>
              <Button color="success" onPress={handleSubmitGroup} className="px-10 font-bold text-white">
                Finalizar e Criar Grupo
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <main className="flex flex-col px-10 md:px-20 lg:px-40 py-14 gap-12 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <header className="flex flex-col rounded-3xl shadow-2xl bg-zinc-200 dark:bg-zinc-900 px-10 md:px-20 lg:px-40 py-16 relative overflow-hidden">

        <div className="flex items-center gap-4 mb-4">
          <Button
            isIconOnly
            variant="flat"
            color="default"
            radius="full"
            onPress={handleBackPage}
            className="bg-white/50 dark:bg-white/10 backdrop-blur-sm shadow-sm dark:text-white"
          >
            <FaArrowLeft />
          </Button>
          <h1 className="text-3xl font-bold dark:text-white">{t("admin.create.header.title")}</h1>
        </div>

        <p className="mb-6 max-w-2xl text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
          {t("admin.create.header.description")}
        </p>

        <div className="flex items-center gap-4">
          <div className="mb-2 rounded-2xl bg-zinc-800 dark:bg-zinc-700 w-32 h-3 shadow-sm" />
          <div className="rounded-2xl bg-white/60 dark:bg-white/20 w-16 h-3 shadow-sm" />
        </div>
      </header>

      <section className="flex flex-col w-full bg-white dark:bg-zinc-900 rounded-[2rem] shadow-xl p-8 md:p-12 border border-zinc-100 dark:border-zinc-800">
        {renderStepIndicator()}
        <div className="transition-all duration-300 ease-in-out">
          {renderFormContent()}
        </div>
      </section>
    </main>
  );
}