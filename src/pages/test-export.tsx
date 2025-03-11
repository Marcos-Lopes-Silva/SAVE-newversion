"use client"

import { useState, useEffect } from "react"
import { ISurveyDocument } from "../../models/surveyModel"

type SurveyListItem = Pick<ISurveyDocument, '_id' | 'title' | 'status' | 'openDate' | 'endDate'> & {
  _id: string
}

export default function ExportacaoDados() {
  const [loading, setLoading] = useState(false)
  const [surveys, setSurveys] = useState<SurveyListItem[]>([])
  const [selectedSurveyId, setSelectedSurveyId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch("/api/survey")
        if (!response.ok) throw new Error("Falha ao carregar pesquisas")
        
        const data: SurveyListItem[] = await response.json()
        setSurveys(data.map(s => ({
          ...s,
          _id: s._id.toString() 
        })))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      }
    }
    
    fetchSurveys()
  }, [])
  
  const handleExport = async () => {
    if (!selectedSurveyId) return

    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      const response = await fetch(`/api/survey/${selectedSurveyId}/export-csv`)
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dados-pesquisa-${selectedSurveyId}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na exportação')
    } finally {
      setLoading(false)
    }
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Exportação de Dados da Pesquisa</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione a Pesquisa:
          </label>
          
          <select
            value={selectedSurveyId}
            onChange={(e) => setSelectedSurveyId(e.target.value)}
            className="w-full p-2 border rounded-md"
            disabled={!surveys.length}
          >
            <option value="">Selecione uma pesquisa...</option>
            {surveys.map((survey) => (
              <option 
                key={survey._id} 
                value={survey._id}  
              >
                {survey.title} - {survey.status} (
                  {formatDate(survey.openDate)} a {formatDate(survey.endDate)}
                )
              </option>
            ))}
          </select>

          {!surveys.length && !error && (
            <p className="mt-2 text-sm text-gray-500">Carregando pesquisas disponíveis...</p>
          )}
        </div>

        <div className="mb-6">
          <button 
            onClick={handleExport}
            disabled={loading || !selectedSurveyId}
            className={`px-4 py-2 rounded-md text-white ${
              loading || !selectedSurveyId 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {loading ? 'Gerando Arquivo...' : 'Exportar para CSV'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
            ✅ Arquivo gerado com sucesso! O download deve iniciar automaticamente.
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p className="font-medium">Informações sobre a exportação:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>O arquivo CSV conterá todas as respostas da pesquisa selecionada</li>
            <li>Questões complexas (como tabelas) serão formatadas adequadamente</li>
            <li>Respostas de 'Outro' serão incluídas em colunas separadas</li>
            <li>O nome do arquivo conterá o ID único da pesquisa</li>
          </ul>
        </div>
      </div>
    </div>
  )
}