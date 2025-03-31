import type { ISurveyDocument, IQuestion, IOption, IPages } from "../../models/surveyModel"
import type { SurveyResultDocument } from "../../types/survey"
import type { ISurveyAnalytics } from "../../models/surveyAnalytics"
import mongoose from "mongoose"

export function processResults(
  survey: ISurveyDocument,
  results: SurveyResultDocument[],
  filter?: { questionName: string; answer: string }
): ISurveyAnalytics {
  const filteredResults = filterResults(results, filter);
  
  return {
    surveyId: new mongoose.Types.ObjectId(String(survey._id)),
    surveyTitle: survey.title,
    surveyDescription: survey.description,
    openDate: survey.openDate,
    endDate: survey.endDate,
    hasPublic: false,
    filter,
    pages: survey.pages
      .filter(page => 
        page.questions.some(q => 
          ["radio", "checkbox", "select", "table"].includes(q.type)
        )
      )
      .map(page => ({
        title: page.title,
        questions: page.questions
          .filter(q => ["radio", "checkbox", "select", "table"].includes(q.type))
          .map(question => ({
            title: question.title,
            name: question.name,
            type: question.type,
            processedData: processQuestion(question, filteredResults),
            isPublic: false
          }))
      }))
  };
}

function filterResults(
  results: SurveyResultDocument[],
  filter?: { questionName: string; answer: string }
): SurveyResultDocument[] {
  if (!filter) return results;

  return results.filter(result => {
    const answer = (result.surveyResult as Record<string, unknown>)[filter.questionName];
    
    if (Array.isArray(answer)) {
      return answer.some(a => a.trim().toLowerCase() === filter.answer.trim().toLowerCase());
    }

    return typeof answer === 'string' && 
      answer.trim().toLowerCase() === filter.answer.trim().toLowerCase();
  });
}

function processTableQuestion(question: IQuestion, results: SurveyResultDocument[]) {
  const tableData: Record<string, Record<string, number>> = {};
  const otherTexts: string[] = [];
  
  question.rows?.forEach(row => {
    tableData[row.text] = {};
    question.options?.forEach(option => {
      tableData[row.text][option.label] = 0;
    });
  });

  results.forEach(result => {
    const tableAnswers = (result.surveyResult as Record<string, Record<string, string>>)[question.name];
    
    if (tableAnswers && typeof tableAnswers === 'object') {
      Object.entries(tableAnswers).forEach(([rowName, selectedOption]) => {
        const cleanRowName = rowName.trim();
        if (selectedOption.startsWith('Outro:')) {
          const optionLabel = 'Outro';
          const texto = selectedOption.split('Outro:')[1].trim();
          
          if (texto) {
            otherTexts.push(`${cleanRowName}: ${texto}`);
            tableData[cleanRowName][optionLabel] = (tableData[cleanRowName][optionLabel] || 0) + 1;
          }
        } else {
          tableData[cleanRowName][selectedOption] = (tableData[cleanRowName][selectedOption] || 0) + 1;
        }
      });
    }
  });

  const data = Object.entries(tableData).map(([rowName, options]) => ({
    row: rowName,
    options: Object.entries(options).map(([optionName, count]) => ({
      name: optionName,
      value: count
    }))
  }));

  return { 
    data,
    ...(otherTexts.length > 0 && { otherTexts })
  };
}

function processQuestion(question: IQuestion, results: SurveyResultDocument[]) {
  if (question.type === 'table') {
    return processTableQuestion(question, results);
  }

  const data = (question.options || []).map((opt: IOption) => ({
    name: opt.label,
    value: 0,
  }));

  const otherTexts: string[] = [];

  const processarResposta = (answer: string) => {
    if (answer.startsWith('Outro:')) {
      const outroOption = data.find(d => d.name === 'Outro:');
      if (outroOption) {
        outroOption.value++;
        const texto = answer.split('Outro:')[1].trim();
        if (texto) otherTexts.push(texto);
      }
    } else {
      const option = data.find(d => d.name === answer);
      if (option) option.value++;
    }
  };

  results.forEach(result => {
    const answer = (result.surveyResult as Record<string, unknown>)[question.name];
    
    if (Array.isArray(answer)) {
      answer.forEach((value: string) => {
        if (typeof value === 'string') processarResposta(value);
      });
    } else if (typeof answer === 'string') {
      processarResposta(answer);
    }
  });

  return { 
    data,
    ...(otherTexts.length > 0 && { otherTexts })
  };
}