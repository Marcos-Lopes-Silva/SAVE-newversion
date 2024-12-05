import { Radio, RadioGroup } from "@nextui-org/react";
import { useState } from "react";
import { MdRemove } from "react-icons/md";
import Button from "@/components/layout/Button";
import { QuestionProps } from "../Question";
import { IQuestion } from "../../../../../models/surveyModel";

export function CreateTable({ question, updateProp, syncSurvey }: QuestionProps) {
  const [selectedValues, setSelectedValues] = useState<{ [key: number]: string }>({});

  const handleChange = (value: string) => {
    const updatedQuestion = { ...question, title: value };
    updateProp(updatedQuestion);
  };

  const handleBlur = () => {
    syncSurvey(question);
  };

  const addRow = () => {
    const rows = question.rows || [];
    const sortedRows = rows.map(row => row.id).sort((a, b) => a - b);
    const id = sortedRows.length > 0 ? sortedRows[sortedRows.length - 1] + 1 : 1;

    const updatedQuestion = {
      ...question,
      rows: [...rows, { id: id, text: "New Question" }]
    };
    updateProp(updatedQuestion);
    syncSurvey(updatedQuestion);
  };

  const addOption = () => {
    const options = question.options || [];
    const sortedOptions = options.map(option => option.id).sort((a, b) => a - b);
    const id = sortedOptions.length > 0 ? sortedOptions[sortedOptions.length - 1] + 1 : 1;

    const updatedQuestion = {
      ...question,
      options: [...options, { id: id, label: `Option ${id}`, value: id.toString() }]
    };
    updateProp(updatedQuestion);
    syncSurvey(updatedQuestion);
  };

  const handleRowTextChange = (value: string, id: number) => {
    if (!question.rows) return;

    const newRows = question.rows.map(row => row.id === id ? { ...row, text: value } : row);

    const updatedQuestion: IQuestion = {
      ...question,
      rows: newRows
    };

    updateProp(updatedQuestion);
  };

  const handleOptionChange = (value: string, id: number) => {
    if (!question.options) return;

    const newOptions = question.options.map(option => 
      option.id === id ? { ...option, label: value } : option
    );

    const updatedQuestion: IQuestion = {
      ...question,
      options: newOptions
    };

    updateProp(updatedQuestion);
  };

  const handleOptionBlur = () => {
    syncSurvey(question);
  };

  const removeRow = (id: number) => {
    if (!question.rows) return;

    const updatedQuestion = {
      ...question,
      rows: question.rows.filter(r => r.id !== id)
    };
    updateProp(updatedQuestion);
    syncSurvey(updatedQuestion);
  };

  const removeOption = (id: number) => {
    if (!question.options) return;

    const updatedQuestion = {
      ...question,
      options: question.options.filter(op => op.id !== id)
    };
    updateProp(updatedQuestion);
    syncSurvey(updatedQuestion);
  };

  const handleRadioChange = (rowId: number, value: string) => {
    setSelectedValues(prev => ({ ...prev, [rowId]: value }));
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <input
        className="border-2 w-full border-zinc-300 rounded-xl p-2 outline-none"
        value={question.title}
        type="text"
        onChange={e => handleChange(e.target.value)}
        onBlur={handleBlur}
      />
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {question.options?.map((option, index) => (
              <th key={index} className="border p-2">
                <div className="flex items-center justify-between">
                  {
                   option.value !== "perguntas" ? 
                    <input
                    className="w-full border-0 outline-none text-center"
                    type="text"
                    value={option.label}
                    onChange={e => handleOptionChange(e.target.value, option.id)}
                    onBlur={handleOptionBlur}
                  />

                  : <label className="w-full border-0 outline-none text-center">{option.label}</label>
                  
                  }

                  {option.value !== "perguntas" && 
                  <Button
                    className="flex items-center justify-center bg-zinc-50 shadow-md hover:bg-zinc-100 rounded-2xl p-1 ml-2"
                    variant="tertiary"
                    onClick={() => removeOption(option.id)}
                  >
                    <MdRemove className="w-4 h-4" />
                  </Button>
                  }
                </div>
              </th>
            ))}
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {question.rows?.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="border p-2">
                <input
                  className="w-full border-0 outline-none"
                  type="text"
                  value={row.text}
                  onChange={e => handleRowTextChange(e.target.value, row.id)}
                  onBlur={handleBlur}
                />
              </td>
              {question.options?.map((option, optionIndex) => (
                <td key={optionIndex} className="border p-2">
                  <RadioGroup
                    value={selectedValues[row.id]}
                    onChange={e => handleRadioChange(row.id, e.target.value)}
                  >
                    <Radio value={option.value} />
                  </RadioGroup>
                </td>
              ))}
              <td className="border p-2">
                <Button
                  className="flex items-center justify-center bg-zinc-50 shadow-md hover:bg-zinc-100 rounded-2xl p-2"
                  variant="tertiary"
                  onClick={() => removeRow(row.id)}
                >
                  <MdRemove className="w-5 h-5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2">
        <Button
          className="flex items-center justify-center bg-zinc-50 shadow-md hover:bg-zinc-100 rounded-2xl"
          variant="tertiary"
          onClick={addRow}
        >
          Add Row
        </Button>
        <Button
          className="flex items-center justify-center bg-zinc-50 shadow-md hover:bg-zinc-100 rounded-2xl"
          variant="tertiary"
          onClick={addOption}
        >
          Add Option
        </Button>
      </div>
    </div>
  );
}