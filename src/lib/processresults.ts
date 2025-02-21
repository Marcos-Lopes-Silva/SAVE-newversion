import type { ISurveyDocument, IQuestion, IOption, IPages } from "../../models/surveyModel"
import type { SurveyResultDocument } from "../../types/survey"
import type { ISurveyAnalytics } from "../../models/surveyAnalytics"
import mongoose from "mongoose"

export function processResults(
  survey: ISurveyDocument,
  results: SurveyResultDocument[]
): ISurveyAnalytics {
  return {
    surveyId: new mongoose.Types.ObjectId(String(survey._id)),
    surveyTitle: survey.title,
    pages: survey.pages
      .filter(page => 
        page.questions.some(q => 
          ["radio", "checkbox", "select"].includes(q.type)
        )
      )
      .map(page => ({
        title: page.title,
        questions: page.questions
          .filter(q => ["radio", "checkbox", "select"].includes(q.type))
          .map(question => ({
            title: question.title,
            name: question.name,
            type: question.type,
            processedData: processQuestion(question, results)
          }))
      }))
  };
}

function processQuestion(question: IQuestion, results: SurveyResultDocument[]) {
  const data = (question.options || []).map((opt: IOption) => ({
    name: opt.label,
    value: 0,
  }))

  const otherTexts: string[] = []

  const processarResposta = (answer: string) => {
    if (answer.startsWith('Outro:')) {
      const outroOption = data.find(d => d.name === 'Outro:')
      if (outroOption) {
        outroOption.value++
        const texto = (answer.split('Outro:')[1]).trim()
        if (texto) otherTexts.push(texto)
      }
    } else {
      const option = data.find(d => d.name === answer)
      if (option) option.value++
    }
  }

  results.forEach(result => {
    const answer = (result.surveyResult as Record<string, unknown>)[question.name]
    
    if (Array.isArray(answer)) {
      answer.forEach((value: string) => {
        if (typeof value === 'string') processarResposta(value)
      })
    } else if (typeof answer === 'string') {
      processarResposta(answer)
    }
  })

  return { 
    data,
    ...(otherTexts.length > 0 && { otherTexts })
  }
}
