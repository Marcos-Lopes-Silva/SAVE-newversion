import { Button, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import { IoMdHelpCircle } from "react-icons/io";

interface Props {
  message: string | JSX.Element,
  size: number,
  title: string,
  image?: StaticImageData,
  imageWidth?: number,
  imageHeight?: number,
}

export default function Note({ title, message, size, image, imageHeight, imageWidth }: Props) {

  const [show, setShow] = useState<boolean>(false);


  return (
    <Popover placement="right" isOpen={show} classNames={{ content: "relative bottom-0 top-0 w-auto" }}>
      <PopoverTrigger>
        <IoMdHelpCircle size={size} onMouseEnter={() => setShow(true)} />
      </PopoverTrigger>
      <PopoverContent onMouseLeave={() => setShow(false)}>
        <div className="px-1 py-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm">{message}</p>
          {image && <Image alt="Imagem de exemplo" src={image} width={imageWidth} height={imageHeight} />}
        </div>
      </PopoverContent>
    </Popover>
  )
}