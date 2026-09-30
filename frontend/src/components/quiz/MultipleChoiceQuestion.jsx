import React from 'react';

export const MultipleChoiceQuestion = ({
  question,
  options = [],
  selectedOption,
  onSelectOption,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gs-text-main leading-relaxed">{question}</h3>
      <div className="space-y-2">
        {options.map((opt, index) => {
          const isSelected = selectedOption === index;
          return (
            <button
              key={index}
              onClick={() => onSelectOption(index)}
              className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                isSelected
                  ? 'border-[#6D6AF6] bg-[#6D6AF6]/10 text-gs-text-main font-medium shadow-xs'
                  : 'border-gs-border bg-white/2 hover:bg-white/5 text-gs-text-secondary'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono border ${
                    isSelected
                      ? 'border-[#6D6AF6] bg-[#6D6AF6] text-white'
                      : 'border-gs-border text-gs-text-muted'
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{opt}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoiceQuestion;
