import { BsInputCursorText, BsTextareaResize } from "react-icons/bs";
import { IoMdRadioButtonOn, IoIosStarOutline, IoIosCheckboxOutline } from "react-icons/io";
import { GoNumber } from "react-icons/go";
import { RxDropdownMenu } from "react-icons/rx";
import { CiCalendarDate } from "react-icons/ci";
import { IQuestion } from "../../../../../models/surveyModel";

const size = 25;
const color = "white"

interface IIcon extends Partial<IQuestion> {
  icon: JSX.Element;
}

const inputTypes: IIcon[] = [
  {
    "type": "text",
    "title": "Text Input",
    "icon": <BsInputCursorText size={size} color={color} />
  },
  {
    "type": "textarea",
    "title": "Text Area",
    "icon": <BsTextareaResize size={size} color={color} />
  },
  {
    "type": "radio",
    "title": "Radio Group",
    "icon": <IoMdRadioButtonOn size={size} color={color} />
  },
  {
    "type": "rating",
    "title": "Rating Scale",
    "icon": <IoIosStarOutline size={size} color={color} />
  },
  {
    "type": "checkbox",
    "title": "Checkbox",
    "options": [{ label: "Option 1", value: "Option 1" }, { label: "Option 2", value: "Option 2" }],
    "icon": <IoIosCheckboxOutline size={size} color={color} />
  },
  {
    "type": "number",
    "title": "Number Input",
    "icon": <GoNumber size={size} color={color} />

  },
  {
    "type": "select",
    "title": "Select",
    "options": [{ label: "Option 1", value: "Option 1" }, { label: "Option 2", value: "Option 2" }],
    "icon": <RxDropdownMenu size={size} color={color} />
  },
  {
    "type": "date",
    "title": "Date",
    "icon": <CiCalendarDate size={size} color={color} />
  }
]

interface Props {
  addQuestion: (type: Partial<IQuestion>) => void;
}

export default function Sidebar({ addQuestion }: Props) {
  return (
    <div className="fixed bg-zinc-900 flex flex-col items-center gap-7 w-28 max-w-36 p-5 h-3/4">
      {inputTypes.map((item, index) => (
        <button key={index} className="group flex gap-4 hover:bg-zinc-800 w-full items-center justify-center p-2 rounded-2xl" onClick={() => addQuestion(item)}>
          <span className="group-hover:none">{item.icon}</span>
          <span className="hidden group-hover:inline absolute left-6 shadow-md rounded-lg w-32 p-1.5 bg-white font-semibold text-sm">{item.title}</span>
        </button>
      ))}
    </div>
  )
}