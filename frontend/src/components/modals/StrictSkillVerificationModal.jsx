import React, { useState, useRef, useCallback } from 'react';
import {
  Shield, BookOpen, Award, Upload, CheckCircle, XCircle,
  ChevronRight, ChevronLeft, RotateCcw, X, Loader2,
  FileText, Image as ImageIcon, Zap, Star, Code2, Cpu,
  Palette, Database, Globe, BarChart2, Check, Sparkles,
  AlertTriangle, Lock,
} from 'lucide-react';
import supabase from '@/lib/supabase';
import { useAppContext } from '@/context/AppContext';

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PASSING_SCORE  = 8;
const TOTAL_QUESTIONS = 10;

const SKILLS = [
  { id: 'react',      label: 'React',           icon: Code2,     color: 'text-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  { id: 'python',     label: 'Python',          icon: Cpu,       color: 'text-indigo-500',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' },
  { id: 'uiux',       label: 'UI / UX',         icon: Palette,   color: 'text-pink-500',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20' },
  { id: 'sql',        label: 'SQL',             icon: Database,  color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'javascript', label: 'JavaScript',      icon: Globe,     color: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  { id: 'ml',         label: 'Machine Learning',icon: BarChart2, color: 'text-purple-500',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
];

// â”€â”€â”€ Question Bank â€” 20+ questions per skill â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Each question: { question, options (4 choices), answer (the correct option string) }
const QUESTION_BANK = {
  react: [
    { question: 'Which hook is used to manage side-effects in React?', options: ['useState', 'useEffect', 'useRef', 'useMemo'], answer: 'useEffect' },
    { question: 'What does JSX stand for?', options: ['JavaScript XML', 'Java Syntax Extension', 'JavaScript Extension', 'Java XML'], answer: 'JavaScript XML' },
    { question: 'Which method updates state in a functional component?', options: ['this.setState', 'setState hook', 'useState setter', 'forceUpdate'], answer: 'useState setter' },
    { question: 'What is the Virtual DOM?', options: ['A server-side DOM', 'A lightweight copy of the real DOM', 'A CSS framework', 'A React plugin'], answer: 'A lightweight copy of the real DOM' },
    { question: 'Which prop passes child elements to a component?', options: ['element', 'children', 'content', 'nodes'], answer: 'children' },
    { question: 'What is the purpose of useCallback?', options: ['Memoize a value', 'Memoize a function reference', 'Fetch data', 'Manage refs'], answer: 'Memoize a function reference' },
    { question: 'Which of the following triggers a re-render?', options: ['useRef change', 'State change', 'Prop reading', 'useEffect cleanup'], answer: 'State change' },
    { question: 'What does React.memo do?', options: ['Memoizes a value', 'Prevents re-render if props unchanged', 'Caches API responses', 'Creates a ref'], answer: 'Prevents re-render if props unchanged' },
    { question: 'How do you conditionally render in React?', options: ['if/else only', 'Switch statements', 'Ternary or &&', 'Template literals'], answer: 'Ternary or &&' },
    { question: 'What is the correct way to pass a function as a prop?', options: ['onClick="handler"', 'onClick={handler}', 'onClick=handler', 'onClick=(handler)'], answer: 'onClick={handler}' },
    { question: 'What is a React Fragment used for?', options: ['Grouping elements without adding DOM nodes', 'Creating portals', 'Handling errors', 'Lazy loading components'], answer: 'Grouping elements without adding DOM nodes' },
    { question: 'Which hook replaces componentDidMount in functional components?', options: ['useState', 'useEffect with empty deps', 'useLayoutEffect', 'useReducer'], answer: 'useEffect with empty deps' },
    { question: 'What does the key prop help React with?', options: ['Styling elements', 'Identifying list items for reconciliation', 'Setting z-index', 'Passing callbacks'], answer: 'Identifying list items for reconciliation' },
    { question: 'What is React Context used for?', options: ['Routing between pages', 'Sharing state without prop drilling', 'Handling HTTP requests', 'Managing CSS themes only'], answer: 'Sharing state without prop drilling' },
    { question: 'Which hook is used for complex state logic?', options: ['useState', 'useReducer', 'useEffect', 'useContext'], answer: 'useReducer' },
    { question: 'What does useRef return?', options: ['A state variable', 'A mutable ref object', 'A callback function', 'An observable'], answer: 'A mutable ref object' },
    { question: 'What is a controlled component in React?', options: ['A component without state', 'A form element whose value is controlled by React state', 'A component that cannot be re-rendered', 'A component wrapped in React.memo'], answer: 'A form element whose value is controlled by React state' },
    { question: 'What does React.lazy() enable?', options: ['Server-side rendering', 'Code splitting and lazy loading', 'State management', 'Error handling'], answer: 'Code splitting and lazy loading' },
    { question: 'What is the purpose of Error Boundaries?', options: ['Catching JavaScript errors in component trees', 'Validating props', 'Handling async operations', 'Managing routing errors'], answer: 'Catching JavaScript errors in component trees' },
    { question: 'Which method is used to create a portal in React?', options: ['React.createPortal', 'ReactDOM.createPortal', 'React.portal', 'ReactDOM.render'], answer: 'ReactDOM.createPortal' },
    { question: 'What is the StrictMode component used for?', options: ['Enforcing TypeScript types', 'Highlighting potential problems during development', 'Enabling production optimizations', 'Disabling warnings'], answer: 'Highlighting potential problems during development' },
    { question: 'What does useMemo do?', options: ['Memoizes an expensive computed value', 'Memoizes a callback function', 'Creates a ref', 'Triggers a side effect'], answer: 'Memoizes an expensive computed value' },
  ],
  python: [
    { question: 'What is the output of type(3.14) in Python?', options: ['int', 'float', 'double', 'number'], answer: 'float' },
    { question: 'Which keyword defines a function in Python?', options: ['function', 'def', 'func', 'define'], answer: 'def' },
    { question: 'What does len([1, 2, 3]) return?', options: ['2', '3', '4', 'Error'], answer: '3' },
    { question: 'How do you create a virtual environment in Python?', options: ['python -m venv env', 'pip install venv', 'python env create', 'venv --create'], answer: 'python -m venv env' },
    { question: 'What is a list comprehension?', options: ['A for-loop in a function', 'A concise way to create lists', 'A decorator', 'A sorted list'], answer: 'A concise way to create lists' },
    { question: 'Which data structure uses key-value pairs in Python?', options: ['List', 'Tuple', 'Dictionary', 'Set'], answer: 'Dictionary' },
    { question: 'What does the *args parameter allow?', options: ['Keyword arguments', 'Variable positional arguments', 'Default values', 'Type hints'], answer: 'Variable positional arguments' },
    { question: 'What is PEP 8?', options: ['A Python version', 'A style guide for Python code', 'A package manager', 'A debugging tool'], answer: 'A style guide for Python code' },
    { question: 'Which module is used for regular expressions in Python?', options: ['regex', 're', 'regexp', 'match'], answer: 're' },
    { question: 'What does __init__ do in a Python class?', options: ['Imports the class', 'Initializes a class instance', 'Destroys an instance', 'Defines a static method'], answer: 'Initializes a class instance' },
    { question: 'What is the difference between a list and a tuple?', options: ['Lists are immutable', 'Tuples are immutable', 'No difference', 'Tuples cannot store strings'], answer: 'Tuples are immutable' },
    { question: 'What does the "with" statement do?', options: ['Creates a loop', 'Manages resource context (auto-close)', 'Imports modules', 'Defines a class'], answer: 'Manages resource context (auto-close)' },
    { question: 'What is a lambda function?', options: ['A named function', 'An anonymous single-expression function', 'A class method', 'A generator'], answer: 'An anonymous single-expression function' },
    { question: 'Which keyword is used for inheritance in Python?', options: ['extends', 'inherits', 'class Child(Parent)', 'super only'], answer: 'class Child(Parent)' },
    { question: 'What does pip stand for?', options: ['Python Install Package', 'Pip Installs Packages', 'Package Installer Program', 'Python Index Platform'], answer: 'Pip Installs Packages' },
    { question: 'What is a decorator in Python?', options: ['A design pattern for CSS', 'A function that wraps another function', 'A type annotation', 'A class attribute'], answer: 'A function that wraps another function' },
    { question: 'What is the Global Interpreter Lock (GIL)?', options: ['A security feature', 'A mutex that protects Python objects in CPython', 'A package manager lock file', 'A syntax rule'], answer: 'A mutex that protects Python objects in CPython' },
    { question: 'What does enumerate() do?', options: ['Sorts a list', 'Returns index-value pairs', 'Filters a list', 'Counts occurrences'], answer: 'Returns index-value pairs' },
    { question: 'What is a generator in Python?', options: ['A function that returns all values at once', 'A function that yields values lazily', 'A class constructor', 'A list factory'], answer: 'A function that yields values lazily' },
    { question: 'Which built-in function converts a string to an integer?', options: ['str()', 'int()', 'float()', 'cast()'], answer: 'int()' },
    { question: 'What does the __str__ method do?', options: ['Converts to bytes', 'Returns a human-readable string representation', 'Compares objects', 'Hashes the object'], answer: 'Returns a human-readable string representation' },
  ],
  uiux: [
    { question: 'What does UX stand for?', options: ['User Experience', 'User Extension', 'User Execution', 'Unique Experience'], answer: 'User Experience' },
    { question: 'What is a wireframe?', options: ['A finished design', 'A low-fidelity structural layout', 'A clickable prototype', 'A color palette'], answer: 'A low-fidelity structural layout' },
    { question: 'Which principle ensures designs are accessible to all users?', options: ['Heuristic Evaluation', 'Universal Design', 'Gestalt Theory', 'Card Sorting'], answer: 'Universal Design' },
    { question: "What is Fitts's Law?", options: ['Color theory principle', 'A principle about target size and distance', 'A typography rule', 'An animation guideline'], answer: 'A principle about target size and distance' },
    { question: 'What is an A/B test?', options: ['Comparing two design versions', 'Testing accessibility', 'A prototyping technique', 'An animation test'], answer: 'Comparing two design versions' },
    { question: 'What is a design system?', options: ['A project management tool', 'A collection of reusable components and guidelines', 'A wireframing app', 'A coding framework'], answer: 'A collection of reusable components and guidelines' },
    { question: 'What does WCAG stand for?', options: ['Web Content Accessibility Guidelines', 'Web Color Application Guide', 'Web Component Architecture Group', 'World Content Access Gateway'], answer: 'Web Content Accessibility Guidelines' },
    { question: 'What is the 60-30-10 rule in UI?', options: ['Animation timing', 'Color distribution rule', 'Grid column ratio', 'Typography scale'], answer: 'Color distribution rule' },
    { question: 'What is a persona in UX?', options: ['A logo design', 'A fictional user representative', 'A color theme', 'A navigation pattern'], answer: 'A fictional user representative' },
    { question: 'Which tool is most popular for UI prototyping?', options: ['VS Code', 'Figma', 'Photoshop', 'Canva'], answer: 'Figma' },
    { question: 'What is a user journey map?', options: ['A sitemap', 'A visualization of user steps to achieve a goal', 'A database schema', 'A color palette tool'], answer: 'A visualization of user steps to achieve a goal' },
    { question: 'What is visual hierarchy?', options: ['Alphabetical ordering', 'Arranging elements to show importance', 'A color contrast tool', 'A font pairing guide'], answer: 'Arranging elements to show importance' },
    { question: 'What is a heuristic evaluation?', options: ['A user survey', 'Expert review against usability principles', 'An A/B test', 'A performance audit'], answer: 'Expert review against usability principles' },
    { question: 'What does affordance mean in UX?', options: ['The cost of a design', 'A visual cue suggesting how to interact with an element', 'A branding guideline', 'A grid system'], answer: 'A visual cue suggesting how to interact with an element' },
    { question: 'What is the purpose of whitespace in design?', options: ['Wasting screen space', 'Improving readability and focus', 'Hiding content', 'Reducing load time'], answer: 'Improving readability and focus' },
    { question: 'What is a micro-interaction?', options: ['A large page transition', 'A small animation triggered by user action', 'A database query', 'A server response'], answer: 'A small animation triggered by user action' },
    { question: 'What is information architecture (IA)?', options: ['Server infrastructure', 'Organizing and structuring content', 'A CSS methodology', 'A JavaScript framework'], answer: 'Organizing and structuring content' },
    { question: 'What is the difference between UI and UX?', options: ['They are the same', 'UI is visual design; UX is overall experience', 'UI is backend; UX is frontend', 'UX is only for mobile'], answer: 'UI is visual design; UX is overall experience' },
    { question: 'What is card sorting?', options: ['A shuffling algorithm', 'A UX method for organizing content categories', 'A Kanban technique', 'A CSS layout method'], answer: 'A UX method for organizing content categories' },
    { question: 'What is responsive design?', options: ['Fast loading pages', 'Design that adapts to different screen sizes', 'Server-side rendering', 'A JavaScript technique'], answer: 'Design that adapts to different screen sizes' },
    { question: 'What is the primary goal of usability testing?', options: ['Finding code bugs', 'Observing real users to identify UX issues', 'Testing server load', 'Checking color contrast only'], answer: 'Observing real users to identify UX issues' },
  ],
  sql: [
    { question: 'Which SQL statement is used to retrieve data?', options: ['GET', 'SELECT', 'FETCH', 'PULL'], answer: 'SELECT' },
    { question: 'What does JOIN do in SQL?', options: ['Deletes rows', 'Combines rows from two tables', 'Sorts results', 'Filters columns'], answer: 'Combines rows from two tables' },
    { question: 'What is a PRIMARY KEY?', options: ['A column with duplicates', 'A unique row identifier', 'An index column', 'A foreign reference'], answer: 'A unique row identifier' },
    { question: 'Which clause filters rows AFTER aggregation?', options: ['WHERE', 'HAVING', 'GROUP BY', 'LIMIT'], answer: 'HAVING' },
    { question: 'What does COUNT(*) return?', options: ['Non-null values in column', 'All rows count', 'Sum of all values', 'Column names'], answer: 'All rows count' },
    { question: 'What is a FOREIGN KEY?', options: ['A primary key backup', "References another table's primary key", 'An encrypted key', 'A composite key'], answer: "References another table's primary key" },
    { question: 'Which SQL statement creates a new table?', options: ['MAKE TABLE', 'CREATE TABLE', 'ADD TABLE', 'NEW TABLE'], answer: 'CREATE TABLE' },
    { question: 'What does DISTINCT do?', options: ['Removes duplicate rows', 'Orders results', 'Limits output', 'Joins tables'], answer: 'Removes duplicate rows' },
    { question: 'What is an INDEX used for?', options: ['Deleting records', 'Speeding up queries', 'Creating views', 'Defining triggers'], answer: 'Speeding up queries' },
    { question: 'What does NULL represent in SQL?', options: ['Zero', 'Empty string', 'Absence of a value', 'False'], answer: 'Absence of a value' },
    { question: 'What is a subquery?', options: ['A JOIN variant', 'A query nested inside another query', 'A stored procedure', 'A trigger'], answer: 'A query nested inside another query' },
    { question: 'What does GROUP BY do?', options: ['Filters rows', 'Groups rows sharing a value for aggregation', 'Orders results', 'Limits output'], answer: 'Groups rows sharing a value for aggregation' },
    { question: 'What is a VIEW in SQL?', options: ['A physical table', 'A virtual table based on a query', 'A backup file', 'An index type'], answer: 'A virtual table based on a query' },
    { question: 'Which SQL command removes all rows from a table but keeps the structure?', options: ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'], answer: 'TRUNCATE' },
    { question: 'What is normalization?', options: ['Adding indexes', 'Organizing data to reduce redundancy', 'Encrypting data', 'Compressing tables'], answer: 'Organizing data to reduce redundancy' },
    { question: 'What does UNION do?', options: ['Joins two tables', 'Combines result sets of two queries', 'Creates a foreign key', 'Updates records'], answer: 'Combines result sets of two queries' },
    { question: 'What is the difference between WHERE and HAVING?', options: ['No difference', 'WHERE filters before GROUP BY; HAVING filters after', 'WHERE is for numbers only', 'HAVING replaces WHERE'], answer: 'WHERE filters before GROUP BY; HAVING filters after' },
    { question: 'What does the LIKE operator do?', options: ['Compares exact values', 'Pattern matching with wildcards', 'Joins tables', 'Counts rows'], answer: 'Pattern matching with wildcards' },
    { question: 'What is a stored procedure?', options: ['A cached query result', 'A precompiled SQL code block saved in the database', 'A temporary table', 'An index'], answer: 'A precompiled SQL code block saved in the database' },
    { question: 'What does COALESCE do?', options: ['Joins tables', 'Returns the first non-null value from a list', 'Counts distinct values', 'Drops a column'], answer: 'Returns the first non-null value from a list' },
    { question: 'What is a transaction in SQL?', options: ['A single query', 'A sequence of operations treated as a single unit of work', 'A data type', 'A table lock'], answer: 'A sequence of operations treated as a single unit of work' },
  ],
  javascript: [
    { question: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'global', 'dim'], answer: 'let' },
    { question: 'What does === check in JavaScript?', options: ['Value only', 'Type only', 'Value and type', 'Reference'], answer: 'Value and type' },
    { question: 'What is a closure?', options: ['A syntax error', 'A function with access to its outer scope', 'A loop construct', 'A promise handler'], answer: 'A function with access to its outer scope' },
    { question: 'What does Array.prototype.map() return?', options: ['A filtered array', 'A new array with results', 'The original array', 'A boolean'], answer: 'A new array with results' },
    { question: 'What is the event loop?', options: ['A for-each loop', 'JS concurrency mechanism', 'A DOM method', 'A CSS animation'], answer: 'JS concurrency mechanism' },
    { question: 'What does async/await help with?', options: ['Type checking', 'Writing async code synchronously', 'DOM manipulation', 'Variable hoisting'], answer: 'Writing async code synchronously' },
    { question: 'What does typeof null return?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], answer: '"object"' },
    { question: 'Which method adds an element to the END of an array?', options: ['shift', 'push', 'unshift', 'splice'], answer: 'push' },
    { question: 'What is hoisting?', options: ['Variables moved to top of scope at runtime', 'A CSS property', 'A sorting algorithm', 'A React pattern'], answer: 'Variables moved to top of scope at runtime' },
    { question: 'What does Promise.all() do?', options: ['Runs one promise', 'Runs promises sequentially', 'Runs all promises concurrently', 'Cancels promises'], answer: 'Runs all promises concurrently' },
    { question: 'What is the spread operator (...) used for?', options: ['Error handling', 'Expanding iterables into individual elements', 'Declaring variables', 'Creating classes'], answer: 'Expanding iterables into individual elements' },
    { question: 'What does Object.freeze() do?', options: ['Deletes an object', 'Prevents modification of object properties', 'Copies an object', 'Converts to JSON'], answer: 'Prevents modification of object properties' },
    { question: 'What is destructuring assignment?', options: ['Deleting variables', 'Extracting values from arrays/objects into variables', 'A loop type', 'A class feature'], answer: 'Extracting values from arrays/objects into variables' },
    { question: 'What does the "this" keyword refer to?', options: ['The previous function', 'The execution context of the function', 'The global object always', 'The DOM element always'], answer: 'The execution context of the function' },
    { question: 'What is a Symbol in JavaScript?', options: ['A string literal', 'A unique and immutable primitive', 'A number type', 'A boolean value'], answer: 'A unique and immutable primitive' },
    { question: 'What does Array.prototype.reduce() do?', options: ['Filters elements', 'Reduces an array to a single value', 'Sorts elements', 'Maps elements'], answer: 'Reduces an array to a single value' },
    { question: 'What is the difference between null and undefined?', options: ['No difference', 'null is intentional absence; undefined means not assigned', 'null is for numbers; undefined is for strings', 'They are interchangeable'], answer: 'null is intentional absence; undefined means not assigned' },
    { question: 'What is a WeakMap?', options: ['A Map with string keys only', 'A Map with weakly-held object keys', 'A smaller Map', 'A Map without values'], answer: 'A Map with weakly-held object keys' },
    { question: 'What does the optional chaining (?.) operator do?', options: ['Creates optional parameters', 'Safely accesses nested properties without errors', 'Declares nullable types', 'Chains promises'], answer: 'Safely accesses nested properties without errors' },
    { question: 'What are template literals?', options: ['Regular strings', 'Backtick strings supporting interpolation and multiline', 'HTML templates', 'CSS variables'], answer: 'Backtick strings supporting interpolation and multiline' },
    { question: 'What is the Nullish Coalescing operator (??)?', options: ['Logical OR', 'Returns right operand when left is null or undefined', 'Strict equality', 'Bitwise AND'], answer: 'Returns right operand when left is null or undefined' },
  ],
  ml: [
    { question: 'What is overfitting?', options: ['Underfitting on training data', 'Model performs well on training but poorly on new data', 'A regularization technique', 'A feature selection method'], answer: 'Model performs well on training but poorly on new data' },
    { question: 'What does a confusion matrix show?', options: ['Model training loss', 'Classification results vs actual labels', 'Feature importance', 'Gradient values'], answer: 'Classification results vs actual labels' },
    { question: 'Which algorithm is used for both classification and regression?', options: ['KMeans', 'Decision Tree', 'PCA', 'DBSCAN'], answer: 'Decision Tree' },
    { question: 'What is gradient descent?', options: ['A data cleaning technique', 'An optimization algorithm minimizing a loss function', 'A feature scaling method', 'A neural network layer'], answer: 'An optimization algorithm minimizing a loss function' },
    { question: 'What does PCA stand for?', options: ['Pattern Classification Analysis', 'Principal Component Analysis', 'Predictive Cluster Algorithm', 'Probabilistic Confusion Analysis'], answer: 'Principal Component Analysis' },
    { question: 'What is the purpose of a validation set?', options: ['Training the model', 'Tuning hyperparameters', 'Final evaluation', 'Feature extraction'], answer: 'Tuning hyperparameters' },
    { question: 'What does an activation function do in a neural network?', options: ['Load data', 'Introduce non-linearity', 'Initialize weights', 'Compute loss'], answer: 'Introduce non-linearity' },
    { question: 'What is the k in KNN?', options: ['Number of features', 'Number of nearest neighbors', 'Number of clusters', 'Number of epochs'], answer: 'Number of nearest neighbors' },
    { question: 'What does regularization prevent?', options: ['Underfitting', 'Overfitting', 'Data leakage', 'Class imbalance'], answer: 'Overfitting' },
    { question: 'Which library is most popular for ML in Python?', options: ['NumPy', 'scikit-learn', 'Pandas', 'Matplotlib'], answer: 'scikit-learn' },
    { question: 'What is the bias-variance tradeoff?', options: ['Choosing between speed and accuracy', 'Balancing underfitting (bias) and overfitting (variance)', 'Selecting features vs samples', 'A loss function type'], answer: 'Balancing underfitting (bias) and overfitting (variance)' },
    { question: 'What is cross-validation?', options: ['Training on all data', 'Splitting data into folds for robust evaluation', 'Testing on training set', 'A neural network technique'], answer: 'Splitting data into folds for robust evaluation' },
    { question: 'What is a hyperparameter?', options: ['A model weight', 'A parameter set before training begins', 'A feature value', 'An output prediction'], answer: 'A parameter set before training begins' },
    { question: 'What is the purpose of a loss function?', options: ['To add more data', 'To measure how far predictions are from actual values', 'To visualize results', 'To preprocess data'], answer: 'To measure how far predictions are from actual values' },
    { question: 'What is transfer learning?', options: ['Moving data between databases', 'Using a pre-trained model on a new task', 'Training from scratch', 'A data augmentation method'], answer: 'Using a pre-trained model on a new task' },
    { question: 'What does the softmax function do?', options: ['Normalizes values into a probability distribution', 'Applies gradient descent', 'Performs feature selection', 'Reduces dimensions'], answer: 'Normalizes values into a probability distribution' },
    { question: 'What is a recurrent neural network (RNN) best for?', options: ['Image classification', 'Sequential/time-series data', 'Tabular data', 'Dimensionality reduction'], answer: 'Sequential/time-series data' },
    { question: 'What is feature scaling?', options: ['Adding new features', 'Normalizing feature ranges for better model performance', 'Removing outliers', 'Encoding labels'], answer: 'Normalizing feature ranges for better model performance' },
    { question: 'What is the vanishing gradient problem?', options: ['Gradients become too large', 'Gradients approach zero, preventing learning in deep networks', 'Loss function diverges', 'Data runs out during training'], answer: 'Gradients approach zero, preventing learning in deep networks' },
    { question: 'What is an epoch in ML training?', options: ['A single data point', 'One complete pass through the entire training dataset', 'A batch of data', 'A learning rate schedule'], answer: 'One complete pass through the entire training dataset' },
    { question: 'What is a convolutional neural network (CNN) primarily used for?', options: ['Text classification', 'Image and spatial data processing', 'Time-series only', 'Reinforcement learning'], answer: 'Image and spatial data processing' },
  ],
};

// â”€â”€â”€ Fisher-Yates Shuffle Utility â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/**
 * Shuffles an array in place using the Fisher-Yates (Knuth) algorithm.
 * Returns a NEW shuffled array (does not mutate the original).
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Prepares a randomized quiz from the question bank for a given skill.
 * 1. Shuffles the full pool of 20+ questions.
 * 2. Slices to keep exactly TOTAL_QUESTIONS (10).
 * 3. For each selected question, shuffles the options array and updates the answer
 *    reference so that correctness is maintained.
 *
 * Returns an array of { question, options, answer } where answer is the correct
 * option string (position-independent).
 */
function prepareQuizQuestions(skillId) {
  const pool = QUESTION_BANK[skillId];
  if (!pool) return [];

  // Step 1 & 2: shuffle full pool, take first 10
  const selected = shuffleArray(pool).slice(0, TOTAL_QUESTIONS);

  // Step 3: shuffle options within each question
  return selected.map((q) => {
    const shuffledOptions = shuffleArray(q.options);
    return {
      question: q.question,
      options: shuffledOptions,
      answer: q.answer, // answer is the string, so position doesn't matter
    };
  });
}

// â”€â”€â”€ Step definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Step 1: Select Skill
// Step 2: Quiz  (must score â‰¥ 8)
// Step 3: Certificate Upload  (mandatory after quiz pass)
// Step 4: Success

const STEPS = [
  { id: 1, label: 'Skill',        icon: Sparkles },
  { id: 2, label: 'Quiz',         icon: BookOpen },
  { id: 3, label: 'Certificate',  icon: Award },
  { id: 4, label: 'Done',         icon: CheckCircle },
];

// â”€â”€â”€ Supabase stubs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Uploads the certificate to Supabase Storage and inserts a verified_skill
 * record with is_verified: true. Skill is ONLY added after both the quiz pass
 * AND a successful file upload.
 *
 * @param {string} userId
 * @param {string} skillId
 * @param {string} skillLabel
 * @param {File}   file
 * @returns {{ publicUrl: string }}
 */
async function verifyAndSaveSkill(userId, skillId, skillLabel, file) {
  // â”€â”€ Step 1: Try to upload certificate to Supabase Storage (optional) â”€â”€â”€â”€â”€â”€
  let publicUrl = null;
  try {
    const filePath = `${userId}/${skillId}/${Date.now()}_${file.name}`;
    const { error: storageErr } = await supabase.storage
      .from('certificates')
      .upload(filePath, file, { upsert: true });

    if (storageErr) {
      // Storage bucket may not exist â€” log & continue without a cert URL
      console.warn('[SkillVerification] Storage upload skipped:', storageErr.message);
    } else {
      const { data: urlData } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);
      publicUrl = urlData?.publicUrl ?? null;
    }
  } catch (storageEx) {
    console.warn('[SkillVerification] Storage exception (non-fatal):', storageEx);
  }

  // â”€â”€ Step 2: Upsert into verified_skills table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { error: dbErr } = await supabase
    .from('verified_skills')
    .upsert(
      {
        user_id:             userId,
        skill_id:            skillId,
        skill_label:         skillLabel,
        is_verified:         true,
        verified_at:         new Date().toISOString(),
        verification_method: 'quiz+certificate',
        certificate_url:     publicUrl,
      },
      { onConflict: 'user_id,skill_id' }
    );

  if (dbErr) {
    console.error('[SkillVerification] DB upsert error:', dbErr);
    throw new Error(dbErr.message || 'Failed to save verified skill');
  }

  return { publicUrl };
}

// â”€â”€â”€ Shared UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Animated 3-dot loader */
function LoadingDots() {
  return (
    <span className="inline-flex gap-1 items-center ml-1">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}

/** Clean flat progress bar */
function ProgressBar({ current, total, color = '#6D6AF6' }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-1.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

/** 4-step wizard header with step indicator */
function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isComplete = currentStep > step.id;
        const isCurrent  = currentStep === step.id;
        const isLocked   = currentStep < step.id;
        return (
          <React.Fragment key={step.id}>
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div className={`
                relative w-8 h-8 rounded-full flex items-center justify-center border transition-colors
                ${isComplete ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                ${isCurrent  ? 'bg-[#6D6AF6] border-[#6D6AF6] text-white' : ''}
                ${isLocked   ? 'bg-gs-bg border-gs-border text-gs-text-muted' : ''}
              `}>
                {isComplete
                  ? <Check size={14} className="text-white" />
                  : <Icon size={13} className={isCurrent ? 'text-white' : 'text-gs-text-muted'} />
                }
              </div>
              <span className={`text-[11px] font-medium ${
                isCurrent ? 'text-[#6D6AF6] font-semibold' : isComplete ? 'text-emerald-500' : 'text-gs-text-muted'
              }`}>
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 w-10 mt-[-14px] transition-colors ${
                currentStep > step.id ? 'bg-emerald-500' : 'bg-gs-border'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// â”€â”€â”€ Step 1: Skill Selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SkillSelectionStep({ onSelect }) {
  const [query, setQuery] = useState('');

  const filtered = SKILLS.filter(s =>
    s.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-gs-text-main">Select a Skill to Verify</h2>
        <p className="text-gs-text-muted text-xs max-w-sm mx-auto">
          Pass a 10-question assessment (â‰¥ 8/10) and submit your credential to verify.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          id="skill-search-input"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search skillsâ€¦"
          className="w-full bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-xs text-gs-text-main placeholder:text-gs-text-muted focus:outline-none focus:border-[#6D6AF6] focus:ring-1 focus:ring-[#6D6AF6] transition-colors"
        />
      </div>

      {/* Skill Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {filtered.map((skill) => {
          const Icon = skill.icon;
          return (
            <button
              key={skill.id}
              id={`strict-skill-${skill.id}`}
              onClick={() => onSelect(skill)}
              className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-gs-border bg-gs-card hover:border-[#6D6AF6]/50 hover:bg-[#6D6AF6]/5 transition-colors cursor-pointer text-center"
            >
              <div className={`p-2 rounded-lg ${skill.bg} border ${skill.border}`}>
                <Icon size={18} className={skill.color} />
              </div>
              <span className="font-medium text-xs text-gs-text-main">{skill.label}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-6 text-gs-text-muted text-xs">
            No skills matching "{query}"
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ Step 2: Quiz â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function QuizStep({ skill, onPassQuiz, onCancel }) {
  // â”€â”€ Dynamic quiz state: shuffled + sliced from the large pool â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [activeQuizQuestions, setActiveQuizQuestions] = useState(() =>
    prepareQuizQuestions(skill.id)
  );

  const [currentIndex, setCurrentIndex]     = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers]               = useState([]);
  const [quizStatus, setQuizStatus]         = useState('in_progress'); // 'in_progress' | 'passed' | 'failed'
  const [score, setScore]                   = useState(0);

  const currentQ       = activeQuizQuestions[currentIndex];
  const isLastQuestion = currentIndex === TOTAL_QUESTIONS - 1;
  const Icon           = skill.icon;

  const handleNext = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers, selectedOption];

    if (isLastQuestion) {
      const finalScore = newAnswers.reduce(
        (acc, ans, idx) => acc + (ans === activeQuizQuestions[idx].answer ? 1 : 0),
        0
      );
      setScore(finalScore);
      setAnswers(newAnswers);
      setQuizStatus(finalScore >= PASSING_SCORE ? 'passed' : 'failed');
    } else {
      setAnswers(newAnswers);
      setSelectedOption(null);
      setCurrentIndex(i => i + 1);
    }
  };

  const handleRetry = () => {
    // Generate a brand-new set of 10 shuffled questions with shuffled options
    setActiveQuizQuestions(prepareQuizQuestions(skill.id));
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setScore(0);
    setQuizStatus('in_progress');
  };

  // â”€â”€ PASSED â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (quizStatus === 'passed') {
    return (
      <div className="text-center space-y-4 py-2">
        {/* Success icon */}
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
          <CheckCircle size={24} />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-[var(--color-gs-text-main)]">Quiz Passed</h3>
          <p className="text-[var(--color-gs-text-muted)] text-xs">
            You scored <span className="font-semibold text-emerald-500">{score}/{TOTAL_QUESTIONS}</span>.
            Now complete <span className="text-[#6D6AF6] font-medium">Step 3</span> â€” upload your certificate to finalise verification.
          </p>
        </div>

        {/* Score bar */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 max-w-xs mx-auto text-left">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-[var(--color-gs-text-muted)]">Quiz Score</span>
            <span className="font-semibold text-emerald-400 tabular-nums">{score} / {TOTAL_QUESTIONS}</span>
          </div>
          <ProgressBar current={score} total={TOTAL_QUESTIONS} color="#10b981" />
          <div className="flex justify-between text-xs text-[var(--color-gs-text-muted)] mt-1">
            <span>0</span>
            <span className="text-emerald-400 font-medium">Pass â‰¥ {PASSING_SCORE}</span>
            <span>{TOTAL_QUESTIONS}</span>
          </div>
        </div>

        {/* Answer review â€” compact */}
        <div className="bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl p-4 max-w-xs mx-auto text-left space-y-1.5">
          <p className="text-[10px] font-semibold text-[var(--color-gs-text-muted)] uppercase tracking-wide mb-2">Answer Review</p>
          {activeQuizQuestions.map((q, i) => {
            const ok = answers[i] === q.answer;
            return (
              <div key={i} className={`flex items-center gap-2 text-xs ${ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                {ok ? <Check size={11} className="shrink-0" /> : <X size={11} className="shrink-0" />}
                <span className="text-[var(--color-gs-text-muted)] shrink-0">Q{i + 1}:</span>
                <span className="truncate">{ok ? 'Correct' : q.answer}</span>
              </div>
            );
          })}
        </div>

        <button
          id="quiz-proceed-to-upload-btn"
          onClick={() => onPassQuiz(score)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium rounded-lg transition-colors text-xs shadow-xs btn-tactile cursor-pointer"
        >
          Proceed to Document Upload <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  // â”€â”€ FAILED â€” flow stops here, skill NOT added â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (quizStatus === 'failed') {
    return (
      <div className="text-center space-y-4 py-2">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
          <XCircle size={28} className="text-rose-500" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-rose-500">Assessment Incomplete</h3>
          <p className="text-gs-text-muted text-xs max-w-sm mx-auto leading-relaxed">
            You scored <span className="font-semibold text-rose-500">{score}/{TOTAL_QUESTIONS}</span>.
            A minimum score of <span className="font-semibold text-gs-text-main">{PASSING_SCORE}/10</span> is required to proceed with verification.
          </p>
        </div>

        {/* Score bar */}
        <div className="bg-gs-bg border border-gs-border rounded-xl p-3.5 max-w-xs mx-auto text-left">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gs-text-muted">Your Score</span>
            <span className="font-semibold text-rose-500 text-xs tabular-nums">{score} / {TOTAL_QUESTIONS}</span>
          </div>
          <ProgressBar current={score} total={TOTAL_QUESTIONS} color="#FB7185" />
          <div className="flex justify-between text-[11px] text-gs-text-muted mt-1">
            <span>0</span>
            <span className="text-gs-text-muted font-medium">Required: {PASSING_SCORE}</span>
            <span>{TOTAL_QUESTIONS}</span>
          </div>
        </div>

        {/* Answer review */}
        <div className="bg-gs-bg border border-gs-border rounded-xl p-3 max-w-xs mx-auto text-left space-y-1">
          <p className="text-[10px] font-semibold text-gs-text-muted uppercase tracking-wider mb-1.5">Review</p>
          {activeQuizQuestions.map((q, i) => {
            const ok = answers[i] === q.answer;
            return (
              <div key={i} className={`flex items-center gap-2 text-xs ${ok ? 'text-emerald-500' : 'text-rose-500'}`}>
                {ok ? <Check size={11} className="shrink-0" /> : <X size={11} className="shrink-0" />}
                <span className="text-gs-text-muted shrink-0">Q{i + 1}:</span>
                <span className="truncate">{ok ? 'Correct' : q.answer}</span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-2 pt-1">
          <button
            id="quiz-retry-btn"
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium text-xs rounded-lg transition-colors shadow-xs btn-tactile cursor-pointer"
          >
            <RotateCcw size={13} /> Retry Assessment
          </button>
          <button
            id="quiz-cancel-btn"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2 border border-gs-border text-gs-text-muted hover:text-gs-text-main rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // â”€â”€ IN PROGRESS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="space-y-4">
      {/* Skill badge + question counter */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${skill.bg} border ${skill.border}`}>
          <Icon size={13} className={skill.color} />
          <span className={`font-semibold text-xs ${skill.color}`}>{skill.label}</span>
        </div>
        <span className="text-xs text-gs-text-muted font-medium">
          Question {currentIndex + 1} of {TOTAL_QUESTIONS}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <ProgressBar current={currentIndex + 1} total={TOTAL_QUESTIONS} />
        <p className="text-[11px] text-gs-text-muted">
          Passing mark: <strong>{PASSING_SCORE}</strong>/10 questions
        </p>
      </div>

      {/* Question card */}
      <div
        key={currentIndex}
        className="bg-gs-bg border border-gs-border rounded-xl p-4 space-y-3"
      >
        <div className="flex items-start gap-2.5">
          <span className="shrink-0 w-6 h-6 rounded-md bg-[#6D6AF6]/10 border border-[#6D6AF6]/20 flex items-center justify-center text-[#6D6AF6] text-xs font-semibold">
            {currentIndex + 1}
          </span>
          <p className="text-gs-text-main font-medium text-sm pt-0.5">
            {currentQ.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-1.5 pt-1">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedOption === opt;
            return (
              <button
                key={i}
                id={`quiz-option-${i}`}
                onClick={() => setSelectedOption(opt)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg border text-left text-xs transition-colors cursor-pointer
                  ${isSelected
                    ? 'border-[#6D6AF6] bg-[#6D6AF6]/10 text-gs-text-main font-medium'
                    : 'border-gs-border hover:border-gs-border/80 bg-gs-card text-gs-text-muted hover:text-gs-text-main'
                  }
                `}
              >
                <div className={`shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#6D6AF6] bg-[#6D6AF6] text-white' : 'border-gs-border'}`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-1">
        <button
          id="quiz-cancel-inline-btn"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-gs-text-muted hover:text-gs-text-main transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          id="quiz-next-btn"
          onClick={handleNext}
          disabled={selectedOption === null}
          className={`
            flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-xs transition-colors shadow-xs
            ${selectedOption !== null
              ? 'bg-[#6D6AF6] hover:bg-[#5C59EC] text-white cursor-pointer btn-tactile'
              : 'bg-gs-card border border-gs-border text-gs-text-muted cursor-not-allowed opacity-50'
            }
          `}
        >
          {isLastQuestion ? 'Submit Quiz' : <>Next <ChevronRight size={13} /></>}
        </button>
      </div>
    </div>
  );
}

// â”€â”€â”€ Step 3: Certificate Upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CertificateUploadStep({ skill, quizScore, onSubmit, onCancel, isSubmitting }) {
  const [certificateFile, setCertificateFile] = useState(null);
  const [isDragOver, setIsDragOver]           = useState(false);
  const fileInputRef = useRef(null);

  const { showToast } = useAppContext();
  const Icon = skill.icon;

  const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE_MB    = 10;

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      showToast?.('Please upload a PDF or image file (JPG, PNG, WebP).', 'error');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showToast?.(`File size must be under ${MAX_SIZE_MB} MB.`, 'error');
      return;
    }
    setCertificateFile(file);
  }, [showToast]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, [handleFile]);

  const isImage = certificateFile && certificateFile.type.startsWith('image/');
  const isPDF   = certificateFile && certificateFile.type === 'application/pdf';

  return (
    <div className="space-y-5" style={{ animation: 'slideLeft 0.3s ease-out' }}>
      {/* Header with quiz-pass receipt */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${skill.bg} border ${skill.border} self-start`}>
          <Icon size={14} className={skill.color} />
          <span className={`font-semibold text-xs ${skill.color}`}>{skill.label}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 self-start">
          <CheckCircle size={13} className="text-emerald-400" />
          <span className="text-emerald-400 text-xs font-semibold">Quiz passed: {quizScore}/10</span>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-[var(--color-gs-text-main)]">Upload Your Certificate</h3>
        <p className="text-[var(--color-gs-text-muted)] text-xs leading-relaxed">
          Upload a PDF or image certificate from Coursera, Udemy, freeCodeCamp, or similar. This is the <strong className="text-[var(--color-gs-text-main)]">final</strong> step before your skill is verified on your profile.
        </p>
      </div>

      {/* Drop zone */}
      <div
        id="cert-drop-zone"
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => !isSubmitting && fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors duration-150
          ${isDragOver
            ? 'border-[#6D6AF6] bg-[#6D6AF6]/10'
            : certificateFile
              ? 'border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500/70'
              : 'border-gs-border bg-gs-bg hover:border-[#6D6AF6]/40 hover:bg-[#6D6AF6]/[0.02]'
          }
          ${isSubmitting ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          id="cert-file-input"
          type="file"
          accept=".pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />

        {certificateFile ? (
          <>
            {/* File preview icon */}
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              {isPDF
                ? <FileText size={28} className="text-emerald-400" />
                : <ImageIcon size={28} className="text-emerald-400" />
              }
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-[var(--color-gs-text-main)] truncate max-w-[200px]">
                {certificateFile.name}
              </p>
              <p className="text-xs text-emerald-400 mt-0.5">
                {(certificateFile.size / 1024).toFixed(1)} KB Â· Ready to upload
              </p>
            </div>
            <button
              id="cert-change-file-btn"
              type="button"
              onClick={e => { e.stopPropagation(); setCertificateFile(null); }}
              className="text-xs text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-text-main)] underline transition-colors cursor-pointer"
            >
              Change file
            </button>
          </>
        ) : (
          <>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-colors duration-200 ${
              isDragOver ? 'bg-[#6D6AF6]/20 border-[#6D6AF6]/50' : 'bg-black/5 dark:bg-white/5 border-gs-border'
            }`}>
              <Upload size={24} className={isDragOver ? 'text-[#6D6AF6]' : 'text-gs-text-muted'} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--color-gs-text-main)]">
                {isDragOver ? 'Drop it here' : 'Drag and drop or click to browse'}
              </p>
              <p className="text-xs text-[var(--color-gs-text-muted)] mt-0.5">PDF, JPG, PNG, WebP Â· max {MAX_SIZE_MB} MB</p>
            </div>
          </>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          id="cert-cancel-btn"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 border border-gs-border text-gs-text-muted rounded-lg hover:bg-white/5 hover:text-gs-text-main transition-colors text-xs font-medium disabled:opacity-40 cursor-pointer"
        >
          <X size={14} /> Cancel
        </button>
        <button
          id="cert-submit-btn"
          onClick={() => certificateFile && onSubmit(certificateFile)}
          disabled={!certificateFile || isSubmitting}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-xs transition-colors cursor-pointer
            ${certificateFile && !isSubmitting
              ? 'bg-[#6D6AF6] hover:bg-[#5C59EC] text-white shadow-xs btn-tactile'
              : 'bg-gs-border text-gs-text-muted cursor-not-allowed opacity-50'
            }
          `}
        >
          {isSubmitting ? (
            <><Loader2 size={14} className="animate-spin" /> Verifying & Saving<LoadingDots /></>
          ) : (
            <><Award size={14} /> Submit Verification</>
          )}
        </button>
      </div>

      {/* Requirement reminder */}
      {!certificateFile && (
        <div className="flex items-center gap-2 text-xs text-[var(--color-gs-text-muted)]">
          <AlertTriangle size={12} className="text-amber-500 shrink-0" />
          A certificate is required â€” the Submit button will remain disabled until a file is selected.
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Step 4: Success â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SuccessStep({ skill, quizScore, onDone }) {
  const Icon = skill.icon;
  return (
    <div className="text-center space-y-5 py-3">
      {/* Clean celebration icon */}
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
        <CheckCircle size={32} />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-semibold text-[var(--color-gs-text-main)]">Skill Verified</h3>
        <p className="text-[var(--color-gs-text-muted)] text-sm max-w-sm mx-auto leading-relaxed">
          Your <span className={`font-medium ${skill.color}`}>{skill.label}</span> skill has been
          verified and added to your profile.
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl p-4 max-w-sm mx-auto text-left space-y-3">
        <p className="text-xs font-medium text-[var(--color-gs-text-muted)] uppercase tracking-wider">Verification Summary</p>

        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${skill.bg} border ${skill.border} flex items-center justify-center`}>
            <Icon size={16} className={skill.color} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-gs-text-main)]">{skill.label}</p>
            <p className="text-xs text-[var(--color-gs-text-muted)]">Verified credential</p>
          </div>
          <span className="ml-auto px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md text-[10px] font-semibold">Verified</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-lg p-2.5 text-center">
            <p className="text-base font-semibold text-emerald-500">{quizScore}/{TOTAL_QUESTIONS}</p>
            <p className="text-[11px] text-[var(--color-gs-text-muted)]">Quiz Score</p>
          </div>
          <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-lg p-2.5 text-center">
            <p className="text-base font-semibold text-[#6D6AF6]">Accepted</p>
            <p className="text-[11px] text-[var(--color-gs-text-muted)]">Certificate</p>
          </div>
        </div>
      </div>

      <button
        id="success-done-btn"
        onClick={onDone}
        className="inline-flex items-center gap-2 px-6 py-2 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium rounded-lg text-xs transition-colors shadow-xs btn-tactile cursor-pointer"
      >
        <CheckCircle size={15} /> Done
      </button>
    </div>
  );
}

// â”€â”€â”€ Main Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * StrictSkillVerificationModal
 *
 * Props:
 *   isOpen       {boolean}   â€” whether the modal is visible
 *   onClose      {function}  â€” called when the user closes the modal
 *   onSkillAdded {function(skillLabel: string)} â€” called after a verified skill
 *                             is saved so the parent can refresh its state
 */
export default function StrictSkillVerificationModal({ isOpen, onClose, onSkillAdded }) {
  const { user, updateLocalUser, showToast } = useAppContext();

  // â”€â”€ Wizard state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [currentStep, setCurrentStep]       = useState(1);
  const [selectedSkill, setSelectedSkill]   = useState(null); // skill object
  const [quizScore, setQuizScore]           = useState(null); // number (set only on pass)
  const [certificateFile, setCertificateFile] = useState(null); // File object
  const [isSubmitting, setIsSubmitting]     = useState(false);

  // â”€â”€ Guard: hidden when not open â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!isOpen) return null;

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
    setCurrentStep(2);
  };

  const handleQuizPass = (score) => {
    // Only called when score >= PASSING_SCORE; component enforces this
    setQuizScore(score);
    setCurrentStep(3);
  };

  /**
   * Called after a file is chosen and the user clicks "Submit Verification".
   * STRICT GATING: this function only executes when quizScore >= PASSING_SCORE
   * AND a file is present â€” both conditions enforced before this point in the flow.
   */
  const handleCertificateSubmit = async (file) => {
    if (!selectedSkill || quizScore === null || quizScore < PASSING_SCORE || !file) return;

    setCertificateFile(file);
    setIsSubmitting(true);

    try {
      await verifyAndSaveSkill(user?.id, selectedSkill.id, selectedSkill.label, file);

      // â”€â”€ Optimistic local profile update â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      if (user && updateLocalUser) {
        const existing = Array.isArray(user.skills) ? user.skills : [];
        if (!existing.includes(selectedSkill.label)) {
          updateLocalUser({ skills: [...existing, selectedSkill.label] });
        }
      }

      // â”€â”€ Signal parent to refresh its Skills section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      onSkillAdded?.(selectedSkill.label);

      showToast?.(`ðŸŽ‰ ${selectedSkill.label} verified and added to your profile!`, 'success');
      setCurrentStep(4);
    } catch (err) {
      console.error('[StrictSkillVerificationModal] Failed to save verified skill:', err);
      showToast?.(`Verification failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset wizard state on close
    setCurrentStep(1);
    setSelectedSkill(null);
    setQuizScore(null);
    setCertificateFile(null);
    setIsSubmitting(false);
    onClose?.();
  };

  // â”€â”€ Step back (only from quiz â†’ skill or cancel altogether) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleBack = () => {
    if (currentStep === 2) {
      setSelectedSkill(null);
      setCurrentStep(1);
    }
  };

  // â”€â”€ Backdrop click closes only if not submitting and not in step 4 â”€â”€â”€â”€â”€â”€â”€â”€
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting && currentStep !== 4) {
      handleClose();
    }
  };

  return (
    /* â”€â”€ Overlay â”€â”€ */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
      onClick={handleBackdropClick}
    >
      {/* â”€â”€ Modal panel â”€â”€ */}
      <div
        className="relative w-full max-w-lg bg-gs-card border border-gs-border rounded-xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gs-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6D6AF6]/10 border border-[#6D6AF6]/20 flex items-center justify-center">
              <Shield size={15} className="text-[#6D6AF6]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--color-gs-text-main)]">Skill Verification</p>
              <p className="text-xs text-[var(--color-gs-text-muted)]">
                Step {Math.min(currentStep, 3)} of 3
                {currentStep === 4 ? ' Â· Complete' : ''}
              </p>
            </div>
          </div>

          {/* Back button (step 2 only) */}
          {currentStep === 2 && !isSubmitting && (
            <button
              id="modal-back-btn"
              onClick={handleBack}
              className="p-1.5 rounded-lg border border-gs-border text-gs-text-muted hover:text-gs-text-main hover:bg-white/5 transition-colors mr-2 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Close */}
          {currentStep !== 4 && !isSubmitting && (
            <button
              id="modal-close-btn"
              onClick={handleClose}
              className="p-1.5 rounded-lg border border-transparent hover:border-gs-border text-gs-text-muted hover:text-gs-text-main hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Step indicator */}
        <div className="px-6 pb-2">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* â”€â”€ Step Content â”€â”€ */}
        <div className="px-6 pb-6 max-h-[70vh] overflow-y-auto">
          {currentStep === 1 && (
            <SkillSelectionStep onSelect={handleSkillSelect} />
          )}

          {currentStep === 2 && selectedSkill && (
            <QuizStep
              skill={selectedSkill}
              onPassQuiz={handleQuizPass}
              onCancel={handleClose}
            />
          )}

          {currentStep === 3 && selectedSkill && quizScore !== null && (
            <CertificateUploadStep
              skill={selectedSkill}
              quizScore={quizScore}
              onSubmit={handleCertificateSubmit}
              onCancel={handleClose}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === 4 && selectedSkill && (
            <SuccessStep
              skill={selectedSkill}
              quizScore={quizScore}
              onDone={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

