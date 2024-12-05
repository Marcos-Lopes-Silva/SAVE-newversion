import { Checkbox, Modal, ModalBody, ModalContent, ModalFooter } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { t } from "i18next";
import Note from "@/components/layout/Note";
import Button from "@/components/layout/Button";
import { IQuestion, IOption } from "../../../../../../models/surveyModel";
import Select from "@/components/layout/Select";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";

interface ConfigurationsProps {
    isOpen: boolean,
    onOpenChange: (value: boolean) => void,
    useRef: React.RefObject<HTMLDivElement>,
    question: IQuestion,
    questions: IQuestion[],
    updateProp: (question: IQuestion) => void,
    syncSurvey: (questions: IQuestion) => void
}



const Configurations = ({ isOpen, onOpenChange, question, updateProp, questions, syncSurvey }: ConfigurationsProps) => {
    const [isDependent, setIsDependent] = useState<boolean>(false);
    const [dependsSetted, setDependsSetted] = useState<boolean>(false);
    const [depends, setDepends] = useState<IQuestion>();
    const [optionsText, setOptionsText] = useState<string>("");
    const [expectedResponses, setExpectedResponses] = useState<IOption[]>([]);

    const handleUpdateRequiredProp = (value: boolean) => {
        const updatedQuestion: IQuestion = { ...question, required: value };
        updateProp(updatedQuestion);
    }

    const handleUpdateDependsOn = (value: IQuestion) => {
        const updatedQuestion: IQuestion = { ...question, dependsOn: value.name };
        setDepends(value);
        if (!value.options) return toast.error(t('admin.survey.create.config.error.options'));
        setDependsSetted(true);
        updateProp(updatedQuestion);
    }

    const handleUpdateNameProp = (value: string) => {
        if (value === "") toast.error(t('admin.survey.create.config.error.name'));
        const updatedQuestion: IQuestion = { ...question, name: value }
        updateProp(updatedQuestion);
    }

    const handleUpdateValueOptionProp = (value: string, id: number) => {
        if (!question.options || !value) return;

        const option = question.options?.find(op => op.id === id)!!

        const updatedOption = { id: option.id, label: option.label, value: value };
        const newOptions = question.options.map((item) => item.id === id ? updatedOption : item);

        const updatedQuestion: IQuestion = {
            ...question,
            options: newOptions
        }

        updateProp(updatedQuestion);
    }

    useEffect(() => {
        setIsDependent(!!question.dependsOn);
        console.log(question.required);
        setExpectedResponses(question.dependsOnOptions || []);
    }, [isOpen, question]);

    const removeOptionProp = (id: number) => {
        const options = question.options?.filter(op => op.id != id);
        const updatedQuestion = { ...question, options: options }
        updateProp(updatedQuestion);
    }

    const haveOptions = question.type === "radio" || question.type === "checkbox";

    const addOptionProp = () => {
        const options = question.options || [];
        if (options === undefined) return;

        const sortedOptions = options!!.map(option => option.id).sort((a, b) => a - b);
        const id = sortedOptions[sortedOptions.length - 1] > 0 ? sortedOptions[sortedOptions.length - 1] + 1 : 1;

        const updatedQuestion = {
            ...question, options: [
                ...question.options === undefined ? [] : question.options,
                { id: id, label: "Option", value: id.toString() }]
        };
        updateProp(updatedQuestion);
    }

    const addExpectedResponses = (option: IOption) => {
        setExpectedResponses([...expectedResponses, option])

        const updatedQuestion: IQuestion = { ...question, dependsOnOptions: expectedResponses }
        updateProp(updatedQuestion);
    }

    const addExpectedResponse = (option: IOption) => {
        const updatedQuestion: IQuestion = { ...question, dependsOnValue: option.value }
        updateProp(updatedQuestion)
    }

    const createQuestionAboutRegion = () => {
        const updatedQuestion: IQuestion = { ...question, region: !question.region }
        updateProp(updatedQuestion);
    }

    const addWithText = () => {
        if (!optionsText) return toast.error(t('admin.survey.create.config.error.options'));

        const options = question.options || [];
        const sortedOptions = options.map(option => option.id).sort((a, b) => a - b);
        const id = sortedOptions.length > 0 ? sortedOptions[sortedOptions.length - 1] + 1 : 1;

        const newOptions = optionsText.split(',');

        const updatedOptions = [
            ...options,
            ...newOptions.map((option, index) => ({
                id: id + index,
                label: option.trim(),
                value: option.trim()
            }))
        ];

        const updatedQuestion = {
            ...question,
            options: updatedOptions
        };

        updateProp(updatedQuestion);
    };

    return (
        <Modal isOpen={isOpen} size="2xl" classNames={{ base: "z-[40] overflow-visible" }} onOpenChange={onOpenChange} isKeyboardDismissDisabled={true}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalBody>
                            <div className="space-y-6 flex flex-col justify-end">
                                <label className="font-semibold text-lg">{`${t('admin.survey.create.config.title')}`}</label>
                                <div className="border-2 border-zinc-200 shadow-md p-5 flex flex-col gap-3 rounded-xl">
                                    <div className="flex gap-2 flex-col border-2 p-5 shadow-md mb-5">
                                        <label className="font-medium justify-between flex text-lg">name<Note size={20} message={t('admin.survey.create.config.name_about')} title={t('admin.survey.create.config.name_title')} /></label>
                                        <input className="border-1 mb-2 border-zinc-300 py-1 px-2 rounded-xl w-2/3" type="text" defaultValue={question.name} onBlur={(e) => handleUpdateNameProp(e.target.value)} />
                                        {haveOptions && <label className="text-lg">{t('admin.survey.create.config.option_value')}</label>}
                                        {haveOptions && question.options?.map((option: IOption, index: number) => (
                                            <div key={index} className="flex items-center gap-5">
                                                <input className="border-1 h-10 border-zinc-300 px-2 rounded-xl w-2/3" type="text" defaultValue={option.value} onBlur={(e) => handleUpdateValueOptionProp(e.target.value, option.id)} />
                                                <button className="size-12 items-center justify-center rounded-3xl border-2 flex hover:bg-zinc-100" onClick={() => removeOptionProp(option.id)}><MdDelete /></button>
                                            </div>
                                        ))}
                                        {haveOptions &&
                                            <div>
                                                <button className="shadow-md border-2 border-zinc-200 w-2/3 rounded-2xl py-1 hover:bg-zinc-100" onClick={addOptionProp}>+</button>
                                                <input className="mt-5 w-2/3 border border-zinc-400 px-3 py-1 rounded-xl mb-2" type="text" onChange={(e) => setOptionsText(e.target.value)} />
                                                <button className="shadow-md border-2 border-zinc-200 w-2/3 rounded-2xl py-1 hover:bg-zinc-100" onClick={() => addWithText()}>Adicionar opções</button>
                                            </div>
                                        }
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <Checkbox about="Obrigatório" defaultSelected={question.required} onChange={(e) => handleUpdateRequiredProp(!question.required)} />
                                        <label>{t('admin.survey.create.config.required')}</label>
                                    </div>
                                    {question.type === 'radio' &&
                                        <div className="flex gap-2 items-center">
                                            <Checkbox about="Outros" defaultSelected={question.required} onChange={(e) => handleUpdateRequiredProp(!question.other)} />
                                            <label>{t('admin.survey.create.config.others')}</label>
                                        </div>
                                    }
                                    <div className="flex gap-2 items-center">
                                        <Checkbox about="Dependência" defaultSelected={isDependent} onChange={(e) => setIsDependent(!isDependent)} />
                                        <label>{t('admin.survey.create.config.dependent')}</label>
                                    </div>
                                    {isDependent && (
                                        <div className="animation-reveal">
                                            <Select<IQuestion> defaultSelected={[question.dependsOn || ""]} className="w-40" onChange={(value: IQuestion) => handleUpdateDependsOn(value)} options={questions.filter(q => q.id !== question.id && (q.type === 'checkbox' || q.type === 'radio' || q.type === 'rating'))} getLabel={(question) => question.name} />
                                        </div>
                                    )}

                                    {depends && depends.options && depends.type === 'checkbox' ? (
                                        <div className="animation-reveal">
                                            <Select<IOption> className="w-40" defaultSelected={question.dependsOnOptions?.map((option) => option.label)} onChange={(value: IOption) => addExpectedResponses(value)} options={depends.options?.filter(op => !expectedResponses.find((eR) => op.id === eR.id))!!} getLabel={(option) => "Selecione..."} />
                                            {expectedResponses.map((option: IOption, index: number) => (
                                                <li key={index} className="">
                                                    {option.label}
                                                </li>
                                            ))}
                                        </div>
                                    ) :
                                        depends && depends.options && depends?.type === 'radio' ? (
                                            <div className="animation-reveal">
                                                <Select<IOption> className="w-40" onChange={(value: IOption) => addExpectedResponse(value)} options={questions.find(q => q.name === question.dependsOn)?.options!!} getLabel={(option) => option.label} />
                                                {expectedResponses.map((option: IOption, index: number) => (
                                                    <li key={index} className="">
                                                        {option.label}
                                                    </li>
                                                ))}
                                            </div>
                                        ) : null
                                    }
                                    <div>
                                        <Checkbox about="Questão sobre região" checked={question.region} onChange={(e) => createQuestionAboutRegion()} />
                                        <label>{t('admin.survey.create.config.region_question')}</label>
                                    </div>
                                </div>

                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={() => {
                                if (question.name === "") return toast.error(t('admin.survey.create.config.error.name'));
                                onClose()
                            }}>
                                Fechar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default Configurations;