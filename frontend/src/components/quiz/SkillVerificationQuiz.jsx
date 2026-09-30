import React, { useState } from 'react';

const QUESTION_BANK = {
  "React": [
    {
      question: "What is the primary purpose of the Virtual DOM in React?",
      options: [
        "To securely store private data",
        "To optimize DOM manipulation for performance",
        "To manage application routing",
        "To provide a built-in state management system"
      ],
      answer: "To optimize DOM manipulation for performance"
    },
    {
      question: "Which React hook is used to handle side effects?",
      options: ["useState", "useMemo", "useEffect", "useCallback"],
      answer: "useEffect"
    },
    {
      question: "How do you pass data from a parent component down to a child component?",
      options: ["Using State", "Using Props", "Using Context API", "Using Redux"],
      answer: "Using Props"
    },
    {
      question: "What does JSX stand for?",
      options: [
        "Java Standard XML",
        "JavaScript Syntax Extension",
        "JavaScript XML",
        "Java Syntax Extension"
      ],
      answer: "JavaScript XML"
    },
    {
      question: "Which of the following is true regarding React component state?",
      options: [
        "State can be accessed freely from any unrelated component",
        "State is read-only and cannot be updated",
        "State updates are managed directly by modifying the state object",
        "State updates should be performed using a setter function (e.g., setState or a hook setter)"
      ],
      answer: "State updates should be performed using a setter function (e.g., setState or a hook setter)"
    },
    {
      question: "What is the purpose of the 'key' prop when rendering lists in React?",
      options: [
        "To uniquely identify elements for efficient re-rendering",
        "To bind a variable to the database",
        "To apply custom CSS styling",
        "To encrypt data during transmission"
      ],
      answer: "To uniquely identify elements for efficient re-rendering"
    },
    {
      question: "Which method is used in class components to handle state updates based on previous state?",
      options: [
        "Passing a callback function to setState",
        "Passing a new object to setState directly",
        "Using the forceUpdate method",
        "Directly modifying this.state"
      ],
      answer: "Passing a callback function to setState"
    },
    {
      question: "What pattern allows you to reuse component logic by wrapping components?",
      options: ["Custom Hooks", "Higher-Order Components (HOCs)", "Render Props", "All of the above"],
      answer: "All of the above"
    },
    {
      question: "What does the useMemo hook do?",
      options: [
        "Caches a function definition between renders",
        "Memoizes the computed value to avoid expensive calculations on every render",
        "Handles asynchronous API calls automatically",
        "Replaces the need for Context API"
      ],
      answer: "Memoizes the computed value to avoid expensive calculations on every render"
    },
    {
      question: "Which hook allows you to reference a DOM element directly?",
      options: ["useRef", "useEffect", "useDOM", "useReference"],
      answer: "useRef"
    }
  ],
  "Python": [
    {
      question: "Which keyword is used to define a function in Python?",
      options: ["func", "def", "function", "lambda"],
      answer: "def"
    },
    {
      question: "What data type is the result of applying square brackets like [1, 2, 3]?",
      options: ["Tuple", "Dictionary", "Set", "List"],
      answer: "List"
    },
    {
      question: "How do you insert single-line comments in Python code?",
      options: ["// This is a comment", "/* This is a comment */", "# This is a comment", "<!-- This is a comment -->"],
      answer: "# This is a comment"
    },
    {
      question: "Which method is used to add an item to the end of a list?",
      options: ["add()", "insert()", "append()", "push()"],
      answer: "append()"
    },
    {
      question: "What is a 'dictionary' in Python?",
      options: [
        "An ordered sequence of items",
        "An immutable collection of objects",
        "An unordered collection of key-value pairs",
        "A set of unique elements"
      ],
      answer: "An unordered collection of key-value pairs"
    },
    {
      question: "How do you handle exceptions in Python?",
      options: ["try...catch", "try...except", "do...catch", "catch...finally"],
      answer: "try...except"
    },
    {
      question: "What does the '__init__' method do in a Python class?",
      options: [
        "It acts as the constructor to initialize object attributes",
        "It destroys the object when no longer needed",
        "It defines static variables for the class",
        "It runs automatically when the program finishes"
      ],
      answer: "It acts as the constructor to initialize object attributes"
    },
    {
      question: "Which statement is used to exit a loop prematurely?",
      options: ["exit", "return", "continue", "break"],
      answer: "break"
    },
    {
      question: "What does 'PEP 8' refer to in the Python ecosystem?",
      options: [
        "The standard library reference",
        "A popular web framework",
        "The official style guide for Python code",
        "A package manager"
      ],
      answer: "The official style guide for Python code"
    },
    {
      question: "What is the output of 'type(lambda x: x)'?",
      options: ["<class 'lambda'>", "<class 'function'>", "<class 'object'>", "TypeError"],
      answer: "<class 'function'>"
    }
  ],
  "UI/UX": [
    {
      question: "What does 'UX' stand for?",
      options: ["User Extension", "User Experience", "User Execution", "Unity Experience"],
      answer: "User Experience"
    },
    {
      question: "What is the primary goal of wireframing?",
      options: [
        "To create the final visual design details with colors and fonts",
        "To structure the layout and establish the visual hierarchy of an application",
        "To write the underlying code for a web page",
        "To finalize user database schemas"
      ],
      answer: "To structure the layout and establish the visual hierarchy of an application"
    },
    {
      question: "What does 'Responsive Design' mean?",
      options: [
        "A design that loads instantly",
        "A design that automatically adjusts layout based on the user's screen size",
        "A design that uses dark mode exclusively",
        "A design focused on AI interactions"
      ],
      answer: "A design that automatically adjusts layout based on the user's screen size"
    },
    {
      question: "Which of the following is a key principle of accessibility (A11y) in UI design?",
      options: [
        "Using complex animations to draw attention",
        "Ensuring high text contrast for readability",
        "Removing all keyboard navigation options",
        "Relying solely on color to convey important information"
      ],
      answer: "Ensuring high text contrast for readability"
    },
    {
      question: "What is A/B testing?",
      options: [
        "Testing the application on two different operating systems",
        "Comparing two versions of a webpage to see which performs better",
        "Testing the frontend and backend sequentially",
        "Testing code for syntax errors and logic bugs"
      ],
      answer: "Comparing two versions of a webpage to see which performs better"
    },
    {
      question: "What is 'White Space' (or Negative Space) in design?",
      options: [
        "The area dedicated to banner advertisements",
        "The empty space between design elements used to improve readability and structure",
        "An error state showing a blank page",
        "Space intentionally colored white, regardless of theme"
      ],
      answer: "The empty space between design elements used to improve readability and structure"
    },
    {
      question: "What describes a 'Call to Action' (CTA)?",
      options: [
        "A system alert indicating an error",
        "A button or link designed to prompt the user to take a specific action",
        "A legal disclaimer at the bottom of a page",
        "A hidden developer menu"
      ],
      answer: "A button or link designed to prompt the user to take a specific action"
    },
    {
      question: "What is a 'Persona' in UX research?",
      options: [
        "An individual user's specific account profile",
        "A fictional character created to represent a user type or demographic",
        "An anonymous user session",
        "A developer's online avatar"
      ],
      answer: "A fictional character created to represent a user type or demographic"
    },
    {
      question: "What is the difference between UI and UX?",
      options: [
        "UI is about coding, UX is about marketing",
        "UI focuses on the visual and interactive surfaces, UX focuses on the overall feel and journey",
        "UI is server-side, UX is client-side",
        "There is no difference; they are interchangeable terms"
      ],
      answer: "UI focuses on the visual and interactive surfaces, UX focuses on the overall feel and journey"
    },
    {
      question: "Which file format is standard for vector-based UI design elements that scale without losing quality?",
      options: ["JPG", "GIF", "SVG", "PNG"],
      answer: "SVG"
    }
  ]
};

const SkillVerificationQuiz = () => {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setQuizFinished(false);
  };

  const handleOptionSelect = (option) => {
    if (!quizFinished) {
      setSelectedOption(option);
    }
  };

  const handleNextOrSubmit = () => {
    if (!selectedOption) return;

    const currentQuestions = QUESTION_BANK[selectedSkill];
    const currentQ = currentQuestions[currentQuestionIndex];

    // Check Answer
    if (selectedOption === currentQ.answer) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestionIndex < currentQuestions.length - 1) {
      // Proceed to next question
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      // Finish quiz
      setQuizFinished(true);
    }
  };

  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setQuizFinished(false);
  };

  const handleChooseDifferentSkill = () => {
    setSelectedSkill(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setQuizFinished(false);
  };

  const handleProceed = async () => {
    // TODO: Update is_verified in Supabase
    // e.g. const { data, error } = await supabase.from('profiles').update({ is_verified: true }).eq('id', user.id);
    console.log("Supabase API call to update is_verified would go here");
    alert(`Successfully verified for ${selectedSkill}!`);
  };

  // -----------------------------------------------------
  // RENDER: Skill Selection
  // -----------------------------------------------------
  if (!selectedSkill) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-gs-card border border-gs-border rounded-xl shadow-xs mt-8 text-gs-text-main flex flex-col items-center">
        <h2 className="text-xl md:text-2xl font-semibold mb-2 tracking-tight">Skill Verification</h2>
        <p className="text-xs text-gs-text-muted mb-6 text-center max-w-md">
          Select a skill to verify. You must score at least <span className="text-[#6D6AF6] font-semibold">8/10</span> to pass the verification quiz.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          {Object.keys(QUESTION_BANK).map((skill) => (
            <button
              key={skill}
              onClick={() => handleSkillSelect(skill)}
              className="flex flex-col items-center justify-center p-5 bg-gs-bg hover:bg-white/5 border border-gs-border hover:border-[#6D6AF6]/40 rounded-xl transition-colors duration-150 group text-center cursor-pointer"
            >
              <div className="w-9 h-9 bg-[#6D6AF6]/10 text-[#6D6AF6] border border-[#6D6AF6]/20 rounded-lg flex items-center justify-center mb-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-medium text-xs text-gs-text-main">{skill}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------
  // RENDER: Quiz Finished (Outcomes)
  // -----------------------------------------------------
  if (quizFinished) {
    const passed = score >= 8;

    return (
      <div className="w-full max-w-xl mx-auto p-6 md:p-8 bg-gs-card border border-gs-border rounded-xl shadow-xs mt-8 text-gs-text-main text-center flex flex-col items-center">
        {passed ? (
          <>
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gs-text-main mb-1">Verification Passed</h2>
            <div className="bg-gs-bg px-5 py-3 rounded-lg border border-gs-border my-4 inline-block">
              <p className="text-xs text-gs-text-muted">
                Score: <span className="text-emerald-500 font-semibold text-base ml-1 tabular-nums">{score}/10</span>
              </p>
              <p className="text-xs text-gs-text-muted mt-0.5">Proficiency verified in {selectedSkill}.</p>
            </div>
            <button
              onClick={handleProceed}
              className="w-full sm:w-auto px-6 py-2 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white rounded-lg font-medium text-xs transition-colors shadow-xs btn-tactile cursor-pointer"
            >
              Proceed
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-4 border border-rose-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gs-text-main mb-1">Verification Incomplete</h2>
            <div className="bg-gs-bg px-5 py-3 rounded-lg border border-gs-border my-4 inline-block">
              <p className="text-xs text-gs-text-muted">
                Score: <span className="text-rose-500 font-semibold text-base ml-1 tabular-nums">{score}/10</span>
              </p>
            </div>
            <p className="text-xs text-gs-text-muted mb-6 max-w-sm">A minimum score of 8/10 is required to verify your proficiency in {selectedSkill}.</p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
              <button
                onClick={handleRetryQuiz}
                className="px-4 py-2 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white rounded-lg font-medium text-xs transition-colors shadow-xs btn-tactile cursor-pointer"
              >
                Retry Quiz
              </button>
              <button
                onClick={handleChooseDifferentSkill}
                className="px-4 py-2 bg-gs-bg hover:bg-white/5 text-gs-text-muted hover:text-gs-text-main border border-gs-border rounded-lg font-medium text-xs transition-colors cursor-pointer"
              >
                Choose Different Skill
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // -----------------------------------------------------
  // RENDER: Active Quiz
  // -----------------------------------------------------
  const currentQuestions = QUESTION_BANK[selectedSkill];
  const totalQuestions = currentQuestions.length;
  const currentQ = currentQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const progressPercentage = ((currentQuestionIndex) / totalQuestions) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-gs-card border border-gs-border rounded-xl shadow-xs mt-8 text-gs-text-main flex flex-col">
      {/* Header & Progress */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-[#6D6AF6] uppercase tracking-wider">{selectedSkill} Verification</span>
        <span className="text-xs text-gs-text-muted font-medium">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
      </div>
      
      <div className="w-full bg-gs-border/40 rounded-full h-1.5 mb-6 overflow-hidden">
        <div 
          className="bg-[#6D6AF6] h-1.5 rounded-full transition-all duration-300 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Question */}
      <h3 className="text-base font-semibold text-gs-text-main mb-6 leading-relaxed">
        {currentQ.question}
      </h3>

      {/* Options */}
      <div className="flex flex-col gap-2.5 mb-8">
        {currentQ.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          return (
            <label
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-150 border text-xs ${
                isSelected 
                  ? 'bg-[#6D6AF6]/10 border-[#6D6AF6] text-gs-text-main font-medium' 
                  : 'bg-gs-bg border-gs-border text-gs-text-muted hover:text-gs-text-main hover:border-white/20'
              }`}
            >
              <div className={`w-4 h-4 rounded-full flex flex-shrink-0 items-center justify-center border transition-colors ${
                isSelected ? 'border-[#6D6AF6]' : 'border-gs-border'
              }`}>
                {isSelected && <div className="w-2 h-2 bg-[#6D6AF6] rounded-full"></div>}
              </div>
              <input
                type="radio"
                name="quiz-option"
                className="hidden"
                value={option}
                checked={isSelected}
                onChange={() => handleOptionSelect(option)}
              />
              <span className="leading-normal">{option}</span>
            </label>
          );
        })}
      </div>

      {/* Footer / Actions */}
      <div className="mt-auto border-t border-gs-border pt-4 flex justify-between items-center">
        <button
          onClick={handleChooseDifferentSkill}
          className="text-gs-text-muted hover:text-gs-text-main text-xs font-medium transition-colors cursor-pointer"
        >
          Cancel Quiz
        </button>
        <button
          onClick={handleNextOrSubmit}
          disabled={!selectedOption}
          className={`px-4 py-2 rounded-lg font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer ${
            !selectedOption 
              ? 'bg-gs-border text-gs-text-muted cursor-not-allowed opacity-50' 
              : 'bg-[#6D6AF6] hover:bg-[#5C59EC] text-white shadow-xs btn-tactile'
          }`}
        >
          {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

export default SkillVerificationQuiz;
