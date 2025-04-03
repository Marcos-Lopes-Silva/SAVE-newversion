import { useState, useRef, useEffect } from "react";
import { Button, Select, SelectItem, Modal, ModalHeader, ModalBody, useDisclosure, ModalContent } from "@nextui-org/react";
import { IoMdDownload } from "react-icons/io";
import { PiClockClockwiseFill } from "react-icons/pi";
import { TbArrowsDiagonal } from "react-icons/tb";
import axios from "axios";
import Charts from "@/components/Charts";
import { toPng } from "html-to-image";

interface GraphicsProps {
  data: any;
  selectedPageIndex: number;
  lastUpdate: boolean;
  download: boolean;
  modal: boolean;
  selectCharts: boolean;
  defaultChart?: Record<string, string>;
  saveOnPublish?: boolean;
  onSaveComplete?: (message: string) => void; // Adicionar callback para feedback
}

const hexChar = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"];

const Graphics = ({ data, selectedPageIndex, lastUpdate, download, modal, selectCharts, defaultChart, saveOnPublish, onSaveComplete }: GraphicsProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalContent, setModalContent] = useState<JSX.Element | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [selectedChartTypes, setSelectedChartTypes] = useState<Record<string, string>>({});
  const generatedColors = useRef<string[]>([]);

  // salvar os gráficos quando saveOnPublish for acionado
  useEffect(() => {
    const saveChartConfigurations = async () => {
      if (!saveOnPublish) return;

      try {
        const updates = Object.entries(selectedChartTypes).map(([id, chartType]) => {
          const [pageIndex, questionIndex] = id.split("-");
          const questionId = data.pages[pageIndex].questions[questionIndex]._id; // Obter o ID da pergunta

          return axios.patch(
            `/api/survey/${data.surveyId}/results`, 
            { 
              chartConfigurations: { 
                id: questionId,  // Usar o ID correto da pergunta
                chartType 
              }
            }
          );
        });

        await Promise.all(updates);
        console.log("Configurações dos gráficos salvas com sucesso!");
        setSelectedChartTypes({});
        onSaveComplete?.("Configurações dos gráficos salvas com sucesso!"); // Enviar mensagem de sucesso
      } catch (error) {
        console.error("Erro ao salvar configurações dos gráficos:", error);
        onSaveComplete?.("Erro ao salvar configurações dos gráficos."); // Enviar mensagem de erro
      }
    };

    saveChartConfigurations();
  }, [saveOnPublish]); // Remover dependências desnecessárias

  const getChartColors = (dataLength: number) => {
    while (generatedColors.current.length < dataLength) {
      let color: string;
      do {
        color = "#";
        for (let i = 0; i < 6; i++) {
          const randomPosition = Math.floor(Math.random() * hexChar.length);
          color += hexChar[randomPosition];
        }
      } while (generatedColors.current.includes(color));

      generatedColors.current.push(color);
    }

    return generatedColors.current.slice(0, dataLength);
  };

  const handleChartTypeChange = (id: string, type: string) => {
    setSelectedChartTypes((prev) => ({
      ...prev,
      [id]: type,
    }));
  };

  const processTableData = (tableData: any[]) => {
    return tableData.map((row) => ({
      name: row.row,
      value: row.options.reduce((sum: number, option: { value: number }) => sum + option.value, 0),
    }));
  };

  const openModal = (title: string, content: JSX.Element) => {
    setModalTitle(title);
    setModalContent(content);
    onOpen();
  };

  const handleDownloadChart = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const chartContainer = event.currentTarget.closest('.chart-container');
    if (!chartContainer) return;

    try {
      const buttons = chartContainer.querySelectorAll('.no-capture');
      buttons.forEach(button => (button as HTMLElement).style.display = 'none');

      await new Promise(resolve => setTimeout(resolve, 500));
      const dataUrl = await toPng(chartContainer as HTMLElement, { cacheBust: true, pixelRatio: 2 });

      buttons.forEach(button => (button as HTMLElement).style.display = '');

      const link = document.createElement('a');
      link.download = `chart-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erro ao baixar gráfico:', error);
    }
  };

  return (
    <div className="mx-auto max-w-5xl mt-20">
      <div className="flex flex-col gap-8">
        {data.pages
          .filter((_: unknown, pageIndex: number) => selectedPageIndex === -1 || pageIndex === selectedPageIndex)
          .map((page: { questions: any[] }, pageIndex: number) =>
            page.questions.map((question: any, questionIndex: number) => {
              const id = `${pageIndex}-${questionIndex}`;
              const isTable = question.type === "table";
              const filteredData = isTable
                ? processTableData(question.processedData.data)
                : question.processedData.data.filter((entry: { value: number }) => entry.value > 0);

              const chartColors = getChartColors(filteredData.length);
              const defaultChartType = defaultChart?.[id] || question.chart;
              const chartType = selectedChartTypes[id] || defaultChartType;

              const chartContent = (
                <div className="flex flex-row justify-between items-center p-6 w-full">
                  {filteredData.length > 0 ? (
                    <div className="w-full h-[450px] flex items-center justify-center">
                      <Charts
                        data={filteredData}
                        typeChart={chartType}
                        colors={chartColors}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      Nenhum dado disponível para esta pergunta.
                    </div>
                  )}
                </div>
              );

              return (
                <div
                  key={id}
                  className="chart-container bg-white shadow-lg rounded-2xl overflow-hidden relative"
                >
                  <div className="bg-slate-950 text-white p-4 text-lg font-bold rounded-t-2xl">
                    <div className="flex items-center">
                      <h2 className={`question-title text-white text-lg font-bold ${!lastUpdate && !download ? "" : "w-4/5"
                        } ml-5`}>
                        {question.title}
                      </h2>
                      <div className="flex items-center gap-5 ml-auto">
                        {lastUpdate && (
                          <div className="flex gap-2 border-2 rounded-lg border-white p-2 text-white text-sm no-capture">
                            <PiClockClockwiseFill className="text-xl" />
                            <p>Ultima atualização</p>
                          </div>
                        )}
                        {download && (
                          <Button
                            variant="bordered"
                            size="sm"
                            className="border-white h-9 no-capture"
                            onClick={handleDownloadChart}
                          >
                            <IoMdDownload className="text-white text-xl" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {chartContent}

                  {selectCharts && (
                    <Select
                      className="max-w-[150px] no-capture absolute bottom-3 left-3 bg-white opacity-70 rounded-lg"
                      label="Tipo de Gráfico"
                      selectedKeys={[chartType]}
                      onChange={(e) => handleChartTypeChange(id, e.target.value)}
                      size="sm"
                      variant="bordered"
                      showScrollIndicators={true}
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
                      className="absolute bottom-3 right-3 bg-black h-9 no-capture"
                      onClick={() => openModal(question.title, chartContent)}
                    >
                      <TbArrowsDiagonal className="text-white text-xl" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent className="w-[85%] max-w-none">
          <ModalHeader className="px-12 py-5 text-xl bg-slate-950 text-white">
            {modalTitle}
          </ModalHeader>
          <ModalBody>{modalContent}</ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Graphics;