import { t } from "i18next";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  className?: string;
  classNameTA?: string;
  maxLength?: number;
}

export function TextArea({
  maxLength = 2000,
  className,
  classNameTA,
  ...props
}: Props) {
  const { register, watch } = useFormContext();
  const value = watch(props.name) || "";
    return (
        <div className={`group rounded-2xl flex flex-col items-end border-b border-zinc-500 shadow-sm px-1 py-2 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500 ${className}`}>
            <textarea
                className={`w-full resize-none h-full outline-none dark:text-white p-3 dark:bg-transparent  border-0 rounded-2xl ${classNameTA}`}
                {...register(props.name)}
                {...props}
            />
            <p className="text-zinc-500 dark:text-white opacity-80">{`${value.length} / ${maxLength}`} {t('textarea.characters')}</p>
        </div>

    )

}
