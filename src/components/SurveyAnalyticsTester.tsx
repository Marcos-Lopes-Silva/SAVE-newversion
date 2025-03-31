
import { useState, useEffect } from 'react'
import axios from 'axios'

interface QuestionFilter {
  name: string
  title: string
  type: string
  options?: Array<{ label: string }>
  rows?: Array<{ text: string }>
}

const SurveyAnalyticsTester = ({ surveyId }: { surveyId: string }) => {
  const [questions, setQuestions] = useState<QuestionFilter[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<string>('')
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const response = await axios.get(`/api/survey/${surveyId}`)
        const filterableQuestions = response.data.pages
          .flatMap((page: any) => page.questions)
          .filter((q: any) => ["radio", "checkbox", "select", "table"].includes(q.type))
          
        setQuestions(filterableQuestions)
      } catch (err) {
        setError('Erro ao carregar a pesquisa')
      }
    }
    
    loadSurvey()
  }, [surveyId])

  const getAvailableAnswers = () => {
    const question = questions.find(q => q.name === selectedQuestion)
    if (!question) return []

    if (question.type === 'table' && question.rows && question.options) {
      return question.options.map(opt => opt.label)
    }

    return question.options?.map(opt => opt.label) || []
  }

  const applyFilter = async () => {
    if (!selectedQuestion || !selectedAnswer) return
    
    setLoading(true)
    try {
      const response = await axios.get(`/api/survey/${surveyId}/results`, {
        params: {
          filterQuestion: selectedQuestion,
          filterAnswer: selectedAnswer
        }
      })
      
      setAnalyticsData(response.data)
      setError('')
    } catch (err) {
      setError('Erro ao aplicar filtro - Verifique os parâmetros')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Filtrar Análises da Pesquisa</h1>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="space-y-4">
        {/* Seletor de Questão */}
        <div>
          <label className="block mb-2 font-medium">Selecione a Questão:</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedQuestion}
            onChange={(e) => {
              setSelectedQuestion(e.target.value)
              setSelectedAnswer('')
            }}
          >
            <option value="">Selecione uma questão</option>
            {questions.map(question => (
              <option key={question.name} value={question.name}>
                {question.title} ({question.type})
              </option>
            ))}
          </select>
        </div>

        {/* Seletor de Resposta */}
        {selectedQuestion && (
          <div>
            <label className="block mb-2 font-medium">Selecione a Resposta para Filtrar:</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
            >
              <option value="">Selecione uma resposta</option>
              {getAvailableAnswers().map(answer => (
                <option key={answer} value={answer}>
                  {answer}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={applyFilter}
          disabled={!selectedQuestion || !selectedAnswer || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Aplicando Filtro...' : 'Aplicar Filtro'}
        </button>

        {/* Exibição dos Resultados */}
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
    </div>
  )
}

export default SurveyAnalyticsTester


