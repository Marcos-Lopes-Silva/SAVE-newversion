import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { connectToMongoDB } from "@/lib/db";
import Survey, { ISurveyDocument } from "../../../../../models/surveyModel";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Button } from "@nextui-org/react";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { MdArrowBack, MdPeople } from "react-icons/md";

interface IRespondent {
    name: string;
    email: string;
    respondedAt: string;
}

interface Props {
    survey: ISurveyDocument;
    respondents: IRespondent[];
    count: number;
}

const PAGE_SIZE = 10;

export default function SurveyRespondents({ survey, respondents, count }: Props) {
    const { t } = useTranslation();
    type SortKey = 'name' | 'email' | 'respondedAt';

    const [sortDescriptor, setSortDescriptor] = useState<{
        column: SortKey;
        direction: 'ascending' | 'descending';
    }>({
        column: 'name',
        direction: 'ascending',
    });
    const { back } = useRouter();
    const [page, setPage] = useState(1);

    const sortedRespondents = useMemo(() => {
        return [...respondents].sort((a, b) => {
            const { column, direction } = sortDescriptor;

            let first: string | number = a[column];
            let second: string | number = b[column];

            if (column === 'respondedAt') {
                first = new Date(first).getTime();
                second = new Date(second).getTime();
            } else {
                first = first.toString().toLowerCase();
                second = second.toString().toLowerCase();
            }

            if (first < second) return direction === 'ascending' ? -1 : 1;
            if (first > second) return direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [respondents, sortDescriptor]);

    const items = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;

        return sortedRespondents.slice(start, end);
    }, [page, sortedRespondents]);

    return (
        <main className="p-20 flex flex-col gap-10">
            <header className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <Button isIconOnly variant="light" onClick={() => back()}>
                        <MdArrowBack size={24} />
                    </Button>
                    <h1 className="text-2xl font-bold dark:text-white">{survey.title}</h1>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 ml-12">
                    {t('admin.survey.user.description')}
                </p>
            </header>

            <section className="bg-zinc-100 dark:bg-zinc-900 p-8 rounded-3xl shadow-xl flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-zinc-800 text-white rounded-xl">
                        <MdPeople size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold dark:text-white">
                            {count} {t('admin.survey.user.completed')}
                        </h2>
                        <p className="text-sm text-zinc-500">
                            {t('admin.survey.user.participants')}: {survey.users}
                        </p>
                    </div>
                </div>

                <Table 
                    aria-label="Tabela de respondentes"
                    bottomContent={
                        <div className="flex w-full justify-center">
                            <Pagination
                                isCompact
                                showControls
                                showShadow
                                color="primary"
                                page={page}
                                total={Math.ceil(respondents.length / PAGE_SIZE)}
                                onChange={(page) => setPage(page)}
                            />
                        </div>
                    }
                    sortDescriptor={sortDescriptor}
                    onSortChange={(descriptor) => {
                        setSortDescriptor(descriptor as any);
                    }}
                    classNames={{
                        wrapper: "min-h-[400px]",
                    }}
                >
                    <TableHeader>
                        <TableColumn key="name" allowsSorting>{t('admin.create.second_section.name')}</TableColumn>
                        <TableColumn key="email" allowsSorting>{t('admin.create.second_section.email')}</TableColumn>
                        <TableColumn key="respondedAt" allowsSorting>{t('admin.survey.complete.finish')}</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"Nenhum respondente encontrado."}>
                        {items.map((respondent, index) => (
                            <TableRow key={index} className="dark:text-white">
                                <TableCell>{respondent.name}</TableCell>
                                <TableCell>{respondent.email}</TableCell>
                                <TableCell>{new Date(respondent.respondedAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>
        </main>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session || session.user.role !== 'admin') {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    const { id } = context.query;

    await connectToMongoDB();

    const survey = await Survey.findById(id).lean();

    if (!survey) {
        return {
            notFound: true,
        }
    }

    const SurveyResult = (await import("../../../../../models/surveyResultModel")).default;
    const User = (await import("../../../../../models/userModel")).default;

    const results = await SurveyResult.find({ surveyId: id }).select('userId createdAt').lean();
    const uniqueUserIds = Array.from(new Set(results.map(r => r.userId.toString())));
    const users = await User.find({ _id: { $in: uniqueUserIds } }).select('name email').lean();

    const latestResultsMap = new Map();

    results.forEach(r => {
        const userId = r.userId.toString();

        if (
            !latestResultsMap.has(userId) ||
            new Date(r.createdAt) > new Date(latestResultsMap.get(userId).createdAt)
        ) {
            latestResultsMap.set(userId, r);
        }
    });

    const respondents = uniqueUserIds.map(userId => {
        const user = users.find(u => u._id.toString() === userId);
        const result = latestResultsMap.get(userId);

        return {
            name: user?.name || 'Unknown',
            email: user?.email || 'Unknown',
            respondedAt: result?.createdAt.toISOString()
        };
    });

    return {
        props: {
            survey: JSON.parse(JSON.stringify(survey)),
            respondents: JSON.parse(JSON.stringify(respondents)),
            count: respondents.length
        }
    }
}

SurveyRespondents.auth = {
    role: 'admin',
    verified: true,
    unauthorized: '/'
}
