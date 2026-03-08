import { OptionLabel } from "./question";


export interface IStudentAnswer {
  id?: number;
  attemptId: number;
  questionId: number;
  selectedOption: OptionLabel;
  isCorrect?: boolean;
}
