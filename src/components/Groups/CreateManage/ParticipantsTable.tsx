import React, { useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Tooltip,
  Select,
  SelectItem,
  Pagination,
} from "@nextui-org/react";
import { FaPen, FaRegTrashAlt } from "react-icons/fa";
import { CiMail } from "react-icons/ci";
import { t } from "i18next";

interface IParticipant {
  name: string;
  email: string;
  cpf?: string;
}

interface Props {
  participants: IParticipant[];
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
  isReadOnly?: boolean;
}

export const ParticipantsTable: React.FC<Props> = ({
  participants,
  onEdit,
  onDelete,
  isReadOnly = false,
}) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const totalPages = Math.ceil(participants.length / rowsPerPage);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return participants.slice(start, start + rowsPerPage);
  }, [page, participants, rowsPerPage]);

  const handleRowsChange = (value: number) => {
    setRowsPerPage(value);
    setPage(1);
  };

  return (
    <div>
      {/* Top controls */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Total: {participants.length}
        </span>

        <Select
          size="sm"
          className="max-w-[120px]"
          selectedKeys={[String(rowsPerPage)]}
          onChange={(e) => handleRowsChange(Number(e.target.value))}
        >
          <SelectItem key="5">5</SelectItem>
          <SelectItem key="10">10</SelectItem>
          <SelectItem key="20">20</SelectItem>
          <SelectItem key="50">50</SelectItem>
        </Select>
      </div>

      <Table
        aria-label={t("admin.create.second_section.added_participants")}
        className="mt-2"
        bottomContent={
          totalPages > 1 && (
            <div className="flex w-full justify-center">
              <Pagination
                page={page}
                classNames={{
                  item: "hover:bg-zinc-700 bg-zinc-900 text-white",
                  next: "hover:bg-zinc-700 bg-zinc-900 text-white",
                  prev: "hover:bg-zinc-500 bg-zinc-900 text-white"
                }}
                total={totalPages}
                onChange={setPage}
                showControls
                size="sm"
              />
            </div>
          )
        }
        classNames={{
          th: "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold border-b dark:border-zinc-700",
          td: "py-3 dark:text-zinc-300",
          wrapper: "dark:bg-zinc-900/40 dark:border dark:border-zinc-800",
        }}
      >
        <TableHeader>
          <TableColumn>{t("admin.create.second_section.name")}</TableColumn>
          <TableColumn>
            <div className="flex items-center gap-2">
              <CiMail size={16} />
              {t("admin.create.second_section.email")}
            </div>
          </TableColumn>
          <TableColumn>{t("admin.create.second_section.cpf")}</TableColumn>
          <TableColumn align="center">Ações</TableColumn>
        </TableHeader>

        <TableBody
          emptyContent={t(
            "admin.create.second_section.search_users_placeholder"
          )}
        >
          {paginatedItems.map((user, index) => {
            const globalIndex = (page - 1) * rowsPerPage + index;

            return (
              <TableRow key={globalIndex}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 dark:bg-zinc-700 text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium dark:text-zinc-200">
                      {user.name}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="dark:text-zinc-400">
                  {user.email}
                </TableCell>

                <TableCell className="dark:text-zinc-400">
                  {user.cpf || "-"}
                </TableCell>

                <TableCell>
                  <div className="flex justify-center gap-2">
                    {!isReadOnly && (
                      <>
                        <Tooltip content={t("admin.dashboard.edit")}>
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onClick={() => onEdit?.(globalIndex)}
                          >
                            <FaPen className="text-zinc-600 dark:text-zinc-400" />
                          </Button>
                        </Tooltip>

                        <Tooltip
                          content={t("admin.dashboard.delete")}
                          color="danger"
                        >
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            color="danger"
                            onClick={() => onDelete?.(globalIndex)}
                          >
                            <FaRegTrashAlt />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};