import { api } from "@/lib/api";
import { t } from "i18next";
import { useEffect, useMemo, useState } from 'react';
import { useSession, getSession } from "next-auth/react";
import { ISurveyDocument } from "../../../../models/surveyModel";
import { useRouter } from "next/router";
import { HiOutlineUserGroup } from "react-icons/hi";
import InputMask from 'react-input-mask';
import { GetServerSideProps } from "next";
import { connectToMongoDB } from "@/lib/db";
import { GiBackwardTime } from "react-icons/gi";
import { PiCalendarDotsLight } from "react-icons/pi";
import { MdMenuBook } from "react-icons/md";
import Item from "@/components/Item";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, useDisclosure } from "@nextui-org/react";
import { toast } from "react-toastify";
import { Session } from "next-auth";
import { truncateText } from "@/lib/utils/truncate";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/Form";

interface Props {
    surveys: ISurveyDocument[]
}

const PageSize = 8;

export default function Dashboard() {
    const { push } = useRouter();
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [recentSurvey, setRecentSurvey] = useState<ISurveyDocument | null>(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [surveys, setSurveys] = useState<ISurveyDocument[]>([]);

    useEffect(() => {
        if (!session?.user?.cpf) return;

        api.get<ISurveyDocument[]>(`user/survey?cpf=${session.user.cpf}`)
            .then(setSurveys);
    }, [session?.user?.cpf]);

    const openSurvey = (id: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('last_survey', id);
            const calendar = new Date();
            localStorage.setItem('last_survey_date', calendar!!.toString());
            push(`/user/survey/${id}`);
        }
    };

    const onPageChange = (page: number) => setCurrentPage(page);

    const filteredListP = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * PageSize;
        const lastPageIndex = firstPageIndex + PageSize;
        return surveys.slice(firstPageIndex, lastPageIndex);
    }, [surveys, currentPage]);

    useEffect(() => {

        if (session?.user.cpf === null || session?.user.cpf === undefined) {
            onOpen();
        }

        if (typeof window !== 'undefined') {
            const id = localStorage.getItem('last_survey');
            if (!id) return;
            api.get<ISurveyDocument>(`survey/${id}`).then(survey => setRecentSurvey(survey));
        }


    }, []);

    return (
        <main className="flex px-2 flex-col sm:py-5 items-center sm:px-5 justify-center gap-16">
            <header className="flex flex-col bg-zinc-100 dark:bg-zinc-800 shadow-lg rounded-3xl gap-4 p-8 lg:px-36 lg:py-12">
                <h1 className={"hidden dark:text-white sm:block font-semibold text-xl mt-5 text-left lg:py-1"}>
                    {t('user.dashboard.welcome_name')}
                    {session?.user.name}
                </h1>

                <h1 className={"block sm:hidden dark:text-white font-semibold text-lg sm:text-xl mt-5 text-left lg:py-1"}>
                    {t('user.dashboard.welcome_name')}
                    {session?.user.name?.split(' ')[0]}
                </h1>

                <p className="text-sm dark:text-white sm:text-md lg:ml-0 text-justify">
                    {t('user.dashboard.welcome_user')}
                </p>
            </header>
            <section className="flex flex-col w-full items-center lg:px-20">
                <div className="flex flex-col gap-8 lg:w-4/5 lg:px-28 w-full ">
                    <label className="text-xs dark:text-white sm:text-sm">
                        {t('user.dashboard.avaliable')}
                        <br />
                        {t('user.dashboard.click')}
                    </label>
                    <ul className="flex flex-col items-center gap-2 sm:gap-7 w-full">
                        {filteredListP.length === 0 ? (
                            <div className="flex flex-col items-center gap-4 mt-10">
                                <p className="text-zinc-500 dark:text-white/90">Não há questionários disponíveis.</p>
                            </div>
                        ) : (null)}
                        {filteredListP.map((survey, index) => survey.status === "active" && (
                            <Item<ISurveyDocument>
                                icon={
                                    <div className="sm:p-7 p-4 -py-2 dark:bg-zinc-950 bg-zinc-800 flex items-center justify-center rounded-2xl text-white">
                                        <MdMenuBook className="size-5 sm:size-7" />
                                    </div>
                                }
                                options={
                                    <div className="flex">
                                        <Options survey={survey} />
                                    </div>
                                }
                                buttonLabel="Começar"
                                action={() => openSurvey(survey._id as string)}
                                key={index}
                                className={"flex gap-3 sm:gap-12 border border-zinc-200 dark:bg-zinc-800 shadow-lg sm:shadow-xl w-full items-center sm:w-11/12 min-h-36 rounded-tr-3xl rounded-bl-3xl p-5 sm:p-9"}
                                item={survey}
                            />
                        ))}
                    </ul>
                    <Pagination
                        total={Math.ceil(surveys.length / PageSize)}
                        initialPage={1}
                        page={currentPage}
                        onChange={onPageChange}
                        showControls
                        loop
                        className="self-center"
                        color="primary"
                        classNames={{
                            item: "hover:bg-zinc-700 bg-zinc-900 text-white",
                            next: "hover:bg-zinc-700 bg-zinc-900 text-white",
                            prev: "hover:bg-zinc-500 bg-zinc-900 text-white"
                        }}
                    />
                </div>
                <ValidateModel isOpen={isOpen} onOpenChange={onOpenChange} session={session} />
            </section>
        </main>
    )
}

interface IAux {
    survey: ISurveyDocument,
}

const Options = ({ survey }: IAux) => {
    return survey.status === 'draft' ? (
        <div className="flex gap-5">
            <label className="flex gap-2 items-center text-zinc-500 dark:text-white"><PiCalendarDotsLight size={20} /> {survey.openDate} - {survey.endDate}</label>
        </div>
    ) : null
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    await connectToMongoDB();

    const session = await getSession(context);
    const surveys = await api.get<ISurveyDocument[]>(`user/survey?cpf=${session?.user?.cpf}`);

    return {
        props: {
            surveys: JSON.parse(JSON.stringify(surveys))
        }
    }
}

Dashboard.auth = {
    role: 'user',
    unauthorized: '/'
};

interface ValidateModelProps {
    isOpen: boolean,
    onOpenChange: () => void,
    session: Session | null
}


const cpfSchema = z.object({
    cpf: z
        .string()
        .min(11, "O CPF deve conter 11 caracteres.")
        .max(14, "O CPF deve conter no máximo 14 caracteres.")
        .refine(value => /^\d{11}$/.test(value.replace(/\D/g, '')), {
            message: "CPF inválido",
        }),
});

type CPF = z.infer<typeof cpfSchema>;

const ValidateModel = ({ isOpen, onOpenChange, session }: ValidateModelProps) => {

    const updateCPF = async (data: CPF) => {
        console.log(data);

        if ((data.cpf && data.cpf.length < 9) || !data.cpf) {
            toast.error("CPF inválido");
            return;
        }

        toast.loading("Atualizando CPF...", { toastId: "loader-cpf" });
        const normalizedCpf = data.cpf.replace(/\D/g, '');

        try {
            const response = await api.get<{ member: { cpf: string } }>(`user/verify-cpf/${normalizedCpf}`);

            const hashedCpf = response.member.cpf;

            if (response) {
                await api.patch(`user/${session?.user._id as string}`, { cpf: hashedCpf });
                await api.patch('user/update-session', { cpf: hashedCpf });
                toast.clearWaitingQueue();
                onOpenChange();
                toast.success("CPF atualizado com sucesso!");
                toast.done("loader-cpf");
            }
        } catch (error) {
            toast.error("Erro ao atualizar CPF, CPF não encontrado!");
            toast.done("loader-cpf")
        }
    }

    const cpfForm = useForm<CPF>({
        resolver: zodResolver(cpfSchema)
    });

    const {
        handleSubmit,
        control,
        formState: { isSubmitting }
    } = cpfForm;

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex items-center justify-between pr-10">
                            <p className="dark:text-white">Validação de Usuário</p>
                        </ModalHeader>
                        <ModalBody>
                            <FormProvider {...cpfForm}>
                                <form onSubmit={handleSubmit(updateCPF)}>
                                    <p className="dark:text-white">Para continuar, por favor, insira o seu CPF no campo abaixo. Usaremos essa informação para buscar questionários ativos associados ao seu perfil.</p>
                                    <Form.Field>
                                        <Form.Label>CPF</Form.Label>
                                        <Form.MaskedInput mask="999.999.999-99" maskChar="" control={control} name="cpf" />
                                        <Form.ErrorMessage field="cpf" />
                                    </Form.Field>
                                    <div className="flex gap-4 justify-end my-[4%]">
                                        <Button color="danger" variant="light" onPress={onClose}>
                                            Fechar
                                        </Button>
                                        <Button color="primary" type="submit" isLoading={isSubmitting}>
                                            Confirmar
                                        </Button>
                                    </div>
                                </form>
                            </FormProvider>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

