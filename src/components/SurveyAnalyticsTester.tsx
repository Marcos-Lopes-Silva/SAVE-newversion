import { useState, useEffect } from 'react'
import axios from 'axios'

interface QuestionFilter {
  name: string
  title: string
  type: string
  options?: Array<{ label: string }>
  rows?: Array<{ text: string }>
}

interface Filter {
  question: string;
  answer: string;
  row?: string;
}

const SurveyAnalyticsTester = ({ surveyId }: { surveyId: string }) => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [questions, setQuestions] = useState<QuestionFilter[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const response = await axios.get(`/api/survey/${surveyId}`);
        const filterableQuestions = response.data.pages
          .flatMap((page: any) => page.questions)
          .filter((q: any) => ["radio", "checkbox", "select", "table"].includes(q.type));
        setQuestions(filterableQuestions);
      } catch (err) {
        setError('Erro ao carregar a pesquisa');
      }
    }
    loadSurvey();
  }, [surveyId]);

  const getAvailableAnswers = (questionName: string) => {
    const question = questions.find(q => q.name === questionName);
    if (!question) return [];
    // Para perguntas do tipo table, utiliza as opções definidas
    if (question.type === 'table' && question.options) {
      return question.options.map(opt => opt.label);
    }
    return question.options?.map(opt => opt.label) || [];
  }

  const getAvailableRows = (questionName: string) => {
    const question = questions.find(q => q.name === questionName);
    if (!question) return [];
    if (question.type === 'table' && question.rows) {
      return question.rows.map(row => row.text);
    }
    return [];
  }

  const getQuestionType = (questionName: string) => {
    const question = questions.find(q => q.name === questionName);
    return question ? question.type : '';
  }

  const handleAddFilter = () => {
    setFilters(prev => [...prev, { question: '', answer: '', row: '' }]);
  }

  const handleRemoveFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  }

  const handleFilterChange = (index: number, field: 'question' | 'answer' | 'row', value: string) => {
    setFilters(prev =>
      prev.map((filter, i) =>
        i === index ? { ...filter, [field]: value } : filter
      )
    );
  }

  const applyFilter = async () => {
    // Para questões do tipo table, é necessário que a linha seja selecionada
    const valid = filters.every(f => f.question && f.answer && (getQuestionType(f.question) !== 'table' || f.row));
    if (filters.length === 0 || !valid) return;
    
    setLoading(true);
    try {
      const params: any = {
        filterQuestion: filters.map(f => f.question),
        filterAnswer: filters.map(f => f.answer)
      };
      
      // Se houver filtro de tabela, envia também o parâmetro das linhas
      const tableFilters = filters.map(f => {
        return getQuestionType(f.question) === 'table' ? f.row : '';
      });
      if (tableFilters.some(row => row)) {
        params.filterRow = tableFilters;
      }
      
      const response = await axios.get(`/api/survey/${surveyId}/results`, { params });
      setAnalyticsData(response.data);
      setError('');
    } catch (err) {
      setError('Erro ao aplicar filtro - Verifique os parâmetros');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Filtrar Análises da Pesquisa</h1>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <button
        onClick={handleAddFilter}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        Adicionar Filtro
      </button>
      
      {filters.map((filter, index) => {
        const questionType = getQuestionType(filter.question);
        return (
          <div key={index} className="flex flex-col space-y-2 mb-4 border p-2 rounded">
            <div className="flex justify-between items-center">
              <span className="font-medium">Filtro {index + 1}</span>
              <button onClick={() => handleRemoveFilter(index)} className="text-red-500">
                Remover
              </button>
            </div>
            <div>
              <label className="block mb-2 font-medium">Selecione a Questão:</label>
              <select
                className="w-full p-2 border rounded"
                value={filter.question}
                onChange={(e) => handleFilterChange(index, 'question', e.target.value)}
              >
                <option value="">Selecione uma questão</option>
                {questions.map(question => (
                  <option key={question.name} value={question.name}>
                    {question.title} ({question.type})
                  </option>
                ))}
              </select>
            </div>
            {filter.question && questionType === 'table' && (
              <div>
                <label className="block mb-2 font-medium">Selecione a Linha para Filtrar:</label>
                <select
                  className="w-full p-2 border rounded"
                  value={filter.row}
                  onChange={(e) => handleFilterChange(index, 'row', e.target.value)}
                >
                  <option value="">Selecione uma linha</option>
                  {getAvailableRows(filter.question).map(row => (
                    <option key={row} value={row}>
                      {row}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {filter.question && (
              <div>
                <label className="block mb-2 font-medium">Selecione a Resposta para Filtrar:</label>
                <select
                  className="w-full p-2 border rounded"
                  value={filter.answer}
                  onChange={(e) => handleFilterChange(index, 'answer', e.target.value)}
                >
                  <option value="">Selecione uma resposta</option>
                  {getAvailableAnswers(filter.question).map(answer => (
                    <option key={answer} value={answer}>
                      {answer}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )
      })}
      
      <button
        onClick={applyFilter}
        disabled={
          filters.length === 0 ||
          filters.some(f => !f.question || !f.answer || (getQuestionType(f.question) === 'table' && !f.row)) ||
          loading
        }
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Aplicando Filtros...' : 'Aplicar Filtros'}
      </button>
      
      {analyticsData && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Resultados Filtrados</h2>
          <div className="bg-gray-50 p-4 rounded">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(analyticsData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default SurveyAnalyticsTester;
