import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/select";

interface QuestionFilter {
  name: string;
  title: string;
  type: string;
  options?: Array<{ label: string }>;
  rows?: Array<{ text: string }>;
}

export interface Filter {
  id: string;
  question: string;
  answer: string;
  row?: string;
}

interface FiltersProps {
  surveyId: string;
  setFiltersApplied: (filters: Filter[]) => void;
  setError: (error: string | null) => void;
  setSelectedPageIndex: (index: number) => void;
  initialFilters: Filter[];
}

const Filters = ({
  surveyId,
  setFiltersApplied,
  setError,
  setSelectedPageIndex,
  initialFilters,
}: FiltersProps) => {
  const [filters, setFilters] = useState<Filter[]>(initialFilters || []);
  const [questions, setQuestions] = useState<QuestionFilter[]>([]);
  const [pages, setPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>("Todas");
  const [loadingFilters, setLoadingFilters] = useState(false);

  const generateId = () => Date.now().toString();

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingFilters(true);
      setError(null);
      try {
        const response = await axios.get(`/api/survey/${surveyId}`);
        const filterable = response.data.pages
          .flatMap((p: any) => p.questions)
          .filter((q: any) => ["radio", "checkbox", "select", "table"].includes(q.type));
        setQuestions(filterable);

        const dimensionTitles = response.data.pages.map((p: any) => p.title);
        setPages(["Todas", ...dimensionTitles]);
      } catch (err) {
        setError("Erro ao carregar perguntas.");
      } finally {
        setLoadingFilters(false);
      }
    };
    if (surveyId) fetchQuestions();
  }, [surveyId, setError]);

  const getType = (q: string) => questions.find((x) => x.name === q)?.type || "";
  const getAnswers = (q: string) => {
    const question = questions.find((x: any) => x.name === q);
    if (!question) return [];
    if (question.type === "table" && question.options) return question.options.map((o: any) => o.label);
    return question.options?.map((o: any) => o.label) || [];
  };
  const getRows = (q: string) => {
    const question = questions.find((x: any) => x.name === q);
    if (question?.type === "table" && question.rows) return question.rows.map((r: any) => r.text);
    return [];
  };

  const handleAdd = () => {
    setFilters((prev) => [
      ...prev,
      { id: generateId(), question: "", answer: "", row: "" }
    ]);
  };

  const handleRemove = (id: string) => {
    const element = document.getElementById(`filter-${id}`);
    if (element) {
      element.style.transition = "transform 0.5s ease, opacity 0.5s ease";
      element.style.transform = "scale(0)";
      element.style.opacity = "0";
      setTimeout(() => {
        setFilters((prev) => prev.filter((f) => f.id !== id));
      }, 500);
    }
  };

  const handleChange = (id: string, field: keyof Filter, value: string) => {
    setFilters((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            [field]: value,
            ...(field === "question" ? { answer: "", row: "" } : {})
          };
        }
        return f;
      })
    );
  };

  const apply = () => {
    const valid = filters.every((f) => f.question && f.answer && (getType(f.question) !== "table" || f.row));
    if (!valid) {
      setError("Preencha todos os campos dos filtros antes de aplicar.");
      return;
    }
    setFiltersApplied(filters);
  };

  const clearFilters = () => {
    setFilters([]);
    setSelectedPage("Todas");
    setSelectedPageIndex(-1);
    setFiltersApplied([]);
  };

  const handlePageChange = (page: string) => {
    setSelectedPage(page);
    setSelectedPageIndex(page === "Todas" ? -1 : pages.indexOf(page) - 1);
  };

  return (
    <div className="p-4 lg:p-6 bg-white shadow rounded-lg space-y-4 lg:space-y-6">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <Select
          className="w-full lg:w-1/3"
          label="Dimensão"
          selectedKeys={[selectedPage]}
          onSelectionChange={(keys) => handlePageChange(String(Array.from(keys)[0]))}
        >
          {pages.map((page) => (
            <SelectItem key={page} value={page}>
              {page}
            </SelectItem>
          ))}
        </Select>
        {!filters.length && (
          <Button onClick={handleAdd} className="w-full lg:w-auto" variant="solid">
            Adicionar Filtros
          </Button>
        )}
      </div>

      <div className="space-y-4 lg:space-y-6">
        {filters.map((f, idx) => (
          <div
            key={f.id}
            id={`filter-${f.id}`}
            className="border p-3 lg:p-4 rounded-lg bg-gray-50 space-y-3 lg:space-y-4"
            style={{ transformOrigin: "center", overflow: "hidden" }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm lg:text-base font-semibold">Filtro {idx + 1}</span>
              <Button
                color="danger"
                variant="light"
                size="sm"
                onClick={() => handleRemove(f.id)}
              >
                Remover
              </Button>
            </div>
            <Select
              className="w-full"
              selectedKeys={f.question ? [f.question] : []}
              onSelectionChange={(keys) => handleChange(f.id, "question", String(Array.from(keys)[0] || ""))}
              placeholder="Questão"
            >
              {questions.map((q) => (
                <SelectItem key={q.name} value={q.name}>
                  {q.title}
                </SelectItem>
              ))}
            </Select>
            {f.question && getType(f.question) === "table" && (
              <Select
                className="w-full"
                selectedKeys={f.row ? [f.row] : []}
                onSelectionChange={(keys) => handleChange(f.id, "row", String(Array.from(keys)[0] || ""))}
                placeholder="Linha"
              >
                {getRows(f.question).map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </Select>
            )}
            {f.question && (
              <Select
                className="w-full"
                selectedKeys={f.answer ? [f.answer] : []}
                onSelectionChange={(keys) => handleChange(f.id, "answer", String(Array.from(keys)[0] || ""))}
                placeholder="Resposta"
              >
                {getAnswers(f.question).map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </Select>
            )}
          </div>
        ))}
        {filters.length > 0 && (
          <div className="flex justify-start">
            <Button onClick={handleAdd} variant="bordered" className="text-slate-950">
              +
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row justify-end gap-4">
        <Button
          onClick={apply}
          variant="solid"
          className="bg-slate-950 w-full lg:w-auto"
          style={{ color: "white" }}
        >
          Aplicar Filtros
        </Button>
        <Button
          onClick={clearFilters}
          variant="solid"
          color="danger"
          className="w-full lg:w-auto"
          style={{ color: "white" }}
        >
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
};

export default Filters;