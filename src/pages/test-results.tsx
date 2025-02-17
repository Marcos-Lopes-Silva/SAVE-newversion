"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts"
import type { ISurveyAnalytics } from "../../models/surveyAnalytics"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"]

const TestSurveyResults = () => {
  const [data, setData] = useState<ISurveyAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ID fixo para teste - substitua pelo seu ID real
  const testSurveyId = "67af87d4e70e3997d690d91f"

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/survey/${testSurveyId}/results`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        setData(result)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
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

      {data.dimensions.map((dimension, dimensionIndex) => (
        <div key={dimensionIndex} className="mb-8">
          <h2 className="text-xl mb-4">{dimension.title}</h2>

          {dimension.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg mb-4">{question.title}</h3>

              {(question.type === "radio" || question.type === "select") && question.processedData.data ? (
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
                </div>
              ) : question.processedData.data ? (
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
              ) : (
                <div>No data available for this question.</div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default TestSurveyResults

