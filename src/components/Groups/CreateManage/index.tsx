import { useEffect, useState } from "react";
import { IGroupDocument } from "../../../../models/groupModel";
import Button from "@/components/layout/Button";
import { FaClipboardList } from "react-icons/fa";
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

const createGroupSchema = z.object ({
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
const [groupData , setGroupData] = useState<ICreateGroupData>();
const [userData, setUserData] = useState<ICreateUserData[]>([]);

const createGroupForm = useForm<ICreateGroupData>({
    resolver: zodResolver(createGroupSchema),
  });

const { handleSubmit } = createGroupForm;

function createGroup(data: ICreateGroupData) {
    setGroupData(data);
    console.log(data);
    setStep(step + 1);
  }

function createUser(data: ICreateUserData) {
    setUserData((prevUsers) => [...prevUsers, data]);
    console.log(data);
  }

useEffect(() => {
  if(step === 1 && groupData) {
    setGroupData(groupData);
  }

  if(step === 2 && userData.length > 0) {
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

const openModal = () => setIsModalOpen(true);

const closeModal = () => {
    setIsModalOpen(false);
    setFile(null);
    setProgress(0);
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
            handleNextStep={() => setStep(step + 1)}
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
                      <Form.Input name="name" type="text" className="mt-0" required />
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
          <div className="p-6 px-12">
            <h1 className="mb-2">Lista de Participantes</h1>
            <SearchBar
              placeholder={t("admin.groups.body.searchbar_placeholder")}
              setSearch={setSearch}
              search={search}
              iconSize={25}
              className="w-full mt-1 shadow-lg"
            />
            <ul>
              {userData.map((user, index) => (
                <li key={index}>
                  <p>{user.name}</p>
                  <p>{user.email}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-center mb-2 gap-2">
            <Button onClick={handleBackStep}>{t("admin.create.section.return")}</Button>
            <Button type="submit">{t("admin.create.section.continue")}</Button>
          </div>
        </div>
      );
      default:
        return null;
    }
  };

  return (
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
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step >= 1 ? "border-black bg-black text-white" : "border-gray-300 bg-white"
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
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step >= 2 ? "border-black bg-black text-white" : "border-gray-300 bg-white"
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
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step === 3 ? "border-black bg-black text-white" : "border-gray-300 bg-white"
              }`}
            >
              <HiOutlineClipboardCheck className="size-6" />
            </div>
          </div>
        </div>
        <div className="font-bold border-2 border-gray-300 shadow-lg rounded">{renderFormContent()}</div>
      </section>
    </main>
  );
}