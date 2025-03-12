import { api } from "@/lib/api";
import { t } from "i18next";
import { connectToMongoDB } from "@/lib/db";
import ImageGraphic from "@/static/images/graphicsPage.svg";
import Image from "next/image";
import { Dropdown, DropdownItem, DropdownTrigger, DropdownMenu } from "@nextui-org/dropdown";
import { Button } from "@nextui-org/button";
import { useState, useEffect } from "react";
import { IoMdDownload } from "react-icons/io";
import { FaFilter } from "react-icons/fa";
import { MdFilterAltOff } from "react-icons/md";
import { GoTriangleUp } from "react-icons/go";
import { GoTriangleDown } from "react-icons/go";
import { ISurveyDocument } from "../../../models/surveyModel";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Graphic from "@/components/Graphic";

interface Props {
    surveys: ISurveyDocument[];
}

export default function Graphics({ surveys }: Props) {
    const [selectedOption, setSelectedOption] = useState("");
    const [isSurveyDropdownOpen, setIsSurveyDropdownOpen] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState<ISurveyDocument | null>(null);
    const [isFilterClicked, setIsFilterClicked] = useState(false);
    const [isDimensionDropdownOpen, setIsDimensionDropdownOpen] = useState(false);
    const [isDegreeDropdownOpen, setIsDegreeDropdownOpen] = useState(false);
    const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
    const [isEntryDropdownOpen, setIsEntryDropdownOpen] = useState(false);
    const [isGraduationDropdownOpen, setIsGraduationDropdownOpen] = useState(false);

    const [dimension, setDimension] = useState("Dimensão");
    const [degree, setDegree] = useState("Curso");
    const [gender, setGender] = useState("Gênero");
    const [entry, setEntry] = useState("Entrada");
    const [graduation, setGraduation] = useState("Graduação");

    useEffect(() => {
        if (selectedOption) {
            const survey = surveys.find(survey => String(survey._id) === selectedOption);
            setSelectedSurvey(survey || null);
        }
    }, [selectedOption, surveys]);

    const handleApplyFilters = () => {
        // algo aqui
    };

    const handleClearFilters = () => {
        setDimension("Dimensão");
        setDegree("Curso");
        setGender("Gênero");
        setEntry("Entrada");
        setGraduation("Graduação");
        setSelectedSurvey(null);
    };

    return (
        <main>
            <header className="flex bg-slate-100 shadow-lg rounded-t-3xl gap-10 p-8 lg:px-32 lg:py-12 max-w-7xl mx-auto mt-10">
                <div className="flex flex-col gap-4 lg:gap-8">
                    <h1 className={"hidden sm:block font-semibold text-2xl mt-5 text-left lg:py-1"}>
                        Pesquisas
                    </h1>
                    <p className="text-sm sm:text-md lg:ml-0 text-justify">
                        Explore as pesquisas e conduza análises personalizadas, selecionando a dimensão desejada
                        para visualizar os dados com precisão.
                    </p>
                </div>
                <Image className="p-8 lg:py-5" src={ImageGraphic} alt="graphics" />
            </header>
            <div className="flex justify-between items-center mt-12 mx-auto max-w-7xl">
                <Dropdown isOpen={isSurveyDropdownOpen} onOpenChange={setIsSurveyDropdownOpen}>
                    <DropdownTrigger>
                        <Button variant="bordered" style={{ borderColor: 'black', paddingLeft: '150px', paddingRight: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                            Questionários
                            <span style={{ position: 'absolute', right: '10px' }}>
                                {isSurveyDropdownOpen ? <GoTriangleDown style={{ fontSize: '1.5em' }} /> : <GoTriangleUp style={{ fontSize: '1.5em' }} />}
                            </span>
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Static Actions" onAction={(key) => setSelectedOption(key as string)} style={{ width: '350px' }}>
                        {surveys && surveys.map((survey) => (
                            <DropdownItem key={String(survey._id)} className={selectedOption === String(survey._id) ? "bg-gray-200" : ""}>
                                {survey.title}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
                <Button variant="bordered" style={{ borderColor: 'black', paddingLeft: '60px', paddingRight: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setIsFilterClicked(!isFilterClicked)}>
                    <FaFilter style={{ position: 'absolute', left: '15px', fontSize: '1em' }} />
                    Filtros
                </Button>
                <Button variant="solid" style={{ backgroundColor: 'black', color: 'white' }}>
                    Download
                    <IoMdDownload style={{ marginLeft: '8px', color: 'white', fontSize: '1.5em' }} />
                </Button>
            </div>
            {isFilterClicked && (
                <div className="flex justify-between items-center mt-20 mx-auto max-w-7xl shadow-lg p-6 rounded-lg">
                    <Dropdown isOpen={isDimensionDropdownOpen} onOpenChange={setIsDimensionDropdownOpen}>
                        <DropdownTrigger>
                            <Button variant="bordered" style={{ borderColor: 'black', paddingLeft: '40px', paddingRight: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                                {dimension}
                                <span style={{ position: 'absolute', right: '10px' }}>
                                    {isDimensionDropdownOpen ? <GoTriangleDown style={{ fontSize: '1.5em' }} /> : <GoTriangleUp style={{ fontSize: '1.5em' }} />}
                                </span>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Static Actions" onAction={(key) => setDimension(key as string)}>
                            <DropdownItem key="Dimensão 1">Dimensão 1</DropdownItem>
                            <DropdownItem key="Dimensão 2">Dimensão 2</DropdownItem>
                            <DropdownItem key="Dimensão 3">Dimensão 3</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    <Dropdown isOpen={isDegreeDropdownOpen} onOpenChange={setIsDegreeDropdownOpen}>
                        <DropdownTrigger>
                            <Button variant="bordered" style={{ borderColor: 'black', paddingLeft: '40px', paddingRight: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                                {degree}
                                <span style={{ position: 'absolute', right: '10px' }}>
                                    {isDegreeDropdownOpen ? <GoTriangleDown style={{ fontSize: '1.5em' }} /> : <GoTriangleUp style={{ fontSize: '1.5em' }} />}
                                </span>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Static Actions" onAction={(key) => setDegree(key as string)}>
                            <DropdownItem key="CC">CC</DropdownItem>
                            <DropdownItem key="ES">ES</DropdownItem>
                            <DropdownItem key="Todos">Todos</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    <Dropdown isOpen={isGenderDropdownOpen} onOpenChange={setIsGenderDropdownOpen}>
                        <DropdownTrigger>
                            <Button variant="bordered" style={{ borderColor: 'black', paddingLeft: '40px', paddingRight: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                                {gender}
                                <span style={{ position: 'absolute', right: '10px' }}>
                                    {isGenderDropdownOpen ? <GoTriangleDown style={{ fontSize: '1.5em' }} /> : <GoTriangleUp style={{ fontSize: '1.5em' }} />}
                                </span>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Static Actions" onAction={(key) => setGender(key as string)}>
                            <DropdownItem key="Masculino">Masculino</DropdownItem>
                            <DropdownItem key="Feminino">Feminino</DropdownItem>
                            <DropdownItem key="Todos">Todos</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    <Dropdown isOpen={isEntryDropdownOpen} onOpenChange={setIsEntryDropdownOpen}>
                        <DropdownTrigger>
                            <Button variant="bordered" style={{ borderColor: 'black', paddingLeft: '40px', paddingRight: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                                {entry}
                                <span style={{ position: 'absolute', right: '10px' }}>
                                    {isEntryDropdownOpen ? <GoTriangleDown style={{ fontSize: '1.5em' }} /> : <GoTriangleUp style={{ fontSize: '1.5em' }} />}
                                </span>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Static Actions" onAction={(key) => setEntry(key as string)}>
                            <DropdownItem key="2018">2018</DropdownItem>
                            <DropdownItem key="2019">2019</DropdownItem>
                            <DropdownItem key="2020">2020</DropdownItem>
                            <DropdownItem key="2021">2021</DropdownItem>
                            <DropdownItem key="Todos">Todos</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    <Dropdown isOpen={isGraduationDropdownOpen} onOpenChange={setIsGraduationDropdownOpen}>
                        <DropdownTrigger>
                            <Button variant="bordered" style={{ borderColor: 'black', paddingLeft: '40px', paddingRight: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                                {graduation}
                                <span style={{ position: 'absolute', right: '10px' }}>
                                    {isGraduationDropdownOpen ? <GoTriangleDown style={{ fontSize: '1.5em' }} /> : <GoTriangleUp style={{ fontSize: '1.5em' }} />}
                                </span>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Static Actions" onAction={(key) => setGraduation(key as string)}>
                            <DropdownItem key="2018">2018</DropdownItem>
                            <DropdownItem key="2019">2019</DropdownItem>
                            <DropdownItem key="2020">2020</DropdownItem>
                            <DropdownItem key="2021">2021</DropdownItem>
                            <DropdownItem key="Todos">Todos</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    <Button variant="solid" style={{ backgroundColor: 'black', color: 'white' }} onClick={handleApplyFilters}>
                        Aplicar
                    </Button>
                    <Button variant="solid" style={{ backgroundColor: 'black', color: 'white' }} onClick={handleClearFilters}>
                        Limpar
                        <MdFilterAltOff style={{ marginLeft: '8px', color: 'white', fontSize: '1.2em' }} />
                    </Button>
                </div>
            )}
            {selectedSurvey && selectedSurvey.pages && selectedSurvey.pages.flatMap(page => page.questions).map((question, index) => (
                <Graphic key={index} questionTitle={question.title} />
            ))}
        </main>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    await connectToMongoDB();

    const session = await getSession(context);
    const surveys = await api.get<ISurveyDocument[]>(`user/survey?cpf=${session?.user?.cpf}`);

    return {
        props: {
            surveys: JSON.parse(JSON.stringify(surveys))
        }
    }
}

Graphics.auth = {
    role: 'user',
    unauthorized: '/'
}