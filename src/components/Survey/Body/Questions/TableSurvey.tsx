import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from "@nextui-org/react";
import { Key, useState } from "react";
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
  const [selectedValues, setSelectedValues] = useState<{
    [key: number]: string;
  }>({});
  const [keys, setKeys] = useState<string[]>([]);
  const [indexes, setIndexes] = useState<number>(0);

  const { control, register } = useFormContext();

  const [backendResponses, setBackendResponses] = useState<IBackendTable[]>([]);

  const addResponse = (rowId: number, columnKey: Key, rowText: string) => {
    if (!question.options) return;

    question.options.map((option) => {
      if (option.value === columnKey) {
        setBackendResponses([...backendResponses, { questionText: rowText, response: option.label }]);
        setSelectedValues({ ...selectedValues, [rowId]: columnKey });
      }
    });
  };

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
                        name={`${question.name}-${row.text.toLowerCase()}`}
                        control={control}
                        rules={{ required: question.required && "Essa questão é obrigatória." }}
                        defaultValue=""
                        render={({ field }) => (
                          <input
                            type="radio"
                            value={columnKey}
                            required={question.required}
                            checked={field.value === columnKey}
                            onChange={field.onChange}
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
