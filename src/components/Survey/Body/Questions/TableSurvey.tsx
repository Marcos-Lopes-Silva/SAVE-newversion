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
        <p className="font-bold px-3 mb-5">{question.id}. {question.title}</p>

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
                  const value = getKeyValue(row, columnKey);

                  if (columnKey === "perguntas") {
                    return <TableCell>{row.text}</TableCell>;
                  }

                  return (
                    <TableCell>
                      <input
                        type="radio"
                        checked={selectedValues[row.id] === columnKey}
                        className=""
                        onChange={() => addResponse(row.id, columnKey, row.text)}
                      />
                    </TableCell>
                  );
                }}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    )
  );
}
