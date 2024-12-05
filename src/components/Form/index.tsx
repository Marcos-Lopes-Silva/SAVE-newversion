import dynamic from "next/dynamic"
import { ErrorMessage } from "./ErrorMessage"
import { Field } from "./Field"
import { Input } from "./Input"
import { Label } from "./Label"
import { TextArea } from "./TextArea"
import { RatingScale } from "./RatingScale"

const Date = dynamic(
    () => import('./Date').then(mod => mod.Date),
    { ssr: false }
)

export const Form = {
    Field,
    Input,
    Label,
    TextArea,
    ErrorMessage,
    Date,
    RatingScale
}
