import { useState, useRef } from "react";
import { Button, Select, SelectItem, Modal, ModalHeader, ModalBody, useDisclosure, ModalContent } from "@nextui-org/react";
import { IoMdDownload } from "react-icons/io";
import { PiClockClockwiseFill } from "react-icons/pi";
import { TbArrowsDiagonal } from "react-icons/tb";
import Charts from "@/components/Charts";
import { toPng } from "html-to-image";
import { format } from "date-fns";

interface GraphicsProps {
  data: any;
  selectedPageIndex: number;
  lastUpdate: boolean;
  download: boolean;
  modal: boolean;
  selectCharts: boolean;
  selectedQuestionName?: string;
  defaultChart?: Record<string, string>;
  selectedChartTypes: { [key: string]: string };
  setSelectedChartTypes?: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  surveyUpdate?: { updatedAt: string };
}

const hexChar = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"];

const Graphics = ({
  data,
  selectedPageIndex,
  lastUpdate,
  download,
  modal,
  selectCharts,
  selectedQuestionName,
  defaultChart,
  selectedChartTypes,
  setSelectedChartTypes,
  surveyUpdate
}: GraphicsProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalContent, setModalContent] = useState<JSX.Element | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("");
  const colorsRef = useRef<string[]>([]);

  const pages = Array.isArray(data?.pages) ? data.pages : [];

  const getColors = (n: number) => {
    while (colorsRef.current.length < n) {
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += hexChar[Math.floor(Math.random() * hexChar.length)];
      }
      if (!colorsRef.current.includes(color)) colorsRef.current.push(color);
    }
    return colorsRef.current.slice(0, n);
  };

  const processTableData = (tableData: any[]) => {
    return tableData
      .map((row) => ({
        name: row.row,
        value: row.options.reduce((sum: number, option: { value: number }) => sum + option.value, 0),
      }))
      .filter((item) => item.value > 0);
  };

  const openModal = (title: string, content: JSX.Element) => {
    setModalTitle(title);
    setModalContent(content);
    onOpen();
  };

  const handleDownloadChart = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const chartContainer = event.currentTarget.closest(".chart-container");
    if (!chartContainer) return;
    try {
      const buttons = chartContainer.querySelectorAll('.no-capture');
      buttons.forEach(button => (button as HTMLElement).style.display = 'none');

      await new Promise(resolve => setTimeout(resolve, 100));
      const dataUrl = await toPng(chartContainer as HTMLElement, {
        cacheBust: true,
        pixelRatio: 2
      });

      buttons.forEach(button => (button as HTMLElement).style.display = '');

      const link = document.createElement('a');
      link.download = `chart-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Erro ao baixar gráfico:", error);
    }
  };

  const filteredQuestions = selectedQuestionName
    ? pages
      .flatMap((page: any) => page.questions)
      .filter((question: any) => question.name === selectedQuestionName)
    : pages
      .filter((_: any, index: number) =>
        selectedPageIndex === -1 || index === selectedPageIndex
      )
      .flatMap((page: any) => page.questions);

  const handleChartTypeChange = (id: string, type: string) => {
    setSelectedChartTypes!((prev) => ({
      ...prev,
      [id]: type,
    }));
  };

  return (
    <div className="mx-auto max-w-full mt-6 px-4 lg:max-w-5xl lg:mt-20 lg:px-0">
      <div className="flex flex-col gap-6 lg:gap-6 ">
        {filteredQuestions.map((question: any) => {
          const id = question.name;
          const isTable = question.type === "table";
          const rawData = question.processedData?.data || [];
          const filteredData = isTable
            ? processTableData(rawData)
            : rawData.filter((item: any) => item.value > 0);
          const defaultChartType = defaultChart?.[id] || question.chart;
          const chartType = selectedChartTypes[id] || defaultChartType || 'pie';

          const chartContent = (
            <div className="w-full h-[80vh] flex items-center justify-center">
              <Charts
                data={filteredData}
                typeChart={chartType}
                colors={getColors(filteredData.length)}
              />
            </div>
          );

          return (
            <div
              key={id}
              className="chart-container bg-white shadow-lg rounded-2xl overflow-hidden relative"
            >
              <div className="bg-slate-950 text-white p-4 text-sm font-bold rounded-t-2xl">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="flex items-center gap-36 mb-2 lg:gap-5 lg:ml-auto lg:order-2">
                    {lastUpdate && (
                      <div className="flex items-center justify-center gap-2 border-1 lg:border-2 rounded-lg border-white p-2 text-white text-xs no-capture lg:order-none lg:ml-0 mx-auto">
                        <PiClockClockwiseFill className="text-white text-sm lg:text-xl" />
                        <p>{surveyUpdate?.updatedAt ? format(new Date(surveyUpdate.updatedAt), 'dd/MM/yyyy') : "Data não disponível"}</p>
                      </div>
                    )}
                    {download && (
                      <Button
                        variant="bordered"
                        size="sm"
                        className="hidden lg:flex border-white h-8 no-capture lg:h-9"
                        onClick={handleDownloadChart}
                      >
                        <IoMdDownload className="text-white text-sm lg:text-xl" />
                      </Button>
                    )}
                  </div>
                  <h2 className="text-white text-sm lg:text-lg font-bold lg:w-4/5 lg:order-1 text-balance-left">
                    {question.title}
                  </h2>
                </div>
              </div>

              <div className="p-4 w-full overflow-x-visible">
                {filteredData.length > 0 ? (
                  <div className="w-full h-[200px] flex items-center justify-center lg:h-[450px]">
                    <Charts
                      data={filteredData}
                      typeChart={chartType}
                      colors={getColors(filteredData.length)}
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm lg:text-base">
                    Nenhum dado disponível para esta pergunta.
                  </div>
                )}
              </div>

              {selectCharts && (
                <Select
                  className="max-w-[120px] no-capture absolute bottom-3 left-3 bg-white opacity-70 rounded-lg lg:max-w-[150px]"
                  label="Tipo de Gráfico"
                  selectedKeys={[chartType]}
                  onChange={(e) => handleChartTypeChange(id, e.target.value)}
                  size="sm"
                  variant="bordered"
                  showScrollIndicators={true}
                  listboxProps={{
                    className: "max-h-40 overflow-auto",
                  }}
                >
                  <SelectItem key="pie">Pizza</SelectItem>
                  <SelectItem key="bar">Barras</SelectItem>
                  <SelectItem key="line">Linhas</SelectItem>
                  <SelectItem key="area">Área</SelectItem>
                  <SelectItem key="scatter">Dispersão</SelectItem>
                  <SelectItem key="radar">Radar</SelectItem>
                  <SelectItem key="radial">Barras Radiais</SelectItem>
                  <SelectItem key="wordCloud">Nuvem de Palavras</SelectItem>
                </Select>
              )}

              {modal && (
                <Button
                  variant="solid"
                  size="sm"
                  className="hidden lg:flex items-center justify-center absolute bottom-3 right-3 bg-slate-950 h-8 lg:h-9 no-capture"
                  onClick={() => openModal(question.title, chartContent)}
                >
                  <TbArrowsDiagonal className="text-white text-sm lg:text-xl" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent className="w-[95%] max-w-none lg:w-[85%]">
          <ModalHeader className="px-6 py-3 text-lg bg-slate-950 text-white lg:px-12 lg:py-5 lg:text-xl ">
            {modalTitle}
          </ModalHeader>
          <ModalBody>{modalContent}</ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Graphics;