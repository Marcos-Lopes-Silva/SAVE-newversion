import { Controller, useFormContext } from "react-hook-form";
import { IQuestionProp } from ".";
import { Autocomplete as NextUiSelect, AutocompleteItem } from "@nextui-org/react";
import { useState } from "react";
import { LuAsterisk } from "react-icons/lu";
import { Form } from "@/components/Form";

export function Select({ question }: IQuestionProp) {
    const { control } = useFormContext();
    const [search, setSearch] = useState<string>("");


    return (
        <Form.Field className="flex font-bold flex-col gap-5">
            <Form.Label className="py-2 px-2 font-bold flex gap-2 dark:text-white">{`${question.id}. ${question.title}`}{question.required ? <LuAsterisk /> : ""}</Form.Label>
            <Controller
                name={question.name}
                control={control}
                rules={{ required: question.required && "Essa questão é obrigatória." }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                    <>
                        <input type="hidden" onChange={(e) => setSearch(e.target.value)} value={search} ref={ref} />
                        <NextUiSelect
                            label="Selecione uma opção"
                            className="max-w-sm"
                            onBlur={onBlur}
                            selectedKey={value}
                            onSelectionChange={onChange}
                            onChange={onChange}
                        >
                            {(question.options || []).filter(item => item.label.includes(search)).map((item) => (
                                <AutocompleteItem key={item.value} className="dark:text-white max-w-xs">
                                    {item.label}
                                </AutocompleteItem>
                            ))}
                        </NextUiSelect>
                    </>
                )}
            />
            <Form.ErrorMessage field={question.name} />
        </Form.Field>
    )
}