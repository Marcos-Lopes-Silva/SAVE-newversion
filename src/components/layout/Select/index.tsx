import { t } from 'i18next';
import React, { useState, useEffect } from 'react';

interface SelectProps<T> {
    options: T[];
    onChange: (value: T) => void;
    placeholder?: string;
    getLabel: (option: T) => string;
    className: string;
    defaultSelected?: string[];
}

const Select = <T,>({
    defaultSelected,
    className,
    options,
    onChange,
    placeholder = t('select.placeholder'),
    getLabel
}: SelectProps<T>) => {
    const [selectedOption, setSelectedOption] = useState<string[] | null>(defaultSelected || null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [value, setValue] = useState<T | null>(null);

    useEffect(() => {
        if (defaultSelected) {
            setSelectedOption(defaultSelected);
        }
    }, [defaultSelected]);

    const handleSelect = (value: T) => {
        setValue(value);
        setSelectedOption([getLabel(value)]);
        onChange(value);
        setIsOpen(false);
    };

    return (
        <div className={`group/select relative ${className}`}>
            <button
                className="w-full group-hover/select:bg-zinc-100 bg-white border border-gray-300 rounded-lg shadow-sm p-2 text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedOption ? selectedOption.join(',').concat(' ') : value ? getLabel(value) : placeholder}
                <span className="float-right">&#9662;</span>
            </button>
            {isOpen && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {options.map((option, index) => (
                        <li
                            key={index}
                            className="p-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() => handleSelect(option)}
                        >
                            {getLabel(option)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Select;
