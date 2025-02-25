"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts"
import type { ISurveyAnalytics } from "../../models/surveyAnalytics"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"]

const TestSurveyResults = () => {
  const [data, setData] = useState<ISurveyAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const testSurveyId = "67a1160e60cd46b1c1fc4e4f"

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/survey/${testSurveyId}/results`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [])

  if (loading) return <div className="p-4">Carregando resultados...</div>
  if (error) return <div className="p-4 text-red-500">Erro: {error}</div>
  if (!data) return <div className="p-4">Nenhum dado encontrado</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-6">Resultados da Pesquisa - {data.surveyTitle}</h1>

      {data.pages.map((page, pageIndex) => (
        <div key={pageIndex} className="mb-8">
          <h2 className="text-xl mb-4">{page.title}</h2>

          {page.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg mb-4">{question.title}</h3>

              {/* Gráfico para questões radio/select/checkbox */}
              {(question.type === "radio" || question.type === "select" || question.type === "checkbox") && question.processedData.data && (
                <div className="mb-6">
                  <PieChart width={400} height={400}>
                    <Pie
                      data={question.processedData.data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {question.processedData.data.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>

                  {question.processedData.otherTexts && (
                    <div className="mt-4 p-3 bg-white rounded-lg shadow">
                      <h4 className="font-semibold mb-2">Respostas "Outro":</h4>
                      <ul className="list-disc pl-5">
                        {question.processedData.otherTexts.map((texto, idx) => (
                          <li key={idx} className="text-sm text-gray-600">{texto}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Gráfico para questões do tipo tabela */}
              {question.type === "table" && question.processedData.data && (
                <div className="mb-6">
                  <h4 className="text-md mb-4">Distribuição por Linha:</h4>
                  {question.processedData.data.map((rowData, index) => (
                    <div key={index} className="mb-4 p-3 bg-white rounded shadow">
                      <h5 className="font-medium mb-2">{rowData.row}</h5>
                      <BarChart
                        width={500}
                        height={300}
                        data={rowData.options}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill={COLORS[index % COLORS.length]} />
                      </BarChart>
                    </div>
                  ))}

                  {question.processedData.otherTexts && (
                    <div className="mt-4 p-3 bg-white rounded-lg shadow">
                      <h4 className="font-semibold mb-2">Respostas 'Outro' específicas:</h4>
                      <ul className="list-disc pl-5">
                        {question.processedData.otherTexts.map((texto, idx) => (
                          <li key={idx} className="text-sm text-gray-600">{texto}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Gráfico de barras padrão para outros tipos */}
              {!["radio", "select", "checkbox", "table"].includes(question.type) && question.processedData.data && (
                <div className="mb-6">
                  <BarChart
                    width={500}
                    height={300}
                    data={question.processedData.data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default TestSurveyResults