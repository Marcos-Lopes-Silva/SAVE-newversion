import type { ISurveyDocument, IQuestion, IOption, IPages } from "../../models/surveyModel"
import type { SurveyResultDocument } from "../../types/survey"
import type { ISurveyAnalytics } from "../../models/surveyAnalytics"
import mongoose from "mongoose"

export function processResults(survey: ISurveyDocument, results: SurveyResultDocument[]): ISurveyAnalytics {
  const processed: ISurveyAnalytics = {
    surveyId: new mongoose.Types.ObjectId(),
    surveyTitle: survey.title,
    dimensions: [],
  }

  survey.pages.forEach((page: IPages) => {
    const dimension = {
      title: page.title,
      questions: page.questions.map((question: IQuestion) => {
        const processedData = processQuestion(question, results)
        return {
          title: question.title,
          name: question.name,
          type: question.type,
          processedData,
        }
      }),
    }
    processed.dimensions.push(dimension)
  })

  return processed
}

function processQuestion(question: IQuestion, results: SurveyResultDocument[]) {
  if (["radio", "checkbox", "select"].includes(question.type)) {
    const data = (question.options || []).map((opt: IOption) => ({
      name: opt.label,
      value: 0,
    }))

    results.forEach((result) => {
      const answer = (result.surveyResult as Record<string, unknown>)[question.name]
      if (Array.isArray(answer)) {
        answer.forEach((value) => {
          const option = data.find((d) => d.name === value)
          if (option) option.value++
        })
      } else if (answer) {
        const option = data.find((d) => d.name === answer)
        if (option) option.value++
      }
    })

    return { type: question.type, data }
  }

  // For other question types, you might want to implement different processing logic
  return { type: question.type, data: [] }
}
