import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from "@nextui-org/react";
import { IQuestion } from "../../../../../models/surveyModel";
import { LuAsterisk } from "react-icons/lu";
import { Form } from "@/components/Form";
import { Controller, useFormContext } from "react-hook-form";

export interface IQuestionProp {
  question: IQuestion;
}

export interface IBackendTable {
  questionText: string;
  response: string;
}

export function TableSurvey({ question }: IQuestionProp) {

  const { control, setValue, getValues } = useFormContext();

  const handleAddResponse = (rowText: string, columnKey: string) => {
    if (!question.options) return;

    const selectedOption = question.options.find(option => option.value === columnKey);
    if (selectedOption) {
      setValue(question.name, { ...getValues(question.name), [rowText]: selectedOption.label });
    }
  }

  return (
    question.options &&
    question.rows && (
      <>
        <Form.Label className="py-2 px-2 font-bold flex gap-2 dark:text-white">{`${question.id}. ${question.title}`}{question.required ? <LuAsterisk size={10} /> : ""}</Form.Label>
        <Table aria-label="Example table with dynamic content">
          <TableHeader>
            {question.options.map((column) => (
              <TableColumn key={column.value}>{column.value === "perguntas" ? "" : column.label}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {question.rows.map((row) => (
              <TableRow key={row.id}>
                {(columnKey) => {

                  if (columnKey === "perguntas") {
                    return <TableCell className="dark:text-white">{row.text}</TableCell>;
                  }

                  return (
                    <TableCell>
                      <Controller
                        name={`${question.name}`}
                        control={control}
                        rules={{ required: question.required && "Essa questão é obrigatória." }}
                        defaultValue=""
                        render={({ field }) => (
                          <input
                            type="radio"
                            value={columnKey}
                            required={question.required}
                            checked={question.options ? field.value[row.text] === question.options?.find(opt => opt.value === columnKey)?.label : false}
                            onChange={(e) => handleAddResponse(row.text, columnKey.toString())}
                          />
                        )}
                      />
                    </TableCell>
                  );
                }}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Form.ErrorMessage field={question.name} />
      </>
    )
  );
}