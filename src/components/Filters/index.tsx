import { useState, useEffect } from "react";
import { Select, SelectItem } from "@nextui-org/select";
import { Button } from "@nextui-org/button";
import { MdFilterAltOff } from "react-icons/md";
import { Key } from "@react-types/shared";
import { ISurveyDocument } from "@/models";

interface FiltersProps {
  surveyId: string;
  setData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedPageIndex: (index: number) => void;
  setFiltersApplied: (applied: boolean) => void;
  dimension: string;
  degree: string;
  gender: string;
  entry: string;
  graduation: string;
  onFilterChange: (filterType: string, value: string) => void;
}

const Filters = ({
  surveyId,
  setData,
  setLoading,
  setError,
  setSelectedPageIndex,
  setFiltersApplied,
  dimension,
  degree,
  gender,
  entry,
  graduation,
  onFilterChange
}: FiltersProps) => {
  const [dimensionOptions, setDimensionOptions] = useState<string[]>([]);
  const [dimensionInternal, setDimensionInternal] = useState(dimension);
  const [degreeInternal, setDegreeInternal] = useState(degree);
  const [genderInternal, setGenderInternal] = useState(gender);
  const [entryInternal, setEntryInternal] = useState(entry);
  const [graduationInternal, setGraduationInternal] = useState(graduation);
  const [selectedPageIndex, setSelectedPageIndexInternal] = useState<number>(-1);

  useEffect(() => {
    const fetchSurvey = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/survey/${surveyId}`);
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        const survey: ISurveyDocument = await response.json();
        setDimensionOptions(survey.pages.map((page: { title: string }) => page.title));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId, setLoading, setError]);

  useEffect(() => {
    setDimensionInternal(dimension);
    setDegreeInternal(degree);
    setGenderInternal(gender);
    setEntryInternal(entry);
    setGraduationInternal(graduation);
  }, [dimension, degree, gender, entry, graduation]);

  const handleDimensionChangeInternal = (key: Key) => {
    const dimensionIndex = parseInt(key as string);
    setSelectedPageIndexInternal(dimensionIndex);
    setDimensionInternal(dimensionOptions[dimensionIndex]);
    setSelectedPageIndex(dimensionIndex);
    onFilterChange("dimension", dimensionOptions[dimensionIndex]);
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    setError(null);
    setFiltersApplied(true);

    try {
      const queryParams = new URLSearchParams({
        dimension: dimensionInternal,
        degree: degreeInternal,
        gender: genderInternal,
        entry: entryInternal,
        graduation: graduationInternal,
      }).toString();

      const response = await fetch(`/api/survey/${surveyId}/results?${queryParams}`);
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    // Limpa os estados internos dos filtros
    setDimensionInternal("");
    setDegreeInternal("");
    setGenderInternal("");
    setEntryInternal("");
    setGraduationInternal("");
    setSelectedPageIndexInternal(-1);
    setFiltersApplied(false);
    setSelectedPageIndex(-1); 
    
  };

  return (
    <div className="flex justify-between items-center mt-16 mb-12 mx-auto max-w-7xl shadow-medium p-6 rounded-lg bg-white" style={{ gap: '10px' }}>
      <Select
        className="max-w-xs"
        label="Dimensão"
        placeholder="Selecione"
        aria-label="Dimensão"
        selectedKeys={dimensionOptions.includes(dimensionInternal) ? new Set([selectedPageIndex.toString()]) : new Set()}
        variant="bordered"
        onSelectionChange={(keys) => handleDimensionChangeInternal(Array.from(keys)[0] as string)}
      >
        {dimensionOptions.map((option, index) => (
          <SelectItem key={index.toString()}>{option}</SelectItem>
        ))}
      </Select>
      <Select
        className="max-w-xs"
        label="Curso"
        placeholder="Selecione"
        aria-label="Curso"
        selectedKeys={["Ciência da Computação", "Engenharia de Software"].includes(degreeInternal) ? new Set([degreeInternal]) : new Set()}
        variant="bordered"
        onSelectionChange={(keys) => setDegreeInternal(Array.from(keys)[0] as string)}
      >
        <SelectItem key="Ciência da Computação">Ciência da Computação</SelectItem>
        <SelectItem key="Engenharia de Software">Engenharia de Software</SelectItem>
      </Select>

      <Select
        className="max-w-xs"
        label="Gênero"
        placeholder="Selecione"
        aria-label="Gênero"
        selectedKeys={["Masculino", "Feminino"].includes(genderInternal) ? new Set([genderInternal]) : new Set()}
        variant="bordered"
        onSelectionChange={(keys) => setGenderInternal(Array.from(keys)[0] as string)}
      >
        <SelectItem key="Masculino">Masculino</SelectItem>
        <SelectItem key="Feminino">Feminino</SelectItem>
      </Select>

      <Select
        className="max-w-xs"
        label="Ingresso"
        placeholder="Selecione"
        aria-label="Ingresso"
        selectedKeys={["2020"].includes(entryInternal) ? new Set([entryInternal]) : new Set()}
        variant="bordered"
        onSelectionChange={(keys) => setEntryInternal(Array.from(keys)[0] as string)}
      >
        <SelectItem key="2020">2020</SelectItem>
      </Select>

      <Select
        className="max-w-xs"
        label="Graduação"
        placeholder="Selecione"
        aria-label="Graduação"
        selectedKeys={["2020"].includes(graduationInternal) ? new Set([graduationInternal]) : new Set()}
        variant="bordered"
        onSelectionChange={(keys) => setGraduationInternal(Array.from(keys)[0] as string)}
      >
        <SelectItem key="2020">2020</SelectItem>
      </Select>

      <Button
        variant="solid"
        onClick={handleClearFilters}
        style={{
          minWidth: '90px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          backgroundColor: '#DC2626',
          color: 'white'
        }}
      >
        Limpar
        <MdFilterAltOff style={{ marginLeft: '3px', color: 'white', fontSize: '1.2em', flexShrink: 0 }} />
      </Button>
    </div>
  );
};

export default Filters;
