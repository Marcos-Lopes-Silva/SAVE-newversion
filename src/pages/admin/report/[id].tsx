import { connectToMongoDB } from "@/lib/db";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ISurveyAnalytics } from "../../../../models/surveyAnalytics";
import Survey from "../../../../models/surveyModel";
import Graphics from "@/components/Graphics";
import Filters, { Filter } from "@/components/Filters";
import { FaFilter, FaFileInvoice } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { Button } from "@nextui-org/button";

interface Props {
    surveyId: string;
    surveyTitle: string;
    surveyDescription: string;
    updatedAt: string;
}

export default function ReportPage({ surveyId, surveyTitle, surveyDescription, updatedAt }: Props) {
    const router = useRouter();
    const [data, setData] = useState<ISurveyAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filter[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedPageIndex, setSelectedPageIndex] = useState<number>(-1);

    useEffect(() => {
        const loadAnalytics = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                filters.forEach((f) => {
                    params.append("filterQuestion[]", f.question);
                    params.append("filterAnswer[]", f.answer);
                    if (f.row) params.append("filterRow[]", f.row);
                });

                const response = await fetch(`/api/survey/${surveyId}/results?${params.toString()}`);
                if (!response.ok) throw new Error("Erro na resposta da API");

                const json = await response.json();
                setData(json.pages?.length ? json : null);
            } catch (err) {
                setError("Erro ao carregar os dados. Tente recarregar a página.");
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, [surveyId, filters]);

    const handleExportCsv = () => {
        window.location.href = `/api/survey/${surveyId}/export-csv`;
    };

    return (
        <main className="flex flex-col min-h-screen px-10 py-14 dark:bg-black">
            <header className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                    ← Voltar
                </button>
            </header>

            <div className="flex flex-col rounded-xl shadow-2xl bg-zinc-200 dark:bg-zinc-900 px-40  py-12 mb-10">
                <div className="flex items-center gap-4 mb-3">
                    <FaFileInvoice
                        size={18}
                        className="p-5 dark:bg-zinc-950 bg-zinc-800 flex items-center justify-center rounded-2xl text-white"
                    />
                    <h1 className="text-2xl font-semibold dark:text-white">{surveyTitle}</h1>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-1">{surveyDescription}</p>
            </div>

            <div className="flex justify-end gap-3 mb-6">
                <Button
                    variant="bordered"
                    className="dark:text-white border-zinc-400"
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                    isDisabled={!data}
                >
                    <FaFilter className="mr-2" />
                    Filtros
                </Button>

                <Button
                    variant="solid"
                    className="bg-zinc-900 dark:bg-white dark:text-black text-white"
                    onClick={handleExportCsv}
                >
                    <IoMdDownload className="mr-2" />
                    Exportar CSV
                </Button>
            </div>

            {isFilterOpen && data && (
                <div className="mb-6">
                    <Filters
                        surveyId={surveyId}
                        setFiltersApplied={(applied) => {
                            setFilters(applied);
                            setIsFilterOpen(false);
                        }}
                        setError={setError}
                        setSelectedPageIndex={setSelectedPageIndex}
                        initialFilters={filters}
                    />
                </div>
            )}

            {loading && (
                <div className="flex justify-center items-center py-32">
                    <p className="text-zinc-500 dark:text-zinc-400">Carregando dados...</p>
                </div>
            )}

            {error && !loading && (
                <div className="flex justify-center items-center py-32">
                    <p className="text-red-500">{error}</p>
                </div>
            )}

            {!loading && !error && !data && (
                <div className="flex flex-col items-center justify-center py-32 gap-3">
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        Nenhum dado coletado ainda para este questionário.
                    </p>
                </div>
            )}

            {!loading && !error && data && (
                <div className="space-y-10">
                    {selectedPageIndex === -1 ? (
                        data.pages.map((_, pageIndex) => (
                            <div key={pageIndex} className="space-y-6">
                                <Graphics
                                    data={data}
                                    selectedPageIndex={pageIndex}
                                    lastUpdate={true}
                                    download={true}
                                    modal={true}
                                    selectCharts={false}
                                    selectedChartTypes={{} as Record<string, string>}
                                    surveyUpdate={{ updatedAt }}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-center mb-8 mt-4">
                                {data.pages[selectedPageIndex]?.title}
                            </h2>
                            <Graphics
                                data={data}
                                selectedPageIndex={selectedPageIndex}
                                lastUpdate={true}
                                download={true}
                                modal={true}
                                selectCharts={false}
                                selectedChartTypes={{} as Record<string, string>}
                                surveyUpdate={{ updatedAt }}
                            />
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session || session.user.role !== 'admin') {
        return { redirect: { destination: '/', permanent: false } };
    }

    await connectToMongoDB();

    const { id } = context.params!;
    const survey = await Survey.findById(id).select('title description updatedAt').lean() as any;

    if (!survey) {
        return { notFound: true };
    }

    return {
        props: {
            surveyId: id as string,
            surveyTitle: survey.title,
            surveyDescription: survey.description,
            updatedAt: survey.updatedAt ? new Date(survey.updatedAt).toISOString() : '',
        },
    };
};

ReportPage.auth = {
    role: 'admin',
    verified: true,
    unauthorized: '/',
};
