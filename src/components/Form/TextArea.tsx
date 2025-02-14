import { Textarea, TextAreaProps } from "@nextui-org/react";
import { useFormContext } from "react-hook-form";

interface Props extends TextAreaProps {
  name: string;
  className?: string;
}

export function TextArea({
  className,
  ...props
}: Props) {
  const { register } = useFormContext();
  return (
    <Textarea
      className={`w-full resize-none h-full outline-none dark:text-white p-3 dark:bg-transparent  border-0 rounded-2xl ${className}`}
      {...register(props.name)}
      {...props}
    />


  )

}
