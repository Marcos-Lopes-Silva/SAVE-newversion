import { Controller, useFormContext } from "react-hook-form";
import { IQuestionProp } from ".";
import { Autocomplete as NextUiSelect, AutocompleteItem } from "@nextui-org/react";
import { useState } from "react";
import { LuAsterisk } from "react-icons/lu";

export function Select({ question }: IQuestionProp) {
    const { control } = useFormContext();
    const [search, setSearch] = useState<string>("");


    return (
        <div className="flex font-bold flex-col gap-5">
            <label>{`${question.id}. ${question.title}`}{question.required ? <LuAsterisk /> : ""}</label>
            <Controller
                name={question.name}
                control={control}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                    <>
                        <input type="hidden" onChange={(e) => setSearch(e.target.value)} value={search} ref={ref} />
                        <NextUiSelect
                            label="Selecione uma opção"
                            className="max-w-xs"
                            onBlur={onBlur}
                            value={value}
                            onChange={onChange}
                        >
                            {(question.options || []).filter(item => item.label.includes(search)).map((item) => (
                                <AutocompleteItem key={item.value}>
                                    {item.label}
                                </AutocompleteItem>
                            ))}
                        </NextUiSelect>
                    </>
                )}
            />
        </div>
    )
}