import { IQuestion } from "../../../../../models/surveyModel";
import { Checkbox } from "./Checkbox";
import { Text } from "./Text";
import { Radio } from "./Radio";
import { DateQuestion } from "./DateQuestion";
import { Dropdown } from "./Dropdown";
import { Number } from "./Number";
import { TextArea } from "./TextArea";
import { Rating } from "./Rating";
import { Select } from "./Select";
import { TableSurvey } from "./TableSurvey";

export interface IQuestionProp {
    question: IQuestion;
}

export const QuestionsBody = {
    Text,
    Checkbox,
    Radio,
    DateQuestion,
    Dropdown,
    Number,
    TextArea,
    Rating,
    Select,
    TableSurvey,
} 