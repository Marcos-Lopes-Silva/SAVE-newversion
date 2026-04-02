import { NextApiRequest, NextApiResponse } from "next"
import { connectToMongoDB } from "@/lib/db"
import SurveyResult from "../../../../../models/surveyResultModel"
import { Parser } from '@json2csv/plainjs'
import mongoose from "mongoose"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToMongoDB()
  const { id } = req.query

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const objectId = new mongoose.Types.ObjectId(id as string)
    
    // Buscar todos os resultados brutos
    const results = await SurveyResult.find({ surveyId: objectId })
    
    if (results.length === 0) {
      return res.status(404).json({ message: "Nenhum resultado encontrado" })
    }

    // Função para achatar objetos aninhados e remover campos sensíveis
    const flattenObject = (obj: Record<string, any>, prefix = '') => {
      return Object.keys(obj).reduce((acc, key) => {
        // Remover campos de identificação em qualquer nível
        const lowerKey = key.toLowerCase()
        if (['userid', '_id', 'nome'].includes(lowerKey)) return acc

        const prefixedKey = prefix ? `${prefix}.${key}` : key
        const value = obj[key]
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          Object.assign(acc, flattenObject(value, prefixedKey))
        } else {
          acc[prefixedKey] = Array.isArray(value) ? value.join('; ') : value
        }
        
        return acc
      }, {} as Record<string, any>)
    }

    // Processar dados para CSV (removendo campos sensíveis)
    const csvData = results.map(result => {
      const rawData = result.toObject()
      // Remover metadados identificáveis
      const { _id, userId, surveyResult, ...rest } = rawData
      
      return {
        ...flattenObject(surveyResult)
      }
    })

    // Obter todos os cabeçalhos únicos
    const headers = Array.from(
      csvData.reduce((acc: Set<string>, row) => {
        Object.keys(row).forEach(key => acc.add(key))
        return acc
      }, new Set<string>())
    )

    // Criar parser CSV
    const parser = new Parser({
        fields: headers,
        transforms: [
        (item) => headers.reduce((acc: Record<string, any>, header) => {
            acc[header] = (item as Record<string, any>)[header] || ''
            return acc
        }, {} as Record<string, any>)
        ]
    })

    const csv = parser.parse(csvData)

    // Configurar headers de resposta
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename=survey-${id}-anonima.csv`)
    
    return res.send(csv)

  } catch (error) {
    console.error("Erro na exportação:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
