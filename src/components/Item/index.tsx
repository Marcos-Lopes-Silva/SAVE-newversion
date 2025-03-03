import { Button, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { useState } from "react";
import { MdMoreHoriz } from "react-icons/md";
import { truncateText } from "@/lib/utils/truncate";

interface Props<T> extends React.HTMLProps<HTMLLIElement> {
    item: T;
    options?: React.ReactNode;
    icon?: React.ReactNode;
    menu?: React.ReactNode;
    buttonLabel?: string;
    action?: () => void;
}

interface Item {
    title?: string;
    name?: string;
}

//Use the generic type Item to define the type of the item prop
//Use flex row to align the title and the options

export default function Item<T extends Item>({ options, item, icon, menu, buttonLabel, action, ...props }: Props<T>) {
    const [show, setShow] = useState<boolean>(false);

    return (
        <li className={`${props.className}`} {...props}>
            {icon}
            <div className="w-full gap-3 flex-col">
                <div className="flex items-center justify-between w-full pt-3">
                    <h2 className="block lg:hidden text-md sm:text-lg font-medium dark:text-white">{truncateText(item.title ?? '', 17)}</h2>
                    <h2 className="hidden lg:block text-md sm:text-lg font-medium dark:text-white">{truncateText(item.title ?? '', 50)}</h2>
                    {
                        !menu && buttonLabel
                            ? <Button className="bg-zinc-900 text-white" onClick={action}>{buttonLabel}</Button>
                            : <Popover size="lg" placement="bottom" showArrow offset={10}>
                                <PopoverTrigger>
                                    <Button className="size-7 flex flex-col cursor-pointer bg-transparent outline-none border-0" onMouseEnter={(e) => e.currentTarget.click()}><MdMoreHoriz size={21} /></Button>
                                </PopoverTrigger>
                                <PopoverContent >
                                    {menu}
                                </PopoverContent>
                            </Popover>
                    }

                </div>
                {options}
                {show && (
                    <div className="absolute z-[100] left-[0] top-[100%] bg-zinc-200 p-5 rounded-lg" onMouseLeave={() => setShow(!show)}>
                        {menu}
                    </div>
                )}
            </div>
        </li>
    )
}