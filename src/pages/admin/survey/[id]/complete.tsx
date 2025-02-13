import { Form } from "@/components/Form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import Survey, { ISurveyDocument } from "../../../../../models/surveyModel";
import Papa from 'papaparse';
import { useEffect, useState } from "react";
import { Button, getKeyValue, Pagination, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip } from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import mongoose from "mongoose";
import Group, { IGroupDocument, IUsers } from "../../../../../models/groupModel";
import { api } from "@/lib/api";
import { toast } from "react-toastify";
import { createGroup } from "@/lib/group";
import Note from "@/components/layout/Note";
import ImageExample from "@/static/images/exemple_list.webp";
import Image from "next/image";
import { FaQuestionCircle } from "react-icons/fa";

const currentDate = new Date().toISOString().split('T')[0];

const surveySchema = z.object({
    title: z.string().min(5),
    description: z.string(),
    open_date: z.string(),
    close_date: z.string(),
    complete_message: z.string(),
}).refine((data) => data.open_date >= currentDate, {
    message: "A data de abertura não pode ser anterior à data atual.",
    path: ["open_date"],
}).refine((data) => data.close_date >= currentDate, {
    message: "A data de fechamento não pode ser anterior à data atual.",
    path: ["close_date"],
}).refine((data) => data.close_date >= data.open_date, {
    message: "A data de fechamento deve ser posterior ou igual à data de abertura.",
    path: ["close_date"],
});

interface ICompleteSurveyData {
    title: string,
    description: string,
    open_date: string,
    close_date: string,
    complete_message: string,
}

interface Props {
    survey: ISurveyDocument;
    groups: IGroupDocument[];
}


interface IAdditionalColumns {
    key: string;
    label: string;
}

export default function CompleteCreation({ survey, groups }: Props) {

    const { t } = useTranslation();

    const [additionalColumn, setAdditionalColumns] = useState<IAdditionalColumns[]>([]);
    const [users, setUsers] = useState<IUsers[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const { data: session } = useSession();

    const completeSurvey = useForm<ICompleteSurveyData>({
        defaultValues: {
            title: survey.title,
            description: survey.description,
            open_date: survey.openDate,
            close_date: survey.endDate,
            complete_message: survey.completeMessage
        },
        resolver: zodResolver(surveySchema)
    })

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = completeSurvey;


    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            transform: (value, field) => {
                if (field === 'cpf') {
                    return value.toString().padStart(11, "0");
                }

                return value;
            },
            complete: (results) => {
                const parsedUsers = results.data as IUsers[];
                const newColumns = new Set<IAdditionalColumns>();
                if (results.meta.fields!!.includes('cpf')) newColumns.add({ key: 'cpf', label: 'CPF' });
                if (results.meta.fields!!.includes('birthDate')) newColumns.add({ key: 'birthDate', label: 'Data de Nascimento' });
                if (results.meta.fields!!.includes('rg')) newColumns.add({ key: 'rg', label: 'RG' });
                const newUsers = parsedUsers.map(user => {
                    user.cpf = user.cpf?.replace(/\D/g, '');
                    return user;
                });

                setUsers(newUsers);
                setAdditionalColumns(Array.from(newColumns));
            },
        });
    };

    const saveSurvey = async (data: ICompleteSurveyData) => {

        const newSurvey = { ...survey };

        newSurvey.title = data.title;
        newSurvey.description = data.description;
        newSurvey.openDate = data.open_date;
        newSurvey.endDate = data.close_date;
        newSurvey.completeMessage = data.complete_message;
        newSurvey.users = users.length;

        try {
            await api.patch(`survey/${survey._id}`, newSurvey);

            await createGroup(users, selectedGroup, survey._id as string, session?.user._id as string);

            await api.post(`schedule-job`, {
                emails: users.map(user => user.email),
                job: 'send emails survey',
                scheduleDate: data.open_date
            });
            await api.post(`schedule-job`, {
                job: 'update database field',
                scheduleDate: data.open_date,
                id: survey._id,
                collection: 'surveys',
                field: 'status',
                value: 'active'
            });
            await api.post(`schedule-job`, {
                job: 'update database field',
                scheduleDate: data.close_date,
                collection: 'surveys',
                id: survey._id,
                field: 'status',
                value: 'closed'
            });
            await api.post(`schedule-job`, {
                emails: [session?.user.email],
                job: 'send emails results',
                scheduleDate: data.close_date,
            })


            toast.success(t('admin.survey.complete.success'));
        } catch (error) {
            console.log(error);
            toast.error(t('admin.survey.complete.error'));
        }
    }


    const updateUsers = async () => {
        const group = await api.get<IGroupDocument>(`group/${selectedGroup}`);

        if (!group) return;

        setUsers(group.members);
    }

    useEffect(() => {
        if (selectedGroup === '') return;
        updateUsers();
    }, [selectedGroup]);

    return (
        <main className="p-20 flex flex-col gap-20">
            <header className="">
                <h1 className="px-12 bg-zinc-200 dark:text-white dark:bg-zinc-800 py-6 rounded-t-2xl shadow-xl">{t('admin.survey.complete.title')}</h1>
                <p className="px-12 py-6 bg-zinc-100 dark:bg-zinc-950 dark:text-white shadow-2xl rounded-b-2xl">{t('admin.survey.complete.description')}</p>
            </header>
            <section className="p-16 w-full pl-20 gap-14 flex">
                <FormProvider {...completeSurvey}>
                    <form onSubmit={handleSubmit(saveSurvey)} className="flex flex-col gap-5 w-1/2">
                        <Form.Field>
                            <Form.Label htmlFor="title">{t('admin.survey.complete.title_label')}</Form.Label>
                            <Form.Input className="w-1/2 py-1 px-1 outline-none" id="title" name="title" />
                            <Form.ErrorMessage field="title" />
                        </Form.Field>
                        <Form.Field>
                            <Form.Label htmlFor="description">{t('admin.survey.complete.description_label')}</Form.Label>
                            <Form.TextArea id="description" name="description" />
                            <Form.ErrorMessage field="description" />
                        </Form.Field>
                        <div className="flex flex-col gap-9 my-9">
                            <h4 className="font-semibold">{t('admin.survey.complete.duration_label')}</h4>
                            <Form.Field>
                                <Form.Label htmlFor="open_date">{t('admin.survey.complete.open_date_label')}</Form.Label>
                                <Form.Date className="w-1/3" name="open_date" />
                                <Form.ErrorMessage field="open_date" />
                            </Form.Field>
                            <Form.Field>
                                <Form.Label htmlFor="close_date">{t('admin.survey.complete.close_date_label')}</Form.Label>
                                <Form.Date name="close_date" className="w-1/3" />
                                <Form.ErrorMessage field="close_date" />
                            </Form.Field>
                        </div>
                        <Form.Field>
                            <Form.Label htmlFor="complete_message">{t('admin.survey.complete.complete_label')}</Form.Label>
                            <Form.Input type="text" name="complete_message" />
                            <Form.ErrorMessage field="complete_message" />
                        </Form.Field>

                        <Form.Field>
                            <Form.Label htmlFor="csvUpload">{t('admin.survey.complete.users')}
                                <Tooltip
                                    content={
                                        <div className="flex flex-col gap-2 items-center">
                                            <h4>Adicionando Egressos ao questionário.</h4>
                                            <div className="flex flex-col gap-2">
                                                <p>Para você adicionar os respondentes siga o padrão abaixo.</p>
                                                <Image src={ImageExample} alt="Imagem de Exemplo" width={800} />
                                            </div>
                                        </div>
                                    } title="Adicionando pessoas ao survey."><FaQuestionCircle size={20} /></Tooltip>
                            </Form.Label>
                            <Form.Input
                                variant="underlined"
                                type="file"
                                name="csvUpload"
                                id="csvUpload"
                                accept=".csv"
                                onChange={handleFileUpload}
                            />
                        </Form.Field>
                        <Button size="md" className="w-1/3" type="submit" isLoading={isSubmitting}>{t('admin.survey.complete.send_button')}</Button>
                    </form>
                </FormProvider>
                <div className="w-1/2 flex flex-col gap-5">
                    <h3 className="text-lg flex">{t('admin.survey.complete.group')}</h3>
                    <UserTable users={users} setUsers={setUsers} additionalColumn={additionalColumn} />
                    <Groups groups={groups ?? []} selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} />
                </div>
            </section>
        </main>
    )
}
interface IGroups {
    groups: IGroupDocument[];
    selectedGroup: string;
    setSelectedGroup: React.Dispatch<React.SetStateAction<string>>;
}

function Groups({ groups, selectedGroup, setSelectedGroup }: IGroups) {

    return (
        <div>
            <Select label="Groups"
                selectionMode="multiple"
                placeholder="Select an group"
                className="max-w-xs"
                onChange={(e) => setSelectedGroup(e.target.value)}>
                {groups.map((group, index) => (
                    <SelectItem className="dark:text-white" key={group._id as string}>{group.name}</SelectItem>
                ))}
            </Select>
        </div>
    )
}


interface UserTableProps {
    users: IUsers[];
    setUsers: React.Dispatch<React.SetStateAction<IUsers[]>>;
    additionalColumn: IAdditionalColumns[];
}



const UserTable: React.FC<UserTableProps> = ({ additionalColumn, users, setUsers }) => {

    const [page, setPage] = useState(1);

    const handleRemoveUser = (id: string) => {
        setUsers(users.filter(user => user.id !== id));
    };

    const columns = [
        {
            key: 'id',
            label: 'ID'
        },
        {
            key: 'name',
            label: 'Name'
        },
        {
            key: 'email',
            label: 'Email'
        },
        {
            key: 'actions',
            label: 'Actions'
        }
    ];

    additionalColumn.forEach(column => {
        columns.splice(columns.length - 1, 0, column);
    });

    return (
        <Table bottomContent={
            <div className="flex w-full justify-center">
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="secondary"
                    page={page}
                    total={Math.ceil(users.length / 8)}
                    onChange={(page) => setPage(page)}
                />
            </div>
        }>
            <TableHeader>
                {columns.map(column => (
                    <TableColumn key={column.key}>{column.label}</TableColumn>
                ))}
            </TableHeader>
            <TableBody emptyContent={"No users to display."}>

                {users.map((user) =>
                    <TableRow key={user.id} className="dark:text-white">
                        {(columnKey) => <TableCell>{columnKey === 'actions' ? <Button onClick={() => handleRemoveUser(user.id)}>Remove</Button> : getKeyValue(user, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context);

    if (!session || session?.user?.role !== 'admin') {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }
    const { id } = context.query;

    const survey = await Survey.findById(id);
    const groups = await Group.find({ author: new mongoose.Types.ObjectId(session.user._id) });

    if (survey === null || survey === undefined) {
        return {
            notFound: true,
        }
    }

    return (
        {
            props: {
                survey: JSON.parse(JSON.stringify(survey)),
                groups: JSON.parse(JSON.stringify(groups))
            }
        }
    )
}