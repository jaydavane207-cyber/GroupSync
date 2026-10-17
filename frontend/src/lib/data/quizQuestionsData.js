/**
 * quizQuestionsData.js — Comprehensive Quiz Question Banks & Randomization Engine
 * Contains 30 verified, high-quality technical questions per category:
 * - JavaScript Fundamentals
 * - React Hooks & State
 * - Python Data Structures
 * - SQL & Database Design
 * - System Design Basics
 * - UI / UX Design
 * - Machine Learning
 */

// Fisher-Yates array shuffle (creates a new randomized array)
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const FULL_QUESTION_BANK = {
  javascript: [
    {
      id: 'js-1',
      q: 'What does `typeof null` return in JavaScript?',
      opts: ['"null"', '"object"', '"undefined"', '"string"'],
      answer: 1,
      explanation: 'In JavaScript, typeof null returns "object" due to a legacy bug dating back to the first implementation of JavaScript.'
    },
    {
      id: 'js-2',
      q: 'What is the output of `0.1 + 0.2 === 0.3` in JavaScript?',
      opts: ['true', 'false', 'NaN', 'undefined'],
      answer: 1,
      explanation: 'Due to IEEE 754 floating-point arithmetic precision limits in binary representation, 0.1 + 0.2 equals 0.30000000000000004, so the strict comparison yields false.'
    },
    {
      id: 'js-3',
      q: 'Which keyword declares a block-scoped variable that cannot be reassigned?',
      opts: ['var', 'let', 'const', 'immutable'],
      answer: 2,
      explanation: '`const` declares a block-scoped identifier that cannot be reassigned through reassignment or re-declaration.'
    },
    {
      id: 'js-4',
      q: 'What is a closure in JavaScript?',
      opts: [
        'A function that terminates immediately after definition',
        'A function bundled together with references to its surrounding lexical environment',
        'A built-in method for terminating asynchronous callbacks',
        'A syntax error caused by unclosed parentheses'
      ],
      answer: 1,
      explanation: 'A closure gives a function access to its outer scope even after the outer function has finished executing.'
    },
    {
      id: 'js-5',
      q: 'Which array method tests whether all elements in the array pass the provided test function?',
      opts: ['some()', 'every()', 'filter()', 'includes()'],
      answer: 1,
      explanation: '`every()` executes a callback for each element and returns true if and only if the callback returns truthy for all elements.'
    },
    {
      id: 'js-6',
      q: 'What does `Promise.all()` do if any of the passed promises rejects?',
      opts: [
        'It waits for all other promises and ignores the rejection',
        'It immediately rejects with the reason of the first promise that rejected',
        'It resolves with null for the rejected promise',
        'It automatically retries the rejected promise up to 3 times'
      ],
      answer: 1,
      explanation: '`Promise.all` follows an all-or-nothing fail-fast behavior: if any promise rejects, the returned promise immediately rejects.'
    },
    {
      id: 'js-7',
      q: 'Which method appends one or more elements to the end of an array and returns its new length?',
      opts: ['push()', 'pop()', 'unshift()', 'shift()'],
      answer: 0,
      explanation: '`push()` adds elements to the end of an array, whereas `unshift()` adds elements to the beginning.'
    },
    {
      id: 'js-8',
      q: 'What is the primary difference between `==` and `===`?',
      opts: [
        '`==` compares object references while `===` compares values',
        '`===` performs type coercion before comparison while `==` does not',
        '`==` performs type coercion if types differ; `===` checks both value and type without coercion',
        'There is no difference; they are strictly interchangeable'
      ],
      answer: 2,
      explanation: '`==` is loose equality (coercing operand types), whereas `===` is strict equality requiring identical types and values.'
    },
    {
      id: 'js-9',
      q: 'Which keyword pauses execution inside a generator function?',
      opts: ['await', 'yield', 'pause', 'defer'],
      answer: 1,
      explanation: 'The `yield` keyword is used to pause and resume a generator function (`function*`).'
    },
    {
      id: 'js-10',
      q: 'What does `typeof NaN` evaluate to in JavaScript?',
      opts: ['"NaN"', '"undefined"', '"number"', '"object"'],
      answer: 2,
      explanation: '`NaN` stands for "Not-a-Number", but its JavaScript type is technically a numeric data type (`number`).'
    },
    {
      id: 'js-11',
      q: 'Which method parses a JSON string, constructing the JavaScript value or object described by the string?',
      opts: ['JSON.stringify()', 'JSON.parse()', 'JSON.object()', 'JSON.decode()'],
      answer: 1,
      explanation: '`JSON.parse()` deserializes a JSON string into a JavaScript object or primitive value.'
    },
    {
      id: 'js-12',
      q: 'What is the result of `Boolean("")`?',
      opts: ['true', 'false', 'undefined', 'null'],
      answer: 1,
      explanation: 'An empty string `""` is falsy in JavaScript, so `Boolean("")` converts to `false`.'
    },
    {
      id: 'js-13',
      q: 'What is the Event Loop responsible for in the JavaScript runtime?',
      opts: [
        'Compiling JavaScript source code into native machine assembly',
        'Monitoring the Call Stack and moving callbacks from the Task/Microtask queues onto the stack when empty',
        'Managing garbage collection memory limits exclusively',
        'Parsing CSS style sheets and computing layout geometries'
      ],
      answer: 1,
      explanation: 'The Event Loop checks if the Call Stack is empty and pushes pending microtasks and macrotask callbacks onto it.'
    },
    {
      id: 'js-14',
      q: 'Which array method creates a new array populated with the results of calling a provided function on every element?',
      opts: ['forEach()', 'map()', 'filter()', 'reduce()'],
      answer: 1,
      explanation: '`map()` transforms each element and returns a brand new array of equal length.'
    },
    {
      id: 'js-15',
      q: 'What does `Object.freeze()` do to an object?',
      opts: [
        'Prevents new properties from being added, but existing properties can still be modified',
        'Prevents additions, deletions, and modifications of existing properties and prototype',
        'Hides properties from enumeration in for...in loops',
        'Creates an asynchronous deep copy of the object'
      ],
      answer: 1,
      explanation: '`Object.freeze()` makes an object completely immutable at a shallow level.'
    },
    {
      id: 'js-16',
      q: 'Which method removes the first element from an array and returns that removed element?',
      opts: ['shift()', 'pop()', 'unshift()', 'splice()'],
      answer: 0,
      explanation: '`shift()` removes the first element (index 0) and shifts all remaining elements down one position.'
    },
    {
      id: 'js-17',
      q: 'In strict mode (`"use strict"`), what is the value of `this` inside an un-bound, plain function invoked directly?',
      opts: ['window / global', 'undefined', 'null', '{}'],
      answer: 1,
      explanation: 'In strict mode, the default binding of `this` in standalone functions is `undefined` rather than the global object.'
    },
    {
      id: 'js-18',
      q: 'What does `Array.isArray([])` return?',
      opts: ['false', 'true', '"array"', 'undefined'],
      answer: 1,
      explanation: '`Array.isArray()` accurately identifies arrays, returning `true` for standard arrays.'
    },
    {
      id: 'js-19',
      q: 'Which operator is known as the Nullish Coalescing Operator in JavaScript?',
      opts: ['||', '&&', '??', '?:'],
      answer: 2,
      explanation: '`??` returns the right-hand operand only when the left-hand operand is `null` or `undefined` (unlike `||` which checks for any falsy value).'
    },
    {
      id: 'js-20',
      q: 'What does "hoisting" mean in JavaScript?',
      opts: [
        'Moving DOM elements higher up the render tree',
        'Variable and function declarations are conceptually moved to the top of their enclosing scope before code execution',
        'Converting asynchronous operations into synchronous executions',
        'Elevating errors to higher-level try/catch blocks automatically'
      ],
      answer: 1,
      explanation: 'Hoisting allows functions and variables declared with `var` to be referenced before their lexical declarations.'
    },
    {
      id: 'js-21',
      q: 'What is the behavior of `Promise.race()`?',
      opts: [
        'It returns all settled promises sorted by execution time',
        'It returns a promise that fulfills or rejects as soon as any one of the input promises settles',
        'It rejects only if every single promise rejects',
        'It executes promises in sequential priority order'
      ],
      answer: 1,
      explanation: '`Promise.race()` settles (fulfills or rejects) with the eventual state of whichever promise finishes first.'
    },
    {
      id: 'js-22',
      q: 'Which ES6 built-in object lets you store unique values of any type, whether primitive values or object references?',
      opts: ['Map', 'WeakMap', 'Set', 'Symbol'],
      answer: 2,
      explanation: 'A `Set` is a collection of unique values; duplicate entries are automatically discarded.'
    },
    {
      id: 'js-23',
      q: 'What is the result of evaluating `[1, 2] + [3, 4]` in JavaScript?',
      opts: ['[1, 2, 3, 4]', '"1,23,4"', 'NaN', 'TypeError'],
      answer: 1,
      explanation: 'The binary `+` operator converts both arrays into strings ("1,2" and "3,4") and concatenates them into `"1,23,4"`.'
    },
    {
      id: 'js-24',
      q: 'Which method returns an array of a given object\'s own enumerable property names?',
      opts: ['Object.values()', 'Object.keys()', 'Object.entries()', 'Object.getOwnPropertyNames()'],
      answer: 1,
      explanation: '`Object.keys()` returns an array containing all string-keyed enumerable property names directly defined on the object.'
    },
    {
      id: 'js-25',
      q: 'How do you stop an event from propagating (bubbling) further up the DOM hierarchy?',
      opts: ['event.preventDefault()', 'event.stopPropagation()', 'event.exit()', 'return false'],
      answer: 1,
      explanation: '`event.stopPropagation()` stops the dispatch of the DOM event along its capture or bubbling phase.'
    },
    {
      id: 'js-26',
      q: 'What does `typeof undefined` return?',
      opts: ['"null"', '"undefined"', '"void"', '"object"'],
      answer: 1,
      explanation: '`typeof undefined` returns the literal string `"undefined"`.'
    },
    {
      id: 'js-27',
      q: 'What does `event.preventDefault()` accomplish?',
      opts: [
        'Cancels the default action belonging to the event (e.g. following a link or submitting a form)',
        'Stops child elements from triggering event handlers',
        'Destroys the active event listener from memory',
        'Prevents CSS pseudo-classes like :hover from firing'
      ],
      answer: 0,
      explanation: '`preventDefault()` signals to the user agent that if the event is not explicitly handled, its default action should not be taken.'
    },
    {
      id: 'js-28',
      q: 'What does `Array.prototype.reduce()` accomplish?',
      opts: [
        'Reduces the size of an array by truncating trailing elements',
        'Executes a user-supplied reducer callback on each element, passing the return value from the calculation on the preceding element',
        'Filters out duplicate values from an array',
        'Sorts the array descending order'
      ],
      answer: 1,
      explanation: '`reduce()` accumulates array values into a single consolidated output value according to the reducer function.'
    },
    {
      id: 'js-29',
      q: 'What is a key property of `WeakMap` in JavaScript?',
      opts: [
        'Keys can be primitives or objects',
        'Keys must be objects, and they do not prevent garbage collection if no other references exist',
        'Its entries can be enumerated with for...of',
        'It automatically persists its keys into localStorage'
      ],
      answer: 1,
      explanation: '`WeakMap` keys must be objects and are held weakly, preventing memory leaks when objects are discarded elsewhere.'
    },
    {
      id: 'js-30',
      q: 'What does `typeof (() => {})` evaluate to?',
      opts: ['"object"', '"function"', '"arrow"', '"undefined"'],
      answer: 1,
      explanation: 'Functions and arrow functions are first-class objects whose `typeof` evaluation is `"function"`.'
    }
  ],

  react: [
    {
      id: 'react-1',
      q: 'What is the primary purpose of the Virtual DOM in React?',
      opts: [
        'To store encrypted user credentials securely',
        'To optimize DOM manipulation for performance by calculating diffs in memory',
        'To manage backend database routing and migrations',
        'To eliminate the need for CSS stylesheets'
      ],
      answer: 1,
      explanation: 'React maintains a lightweight virtual representation of the UI in memory, calculating the minimal set of changes before updating the browser DOM.'
    },
    {
      id: 'react-2',
      q: 'Which React hook is used to handle side effects like data fetching and subscriptions?',
      opts: ['useState', 'useMemo', 'useEffect', 'useCallback'],
      answer: 2,
      explanation: '`useEffect` runs side effects after rendering, including API calls, event listeners, and manual DOM manipulation.'
    },
    {
      id: 'react-3',
      q: 'How do you pass data down from a parent component to a child component?',
      opts: ['Using State', 'Using Props', 'Using HTML dataset attributes', 'Using Redux stores only'],
      answer: 1,
      explanation: 'Props (short for properties) are the standard unidirectional mechanism for passing data down from parent to child components.'
    },
    {
      id: 'react-4',
      q: 'What does JSX stand for?',
      opts: ['Java Standard XML', 'JavaScript XML', 'JavaScript Syntax Extension', 'JSON Syntax XML'],
      answer: 1,
      explanation: 'JSX stands for JavaScript XML. It is a syntax extension that lets you write HTML-like markup inside JavaScript.'
    },
    {
      id: 'react-5',
      q: 'What is the correct way to update state that depends on the previous state?',
      opts: [
        'count = count + 1',
        'setCount(count + 1)',
        'setCount(prev => prev + 1)',
        'this.state.count++'
      ],
      answer: 2,
      explanation: 'Passing a function `setCount(prev => prev + 1)` guarantees you are calculating the new state based on the most up-to-date pending state.'
    },
    {
      id: 'react-6',
      q: 'What is the purpose of the `key` prop when rendering dynamic lists in React?',
      opts: [
        'To apply unique CSS styles to list items',
        'To help React identify which items have changed, been added, or removed for efficient reconciliation',
        'To bind items to database primary keys automatically',
        'To prevent items from receiving user click events'
      ],
      answer: 1,
      explanation: 'Keys provide a stable identity to list items across renders, avoiding unnecessary DOM re-creations and maintaining input state.'
    },
    {
      id: 'react-7',
      q: 'What is the purpose of the `useMemo` hook?',
      opts: [
        'Memoizes a callback function definition',
        'Memoizes the result of an expensive calculation to avoid recalculating on every render',
        'Automatically manages local component state',
        'Provides global application routing'
      ],
      answer: 1,
      explanation: '`useMemo` caches the result of a calculation between renders, only recomputing when its specified dependencies change.'
    },
    {
      id: 'react-8',
      q: 'Which hook allows you to persist a mutable value or reference a DOM element directly without triggering a re-render?',
      opts: ['useState', 'useRef', 'useEffect', 'useImperativeHandle'],
      answer: 1,
      explanation: '`useRef` returns a mutable ref object whose `.current` property persists across renders without causing component re-renders when updated.'
    },
    {
      id: 'react-9',
      q: 'What does the `useCallback` hook memoize?',
      opts: ['A calculated value', 'A function definition / reference', 'A Redux state tree', 'A DOM node reference'],
      answer: 1,
      explanation: '`useCallback` caches a function definition between renders so child components relying on reference equality do not re-render unnecessarily.'
    },
    {
      id: 'react-10',
      q: 'What does `React.memo()` do?',
      opts: [
        'It memoizes an entire React component, skipping re-renders if its props have not changed',
        'It saves component data into the browser\'s sessionStorage',
        'It creates a memoized custom hook automatically',
        'It forces a component to re-render every second'
      ],
      answer: 0,
      explanation: '`React.memo` is a higher-order component that performs a shallow comparison of props to avoid re-rendering pure components.'
    },
    {
      id: 'react-11',
      q: 'Which of the following causes a React component to re-render?',
      opts: [
        'Updating a useRef current value',
        'State changes or props changes',
        'Reading an ordinary local variable',
        'Adding a comment inside the JSX'
      ],
      answer: 1,
      explanation: 'When a component\'s state or props change, React schedules a re-render of that component and its children.'
    },
    {
      id: 'react-12',
      q: 'What is a fundamental Rule of React Hooks?',
      opts: [
        'Hooks must only be called inside loops or conditions',
        'Hooks must be called at the top level of React function components or custom hooks, never inside loops or conditions',
        'Hooks can only be called inside class components',
        'Hooks must always be declared as async functions'
      ],
      answer: 1,
      explanation: 'Hooks must execute in the exact same order on every render, so they cannot be placed inside conditions, loops, or nested functions.'
    },
    {
      id: 'react-13',
      q: 'When does `useEffect(callback, [])` (with an empty dependency array) run?',
      opts: [
        'On every single render and re-render',
        'Only once after the initial component mount',
        'Before the component mounts into the DOM',
        'Only when the component throws an error'
      ],
      answer: 1,
      explanation: 'An empty dependency array `[]` indicates the effect does not depend on any state or props, running only once after initial mount.'
    },
    {
      id: 'react-14',
      q: 'Which built-in API avoids "prop drilling" by sharing data across the component tree without passing props manually at every level?',
      opts: ['Context API', 'Web Workers', 'localStorage', 'Service Workers'],
      answer: 0,
      explanation: 'The Context API (`createContext` and `useContext`) provides a way to pass data through the component tree without prop drilling.'
    },
    {
      id: 'react-15',
      q: 'What is a "controlled component" in React form handling?',
      opts: [
        'A component whose rendered HTML is controlled directly by third-party jQuery scripts',
        'An input form element whose current value is driven by React component state',
        'A component that cannot receive user input events',
        'A component rendered exclusively on the server'
      ],
      answer: 1,
      explanation: 'In a controlled component, form input values are bound to React state and updated via event handlers (`onChange`).'
    },
    {
      id: 'react-16',
      q: 'What hook is recommended for managing complex local state transitions with action types?',
      opts: ['useReducer', 'useState', 'useTransition', 'useLayoutEffect'],
      answer: 0,
      explanation: '`useReducer` is preferable to `useState` when state logic is complex or when the next state depends on multiple previous sub-values.'
    },
    {
      id: 'react-17',
      q: 'Why should state never be mutated directly (e.g. `state.user = "Alice"`) in React?',
      opts: [
        'Direct mutations cause immediate syntax compilation errors',
        'React relies on state immutability to detect state changes and schedule re-renders',
        'Direct mutations corrupt the browser\'s DOM tree permanently',
        'React state is stored in read-only cookies'
      ],
      answer: 1,
      explanation: 'React compares state references; modifying properties in-place prevents React from recognizing changes and updating the UI.'
    },
    {
      id: 'react-18',
      q: 'What is React Fragment (`<React.Fragment>` or `<></>`) used for?',
      opts: [
        'Creating an isolated web worker thread',
        'Grouping a list of child elements without adding extra wrapper nodes to the browser DOM',
        'Styling elements with flexbox automatically',
        'Handling uncaught JavaScript runtime exceptions'
      ],
      answer: 1,
      explanation: 'Fragments let you return multiple sibling elements without rendering unnecessary `<div>` or wrapper elements into the DOM.'
    },
    {
      id: 'react-19',
      q: 'What does the cleanup function returned inside `useEffect` do?',
      opts: [
        'Deletes the component\'s source code from memory',
        'Cleans up subscriptions, timers, or event listeners before the component unmounts or before re-running the effect',
        'Resets all component state variables to null',
        'Empties the browser cache and cookies'
      ],
      answer: 1,
      explanation: 'The cleanup function executes before the component unmounts or prior to re-executing the effect with updated dependencies.'
    },
    {
      id: 'react-20',
      q: 'How can a parent component obtain a ref to an inner DOM element rendered by a custom child component?',
      opts: ['React.forwardRef', 'React.createRef', 'React.cloneElement', 'React.memo'],
      answer: 0,
      explanation: '`React.forwardRef` creates a React component that forwards the `ref` attribute it receives to a child node further down the tree.'
    },
    {
      id: 'react-21',
      q: 'What is an Error Boundary in React?',
      opts: [
        'A hook that logs warnings in the browser console',
        'A component that catches JavaScript errors anywhere in its child component tree and displays a fallback UI',
        'A linter rule checking for syntax flaws in JSX',
        'A network timeout interceptor for Axios requests'
      ],
      answer: 1,
      explanation: 'Error Boundaries catch JavaScript errors in their child tree during rendering, in lifecycle methods, and in constructors.'
    },
    {
      id: 'react-22',
      q: 'In React 18, which hook allows you to mark specific state updates as non-blocking transitions?',
      opts: ['useTransition', 'useDeferredValue', 'useId', 'useSyncExternalStore'],
      answer: 0,
      explanation: '`useTransition` allows you to mark state updates as non-urgent transitions, keeping the user interface responsive during intensive updates.'
    },
    {
      id: 'react-23',
      q: 'What does `useLayoutEffect` do differently from `useEffect`?',
      opts: [
        'It runs on a separate web worker thread',
        'It fires synchronously after all DOM mutations but before the browser paints on screen',
        'It only runs when the window is resized',
        'It cannot read layout dimensions from the DOM'
      ],
      answer: 1,
      explanation: '`useLayoutEffect` executes synchronously immediately after React updates the DOM, allowing layout measurements without visual flicker.'
    },
    {
      id: 'react-24',
      q: 'What is the purpose of the `children` prop in React?',
      opts: [
        'It contains the number of child components rendered',
        'It allows components to be composed by passing arbitrary nested elements into their body',
        'It links child elements directly to parent database rows',
        'It specifies the CSS grid column span of child elements'
      ],
      answer: 1,
      explanation: '`props.children` allows components to receive and render nested JSX passed between their opening and closing tags.'
    },
    {
      id: 'react-25',
      q: 'What does the `useId` hook introduced in React 18 provide?',
      opts: [
        'Generates unique, stable IDs across server and client for accessible form inputs and ARIA attributes',
        'Retrieves the currently authenticated user\'s database ID',
        'Generates UUID v4 tokens for cryptographic signatures',
        'Returns the internal fiber node ID'
      ],
      answer: 0,
      explanation: '`useId` produces unique IDs that match seamlessly across client and server hydration, ideal for accessibility attributes.'
    },
    {
      id: 'react-26',
      q: 'What happens during React\'s Reconciliation process?',
      opts: [
        'Compiling JSX into WebAssembly bytecode',
        'Comparing the new Virtual DOM tree with the previous one to compute the minimal set of real DOM operations',
        'Validating user passwords against an encrypted database',
        'Minifying JavaScript asset bundles for deployment'
      ],
      answer: 1,
      explanation: 'Reconciliation is React\'s diffing algorithm that computes the differences between Virtual DOM trees to update the real DOM efficiently.'
    },
    {
      id: 'react-27',
      q: 'Can custom hooks in React call other hooks?',
      opts: [
        'No, custom hooks can only call plain JavaScript functions',
        'Yes, custom hooks can call any built-in or other custom React hooks',
        'Only if they are wrapped in React.memo',
        'Only in production mode'
      ],
      answer: 1,
      explanation: 'Custom hooks are functions starting with "use" that can compose any other hooks (`useState`, `useEffect`, etc.).'
    },
    {
      id: 'react-28',
      q: 'What does React Portal (`ReactDOM.createPortal`) allow you to do?',
      opts: [
        'Render children into a DOM node that exists outside the DOM hierarchy of the parent component',
        'Create a WebSocket tunnel between client and server',
        'Open new browser tabs without popup blockers',
        'Stream server-side rendered HTML asynchronously'
      ],
      answer: 0,
      explanation: 'Portals render child components into a different DOM subtree (such as modals or tooltips attached to `document.body`).'
    },
    {
      id: 'react-29',
      q: 'Why does React 18 render components twice in StrictMode during development?',
      opts: [
        'To test if the monitor refresh rate is 120Hz',
        'To help detect unintended side effects and verify cleanup functions in effects',
        'It is a known regression bug in React 18',
        'To verify that CSS animations operate smoothly'
      ],
      answer: 1,
      explanation: 'In development StrictMode, React deliberately double-invokes render methods and effects to catch impure code and missing cleanups.'
    },
    {
      id: 'react-30',
      q: 'What is "hydration" in modern server-rendered React applications?',
      opts: [
        'Downloading images into browser memory caches',
        'Attaching React event listeners and state to server-rendered HTML markup in the browser',
        'Validating form inputs before sending network requests',
        'Compiling CSS variables into static style sheets'
      ],
      answer: 1,
      explanation: 'Hydration enables interactivity by attaching event listeners and React fiber structures to pre-rendered HTML sent from the server.'
    }
  ],

  python: [
    {
      id: 'py-1',
      q: 'Which keyword is used to define a function in Python?',
      opts: ['func', 'def', 'function', 'define'],
      answer: 1,
      explanation: 'In Python, functions are defined using the `def` keyword followed by the function name and parameter list.'
    },
    {
      id: 'py-2',
      q: 'What data type is created by square brackets like `[1, 2, 3]`?',
      opts: ['Tuple', 'List', 'Set', 'Dictionary'],
      answer: 1,
      explanation: 'Square brackets define a `list`, which is an ordered, mutable sequence of elements.'
    },
    {
      id: 'py-3',
      q: 'How do you write a single-line comment in Python?',
      opts: ['// Comment', '/* Comment */', '# Comment', '<!-- Comment -->'],
      answer: 2,
      explanation: 'In Python, single-line comments start with the hash symbol `#`.'
    },
    {
      id: 'py-4',
      q: 'Which method adds a single item to the end of a list?',
      opts: ['add()', 'push()', 'append()', 'insert()'],
      answer: 2,
      explanation: '`append()` places an element at the end of an existing list.'
    },
    {
      id: 'py-5',
      q: 'What built-in data type stores data as key-value pairs in Python?',
      opts: ['List', 'Tuple', 'Dictionary (`dict`)', 'Set'],
      answer: 2,
      explanation: 'A dictionary (`dict`) is a collection of key-value pairs where keys must be hashable and unique.'
    },
    {
      id: 'py-6',
      q: 'How are exceptions handled in Python?',
      opts: ['try...catch', 'try...except', 'do...catch', 'catch...finally'],
      answer: 1,
      explanation: 'Python uses `try` and `except` blocks (along with optional `else` and `finally`) to handle exceptions.'
    },
    {
      id: 'py-7',
      q: 'What does the `__init__` method do in a Python class?',
      opts: [
        'Destroys the instance when garbage collected',
        'Acts as the constructor to initialize new object instances and attributes',
        'Registers the class with the Python package manager',
        'Compiles bytecode for the module'
      ],
      answer: 1,
      explanation: '`__init__` is the initializer method automatically invoked when a new instance of a class is created.'
    },
    {
      id: 'py-8',
      q: 'Which statement terminates the current loop immediately?',
      opts: ['continue', 'break', 'pass', 'return'],
      answer: 1,
      explanation: '`break` terminates the smallest enclosing `for` or `while` loop prematurely.'
    },
    {
      id: 'py-9',
      q: 'What is PEP 8 in the Python ecosystem?',
      opts: [
        'A package distribution tool',
        'The official Style Guide for Python Code',
        'Python\'s built-in unit testing framework',
        'The Python compiler executable'
      ],
      answer: 1,
      explanation: 'PEP 8 provides coding conventions and styling guidelines for writing clean, readable Python code.'
    },
    {
      id: 'py-10',
      q: 'What is the output of `type(lambda x: x)`?',
      opts: ['<class \'lambda\'>', '<class \'function\'>', '<class \'object\'>', '<class \'closure\'>'],
      answer: 1,
      explanation: 'Anonymous lambda expressions create instances of the standard `<class \'function\'>`.'
    },
    {
      id: 'py-11',
      q: 'What is the primary difference between a list and a tuple in Python?',
      opts: [
        'Lists are immutable; tuples are mutable',
        'Lists are mutable; tuples are immutable',
        'Tuples can only contain numbers; lists can contain any type',
        'There is no difference'
      ],
      answer: 1,
      explanation: 'Lists can be modified (elements added, removed, or changed); tuples cannot be altered after creation.'
    },
    {
      id: 'py-12',
      q: 'What does the `//` operator do in Python?',
      opts: ['Exponentiation', 'Floor division (integer division)', 'Modulus remainder', 'Single-line comment inside expressions'],
      answer: 1,
      explanation: '`//` divides two numbers and truncates the fractional part, returning the mathematical floor.'
    },
    {
      id: 'py-13',
      q: 'Which keyword turns a regular function into a generator?',
      opts: ['generate', 'yield', 'produce', 'async'],
      answer: 1,
      explanation: 'Using `yield` inside a function body turns it into a generator function that produces values lazily on demand.'
    },
    {
      id: 'py-14',
      q: 'What does the `is` operator compare in Python?',
      opts: [
        'Values for equality (`==`)',
        'Memory addresses / object identity',
        'Data types only',
        'String lengths'
      ],
      answer: 1,
      explanation: '`is` checks if two variables refer to the exact same object in memory, whereas `==` checks value equality.'
    },
    {
      id: 'py-15',
      q: 'In a function signature, what does `*args` allow you to receive?',
      opts: [
        'Keyword arguments as a dictionary',
        'An arbitrary number of positional arguments as a tuple',
        'Required arguments only',
        'Type annotations'
      ],
      answer: 1,
      explanation: '`*args` gathers excess positional arguments into a single tuple.'
    },
    {
      id: 'py-16',
      q: 'In a function signature, what does `**kwargs` allow you to receive?',
      opts: [
        'Positional arguments as a list',
        'Arbitrary keyword arguments as a dictionary',
        'A generator expression',
        'Global module variables'
      ],
      answer: 1,
      explanation: '`**kwargs` collects excess named keyword arguments into a standard dictionary.'
    },
    {
      id: 'py-17',
      q: 'What is the value of `[x**2 for x in range(4)]`?',
      opts: ['[1, 4, 9, 16]', '[0, 1, 4, 9]', '[0, 1, 2, 3]', '[0, 2, 4, 6]'],
      answer: 1,
      explanation: '`range(4)` yields 0, 1, 2, 3. Squaring each produces `[0, 1, 4, 9]`.'
    },
    {
      id: 'py-18',
      q: 'Which standard library module is used for regular expressions in Python?',
      opts: ['regex', 're', 'regexp', 'match'],
      answer: 1,
      explanation: 'The standard module for pattern matching with regular expressions is `re`.'
    },
    {
      id: 'py-19',
      q: 'What is the Global Interpreter Lock (GIL) in CPython?',
      opts: [
        'A security lock preventing unauthorized script execution',
        'A mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously',
        'A cryptographic hash algorithm in the hashlib module',
        'A file-system lock on open .py files'
      ],
      answer: 1,
      explanation: 'The GIL allows only one thread to hold the Python interpreter lock in CPython, affecting CPU-bound multithreaded performance.'
    },
    {
      id: 'py-20',
      q: 'What is the recommended idiom for safely opening and closing files in Python?',
      opts: [
        'Using the `with` statement (context manager)',
        'Calling file.close() inside a loop',
        'Calling os.close_all() at script exit',
        'Using try without finally'
      ],
      answer: 0,
      explanation: '`with open(...) as f:` ensures the file descriptor is closed automatically when leaving the block, even if exceptions occur.'
    },
    {
      id: 'py-21',
      q: 'What does `my_dict.get("missing_key", "default")` return if "missing_key" is not present?',
      opts: ['KeyError exception', '"default"', 'None', 'False'],
      answer: 1,
      explanation: '`get()` returns the specified fallback default if the key is not found, avoiding a `KeyError`.'
    },
    {
      id: 'py-22',
      q: 'What is the boolean evaluation of an empty list `bool([])` in Python?',
      opts: ['True', 'False', 'None', 'Error'],
      answer: 1,
      explanation: 'In Python, empty collections (lists, dicts, tuples, sets, strings) evaluate to `False` in boolean contexts.'
    },
    {
      id: 'py-23',
      q: 'What does the `pass` statement do in Python?',
      opts: [
        'Passes a value to the calling function',
        'Acts as a syntactic placeholder / null operation where code is syntactically required',
        'Skips the next line of code',
        'Forces the interpreter to move to the next iteration of a loop'
      ],
      answer: 1,
      explanation: '`pass` is a null statement used as a placeholder in empty functions, loops, or classes.'
    },
    {
      id: 'py-24',
      q: 'What does the `enumerate()` function return when iterating over a sequence?',
      opts: [
        'Only the elements in reverse order',
        'Tuples containing the zero-based count/index and the value from iterating over the sequence',
        'A dictionary with indices as keys',
        'The length of the sequence'
      ],
      answer: 1,
      explanation: '`enumerate()` yields pairs of `(index, item)` during iteration.'
    },
    {
      id: 'py-25',
      q: 'Which built-in function aggregates elements from two or more iterables into tuples?',
      opts: ['combine()', 'zip()', 'merge()', 'chain()'],
      answer: 1,
      explanation: '`zip(*iterables)` pairs elements from each iterable until the shortest iterable is exhausted.'
    },
    {
      id: 'py-26',
      q: 'What is a decorator in Python?',
      opts: [
        'A CSS class applied to Tkinter UI elements',
        'A callable that takes another function as an argument and extends its behavior without modifying it',
        'A method that formats strings into HTML tables',
        'A keyword used for declaring global constants'
      ],
      answer: 1,
      explanation: 'A decorator (denoted by `@decorator_name`) wraps a function or class to augment its behavior.'
    },
    {
      id: 'py-27',
      q: 'What does `dir(obj)` return?',
      opts: [
        'The file path of the script directory',
        'A list of the attributes and methods of the specified object',
        'The memory address of the object',
        'A dictionary of all global variables'
      ],
      answer: 1,
      explanation: '`dir()` returns a sorted list of valid attribute and method names for the object.'
    },
    {
      id: 'py-28',
      q: 'What does `sorted([3, 1, 2])` return versus `[3, 1, 2].sort()`?',
      opts: [
        '`sorted()` returns a new sorted list; `.sort()` sorts the list in place and returns `None`',
        '`sorted()` sorts in place; `.sort()` returns a new list',
        'Both return brand new lists',
        'Both sort in place'
      ],
      answer: 0,
      explanation: '`sorted()` produces a new sorted list, while list method `.sort()` mutates the original list in place and returns `None`.'
    },
    {
      id: 'py-29',
      q: 'How do you create a set with numbers 1, 2, and 3?',
      opts: ['{1, 2, 3}', '[1, 2, 3]', '(1, 2, 3)', 'set: [1, 2, 3]'],
      answer: 0,
      explanation: 'Curly braces `{1, 2, 3}` without key:value pairs create a `set`.'
    },
    {
      id: 'py-30',
      q: 'What does `str.split(",")` do on `"apple,banana,orange"`?',
      opts: [
        '["apple", "banana", "orange"]',
        '("apple", "banana", "orange")',
        '{"apple", "banana", "orange"}',
        '"apple banana orange"'
      ],
      answer: 0,
      explanation: '`split()` breaks a string by the specified delimiter into a list of substrings.'
    }
  ],

  sql: [
    {
      id: 'sql-1',
      q: 'Which SQL statement is used to retrieve data from a database?',
      opts: ['GET', 'SELECT', 'FETCH', 'PULL'],
      answer: 1,
      explanation: '`SELECT` is the primary SQL command used to query and extract rows from database tables.'
    },
    {
      id: 'sql-2',
      q: 'Which clause is used to combine rows from two or more tables based on a related column?',
      opts: ['COMBINE', 'JOIN', 'MERGE', 'UNION'],
      answer: 1,
      explanation: '`JOIN` operations (INNER, LEFT, RIGHT, FULL) combine columns from multiple tables using shared keys.'
    },
    {
      id: 'sql-3',
      q: 'What is a PRIMARY KEY constraint in relational databases?',
      opts: [
        'A column that permits duplicates but not nulls',
        'A column (or set of columns) that uniquely identifies each row in a table',
        'An encryption key used for column-level security',
        'A pointer to an external file on disk'
      ],
      answer: 1,
      explanation: 'A primary key uniquely identifies each record in a table; it cannot contain NULLs and must be strictly unique.'
    },
    {
      id: 'sql-4',
      q: 'Which SQL clause is used to filter records AFTER an aggregation (`GROUP BY`) has been performed?',
      opts: ['WHERE', 'HAVING', 'FILTER', 'ORDER BY'],
      answer: 1,
      explanation: '`WHERE` filters rows before aggregation; `HAVING` filters aggregated groups created by `GROUP BY`.'
    },
    {
      id: 'sql-5',
      q: 'What does `COUNT(*)` return in SQL?',
      opts: [
        'The count of non-null values in the first column',
        'The total number of rows matching the query criteria, including rows with NULL values',
        'The sum of all integer columns',
        'The number of tables in the database'
      ],
      answer: 1,
      explanation: '`COUNT(*)` counts all matching rows in the table or group, regardless of NULL values.'
    },
    {
      id: 'sql-6',
      q: 'What is a FOREIGN KEY in relational database design?',
      opts: [
        'A key stored in a different country for compliance',
        'A column that references the primary key of another table, enforcing referential integrity',
        'A temporary index discarded after query completion',
        'A key generated by third-party APIs'
      ],
      answer: 1,
      explanation: 'Foreign keys establish relationships between tables by pointing to the candidate/primary key of another table.'
    },
    {
      id: 'sql-7',
      q: 'Which keyword eliminates duplicate rows from query results?',
      opts: ['UNIQUE', 'DISTINCT', 'DIFFERENT', 'DEDUPE'],
      answer: 1,
      explanation: '`SELECT DISTINCT` returns only unique rows from the specified result set.'
    },
    {
      id: 'sql-8',
      q: 'What is the primary purpose of creating an INDEX on database columns?',
      opts: [
        'To compress database files on disk',
        'To speed up data retrieval operations at the cost of additional storage and slower writes',
        'To prevent unauthorized users from viewing table data',
        'To automatically backup tables periodically'
      ],
      answer: 1,
      explanation: 'Indexes (like B-trees) accelerate `SELECT` lookups and `WHERE` filters, but increase storage and write overhead on inserts/updates.'
    },
    {
      id: 'sql-9',
      q: 'What does `NULL` represent in relational SQL databases?',
      opts: ['Zero (`0`)', 'An empty string (`""`)', 'Missing, unknown, or inapplicable data', 'Boolean False'],
      answer: 2,
      explanation: '`NULL` signifies the absence of a value; it is neither equal to zero nor empty string, and `NULL = NULL` evaluates to unknown.'
    },
    {
      id: 'sql-10',
      q: 'Which SQL command quickly removes ALL rows from a table without logging individual row deletions?',
      opts: ['DELETE ALL', 'TRUNCATE', 'DROP', 'CLEAR'],
      answer: 1,
      explanation: '`TRUNCATE TABLE` empties a table quickly by deallocating data pages rather than deleting rows one by one.'
    },
    {
      id: 'sql-11',
      q: 'What rows does an `INNER JOIN` return?',
      opts: [
        'All rows from the left table and matching rows from the right table',
        'Only rows where there is a match in both tables',
        'All rows from both tables, pairing unmatched rows with NULL',
        'Rows from the left table that have NO match in the right table'
      ],
      answer: 1,
      explanation: '`INNER JOIN` selects records that have matching values in both joined tables.'
    },
    {
      id: 'sql-12',
      q: 'What rows does a `LEFT JOIN` (LEFT OUTER JOIN) return?',
      opts: [
        'Only rows that match in both tables',
        'All rows from the left table, and matched rows from the right table (with NULLs for unmatched right rows)',
        'All rows from the right table and only matching rows from the left',
        'Only rows that have no match in the right table'
      ],
      answer: 1,
      explanation: '`LEFT JOIN` returns all records from the left table regardless of whether a matching record exists in the right table.'
    },
    {
      id: 'sql-13',
      q: 'What does the "A" in the database acronym ACID stand for?',
      opts: ['Availability', 'Atomicity', 'Asynchronous', 'Authorization'],
      answer: 1,
      explanation: 'Atomicity guarantees that all operations within a transaction succeed completely or are entirely rolled back (all-or-nothing).'
    },
    {
      id: 'sql-14',
      q: 'What does the "I" in ACID stand for?',
      opts: ['Indexing', 'Isolation', 'Integrity', 'Idempotency'],
      answer: 1,
      explanation: 'Isolation ensures that concurrent transactions do not interfere with each other\'s intermediate states.'
    },
    {
      id: 'sql-15',
      q: 'Which database normal form eliminates transitive dependencies (non-key attributes depending on other non-key attributes)?',
      opts: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'BCNF'],
      answer: 2,
      explanation: 'Third Normal Form (3NF) requires 2NF and that no non-prime attribute is transitively dependent on the primary key.'
    },
    {
      id: 'sql-16',
      q: 'Which SQL statement undoes the modifications made in the current uncommitted transaction?',
      opts: ['REVERT', 'ROLLBACK', 'UNDO', 'CANCEL'],
      answer: 1,
      explanation: '`ROLLBACK` restores the database state to the beginning of the transaction or a designated savepoint.'
    },
    {
      id: 'sql-17',
      q: 'What is the difference between `UNION` and `UNION ALL`?',
      opts: [
        '`UNION` removes duplicate rows from the combined result set; `UNION ALL` retains all duplicates',
        '`UNION ALL` removes duplicates; `UNION` does not',
        '`UNION` operates on tables; `UNION ALL` operates on views only',
        'There is no difference'
      ],
      answer: 0,
      explanation: '`UNION` performs a deduplication step (equivalent to DISTINCT), while `UNION ALL` concatenates datasets without removing duplicates.'
    },
    {
      id: 'sql-18',
      q: 'What is a Composite Primary Key?',
      opts: [
        'A primary key composed of two or more columns combined together',
        'A primary key that automatically compresses data',
        'A primary key linked to a foreign table',
        'A key generated by hashing multiple tables'
      ],
      answer: 0,
      explanation: 'A composite primary key uses two or more columns together to uniquely identify a record.'
    },
    {
      id: 'sql-19',
      q: 'What does the `DROP TABLE` command do?',
      opts: [
        'Empties rows while keeping table structure and schema intact',
        'Permanently deletes the table schema, definition, indexes, and all its data',
        'Hides the table from public SELECT queries',
        'Archives table records into CSV format'
      ],
      answer: 1,
      explanation: '`DROP TABLE` deletes the entire table structure, triggers, constraints, and data from the database schema.'
    },
    {
      id: 'sql-20',
      q: 'Which function returns the first non-null value among its arguments?',
      opts: ['NULLIF()', 'COALESCE()', 'IFNULL()', 'ISNULL()'],
      answer: 1,
      explanation: '`COALESCE(val1, val2, ...)` evaluates arguments in order and returns the current value of the first expression that does not evaluate to NULL.'
    },
    {
      id: 'sql-21',
      q: 'What is a Database View?',
      opts: [
        'A physical copy of table data stored in RAM',
        'A saved, named virtual table defined by a query that executes dynamically when queried',
        'A GUI tool used by database administrators',
        'A hardware monitor for disk usage'
      ],
      answer: 1,
      explanation: 'A view is a stored query that presents data from underlying tables as if it were a regular table.'
    },
    {
      id: 'sql-22',
      q: 'What is the defining characteristic of a Clustered Index?',
      opts: [
        'It stores pointers to rows stored elsewhere on disk',
        'It dictates the physical sorting and storage order of the actual table rows on disk',
        'A table can have up to 255 clustered indexes',
        'It is only used for caching full-text search strings'
      ],
      answer: 1,
      explanation: 'A clustered index sorts and stores the data rows in the table based on their key values (each table can have only one clustered index).'
    },
    {
      id: 'sql-23',
      q: 'What does the pattern `LIKE "%test"` match in SQL?',
      opts: [
        'Strings that start with "test"',
        'Strings that end with "test"',
        'Strings that contain "test" anywhere',
        'Exact string "test" only'
      ],
      answer: 1,
      explanation: 'The `%` wildcard matches zero or more characters, so `"%test"` matches any string ending with "test".'
    },
    {
      id: 'sql-24',
      q: 'What is the default sort order of the `ORDER BY` clause?',
      opts: ['DESC (Descending)', 'ASC (Ascending)', 'Random', 'Insertion order'],
      answer: 1,
      explanation: 'If unspecified, `ORDER BY` sorts values in ascending (`ASC`) order (from lowest to highest).'
    },
    {
      id: 'sql-25',
      q: 'What does `ON DELETE CASCADE` specify on a Foreign Key constraint?',
      opts: [
        'Prevents deletion of the referenced parent row',
        'Automatically deletes matching child rows when the referenced parent row is deleted',
        'Sets foreign key values in child rows to NULL upon parent deletion',
        'Sends an error notification to connected clients'
      ],
      answer: 1,
      explanation: '`ON DELETE CASCADE` automatically propagates deletions from parent tables down to related child records.'
    },
    {
      id: 'sql-26',
      q: 'What do SQL Window Functions (like `ROW_NUMBER() OVER (...)`) do?',
      opts: [
        'Open modal popup windows in web browsers',
        'Perform calculations across a set of table rows related to the current row without collapsing the rows into a single output group',
        'Encrypt table data during transmission over SSL',
        'Limit the number of database connections per client'
      ],
      answer: 1,
      explanation: 'Window functions perform calculations across partitions of rows while retaining individual row identities.'
    },
    {
      id: 'sql-27',
      q: 'Which SQL command is used to add or modify columns in an existing table?',
      opts: ['UPDATE TABLE', 'ALTER TABLE', 'MODIFY TABLE', 'CHANGE TABLE'],
      answer: 1,
      explanation: '`ALTER TABLE` is used to add, modify, or drop columns and constraints on existing tables.'
    },
    {
      id: 'sql-28',
      q: 'What is SQL Injection?',
      opts: [
        'A performance optimization technique for bulk inserting data',
        'A security vulnerability where malicious SQL commands are injected into input fields and executed by the database',
        'Automated database schema migration scripts',
        'Replication of database logs across regions'
      ],
      answer: 1,
      explanation: 'SQL Injection occurs when untrusted user inputs are concatenated directly into SQL queries rather than using parameterized queries.'
    },
    {
      id: 'sql-29',
      q: 'What is the purpose of a Database Transaction Savepoint?',
      opts: [
        'To export a database dump to an Amazon S3 bucket',
        'To establish a checkpoint within a transaction to which you can later roll back without discarding the entire transaction',
        'To lock the database against read queries',
        'To save user login sessions'
      ],
      answer: 1,
      explanation: 'Savepoints (`SAVEPOINT name`) allow partial rollbacks (`ROLLBACK TO name`) within a larger active transaction.'
    },
    {
      id: 'sql-30',
      q: 'What does a Cross Join (Cartesian Product) produce?',
      opts: [
        'Only matching rows between two tables',
        'Every row from the first table combined with every row from the second table (M × N rows)',
        'An empty result set',
        'A union of the two tables\' column names'
      ],
      answer: 1,
      explanation: 'A `CROSS JOIN` produces the Cartesian product of two tables, returning every possible combination of rows.'
    }
  ],

  system_design: [
    {
      id: 'sd-1',
      q: 'What is Horizontal Scaling (Scaling Out)?',
      opts: [
        'Adding more RAM, CPU, or storage to an existing single machine',
        'Adding more machines or servers to a pool of distributed resources',
        'Increasing screen resolution for user dashboards',
        'Compressing database indices'
      ],
      answer: 1,
      explanation: 'Horizontal scaling means adding more node instances to share workload, whereas vertical scaling means adding power to a single node.'
    },
    {
      id: 'sd-2',
      q: 'In the CAP Theorem, what does "Consistency" (C) guarantee?',
      opts: [
        'All client requests will succeed with 200 OK',
        'Every read receives the most recent write or an error',
        'The database schema remains immutable',
        'Transactions execute without locks'
      ],
      answer: 1,
      explanation: 'Consistency in CAP means all nodes see the same data at the same time, returning the latest write or an error.'
    },
    {
      id: 'sd-3',
      q: 'In the CAP Theorem, what does "Availability" (A) guarantee?',
      opts: [
        'Every non-failing node returns a non-error response for every request, without guarantee of containing the latest write',
        'Zero network latency for international users',
        'Servers never crash or reboot',
        'Data is replicated across 10 continents'
      ],
      answer: 0,
      explanation: 'Availability ensures that every non-failing node returns a reasonable response to every received request.'
    },
    {
      id: 'sd-4',
      q: 'In the CAP Theorem, what does "Partition Tolerance" (P) mean?',
      opts: [
        'The database partitions tables into horizontal shards',
        'The system continues to operate despite an arbitrary number of dropped or delayed messages between nodes (network partition)',
        'Users can partition their accounts into teams',
        'Disk drives can be partitioned into FAT32 or NTFS'
      ],
      answer: 1,
      explanation: 'Partition tolerance means the distributed system functions properly even when network communication between nodes breaks down.'
    },
    {
      id: 'sd-5',
      q: 'What is the primary function of a Load Balancer?',
      opts: [
        'To distribute incoming network traffic across multiple backend servers to prevent overload and maximize throughput',
        'To convert SQL queries into NoSQL documents',
        'To monitor disk hardware temperatures',
        'To encrypt user hard drives'
      ],
      answer: 0,
      explanation: 'Load balancers sit between clients and backend servers, evenly distributing incoming requests based on algorithms like round-robin or least-connections.'
    },
    {
      id: 'sd-6',
      q: 'Which caching strategy writes data to both the cache and the primary database simultaneously before returning success?',
      opts: ['Write-Around', 'Write-Back (Write-Behind)', 'Write-Through', 'Cache-Aside'],
      answer: 2,
      explanation: 'In Write-Through caching, writes are written to the cache and the permanent database synchronously, ensuring strong data consistency.'
    },
    {
      id: 'sd-7',
      q: 'What is Database Sharding?',
      opts: [
        'Creating read-only mirrors of the entire database',
        'Horizontally partitioning data so that subsets of rows reside across distinct database server instances',
        'Backing up database tables to cold magnetic tape',
        'Converting relational tables into graph models'
      ],
      answer: 1,
      explanation: 'Sharding splits a large dataset horizontally across multiple database servers based on a shard key.'
    },
    {
      id: 'sd-8',
      q: 'What is a CDN (Content Delivery Network) primarily used for?',
      opts: [
        'Deploying machine learning models to mobile devices',
        'Serving cached static assets (images, videos, JS/CSS) from edge servers physically close to users to reduce latency',
        'Running complex database stored procedures',
        'Managing employee email accounts'
      ],
      answer: 1,
      explanation: 'A CDN is a distributed network of edge servers that delivers web content geographically close to users, cutting down round-trip latency.'
    },
    {
      id: 'sd-9',
      q: 'Why are Message Queues (like RabbitMQ or Apache Kafka) introduced into system architectures?',
      opts: [
        'To replace SQL databases for transaction processing',
        'To decouple systems and enable asynchronous, non-blocking communication and buffer traffic spikes',
        'To serve frontend HTML pages directly to users',
        'To eliminate the need for load balancers'
      ],
      answer: 1,
      explanation: 'Message queues decouple producer and consumer services, enabling asynchronous processing and smoothing out traffic spikes.'
    },
    {
      id: 'sd-10',
      q: 'What is a Reverse Proxy?',
      opts: [
        'A proxy that allows internal employees to browse external websites anonymously',
        'A server that sits in front of backend web servers, intercepting requests to provide caching, SSL termination, and security',
        'A DNS resolver that maps domain names to IP addresses',
        'A database connection pool manager'
      ],
      answer: 1,
      explanation: 'A reverse proxy (such as NGINX or HAProxy) shields origin servers, handling SSL termination, compression, and request routing.'
    },
    {
      id: 'sd-11',
      q: 'What is Consistent Hashing commonly used for in distributed systems?',
      opts: [
        'To encrypt user passwords in database tables',
        'To distribute keys across nodes in a distributed cache so that adding or removing a node re-maps only a minimal fraction of keys (K/N)',
        'To verify file checksums during downloads',
        'To authenticate JSON Web Tokens'
      ],
      answer: 1,
      explanation: 'Consistent hashing maps keys and nodes onto a circular hash ring, preventing massive cache stampedes when cluster nodes scale.'
    },
    {
      id: 'sd-12',
      q: 'What is the purpose of the Circuit Breaker pattern in microservices?',
      opts: [
        'To cut power to overheated server hardware',
        'To prevent an application from repeatedly invoking a failing remote service, avoiding cascading failures across the system',
        'To disconnect idle database connections after 30 seconds',
        'To block unauthorized IP addresses from visiting a website'
      ],
      answer: 1,
      explanation: 'A circuit breaker trips when failure thresholds are exceeded, returning immediate fallbacks and allowing the troubled service time to recover.'
    },
    {
      id: 'sd-13',
      q: 'What does Idempotency mean in API and system design?',
      opts: [
        'An operation that executes in under 1 millisecond',
        'An operation that can be applied multiple times without changing the result beyond the initial application',
        'An API endpoint that requires multi-factor authentication',
        'A database query that uses zero CPU resources'
      ],
      answer: 1,
      explanation: 'An idempotent request (such as HTTP PUT or DELETE) can be safely retried without unintended side-effects (e.g. charging a card twice).'
    },
    {
      id: 'sd-14',
      q: 'What is the difference between Latency and Throughput?',
      opts: [
        'Latency is the time taken to process a single request; Throughput is the number of requests processed per unit of time',
        'Latency is data size; Throughput is server uptime',
        'Throughput is measured in milliseconds; Latency is measured in requests/sec',
        'There is no difference'
      ],
      answer: 0,
      explanation: 'Latency measures duration/delay (e.g. milliseconds); throughput measures volume/capacity (e.g. requests per second).'
    },
    {
      id: 'sd-15',
      q: 'What is a Database Read Replica used for?',
      opts: [
        'Executing master write transactions exclusively',
        'Offloading read-heavy queries from the primary database to improve read scalability and performance',
        'Backing up deleted records permanently',
        'Generating SSL certificates'
      ],
      answer: 1,
      explanation: 'Read replicas replicate data from the primary database asynchronously to handle read traffic without burdening the write primary.'
    },
    {
      id: 'sd-16',
      q: 'What is Cache Invalidation, and why is it notoriously challenging?',
      opts: [
        'Purging dead connections; it is difficult due to hardware limits',
        'Ensuring cached data matches underlying source data when updates occur without serving stale data or causing cache stampedes',
        'Renewing SSL certificates before expiry',
        'Allocating memory addresses in C++'
      ],
      answer: 1,
      explanation: 'Cache invalidation ensures cached copies are kept up to date or evicted when mutations occur, balancing freshness and performance.'
    },
    {
      id: 'sd-17',
      q: 'Which communication protocol establishes a persistent, full-duplex TCP connection between client and server?',
      opts: ['HTTP/1.0', 'WebSocket', 'DNS', 'SMTP'],
      answer: 1,
      explanation: 'WebSocket provides bidirectional, real-time communication over a single long-lived TCP connection.'
    },
    {
      id: 'sd-18',
      q: 'How does the Cache-Aside (Lazy Loading) caching pattern work?',
      opts: [
        'The cache loads all database tables into RAM at system startup',
        'The application first checks the cache; on a cache miss, it reads from the database and populates the cache for subsequent reads',
        'The database writes to the cache in the background automatically',
        'Cache writes happen without writing to the database'
      ],
      answer: 1,
      explanation: 'With Cache-Aside, the application code directly orchestrates reads from the cache and backfills misses from the primary data store.'
    },
    {
      id: 'sd-19',
      q: 'What is a Single Point of Failure (SPOF)?',
      opts: [
        'A software bug that causes a 404 error',
        'A single component of a system that, if it ceases to function, will cause the entire system to fail',
        'An encryption key used by only one employee',
        'A network cable connected to one workstation'
      ],
      answer: 1,
      explanation: 'A SPOF is any critical component whose lack of redundancy threatens the availability of the entire architecture.'
    },
    {
      id: 'sd-20',
      q: 'What is Rate Limiting used for in API design?',
      opts: [
        'Slowing down all user requests to reduce CPU power bills',
        'Controlling the rate of incoming requests from clients to prevent abuse, DoS attacks, and resource starvation',
        'Limiting database row counts to 1,000 items',
        'Enforcing maximum password lengths'
      ],
      answer: 1,
      explanation: 'Rate limiting constrains the frequency of requests a client can make within a given time window (e.g. 100 requests per minute).'
    },
    {
      id: 'sd-21',
      q: 'Which algorithm is commonly used for implementing API Rate Limiting?',
      opts: ['Token Bucket / Leaky Bucket', 'Dijkstra\'s Shortest Path', 'Binary Search', 'Quicksort'],
      answer: 0,
      explanation: 'Token Bucket and Leaky Bucket algorithms track available request capacity over time with a constant refill rate.'
    },
    {
      id: 'sd-22',
      q: 'What is Eventual Consistency in distributed data stores?',
      opts: [
        'Data will never be consistent across nodes',
        'A consistency model guaranteeing that if no new updates are made, all replicas will eventually return the latest value',
        'Writes are blocked until every node in the world confirms the write',
        'Data is erased every 24 hours'
      ],
      answer: 1,
      explanation: 'Eventual consistency guarantees that all replicas will converge on identical states given sufficient time without new mutations.'
    },
    {
      id: 'sd-23',
      q: 'What is an API Gateway in a microservice architecture?',
      opts: [
        'A firewall that blocks all HTTP connections',
        'A centralized reverse proxy service providing a single entry point for clients, handling routing, authentication, rate limiting, and telemetry',
        'A hardware router installed in an office server closet',
        'A database ORM tool'
      ],
      answer: 1,
      explanation: 'An API Gateway simplifies client interactions by aggregating microservices, terminating auth, and directing traffic.'
    },
    {
      id: 'sd-24',
      q: 'What does SLA stand for in enterprise system infrastructure?',
      opts: ['System Log Algorithm', 'Service Level Agreement', 'Server Load Architecture', 'Software License Authorization'],
      answer: 1,
      explanation: 'An SLA is a formal commitment between a service provider and customer specifying metrics like uptime (e.g. 99.99%).'
    },
    {
      id: 'sd-25',
      q: 'What is Database Connection Pooling?',
      opts: [
        'Opening a brand new database connection on every single HTTP request',
        'Maintaining a cache of open database connections that can be reused across incoming requests, avoiding connection setup latency',
        'Sharing database access with third-party partners publicly',
        'Combining SQL and NoSQL tables into one query'
      ],
      answer: 1,
      explanation: 'Connection pooling avoids the significant overhead of handshaking new database connections for every query by reusing a warm pool.'
    },
    {
      id: 'sd-26',
      q: 'What is Distributed Tracing (such as with OpenTelemetry or Jaeger)?',
      opts: [
        'Drawing network topology diagrams manually',
        'Tracking the end-to-end lifecycle and timing of requests as they flow across multiple distributed microservices using Correlation IDs',
        'Backtracking Git commits across repository branches',
        'Tracking physical delivery trucks via GPS'
      ],
      answer: 1,
      explanation: 'Distributed tracing tracks requests through microservice boundaries using unique trace IDs to diagnose latency bottlenecks.'
    },
    {
      id: 'sd-27',
      q: 'When would you prefer a NoSQL document database (e.g. MongoDB) over a traditional relational SQL database?',
      opts: [
        'When you require strict multi-table ACID transactions and normalized schemas',
        'When handling rapidly evolving, unstructured/polymorphic data models and needing horizontal scalability with flexible schemas',
        'When storing banking transaction ledgers exclusively',
        'When you have only 100 rows of static data'
      ],
      answer: 1,
      explanation: 'Document stores excel with hierarchical, dynamic schemas that benefit from document-oriented access patterns and seamless horizontal sharding.'
    },
    {
      id: 'sd-28',
      q: 'What is a "Thundering Herd" (Cache Stampede) problem?',
      opts: [
        'When thousands of simultaneous requests experience a cache miss for the same expired key and simultaneously overwhelm the database',
        'When too many developers push commits to master simultaneously',
        'When hard drives fill to 100% capacity',
        'When CSS animations consume excessive GPU cycles'
      ],
      answer: 0,
      explanation: 'A cache stampede occurs when high concurrency causes many parallel cache misses to hit the database at once; mutex locks mitigate this.'
    },
    {
      id: 'sd-29',
      q: 'What is the purpose of Data Redundancy across different geographical availability zones?',
      opts: [
        'Wasting disk storage to inflate infrastructure bills',
        'Ensuring disaster recovery, business continuity, and zero data loss if an entire data center experiences a catastrophic outage',
        'Speeding up code compilation times',
        'Translating English text into foreign languages'
      ],
      answer: 1,
      explanation: 'Multi-AZ replication safeguards applications against localized disasters (power grid failure, earthquakes) ensuring high availability.'
    },
    {
      id: 'sd-30',
      q: 'What is Write-Behind (Write-Back) caching?',
      opts: [
        'Writes are written directly to cache and immediately acknowledged; the cache asynchronously writes back to the database in batches',
        'Writes bypass cache completely and write directly to disk',
        'The database writes to the cache only after a 24-hour delay',
        'Cache updates are discarded if the network is busy'
      ],
      answer: 0,
      explanation: 'Write-Back provides extremely low write latency by confirming writes as soon as they hit RAM cache, deferring database writes.'
    }
  ],

  uiux: [
    {
      id: 'uiux-1',
      q: 'What does "UX" stand for in digital design?',
      opts: ['User Extension', 'User Experience', 'User Execution', 'Universal XML'],
      answer: 1,
      explanation: 'UX stands for User Experience—encompassing all aspects of the end-user\'s interaction with the company, its services, and its products.'
    },
    {
      id: 'uiux-2',
      q: 'What does "UI" stand for?',
      opts: ['User Interface', 'Universal Integration', 'User Input', 'Unit Interaction'],
      answer: 0,
      explanation: 'UI stands for User Interface—the graphical and touchpoint visual surfaces through which a user interacts with a digital product.'
    },
    {
      id: 'uiux-3',
      q: 'What is the primary purpose of a Wireframe?',
      opts: [
        'To establish final brand color palettes and typography pairings',
        'To establish structural layout, information hierarchy, and content placement at low fidelity before visual design',
        'To write frontend HTML and Tailwind CSS code directly',
        'To finalize PostgreSQL database schemas'
      ],
      answer: 1,
      explanation: 'Wireframes are low-fidelity blueprints focusing on screen structure, layout, and functionality without color or visual styling.'
    },
    {
      id: 'uiux-4',
      q: 'What does "Responsive Web Design" mean?',
      opts: [
        'A website that answers user questions via AI chatbots',
        'A design that dynamically adapts its layout and elements to provide optimal viewing across varied screen sizes and devices',
        'A design that operates in dark mode exclusively',
        'A website that loads in under 100 milliseconds'
      ],
      answer: 1,
      explanation: 'Responsive design uses flexible grids, media queries, and responsive images to look and function great on mobile, tablet, and desktop.'
    },
    {
      id: 'uiux-5',
      q: 'What is Fitts\'s Law in human-computer interaction?',
      opts: [
        'Users spend most of their time on other websites',
        'The time required to rapidly move to a target area is a function of the target distance and the target size',
        'Every design should use exactly 3 colors',
        'Users can only remember 7 items at once'
      ],
      answer: 1,
      explanation: 'Fitts\'s Law states that larger and closer targets (like full-width buttons at the bottom of mobile screens) are faster and easier to tap.'
    },
    {
      id: 'uiux-6',
      q: 'What is the 60-30-10 Rule in UI color distribution?',
      opts: [
        '60% text, 30% images, 10% buttons',
        '60% dominant base color, 30% secondary structure color, and 10% accent color for calls to action',
        '60 minutes designing, 30 minutes testing, 10 minutes deploying',
        '60% desktop traffic, 30% mobile, 10% tablet'
      ],
      answer: 1,
      explanation: 'The 60-30-10 rule provides visual balance: 60% neutral/dominant canvas, 30% secondary contrast, and 10% bold accent for key interactions.'
    },
    {
      id: 'uiux-7',
      q: 'What is A/B Testing in product development?',
      opts: [
        'Testing compatibility between iOS and Android',
        'Comparing two variations of a page or element (A and B) with live users to measure which achieves higher conversion or engagement',
        'Testing code for unit and integration errors',
        'Testing accessibility contrast ratios'
      ],
      answer: 1,
      explanation: 'A/B testing splits traffic between variants to statistically determine which design or copy yields better user outcomes.'
    },
    {
      id: 'uiux-8',
      q: 'What is "White Space" (Negative Space) in graphic and UI design?',
      opts: [
        'Areas of the canvas intentionally left blank to improve readability, visual breathing room, and focus',
        'Empty space reserved for banner advertisements',
        'A blank error screen displayed on 500 server errors',
        'Space that must be colored pure white `#ffffff`'
      ],
      answer: 0,
      explanation: 'Negative space is the unmarked area between design elements that prevents clutter and establishes visual clarity.'
    },
    {
      id: 'uiux-9',
      q: 'What is a "User Persona" in UX research?',
      opts: [
        'A real user\'s private profile account',
        'A research-based archetype representing the goals, pain points, and behavioral patterns of a specific target user segment',
        'An anonymous avatar chosen in settings',
        'A legal terms of service document'
      ],
      answer: 1,
      explanation: 'Personas synthesize user research into realistic composite profiles to guide empathetic, user-centered product decisions.'
    },
    {
      id: 'uiux-10',
      q: 'What is a Call to Action (CTA)?',
      opts: [
        'A phone number in a footer',
        'A clear, prominent interactive element (like a button) that directs users toward taking a desired action (e.g. "Get Started", "Submit")',
        'An error toast notification',
        'A modal dialog warning about session expiry'
      ],
      answer: 1,
      explanation: 'A CTA is a visually prominent prompt designed to encourage immediate user action and advance user conversion.'
    },
    {
      id: 'uiux-11',
      q: 'What does Hick\'s Law state regarding user decision-making?',
      opts: [
        'The time it takes to make a decision increases logarithmically with the number and complexity of choices presented',
        'Users always click the top-left button first',
        'Complex interfaces are perceived as more powerful',
        'Decisions are always made in under 3 seconds'
      ],
      answer: 0,
      explanation: 'Hick\'s Law demonstrates that offering too many choices increases cognitive overload and decision latency.'
    },
    {
      id: 'uiux-12',
      q: 'What does "WCAG" stand for in digital accessibility?',
      opts: [
        'Web Content Accessibility Guidelines',
        'Web Color Application Guidelines',
        'World Consortium Accessibility Group',
        'Web Component Architecture Guide'
      ],
      answer: 0,
      explanation: 'WCAG provides international standards for making web content accessible to individuals with disabilities.'
    },
    {
      id: 'uiux-13',
      q: 'What is the minimum contrast ratio recommended by WCAG AA for normal body text against its background?',
      opts: ['2:1', '3:1', '4.5:1', '7:1'],
      answer: 2,
      explanation: 'WCAG 2.1 Level AA mandates a contrast ratio of at least 4.5:1 for standard text (and 3:1 for large text).'
    },
    {
      id: 'uiux-14',
      q: 'What is a Design System?',
      opts: [
        'A software development lifecycle methodology',
        'A comprehensive single source of truth containing reusable UI components, design tokens (colors, typography), patterns, and brand standards',
        'A hardware design specifications manual',
        'An operating system theme'
      ],
      answer: 1,
      explanation: 'Design systems (like Material Design or Polaris) ensure visual consistency and development speed across an entire product ecosystem.'
    },
    {
      id: 'uiux-15',
      q: 'What does Miller\'s Law state regarding human working memory capacity?',
      opts: [
        'The average human can only hold 7 (plus or minus 2) items in their working memory at one time',
        'Humans read web pages in a Z-pattern only',
        'Users retain memories of advertisements for 7 days',
        'Users decide whether to stay on a page within 7 seconds'
      ],
      answer: 0,
      explanation: 'George Miller\'s cognitive psychology law highlights that working memory chunks information into approximately 5 to 9 items.'
    },
    {
      id: 'uiux-16',
      q: 'What is a User Journey Map?',
      opts: [
        'A GPS tracking map of where users open an app',
        'A visual timeline illustrating the step-by-step phases, touchpoints, thoughts, and emotions a user experiences while pursuing a goal',
        'A site sitemap listing all URLs in XML',
        'A flowchart of backend database tables'
      ],
      answer: 1,
      explanation: 'Journey maps visualize the end-to-end customer experience, identifying user friction and opportunities for delight.'
    },
    {
      id: 'uiux-17',
      q: 'What is "Card Sorting" used for in Information Architecture?',
      opts: [
        'A card game played during design sprints',
        'A research method where participants organize topics into categories to help structure website navigation and content menus intuitively',
        'Sorting credit card payments by transaction date',
        'Arranging Kanban boards in Agile development'
      ],
      answer: 1,
      explanation: 'Card sorting reveals mental models, informing natural menu labels, taxonomy, and navigation architecture.'
    },
    {
      id: 'uiux-18',
      q: 'What is a Heuristic Evaluation in UX inspection?',
      opts: [
        'An automated algorithm checking for broken links',
        'An expert review where evaluators examine an interface against recognized usability principles (such as Nielsen\'s 10 Heuristics)',
        'A quantitative survey sent to 1,000 customers',
        'A server load test during peak traffic'
      ],
      answer: 1,
      explanation: 'Heuristic evaluation involves usability specialists evaluating an interface against established UX rules of thumb.'
    },
    {
      id: 'uiux-19',
      q: 'What does "Visual Hierarchy" mean in UI design?',
      opts: [
        'The alphabetical ordering of code files in a repository',
        'Arranging elements intentionally using scale, weight, contrast, and spacing to signal relative importance and direct the user\'s gaze',
        'Using 3D drop shadows on all elements',
        'Placing company logos in every corner'
      ],
      answer: 1,
      explanation: 'Visual hierarchy guides the viewer\'s eye through content in order of priority, facilitating effortless scanning.'
    },
    {
      id: 'uiux-20',
      q: 'What is a "Micro-interaction" in UI design?',
      opts: [
        'A sub-second database query',
        'Subtle, contained visual animations or audio/haptic feedback centered on a single task (e.g. toggling a switch, liking a post)',
        'An interaction between two microservices',
        'A tiny banner advertisement'
      ],
      answer: 1,
      explanation: 'Micro-interactions communicate status, confirm actions, and provide satisfying feedback to enrich user engagement.'
    },
    {
      id: 'uiux-21',
      q: 'What is a "Skeleton Screen" loading state?',
      opts: [
        'A Halloween themed website design',
        'A blank page showing a spinning wheel exclusively',
        'A low-fidelity placeholder wireframe mimicking the incoming layout to reduce perceived waiting time',
        'A screen warning the user about battery depletion'
      ],
      answer: 2,
      explanation: 'Skeleton screens display light gray placeholder shapes simulating content layout while real data loads, lowering perceived latency.'
    },
    {
      id: 'uiux-22',
      q: 'What is the Gestalt Law of Proximity?',
      opts: [
        'Objects positioned near one another are naturally perceived as belonging to a unified group',
        'Objects with the same color are perceived as related',
        'Visual elements must always touch each other',
        'Items at the bottom of the screen have highest priority'
      ],
      answer: 0,
      explanation: 'The Law of Proximity states that spatial closeness triggers human perception to group individual items into a single cognitive unit.'
    },
    {
      id: 'uiux-23',
      q: 'What is an "Affordance" in product design?',
      opts: [
        'The monetary price of a software license',
        'A property or visual clue that immediately indicates how an object can or should be used (e.g. a 3D button affording pushing)',
        'The maximum load capacity of a server',
        'The speed of user internet connections'
      ],
      answer: 1,
      explanation: 'An affordance is a perceptual cue that communicates possible actions without requiring explicit instructions.'
    },
    {
      id: 'uiux-24',
      q: 'What is "Mobile-First" design philosophy?',
      opts: [
        'Designing solely for mobile phones and ignoring desktop computers completely',
        'Designing the mobile layout first to focus on core content and constraints, then progressively enhancing for larger desktop viewports',
        'Developing native iOS Swift apps before web apps',
        'Forcing desktop users to download an APK'
      ],
      answer: 1,
      explanation: 'Mobile-first prioritizes essential features under strict space constraints before progressively layering complexity on wider displays.'
    },
    {
      id: 'uiux-25',
      q: 'Why should HTML form `<input>` fields always have explicit `<label>` tags?',
      opts: [
        'To speed up page download speeds',
        'For accessibility: screen readers announce labels, and clicking the label enlarges the interactive tap target area for the input',
        'Because browsers refuse to render unlabeled inputs',
        'To automatically validate email syntax'
      ],
      answer: 1,
      explanation: 'Labels ensure screen reader users understand what data is requested and expand the clickable/tappable hitbox.'
    },
    {
      id: 'uiux-26',
      q: 'What is "Breadcrumb Navigation"?',
      opts: [
        'A trail of advertising banners',
        'A secondary navigation aid showing the user\'s current hierarchical location within the website structure (e.g. Home > Shop > Shoes)',
        'A cookie tracking user browsing history across websites',
        'A pagination component showing page numbers 1, 2, 3'
      ],
      answer: 1,
      explanation: 'Breadcrumbs help users understand their current location in the site hierarchy and easily navigate back to parent categories.'
    },
    {
      id: 'uiux-27',
      q: 'What is "Leading" in typography?',
      opts: [
        'The horizontal space between individual letter characters',
        'The vertical distance (line height) between baselines of successive lines of text',
        'The primary headline of a webpage',
        'The boldest font weight in a family'
      ],
      answer: 1,
      explanation: 'Leading (pronounced "led-ing", derived from lead typesetting strips) refers to vertical line spacing and affects paragraph readability.'
    },
    {
      id: 'uiux-28',
      q: 'What is "Kerning" in typography?',
      opts: [
        'The adjustment of horizontal space between specific pairs of characters for visual harmony',
        'The vertical line height of a paragraph',
        'The tilt angle of italicized fonts',
        'The thickness of font serifs'
      ],
      answer: 0,
      explanation: 'Kerning adjusts spacing between individual character pairs (like \'AV\' or \'To\') to eliminate awkward visual gaps.'
    },
    {
      id: 'uiux-29',
      q: 'What is the primary goal of User Onboarding in digital products?',
      opts: [
        'To collect credit card information immediately',
        'To guide new users seamlessly to their "Aha!" moment where they experience the product\'s core value and learn essential workflows',
        'To force users to read the entire privacy policy',
        'To display every single configuration setting available'
      ],
      answer: 1,
      explanation: 'Effective onboarding accelerates time-to-value, reduces early churn, and equips users to succeed autonomously.'
    },
    {
      id: 'uiux-30',
      q: 'Which file format is standard for vector UI icons that scale infinitely without pixelation?',
      opts: ['JPG', 'PNG', 'SVG', 'GIF'],
      answer: 2,
      explanation: 'SVG (Scalable Vector Graphics) is an XML-based vector image format that scales crisply to any resolution or screen density.'
    }
  ],

  ml: [
    {
      id: 'ml-1',
      q: 'What is Supervised Learning in Machine Learning?',
      opts: [
        'Training a model where human operators watch the computer screen in real time',
        'Training a model using labeled dataset where input features are paired with ground-truth target outputs',
        'Training algorithms without any historical data',
        'Clustering unlabeled data into unknown groups'
      ],
      answer: 1,
      explanation: 'Supervised learning algorithms learn a mapping function from input features to target labels using labeled training pairs.'
    },
    {
      id: 'ml-2',
      q: 'What is "Overfitting" in machine learning?',
      opts: [
        'When a model is too simplistic to capture underlying patterns',
        'When a model learns the training data and noise too closely, performing exceptionally on training data but poorly on unseen test data',
        'When a neural network has too few parameters',
        'When data files exceed hard drive storage capacity'
      ],
      answer: 1,
      explanation: 'Overfitting occurs when a high-variance model memorizes training noise and fails to generalize to fresh, unseen data.'
    },
    {
      id: 'ml-3',
      q: 'What is "Underfitting"?',
      opts: [
        'When a model is too complex and over-parameterized',
        'When a model is too simple to capture the underlying structure or trends in the data, performing poorly on both training and test data',
        'When training finishes in under one minute',
        'When datasets contain zero missing values'
      ],
      answer: 1,
      explanation: 'Underfitting represents high bias: the model lacks sufficient expressive power or features to learn the relationship.'
    },
    {
      id: 'ml-4',
      q: 'What is the purpose of Regularization (like L1 Lasso or L2 Ridge) in model training?',
      opts: [
        'To speed up GPU cooling fans',
        'To add a penalty term on large model weights to the loss function, discouraging complexity and preventing overfitting',
        'To convert continuous numbers into integers',
        'To encrypt trained model files'
      ],
      answer: 1,
      explanation: 'Regularization penalizes extreme weight coefficients, promoting simpler, more robust models that generalize better.'
    },
    {
      id: 'ml-5',
      q: 'What does a Confusion Matrix display for a classification model?',
      opts: [
        'A table detailing prediction outcomes: True Positives, False Positives, True Negatives, and False Negatives',
        'The convergence rate of gradient descent over time',
        'The distribution of missing values across feature columns',
        'The memory usage of each layer in a neural network'
      ],
      answer: 0,
      explanation: 'A confusion matrix cross-tabulates predicted class labels against true ground-truth labels.'
    },
    {
      id: 'ml-6',
      q: 'What is the formula for Precision in binary classification?',
      opts: [
        'True Positives / (True Positives + False Positives)',
        'True Positives / (True Positives + False Negatives)',
        '(True Positives + True Negatives) / Total Samples',
        'False Positives / (True Positives + True Negatives)'
      ],
      answer: 0,
      explanation: 'Precision answers: "Out of all instances predicted as positive, how many were actually positive?" (TP / (TP + FP)).'
    },
    {
      id: 'ml-7',
      q: 'What is the formula for Recall (Sensitivity)?',
      opts: [
        'True Positives / (True Positives + False Negatives)',
        'True Positives / (True Positives + False Positives)',
        'True Negatives / (True Negatives + False Positives)',
        'False Negatives / Total Samples'
      ],
      answer: 0,
      explanation: 'Recall answers: "Out of all actual positive instances in the data, how many did the model correctly find?" (TP / (TP + FN)).'
    },
    {
      id: 'ml-8',
      q: 'What is the F1-Score?',
      opts: [
        'The arithmetic mean of accuracy and loss',
        'The harmonic mean of Precision and Recall, balancing both metrics in uneven class distributions',
        'The time required to finish one epoch of training',
        'The total number of false alarms'
      ],
      answer: 1,
      explanation: 'The F1-score is 2 * (Precision * Recall) / (Precision + Recall), giving balanced evaluation especially on imbalanced datasets.'
    },
    {
      id: 'ml-9',
      q: 'What does PCA (Principal Component Analysis) do?',
      opts: [
        'Trains deep convolutional neural networks for vision',
        'Performs linear dimensionality reduction by projecting data onto orthogonal directions of maximum variance',
        'Sorts database columns in alphabetical order',
        'Classifies text into sentiment categories'
      ],
      answer: 1,
      explanation: 'PCA identifies the principal axes of greatest variance in high-dimensional data, reducing dimensionality with minimal loss of information.'
    },
    {
      id: 'ml-10',
      q: 'What is Gradient Descent in machine learning optimization?',
      opts: [
        'A sorting algorithm for large arrays',
        'An iterative optimization algorithm that updates parameters in the opposite direction of the gradient of the loss function to find a minimum',
        'A technique for generating CSS color gradients',
        'A tree pruning method'
      ],
      answer: 1,
      explanation: 'Gradient descent computes loss derivatives with respect to weights and takes steps in the direction of steepest descent.'
    },
    {
      id: 'ml-11',
      q: 'What is the difference between Classification and Regression tasks?',
      opts: [
        'Classification predicts discrete categorical labels; Regression predicts continuous numerical quantities',
        'Regression predicts categories; Classification predicts numbers',
        'Classification is unsupervised; Regression is supervised',
        'There is no mathematical difference'
      ],
      answer: 0,
      explanation: 'Classification outputs discrete classes (e.g. spam/not-spam); regression outputs continuous values (e.g. house price).'
    },
    {
      id: 'ml-12',
      q: 'What is the purpose of a Validation Dataset during machine learning experiments?',
      opts: [
        'To train the final weights of the model',
        'To evaluate the model and tune hyperparameters (e.g. learning rate, tree depth) without biasing test set evaluation',
        'To replace the training set completely',
        'To encrypt user data before feeding it to GPUs'
      ],
      answer: 1,
      explanation: 'Validation data provides an unbiased evaluation during model selection and hyperparameter tuning, keeping the test set pristine.'
    },
    {
      id: 'ml-13',
      q: 'In the K-Means clustering algorithm, what does the parameter "k" specify?',
      opts: [
        'The number of iterations to run',
        'The number of distinct clusters to partition the observations into',
        'The number of nearest neighbors to search for',
        'The learning rate multiplier'
      ],
      answer: 1,
      explanation: 'In K-Means, \'k\' is the predefined number of cluster centroids to discover.'
    },
    {
      id: 'ml-14',
      q: 'What is the "Vanishing Gradient" problem in deep neural networks?',
      opts: [
        'When gradients become infinitely large and cause numeric overflow',
        'When gradients become exponentially small as they backpropagate through deep layers, preventing early layers from updating their weights',
        'When the dataset runs out of training samples',
        'When loss function values become negative'
      ],
      answer: 1,
      explanation: 'During backpropagation in deep networks with saturating activations, gradients shrink toward zero, halting learning in initial layers.'
    },
    {
      id: 'ml-15',
      q: 'Which activation function is defined as `f(x) = max(0, x)`?',
      opts: ['Sigmoid', 'Tanh', 'ReLU (Rectified Linear Unit)', 'Softmax'],
      answer: 2,
      explanation: 'ReLU outputs `x` if positive and 0 otherwise, overcoming vanishing gradient issues and offering fast computation.'
    },
    {
      id: 'ml-16',
      q: 'Which activation function squashes any real-valued input into the range (0, 1), often used for binary probability output?',
      opts: ['ReLU', 'Sigmoid', 'Linear', 'Step'],
      answer: 1,
      explanation: 'The Sigmoid function `1 / (1 + e^-x)` maps real values into (0, 1), making it suitable for binary classification probabilities.'
    },
    {
      id: 'ml-17',
      q: 'What is K-Fold Cross-Validation?',
      opts: [
        'Splitting data into K subsets, training K times using each subset once as validation and the rest as training, then averaging performance',
        'Running training on K parallel GPU machines',
        'Multiplying the learning rate by K at each epoch',
        'Folding paper printouts of loss charts K times'
      ],
      answer: 0,
      explanation: 'K-Fold cross-validation provides a robust estimate of generalization error by rotating validation splits across K partitions.'
    },
    {
      id: 'ml-18',
      q: 'Why is Feature Scaling (Normalization / Standardization) essential for algorithms like KNN, SVM, and Neural Networks?',
      opts: [
        'Because features with much larger numerical scales would disproportionately dominate distance calculations and gradient updates',
        'To reduce dataset file sizes on hard drives',
        'To convert categorical strings into numbers',
        'Because computer processors can only calculate numbers between 0 and 1'
      ],
      answer: 0,
      explanation: 'Distance-based and gradient-descent algorithms are sensitive to magnitude differences; scaling puts all features on equal footing.'
    },
    {
      id: 'ml-19',
      q: 'What is the goal of an agent in Reinforcement Learning?',
      opts: [
        'To accurately classify images into 1,000 ImageNet categories',
        'To take actions in an environment to maximize cumulative numerical reward over time',
        'To minimize database query latency',
        'To compress neural network weight matrices'
      ],
      answer: 1,
      explanation: 'Reinforcement learning agents learn policies via trial-and-error interaction to maximize expected cumulative rewards.'
    },
    {
      id: 'ml-20',
      q: 'What is the Bias-Variance Tradeoff in machine learning?',
      opts: [
        'A model cannot have high bias without zero loss',
        'Models with high bias underfit (too simple); models with high variance overfit (too sensitive to training noise); optimal models balance both',
        'Trading GPU speed for CPU RAM capacity',
        'Choosing between supervised and unsupervised learning'
      ],
      answer: 1,
      explanation: 'Total error = Bias² + Variance + Irreducible Error. Minimizing total error requires finding the sweet spot between underfitting and overfitting.'
    },
    {
      id: 'ml-21',
      q: 'What is an Ensemble Method in machine learning?',
      opts: [
        'Using multiple computer monitors to monitor training loss',
        'Techniques that combine predictions from multiple base models (e.g. bagging, boosting) to achieve superior predictive accuracy and robustness',
        'A method that clusters data without algorithms',
        'A collection of Python scripts in a folder'
      ],
      answer: 1,
      explanation: 'Ensembles (like Random Forests or XGBoost) combine diverse weaker models into a strong, resilient meta-model.'
    },
    {
      id: 'ml-22',
      q: 'How does a Random Forest model make predictions?',
      opts: [
        'By training a single giant deep decision tree with unlimited depth',
        'By constructing an ensemble of decision trees trained on random bootstrap samples and features, aggregating their votes or averages',
        'By running K-Means clustering on tree leaves',
        'By solving linear matrix algebra equations'
      ],
      answer: 1,
      explanation: 'Random Forest builds multiple decorrelated decision trees on random data/feature subsets and averages their predictions to reduce variance.'
    },
    {
      id: 'ml-23',
      q: 'What does "Epoch" mean in deep neural network training?',
      opts: [
        'The time it takes for one mini-batch to complete forward propagation',
        'One complete forward and backward pass of the entire training dataset through the neural network',
        'The point at which a model begins to overfit',
        'A single layer in a convolutional network'
      ],
      answer: 1,
      explanation: 'One epoch signifies that every training sample has been seen once by the learning algorithm.'
    },
    {
      id: 'ml-24',
      q: 'What is "Transfer Learning" in modern deep learning?',
      opts: [
        'Transferring model weights from one GPU server to another across a network cable',
        'Taking a model pre-trained on a massive dataset and fine-tuning it on a smaller, domain-specific task',
        'Converting PyTorch models into TensorFlow formats',
        'Transferring training responsibilities between team members'
      ],
      answer: 1,
      explanation: 'Transfer learning leverages general feature representations learned from vast datasets (e.g. ImageNet, BERT), requiring less data and training time.'
    },
    {
      id: 'ml-25',
      q: 'What does "One-Hot Encoding" do for categorical features?',
      opts: [
        'Assigns random floating-point numbers to categories',
        'Converts categorical variables into binary vectors with a length equal to the number of categories, where exactly one bit is 1 and all others 0',
        'Compresses text into gzip archives',
        'Sorts categories by frequency of appearance'
      ],
      answer: 1,
      explanation: 'One-hot encoding represents categorical variables as binary indicator vectors without falsely implying ordinal numerical relationships.'
    },
    {
      id: 'ml-26',
      q: 'Which loss function is standard for multi-class classification problems with mutually exclusive classes?',
      opts: ['Mean Squared Error (MSE)', 'Categorical Cross-Entropy', 'Binary Cross-Entropy', 'Hinge Loss'],
      answer: 1,
      explanation: 'Categorical cross-entropy measures the divergence between true one-hot class distributions and predicted softmax probability distributions.'
    },
    {
      id: 'ml-27',
      q: 'What is "Dropout" in deep neural network training?',
      opts: [
        'Dropping rows with missing values from the dataset',
        'A regularization technique where randomly selected neurons are temporarily ignored (dropped out) during each training forward/backward pass',
        'Terminating training if loss does not improve for 5 epochs',
        'Disconnecting the GPU power cable'
      ],
      answer: 1,
      explanation: 'Dropout prevents complex co-adaptations between neurons by randomly zeroing activations during training, acting like an implicit ensemble.'
    },
    {
      id: 'ml-28',
      q: 'What does the ROC-AUC score measure in classification?',
      opts: [
        'The time required to train the classifier in minutes',
        'The Area Under the Receiver Operating Characteristic curve, assessing the model\'s ability to discriminate between positive and negative classes across all classification thresholds',
        'The percentage of missing data in the test set',
        'The hardware utilization of tensor cores'
      ],
      answer: 1,
      explanation: 'ROC-AUC evaluates ranking quality across all classification thresholds; 1.0 represents a perfect classifier, and 0.5 represents random guessing.'
    },
    {
      id: 'ml-29',
      q: 'What is a "Hyperparameter" in machine learning?',
      opts: [
        'A model parameter learned directly from data during training (like neural network weights)',
        'A configuration setting whose value is set before the learning process begins (like learning rate, batch size, or number of trees)',
        'A metric that measures CPU temperature',
        'An exceptionally fast database query'
      ],
      answer: 1,
      explanation: 'Hyperparameters govern the training process itself and cannot be learned directly from ordinary training backpropagation.'
    },
    {
      id: 'ml-30',
      q: 'Which Python library is the industry standard for classical machine learning algorithms (clustering, regression, classification, preprocessing)?',
      opts: ['scikit-learn', 'Django', 'Requests', 'Pygame'],
      answer: 0,
      explanation: '`scikit-learn` is the premier Python library for classical machine learning, providing efficient tools for predictive data analysis.'
    }
  ]
};

/**
 * Normalizes skill/quiz strings to canonical question bank key
 */
export function normalizeSkillKey(raw) {
  if (!raw) return 'javascript';
  const str = String(raw).trim().toLowerCase();

  if (str.includes('react')) return 'react';
  if (str.includes('python') || str === 'py') return 'python';
  if (str.includes('sql') || str.includes('database') || str.includes('db')) return 'sql';
  if (str.includes('system') || str.includes('architecture')) return 'system_design';
  if (str.includes('ui') || str.includes('ux') || str.includes('design') || str.includes('figma')) return 'uiux';
  if (str.includes('ml') || str.includes('machine') || str.includes('learning') || str.includes('ai')) return 'ml';
  if (str.includes('javascript') || str.includes('js') || str.includes('node') || str.includes('frontend')) return 'javascript';

  return 'javascript';
}

/**
 * Generates randomized questions formatted for the specific target component:
 * @param {string} skillOrTitle - Skill name or quiz title
 * @param {number} count - Number of questions to return (defaults to 10)
 * @param {'standard' | 'db' | 'module' | 'quiz'} format - Output shape
 * @param {object} [opts] - Additional options (e.g. quizId)
 */
export function getRandomQuestionsForSkill(skillOrTitle, count = 10, format = 'standard', opts = {}) {
  const key = normalizeSkillKey(skillOrTitle);
  const pool = FULL_QUESTION_BANK[key] || FULL_QUESTION_BANK.javascript;

  // Perform full Fisher-Yates shuffle on the question pool
  const shuffled = shuffleArray(pool);
  const selected = shuffled.slice(0, Math.min(count, pool.length));

  if (format === 'db') {
    // Formatted like database table `quiz_questions` for TakingQuizPage / quizService
    return selected.map((item, idx) => ({
      id: item.id || `${key}-q-${idx + 1}-${Date.now()}`,
      quiz_id: opts.quizId || null,
      question_text: item.q,
      question_type: item.type || 'mcq',
      options: item.opts.map((optText, optIdx) => ({
        label: ['A', 'B', 'C', 'D'][optIdx] || String(optIdx),
        text: optText
      })),
      correct_answer: ['A', 'B', 'C', 'D'][item.answer],
      explanation: item.explanation || '',
      question_order: idx + 1
    }));
  }

  if (format === 'module') {
    // Formatted for SkillVerificationModule ({ q, opts, answer: numberIndex })
    return selected.map(item => ({
      q: item.q,
      opts: item.opts,
      answer: item.answer,
      explanation: item.explanation || ''
    }));
  }

  if (format === 'quiz') {
    // Formatted for SkillVerificationQuiz ({ question, options, answer: stringAnswer })
    return selected.map(item => ({
      question: item.q,
      options: item.opts,
      answer: item.opts[item.answer],
      explanation: item.explanation || ''
    }));
  }

  // Default standard shape
  return selected;
}

export default {
  FULL_QUESTION_BANK,
  shuffleArray,
  normalizeSkillKey,
  getRandomQuestionsForSkill
};
