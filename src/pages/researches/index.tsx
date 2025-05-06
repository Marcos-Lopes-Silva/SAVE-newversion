import { api } from "@/lib/api";
import { t } from "i18next";
import { connectToMongoDB } from "@/lib/db";
import ImageGraphic from "@/static/images/graphicsPage.svg";
import Image from "next/image";
import { Select, SelectItem } from "@nextui-org/select";
import { FaFilter } from "react-icons/fa";
import { GetServerSideProps } from "next";
import { Key } from "@react-types/shared";
import { Button } from "@nextui-org/button";
import { IoMdDownload } from "react-icons/io";
import { RiErrorWarningLine } from "react-icons/ri";
import { useState, useEffect } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { ISurveyAnalytics } from "../../../models/surveyAnalytics";
import Survey from "../../../models/surveyModel";
import SurveyAnalytics from "../../../models/surveyAnalytics";
import { ISurveyDocument } from "../../../models/surveyModel";
import mongoose from "mongoose";
import Filters from "@/components/Filters";
import Graphics from "@/components/Graphics";

export default function Researches({ surveys }: { surveys: ISurveyDocument[] }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<ISurveyDocument | null>(null);
  const [dimensionOptions, setDimensionOptions] = useState<string[]>([]);
  const [data, setData] = useState<ISurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFilterClicked, setIsFilterClicked] = useState(false);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(-1);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [dimension, setDimension] = useState<string>("Dimensão");
  const [degree, setDegree] = useState<string>("Curso");
  const [gender, setGender] = useState<string>("Gênero");
  const [entry, setEntry] = useState<string>("Ingresso");
  const [graduation, setGraduation] = useState<string>("Graduação");

  useEffect(() => {
    if (!selectedOption) return;
    const fetchSurvey = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<ISurveyDocument>(`survey/${selectedOption}`);
        setSelectedSurvey(response);
        setDimensionOptions(response.pages.map((page: { title: string }) => page.title));
      } catch (error) {
        console.error("Erro ao buscar o questionário:", error);
        setSelectedSurvey(null);
        setError("Erro ao carregar questionário.");
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [selectedOption]);

  const handleSurveyChange = (key: Key) => {
    setSelectedOption(key as string);
    setSelectedPageIndex(-1);
  };

  useEffect(() => {
    if (!selectedSurvey) return;
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/survey/${selectedSurvey._id}/results`);
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [selectedSurvey]);

  const handleDownloadPDF = async () => {
    if (!selectedSurvey) return;
    setIsGeneratingPDF(true);

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

      const headerHeight = 50; // Altura do cabeçalho
      const marginX = 20;
      const marginY = headerHeight + 20; // Ajustar margem Y para não sobrepor o cabeçalho
      const chartsPerPage = 2;
      const chartWidth = pageWidth - marginX * 2;
      const baseChartHeight = (pageHeight - marginY * (chartsPerPage + 1)) / chartsPerPage;
      const chartHeight = baseChartHeight * 0.95; // Aumentar levemente a altura dos gráficos

      pdf.setFillColor("#0F0F0F");
      pdf.rect(0, 0, pageWidth, headerHeight, 'F');

      pdf.setTextColor(255);
      pdf.setFontSize(16);
      pdf.text(selectedSurvey.title, marginX, 20);

      pdf.setFontSize(11);
      const appliedFilters = [
        dimension !== "Dimensão" ? `Dimensão: ${dimension}` : null,
        degree !== "Curso" ? `Curso: ${degree}` : null,
        gender !== "Gênero" ? `Gênero: ${gender}` : null,
        entry !== "Ingresso" ? `Ingresso: ${entry}` : null,
        graduation !== "Graduação" ? `Graduação: ${graduation}` : null
      ].filter(Boolean);

      if (appliedFilters.length > 0) {
        pdf.text(`Filtros Aplicados:`, marginX, 40);
        appliedFilters.forEach((filter, index) => {
          pdf.text(filter, marginX, 60 + index * 10);
        });
      } else {
        pdf.text(`Filtros: Nenhum`, marginX, 35);
      }

      for (let i = 0; i < validContainers.length; i += chartsPerPage) {
        if (i > 0) {
          pdf.addPage();
        }

        const currentCharts = validContainers.slice(i, i + chartsPerPage);
        const verticalSpacing = (pageHeight - (chartHeight * currentCharts.length)) / (currentCharts.length + 1);

        for (let j = 0; j < currentCharts.length; j++) {
          const container = currentCharts[j] as HTMLElement;
          await new Promise(resolve => setTimeout(resolve, 100));

          const dataUrl = await toPng(container, { cacheBust: true, pixelRatio: 2 });

          const posX = (pageWidth - chartWidth) / 2; // Centralizar horizontalmente
          const posY = (i === 0 && j === 0 ? marginY : verticalSpacing + j * (chartHeight + verticalSpacing)); // Ajustar para não sobrepor o cabeçalho na 1ª página


          pdf.setDrawColor(15); // Cor da borda (slate-950)
          pdf.setLineWidth(1);
          pdf.roundedRect(posX - 2, posY - 2, chartWidth + 4, chartHeight + 4, 5, 5, 'S'); // Ajustar borda proporcional

          pdf.addImage(dataUrl, 'PNG', posX, posY, chartWidth, chartHeight);
        }
      }

      pdf.save(`${selectedSurvey.title}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case "dimension":
        setDimension(value);
        break;
      case "degree":
        setDegree(value);
        break;
      case "gender":
        setGender(value);
        break;
      case "entry":
        setEntry(value);
        break;
      case "graduation":
        setGraduation(value);
        break;
      default:
        break;
    }
  };

  return (
    <main>
      <header className="flex bg-slate-100 shadow-lg rounded-t-3xl gap-10 p-8 lg:px-32 lg:py-6 max-w-7xl mx-auto mt-10 relative">
        <div className="flex flex-col gap-4 lg:gap-4 place-content-center">
          <h1 className="hidden sm:block font-semibold text-2xl mt-5 text-left lg:py-1">
            Pesquisas
          </h1>
          <p className="text-sm sm:text-md text-justify">
            Explore as pesquisas e conduza análises personalizadas, selecionando a dimensão desejada
            para visualizar os dados com precisão.
          </p>
        </div>
        <Image className="p-4 lg:py-5" src={ImageGraphic} alt="graphics" priority />
        <div className="absolute top-4 right-4 p-5">
          <RiErrorWarningLine
            style={{ fontSize: '2em', color: 'black' }}
            title="Selecione um dos questionários disponíveis para começar a visualizar os gráficos."
          />
        </div>
      </header>

      <div className="flex justify-between items-center mt-12 mx-auto max-w-7xl">
        <Select
          className="max-w-xs"
          label="Questionários"
          placeholder="Selecione"
          selectedKeys={new Set([selectedOption || ""])}
          variant="bordered"
          onSelectionChange={(keys) => handleSurveyChange(Array.from(keys)[0] as string)}
        >
          {surveys.map((survey) => (
            <SelectItem key={String(survey._id)}>{survey.title}</SelectItem>
          ))}
        </Select>

        <Button
          variant="bordered"
          style={{
            paddingLeft: '60px',
            paddingRight: '60px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={() => setIsFilterClicked(!isFilterClicked)}
          isDisabled={!selectedSurvey}
        >
          <FaFilter style={{ position: 'absolute', left: '15px', fontSize: '1em' }} />
          Filtros
        </Button>
        <Button
          variant="solid"
          style={{ backgroundColor: 'black', color: 'white' }}
          isDisabled={!selectedSurvey}
          onClick={handleDownloadPDF}
          isLoading={isGeneratingPDF}
        >
          {isGeneratingPDF ? 'Gerando PDF...' : 'Download'} <IoMdDownload className="ml-2" />
        </Button>
      </div>

      <div className="absolute z-40 max-w-7xl right-0 left-0 mx-auto -mt-5 px-4">
        {isFilterClicked && (
          <Filters
            surveyId={selectedSurvey?._id}
            setData={setData}
            setLoading={setLoading}
            setError={setError}
            setSelectedPageIndex={setSelectedPageIndex}
            setFiltersApplied={setFiltersApplied}
            dimension={dimension}
            degree={degree}
            gender={gender}
            entry={entry}
            graduation={graduation}
            onFilterChange={handleFilterChange}
          />
        )}
      </div>

      {error && (
        <div className="p-4 text-center text-red-500 text-lg font-semibold">
          {error}
        </div>
      )}

      <div className="flex -mt-8 mx-auto max-w-7xl">
        {data && (
          <Graphics
            data={data}
            selectedPageIndex={selectedPageIndex}
            lastUpdate={false}
            download={!isGeneratingPDF}
            modal={!isGeneratingPDF}
            selectCharts={!isGeneratingPDF} // Alterar para false ao gerar PDF
          />
        )}
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  await connectToMongoDB();

  const publicAnalytics = await SurveyAnalytics.find({ hasPublic: true }).lean();
  const rawIds = publicAnalytics.map(a => a.surveyId);
  console.log('[2] IDs crus:', rawIds);

  const publicSurveyIds = rawIds.map(id => {
    try {
      return new mongoose.Types.ObjectId(id.toString());
    } catch (error) {
      console.error('ID inválido:', id);
      return null;
    }
  }).filter(Boolean);

  const publicSurveys = await Survey.find({
    _id: { $in: publicSurveyIds }
  }).lean();

  return {
    props: {
      surveys: JSON.parse(JSON.stringify(publicSurveys))
    }
  };
};
