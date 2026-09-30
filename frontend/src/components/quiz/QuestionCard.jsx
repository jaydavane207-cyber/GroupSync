import React from 'react';
import Card from '@/components/cards/Card';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';

export const QuestionCard = ({
  questionIndex = 0,
  totalQuestions = 10,
  question,
  options = [],
  selectedOption,
  onSelectOption,
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between text-[11px] text-gs-text-muted mb-4 pb-2 border-b border-gs-border">
        <span>Question {questionIndex + 1} of {totalQuestions}</span>
      </div>
      <MultipleChoiceQuestion
        question={question}
        options={options}
        selectedOption={selectedOption}
        onSelectOption={onSelectOption}
      />
    </Card>
  );
};

export default QuestionCard;

