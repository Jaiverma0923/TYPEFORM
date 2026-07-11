type PositionedQuestion = {
  id: number;
  position: number;
};

export function normalizeQuestionPositions<T extends PositionedQuestion>(questions: T[]) {
  return questions.map((question, index) => ({
    ...question,
    position: index + 1,
  }));
}
