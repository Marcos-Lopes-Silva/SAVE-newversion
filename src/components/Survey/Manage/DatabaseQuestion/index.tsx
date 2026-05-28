"use client";

import {
  Button,
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  Checkbox,
  CheckboxGroup,
} from "@nextui-org/react";
import axios from "axios";
import { useEffect, useState } from "react";
import type {
  IPages,
  IQuestion,
  ISurveyQuestionsDocument,
} from "../../../../../models/surveyQuestionsModel";
import { MdArrowBack } from "react-icons/md";
import { IoMdEye } from "react-icons/io";
import { QuestionsBody } from "../../Body/Questions";
import { FormProvider, useForm } from "react-hook-form";
import { ISurvey } from "../../../../../models/surveyModel";

interface IDatabaseQuestion {
  isOpen: boolean;
  onOpenChange: () => void;
  handleAddQuestionsBatch: (
    questionsToAdd: Partial<IQuestion>[]
  ) => Promise<void>;
  data: ISurvey;
}

const DatabaseQuestion = ({
  isOpen,
  onOpenChange,
  handleAddQuestionsBatch,
  data,
}: IDatabaseQuestion) => {
  const [pages, setPages] = useState<IPages[]>([]);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [previewQuestion, setPreviewQuestion] = useState<IQuestion | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const fetchDatabaseQuestions = async () => {
    try {
      const response = await axios.get("/api/surveyQuestions");
      if (response.status !== 200) throw new Error("Failed to fetch questions");
      const questions: ISurveyQuestionsDocument = response.data;
      setPages(questions.pages);
    } catch (error) {
      console.error("Error fetching database questions:", error);
    }
  };

  const handlePreviewQuestion = (question: IQuestion) => {
    setPreviewQuestion(question);
    setIsPreviewOpen(true);
  };

  const handleAddQuestions = async () => {
    if (selectedPage && selectedQuestions.length > 0) {
      const currentPage = pages.find((page) => page.id === selectedPage);
      if (!currentPage) return;

      const questionsToAdd = currentPage.questions.filter((question) =>
        selectedQuestions.includes(question.id.toString())
      );

      await handleAddQuestionsBatch(questionsToAdd);

      setSelectedQuestions([]);
      onOpenChange();
    }
  };

  const form = useForm();

  useEffect(() => {
    fetchDatabaseQuestions();
  }, []);

  const renderQuestionPreview = (question: IQuestion) => {
    switch (question.type) {
      case "text":
        return <FormProvider {...form}><QuestionsBody.Text question={question} /></FormProvider>;
      case "textarea":
        return <FormProvider {...form}><QuestionsBody.TextArea question={question} /></FormProvider>;
      case "number":
        return <FormProvider {...form}><QuestionsBody.Number question={question} /></FormProvider>;
      case "date":
        return <FormProvider {...form}><QuestionsBody.DateQuestion question={question} /></FormProvider>;
      case "radio":
        return <FormProvider {...form}><QuestionsBody.Radio question={question} /></FormProvider>;
      case "checkbox":
        return <FormProvider {...form}><QuestionsBody.Checkbox question={question} /></FormProvider>;
      case "select":
      case "dropdown":
        return <FormProvider {...form}><QuestionsBody.Select question={question} /></FormProvider>;
      case "rating":
        return <FormProvider {...form}><QuestionsBody.Rating question={question} /></FormProvider>;
      case "table":
        return <FormProvider {...form}><QuestionsBody.TableSurvey question={question} /></FormProvider>;
      default:
        return <div>Tipo de questão não suportado na pré-visualização</div>;
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="4xl"
        classNames={{
          base: "min-w-[400px] max-w-[1000px] max-h-[530px] min-h-[530px] overflow-scroll",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="gap-3 items-center dark:bg-zinc-900 dark:text-white">
                <MdArrowBack
                  size={24}
                  className="hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-full w-8 h-8 p-1 duration-300 ease-in-out hover:cursor-pointer"
                  onClick={() => onOpenChange()}
                />
                <p>Adicionar do Banco de Questões</p>
              </ModalHeader>
              <ModalBody className="h-full dark:bg-zinc-900">
                <div className="flex flex-col h-full justify-between gap-3 overflow-scroll">
                  <Select
                    label="Dimensões"
                    placeholder="Selecione uma dimensão"
                    classNames={{
                      label: "dark:text-zinc-300",
                      trigger: "dark:bg-zinc-800 dark:hover:bg-zinc-700",
                      value: "dark:text-white",
                    }}
                    onChange={(e) => setSelectedPage(Number(e.target.value))}
                  >
                    {pages.map((page) => (
                      <SelectItem
                        classNames={{ base: "dark:text-white dark:hover:bg-zinc-700" }}
                        key={page.id}
                        value={page.id}
                      >
                        {page.title}
                      </SelectItem>
                    ))}
                  </Select>
                  {selectedPage && (
                    <CheckboxGroup
                      value={selectedQuestions}
                      onChange={(values) => setSelectedQuestions(values as string[])}
                    >
                      <div className="flex flex-col gap-2">
                        {pages
                          .find((page) => page.id === selectedPage)
                          ?.questions.map((element) => (
                            <Card
                              classNames={{ base: "w-full p-2 mb-2 dark:bg-zinc-800 dark:border-zinc-700" }}
                              key={element.id}
                            >
                              <div className="flex justify-between items-center px-2">
                                <Checkbox value={element.id.toString()} key={element.id}>
                                  <div className="flex flex-col">
                                    <span className="dark:text-white">{element.title}</span>
                                    <span className="text-xs text-gray-500 dark:text-zinc-400">Tipo: {element.type}</span>
                                  </div>
                                </Checkbox>
                                <IoMdEye
                                  size={18}
                                  className="hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-full w-8 h-8 p-1 duration-300 ease-in-out hover:cursor-pointer dark:text-zinc-300"
                                  onClick={() => handlePreviewQuestion(element)}
                                />
                              </div>
                            </Card>
                          ))}
                      </div>
                    </CheckboxGroup>
                  )}
                  <Button
                    className="bg-zinc-900 dark:bg-zinc-700 text-white"
                    onPress={handleAddQuestions}
                    isDisabled={selectedQuestions.length === 0}
                  >
                    Adicionar questões ({selectedQuestions.length})
                  </Button>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isPreviewOpen}
        onOpenChange={() => setIsPreviewOpen(false)}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex gap-1 dark:bg-zinc-900 dark:text-white">
                <p>Pré-visualização da Questão</p>
              </ModalHeader>
              <ModalBody className="dark:bg-zinc-900">
                {previewQuestion && (
                  <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-md dark:text-white">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-1">{previewQuestion.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        Tipo: {previewQuestion.type}{" "}
                        {previewQuestion.required && <span className="text-red-500">*</span>}
                      </p>
                    </div>
                    {renderQuestionPreview(previewQuestion)}
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default DatabaseQuestion;
