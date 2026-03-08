export type OptionLabel = 'A' | 'B' | 'C' | 'D';

export interface IQuestion {
  id?: number;
  examId: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: OptionLabel;
  marks?: number;
}
