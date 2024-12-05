import { t } from "i18next";
import { MdArrowBackIosNew } from "react-icons/md";
import { FaSearchPlus } from "react-icons/fa";
import { Checkbox } from "@nextui-org/react";
import Button from "@/components/layout/Button";
import { api } from "@/lib/api";
import { useEffect, useRef, useState } from "react";
import { ISurveyQuestions, IElement } from "../../../../../models/surveyQuestionsModel";

export default function DatabaseQuestion({
    showDatabase,
    setShowDatabase,
    selectedQuestionsByDimension,
    setSelectedQuestionsByDimension
}: {
    showDatabase: boolean;
    setShowDatabase: React.Dispatch<React.SetStateAction<boolean>>;
    selectedQuestionsByDimension: { SurveyQuestions : ISurveyQuestions };
    setSelectedQuestionsByDimension: React.Dispatch<React.SetStateAction<{SurveyQuestions : ISurveyQuestions }>>;
}) {
    const [selectedDimension, setSelectedDimension] = useState<string>("");
    const [surveyQuestions, setSurveyQuestions] = useState<ISurveyQuestions[]>([]);
    const [selectedElements, setSelectedElements] = useState<IElement[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [boxMinWidth, setBoxMinWidth] = useState<number | null>(null);
    const selectRef = useRef<HTMLSelectElement>(null);  
    const containerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const fetchSurveyQuestions = async () => {
            try {
            const response = await api.get<ISurveyQuestions[]>('/surveyQuestions');
            setSurveyQuestions(response);
            } catch (error) {
                console.error("Failed to fetch survey questions:", error);
            }
        };
        fetchSurveyQuestions();
    }, []);

    const handleDimensionChange = (event: React.ChangeEvent<HTMLSelectElement>) => 
    {
        const value = event.target.value;
        setSelectedDimension(value);

        const selectedDimensionData = surveyQuestions.find(surveyQuestion => surveyQuestion.pages.some(page => page.title === value));

        const elements = selectedDimensionData?.pages.find(page => page.title === value)?.elements || [];
        setSelectedElements(elements);
        const isAllSelected = selectedQuestionsByDimension.SurveyQuestions?.pages?.find(page => page.title === value)?.elements.length === elements.length;

        setSelectAll(isAllSelected);
        updateBoxMinWidth();
        console.log(selectedQuestionsByDimension);
    };


    const handleCheckboxChange = (element: IElement) => {
        const updatedPages = [...selectedQuestionsByDimension.SurveyQuestions?.pages || []];
        let pageIndex = updatedPages.findIndex(page => page.title === selectedDimension);

        if(pageIndex === -1)
        {
            updatedPages.push({name : selectedDimension, title : selectedDimension, elements : []});
            pageIndex = updatedPages.length - 1;
        }

        const isSelected = updatedPages[pageIndex].elements.some(question => question.name === element.name);
        if(isSelected)
        {
            updatedPages[pageIndex].elements = updatedPages[pageIndex].elements.filter(question => question.name !== element.name);
        } else {
            updatedPages[pageIndex].elements = [...updatedPages[pageIndex].elements, element];
        }

        updatedPages[pageIndex].elements.sort((a, b) => {
            const indexA = selectedElements.findIndex(e => e.name === a.name);
            const indexB = selectedElements.findIndex(e => e.name === b.name);
            return indexA - indexB;
        });

        if(updatedPages[pageIndex].elements.length === 0)
            updatedPages.splice(pageIndex, 1);

        setSelectedQuestionsByDimension({
            SurveyQuestions: {
                ...selectedQuestionsByDimension.SurveyQuestions,
                pages: updatedPages
            }
        });
        
        setSelectAll(updatedPages[pageIndex]?.elements.length === selectedElements.length);
    };


    const handleSelectAllChange = () => {
        let updatedPages = [...selectedQuestionsByDimension.SurveyQuestions?.pages || []];
        let pageIndex = updatedPages.findIndex(page => page.title === selectedDimension);

        if(selectAll)
        {
            if(pageIndex !== -1)
                updatedPages.splice(pageIndex, 1);
        } else {
            if(pageIndex === -1)
            {
                updatedPages.push({name : selectedDimension, title : selectedDimension, elements :selectedElements});
            } else {
                updatedPages[pageIndex].elements = selectedElements;
            }
        }
        setSelectedQuestionsByDimension({
            SurveyQuestions: {
                ...selectedQuestionsByDimension.SurveyQuestions,
                pages : updatedPages
            }
        });
        setSelectAll(!selectAll);
    };

    const updateBoxMinWidth = () => {
        if(selectRef.current && containerRef.current)
        {
            const selectWidth = selectRef.current?.offsetWidth || 0;
            containerRef.current.style.minWidth = `${selectWidth}px`;
            setBoxMinWidth(selectWidth);
        }
    };

    useEffect(() => {
        updateBoxMinWidth();

        const handleResize = () => {
            updateBoxMinWidth();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [selectedDimension, surveyQuestions]);

    const dimensionOptions = surveyQuestions.flatMap(surveyQuestion =>
        surveyQuestion.pages.map(page => ({
            label: page.title,
            value: page.title
        }))
    );

    return (
        <div className="shadow-2xl p-4 md:p-10">
            <div className="shadow-xl bg-gray-100 px-6 py-4 md:px-10 md:py-6 rounded-2xl">
                <div className="flex items-center">
                    <Button variant="tertiary" onClick={() => setShowDatabase(false)}>
                        <MdArrowBackIosNew className="mr-2 cursor-pointer" />
                    </Button>
                    <h1 className="font-bold text-lg md:text-2xl">
                        {t("admin.survey.manage.database_question.title")}
                    </h1>
                </div>
            </div>

            <div className="shadow-2xl mt-6 p-4 md:p-10 rounded-2xl">
                <div className="w-full max-w-full md:max-w-fit rounded-2xl">
                    <div className="mb-4">
                        <label htmlFor="dimension" className="block mb-2 text-sm font-medium"> 
                        {t("admin.survey.manage.database_question.title")}
                        </label>
                        <div className="relative">
                            <select
                                id="dimension"
                                ref={selectRef} 
                                value={selectedDimension}
                                onChange={handleDimensionChange}
                                className="font-extrabold w-full rounded-2xl shadow-md p-2 border  border-gray-300"
                            >
                                <option value="" disabled>
                                    {t("admin.survey.manage.database_question.select_dimension")}
                                </option>
                                {dimensionOptions.map((option, index) => (
                                        <option key={index} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>
                </div>
                {selectedElements.length > 0 && (
                    <div
                        ref={containerRef}
                        className="shadow-2xl rounded-2xl p-4 mt-4 max-w-full md:max-w-fit border border-gray-300"
                        style={{ minWidth: boxMinWidth ? `${boxMinWidth}px` : 'auto' }}
                    >
                        <div className="flex items-center justify-between mt-2">
                            <button
                                type="button"
                                className="flex items-center gap-2 w-full text-left mb-2"
                                onClick={handleSelectAllChange}
                            >
                                <Checkbox
                                    id="select-all"

                                    isSelected={selectAll}
                                    onValueChange={handleSelectAllChange}
                                />

                            <label className="font-normal pointer-events-none text-sm md:text-base" htmlFor="select-all">
                                {t("admin.survey.manage.database_question.select_all")}
                            </label>

                            </button>
                        </div>
                        {selectedElements.map((element, index) => (
                            <div className="flex items-center justify-between mt-2" key={index}>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 w-full text-left"
                                    onClick={() => handleCheckboxChange(element)}
                                >
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id={`checkbox-${index}`}
                                            isSelected={selectedQuestionsByDimension.SurveyQuestions?.pages?.find(page => page.title === selectedDimension)?.elements.some(question => question.name === element.name) || false}
                                            onValueChange={() => handleCheckboxChange(element)}
                                        />
                                        <label className="font-normal pointer-events-none text-sm md:text-base" htmlFor={`checkbox-${index}`}>
                                            {element.title}
                                        </label>
                                    </div>
                                </button>
                                <Button variant="tertiary" className="ml-4">
                                    <FaSearchPlus className="hover:cursor-pointer" size={20} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-6">
                    <Button variant="primary" >
                        {t("admin.survey.manage.database_question.add_questions")}
                    </Button>
                </div>
            </div>
        </div>
    );
} 