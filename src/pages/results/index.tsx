import { t } from "i18next";
import { connectToMongoDB } from "@/lib/db";
import { Select, SelectItem } from "@nextui-org/select";
import { FaFilter } from "react-icons/fa";
import { GetServerSideProps } from "next";
import { Key } from "@react-types/shared";
import { Button } from "@nextui-org/button";
import { IoMdDownload } from "react-icons/io";
import { useState, useEffect } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { ISurveyAnalytics } from "../../../models/surveyAnalytics";
import Survey from "../../../models/surveyModel";
import SurveyAnalytics from "../../../models/surveyAnalytics";
import mongoose from "mongoose";
import Filters, { Filter } from "@/components/Filters";
import Graphics from "@/components/Graphics";
import { Progress } from "@nextui-org/react";
import { getSession } from "next-auth/react";
import Image from "next/image";
import minipc from "@/static/images/minipc.svg";

interface CustomISurveyDocument extends mongoose.Document {
    _id: string;
    title: string;
    description: string;
    updatedAt: string;
}

export default function TestSurveyResults({ surveys }: { surveys: CustomISurveyDocument[] }) {
    const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
    const [selectedSurvey, setSelectedSurvey] = useState<(CustomISurveyDocument & { _id: string }) | null>(null);
    const [data, setData] = useState<ISurveyAnalytics | null>(null as ISurveyAnalytics | null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFilterClicked, setIsFilterClicked] = useState(false);
    const [selectedPageIndex, setSelectedPageIndex] = useState<number>(-1);
    const [filters, setFilters] = useState<Filter[]>([]);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<number>(0);

    useEffect(() => {
        const loadAnalytics = async () => {
            if (!selectedSurveyId) return;

            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                filters.forEach((f) => {
                    params.append("filterQuestion[]", f.question);
                    params.append("filterAnswer[]", f.answer);
                    if (f.row) params.append("filterRow[]", f.row);
                });

                const response = await fetch(`/api/survey/${selectedSurveyId}/results?${params.toString()}`);
                if (!response.ok) throw new Error("Erro na resposta da API");

                const json = await response.json();
                setData(json.pages?.length ? json : null);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);

                if (error instanceof Error) {
                    console.error("Mensagem de erro:", error.message);
                    console.error("Stack trace:", error.stack);
                } else {
                    console.error("Erro desconhecido:", error);
                }

                setError("Erro ao carregar os dados. Por favor, tente recarregar a página.");
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, [selectedSurveyId, filters]);

    const handleSurveyChange = (key: Key) => {
        const newId = (Array.isArray(key) ? key[0] : key) as string;
        setSelectedSurveyId(newId);

        if (!newId) {
            setSelectedSurvey(null);
            setData(null);
            setError(null);
            return;
        }

        const survey = surveys.find((s) => s._id === newId);
        if (survey) {
            setSelectedSurvey(survey);
            setError(null);
        } else {
            setSelectedSurvey(null);
            setData(null);
            setError("Questionário não encontrado. Verifique o ID e tente novamente.");
        }
    };

    const handleDownloadPDF = async () => {
        if (!selectedSurvey) return;
        setIsGeneratingPDF(true);
        setDownloadProgress(0);

        try {
            const allContainers = document.querySelectorAll('.chart-container');

            const validContainers = Array.from(allContainers).filter(container => {
                const text = container.textContent || "";
                return !text.includes("Nenhum dado disponível para esta pergunta");
            });

            if (!validContainers.length) {
                console.warn('Nenhum gráfico com dados disponível para capturar.');
                setIsGeneratingPDF(false);
                return;
            }

            const pdf = new jsPDF('p', 'px', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const headerHeight = 50;
            const footerHeight = 70;
            const marginX = 20;
            const marginYFirstPage = headerHeight + 20;
            const marginYOtherPages = 30;
            const chartsPerPage = 2;
            const chartWidth = pageWidth - marginX * 2;
            const chartHeight = (pageHeight - marginYOtherPages - footerHeight - (chartsPerPage + 1) * 30) / chartsPerPage; // Ajuste para maior espaçamento entre gráficos
            const verticalSpacing = 30;

            const totalSteps = validContainers.length * chartsPerPage + 1;
            let currentStep = 0;

            const updateProgress = () => {
                currentStep++;
                setDownloadProgress(Math.min((currentStep / totalSteps) * 100, 100));
            };

            const formattedFilters = filters.length > 0
                ? filters.map(f => {
                    const questionTitle = data?.pages
                        .flatMap((page: { questions: { name: string; title: string }[] }) => page.questions)
                        .find(q => q.name === f.question)?.title || f.question;
                    return `(${questionTitle} ${f.answer})`;
                })
                : ['Nenhum filtro aplicado'];

            pdf.setFillColor("#0F0F0F");
            pdf.rect(0, 0, pageWidth, headerHeight, 'F');

            pdf.setTextColor(255);
            pdf.setFontSize(16);
            pdf.text(selectedSurvey.title, marginX, 20);

            pdf.setFontSize(12);
            pdf.text(`Dimensão: ${selectedPageIndex === -1 ? 'Todas' : data?.pages[selectedPageIndex]?.title || 'Desconhecida'}`, marginX, 35);

            let isLastPage = false;

            for (let i = 0; i < validContainers.length; i += chartsPerPage) {
                const isFirstPage = i === 0;
                const marginY = isFirstPage ? marginYFirstPage : marginYOtherPages;

                if (!isFirstPage) {
                    pdf.addPage();
                }

                const currentCharts = validContainers.slice(i, i + chartsPerPage);

                const availableHeight = pageHeight - headerHeight - footerHeight;
                const totalChartHeight = chartHeight * currentCharts.length + verticalSpacing * (currentCharts.length - 1);
                const startY = headerHeight + (availableHeight - totalChartHeight) / 2;

                for (let j = 0; j < currentCharts.length; j++) {
                    const container = currentCharts[j] as HTMLElement;
                    await new Promise(resolve => setTimeout(resolve, 100));

                    const dataUrl = await toPng(container, { cacheBust: true, pixelRatio: 2 });

                    const posX = (pageWidth - chartWidth) / 2;
                    const posY = startY + j * (chartHeight + verticalSpacing);

                    pdf.setDrawColor(15);
                    pdf.setLineWidth(1);
                    pdf.roundedRect(posX - 2, posY - 2, chartWidth + 4, chartHeight + 4, 5, 5, 'S');
                    pdf.addImage(dataUrl, 'PNG', posX, posY, chartWidth, chartHeight);

                    updateProgress();
                    isLastPage = i + j + 1 === validContainers.length;
                }

                if (isLastPage) {
                    pdf.setFillColor("#0F0F0F");
                    pdf.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');

                    pdf.setTextColor(255);
                    pdf.setFontSize(12);
                    pdf.text('Filtros Aplicados:', marginX, pageHeight - footerHeight + 20);

                    let currentX = marginX;
                    let currentY = pageHeight - footerHeight + 35;
                    formattedFilters.forEach((filter, index) => {
                        const filterWidth = pdf.getTextWidth(filter + ', ');
                        if (currentX + filterWidth > pageWidth - marginX) {
                            currentX = marginX;
                            currentY += 10;
                        }
                        if (currentY + 10 > pageHeight) {
                            pdf.addPage();
                            pdf.setFillColor("#0F0F0F");
                            pdf.rect(0, 0, pageWidth, footerHeight, 'F');
                            pdf.setTextColor(255);
                            pdf.text('Filtros Aplicados (continuação):', marginX, 20);
                            currentX = marginX;
                            currentY = 35;
                        }
                        pdf.text(filter + (index < formattedFilters.length - 1 ? ',' : ''), currentX, currentY);
                        currentX += filterWidth;
                    });
                }
            }

            updateProgress();
            pdf.save(`${selectedSurvey.title}.pdf`);
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
        } finally {
            setIsGeneratingPDF(false);
            setDownloadProgress(0);
        }
    };

    return (
        <div className="p-6 min-h-screen">
            <header className="bg-gray-200 rounded-t-3xl shadow-xl px-20 py-4 max-w-7xl mx-auto mt-10 mb-2 text-center">
                <div className="flex items-center gap-5">
                    <Image src={minipc} alt="MiniPC" width={60} height={60} className=" bg-slate-950 rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-sm shadow-xl p-4" />
                    <h1 className="text-2xl font-semibold text-black">
                        {selectedSurvey?.title || 'Pesquisas'}
                    </h1>
                </div>
            </header>

            <header className="bg-white rounded-b-3xl shadow-xl px-32 py-24 max-w-7xl mx-auto text-center relative">
                <h1 className="text-2xl font-medium text-gray-900">
                    {selectedSurvey ? (
                        selectedSurvey.description
                    ) : (
                        <>
                            Explore as pesquisas e conduza análises personalizadas.
                            <br />
                            Comece selecionando um questionário para visualizar os resultados.
                        </>
                    )}

                </h1>
            </header>

            <div className="flex justify-end max-w-7xl mx-auto mb-6 space-x-4 mt-8 mr-32">
                <Select
                    className="w-full lg:max-w-xs"
                    label="Questionários"
                    placeholder="Selecione"
                    selectedKeys={selectedSurveyId ? [selectedSurveyId] : new Set()}
                    variant="bordered"
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as string;
                        handleSurveyChange(selectedKey);
                    }}
                >
                    {surveys.map((survey) => (
                        <SelectItem
                            key={String(survey._id)}
                            value={String(survey._id)}
                        >
                            {survey.title}
                        </SelectItem>
                    ))}
                </Select>

                <Button
                    variant="bordered"
                    className="w-full lg:w-auto"
                    style={{
                        paddingLeft: '40px',
                        paddingRight: '40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    onClick={() => setIsFilterClicked((prev) => !prev)}
                    isDisabled={!selectedSurveyId}
                >
                    <FaFilter style={{ position: 'absolute', left: '15px', fontSize: '1em' }} />
                    Filtros
                </Button>

                <Button
                    variant="solid"
                    className="w-full lg:w-auto"
                    style={{
                        backgroundColor: '#0f172a',
                        color: 'white',
                        position: 'relative',
                        width: '100%',
                        maxWidth: '180px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isGeneratingPDF || !selectedSurveyId ? 'default' : 'pointer',
                    }}
                    isDisabled={isGeneratingPDF || !selectedSurveyId}
                    onClick={!isGeneratingPDF && selectedSurveyId ? handleDownloadPDF : undefined}
                >
                    {isGeneratingPDF ? (
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                            <span style={{ color: 'white', marginRight: '10px', fontSize: '14px', width: '30px', textAlign: 'right' }}>
                                {Math.round(downloadProgress)}%
                            </span>
                            <Progress
                                aria-label="Progresso do download"
                                className="w-full"
                                color="success"
                                size="sm"
                                value={downloadProgress}
                            />
                        </div>
                    ) : (
                        <>
                            Download <IoMdDownload className="ml-2" />
                        </>
                    )}
                </Button>
            </div>

            {isFilterClicked && selectedSurvey && (
                <div className="mt-4">
                    <Filters
                        surveyId={selectedSurvey._id}
                        setFiltersApplied={(applied) => {
                            setFilters(applied);
                            setIsFilterClicked(false);
                        }}
                        setError={setError}
                        setSelectedPageIndex={setSelectedPageIndex}
                        initialFilters={filters}
                    />
                </div>
            )}

            <div className="space-y-10">
                {selectedPageIndex === -1 ? (
                    data?.pages.map((_: any, pageIndex: number) => (
                        <div key={pageIndex} className="space-y-6">
                            <Graphics
                                data={data}
                                selectedPageIndex={pageIndex}
                                lastUpdate={true}
                                download={!isGeneratingPDF}
                                modal={!isGeneratingPDF}
                                selectCharts={false}
                                selectedChartTypes={{} as Record<string, string>}
                                surveyUpdate={{ updatedAt: selectedSurvey?.updatedAt || '' }}
                            />
                        </div>
                    ))
                ) : (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-center mb-8 mt-4">
                            {data?.pages[selectedPageIndex]?.title}
                        </h2>
                        <Graphics
                            data={data}
                            selectedPageIndex={selectedPageIndex}
                            lastUpdate={true}
                            download={!isGeneratingPDF}
                            modal={!isGeneratingPDF}
                            selectCharts={false}
                            selectedChartTypes={{} as Record<string, string>}
                            surveyUpdate={{ updatedAt: selectedSurvey?.updatedAt || '' }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// revisar
export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const session = await getSession(context);
        if (!session || !session.user || !session.user._id) {
            return {
                redirect: {
                    destination: '/authenticate',
                    permanent: false,
                },
            };
        }

        await connectToMongoDB();
        const userId = session.user._id;
        const userAnalytics = await SurveyAnalytics.find({ author: userId }).lean();
        const validSurveyIds = userAnalytics

            .map(a => {
                try {
                    return new mongoose.Types.ObjectId(a.surveyId.toString());
                } catch (error) {
                    console.error("ID inválido:", a.surveyId);
                    return null;
                }
            })
            .filter(Boolean);

        const userSurveys = await Survey.find({
            _id: { $in: validSurveyIds }
        }).lean();

        const formattedSurveys = userSurveys.map(survey => ({
            ...survey,
            updatedAt: survey.updatedAt ? new Date(survey.updatedAt).toISOString() : null
        }));

        return {
            props: {
                surveys: JSON.parse(JSON.stringify(formattedSurveys))
            }
        };
    } catch (error) {
        console.error("Erro no servidor:", error);
        return {
            props: {
                surveys: []
            }
        };
    }
};