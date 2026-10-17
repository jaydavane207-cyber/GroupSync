import React, { useState, useRef, useCallback } from 'react';
import {
  Shield, BookOpen, Award, Upload, CheckCircle, XCircle,
  ChevronRight, ChevronLeft, RotateCcw, X, Eye, EyeOff,
  Loader2, FileText, Image as ImageIcon, Zap, AlertTriangle,
  Star, Code2, Cpu, Palette, Database, Globe, Lock,
  BarChart2, Check, Sparkles,
} from 'lucide-react';
import supabase from '@/lib/supabase';
import { useAppContext } from '@/context/AppContext';
import { getRandomQuestionsForSkill, FULL_QUESTION_BANK } from '@/lib/data/quizQuestionsData';

// ─── Constants ────────────────────────────────────────────────────────────────

const SKILLS = [
  { id: 'react',       label: 'React',            icon: Code2,     color: 'text-[#9182f8]',    bg: 'bg-[#7c6af6]/12',    border: 'border-[#7c6af6]/20' },
  { id: 'python',      label: 'Python',            icon: Cpu,       color: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  { id: 'uiux',        label: 'UI / UX',           icon: Palette,   color: 'text-purple-500',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
  { id: 'sql',         label: 'SQL',               icon: Database,  color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'javascript',  label: 'JavaScript',        icon: Globe,     color: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  { id: 'ml',          label: 'Machine Learning',  icon: BarChart2, color: 'text-[#9182f8]',    bg: 'bg-[#7c6af6]/12',    border: 'border-[#7c6af6]/20' },
];

// ─── Question Bank — exactly 10 questions per skill ───────────────────────────
const QUESTION_BANK = {
  react: [
    { q: 'Which hook is used to manage side-effects in React?',               opts: ['useState', 'useEffect', 'useRef', 'useMemo'],                                          answer: 1 },
    { q: 'What does JSX stand for?',                                          opts: ['JavaScript XML', 'Java Syntax Extension', 'JavaScript Extension', 'Java XML'],        answer: 0 },
    { q: 'Which method updates state in a functional component?',             opts: ['this.setState', 'setState hook', 'useState setter', 'forceUpdate'],                   answer: 2 },
    { q: 'What is the Virtual DOM?',                                          opts: ['A server-side DOM', 'A lightweight copy of the real DOM', 'A CSS framework', 'A React plugin'], answer: 1 },
    { q: 'Which prop passes child elements to a component?',                  opts: ['element', 'children', 'content', 'nodes'],                                            answer: 1 },
    { q: 'What is the purpose of useCallback?',                               opts: ['Memoize a value', 'Memoize a function reference', 'Fetch data', 'Manage refs'],      answer: 1 },
    { q: 'Which of the following triggers a re-render?',                      opts: ['useRef change', 'State change', 'Prop reading', 'useEffect cleanup'],                 answer: 1 },
    { q: 'What does React.memo do?',                                          opts: ['Memoizes a value', 'Prevents re-render if props unchanged', 'Caches API responses', 'Creates a ref'], answer: 1 },
    { q: 'How do you conditionally render in React?',                         opts: ['if/else only', 'Switch statements', 'Ternary or &&', 'Template literals'],           answer: 2 },
    { q: 'What is the correct way to pass a function as a prop?',             opts: ['onClick="handler"', 'onClick={handler}', 'onClick=handler', 'onClick=(handler)'],    answer: 1 },
  ],
  python: [
    { q: 'What is the output of `type(3.14)` in Python?',                     opts: ['int', 'float', 'double', 'number'],                                                  answer: 1 },
    { q: 'Which keyword defines a function in Python?',                       opts: ['function', 'def', 'func', 'define'],                                                 answer: 1 },
    { q: 'What does `len([1, 2, 3])` return?',                                opts: ['2', '3', '4', 'Error'],                                                              answer: 1 },
    { q: 'How do you create a virtual environment in Python?',                opts: ['python -m venv env', 'pip install venv', 'python env create', 'venv --create'],      answer: 0 },
    { q: 'What is a list comprehension?',                                     opts: ['A for-loop in a function', 'A concise way to create lists', 'A decorator', 'A sorted list'], answer: 1 },
    { q: 'Which data structure uses key-value pairs in Python?',              opts: ['List', 'Tuple', 'Dictionary', 'Set'],                                                answer: 2 },
    { q: 'What does the `*args` parameter allow?',                            opts: ['Keyword arguments', 'Variable positional arguments', 'Default values', 'Type hints'], answer: 1 },
    { q: 'What is PEP 8?',                                                    opts: ['A Python version', 'A style guide for Python code', 'A package manager', 'A debugging tool'], answer: 1 },
    { q: 'Which module is used for regular expressions in Python?',           opts: ['regex', 're', 'regexp', 'match'],                                                    answer: 1 },
    { q: 'What does `__init__` do in a Python class?',                        opts: ['Imports the class', 'Initializes a class instance', 'Destroys an instance', 'Defines a static method'], answer: 1 },
  ],
  uiux: [
    { q: "What does UX stand for?",                                           opts: ['User Experience', 'User Extension', 'User Execution', 'Unique Experience'],          answer: 0 },
    { q: 'What is a wireframe?',                                              opts: ['A finished design', 'A low-fidelity structural layout', 'A clickable prototype', 'A color palette'], answer: 1 },
    { q: 'Which principle ensures designs are accessible to all users?',      opts: ['Heuristic Evaluation', 'Universal Design', 'Gestalt Theory', 'Card Sorting'],       answer: 1 },
    { q: "What is Fitts's Law?",                                              opts: ['Color theory principle', 'A principle about target size and distance', 'A typography rule', 'An animation guideline'], answer: 1 },
    { q: 'What is an A/B test?',                                              opts: ['Comparing two design versions', 'Testing accessibility', 'A prototyping technique', 'An animation test'], answer: 0 },
    { q: 'What is a design system?',                                          opts: ['A project management tool', 'A collection of reusable components and guidelines', 'A wireframing app', 'A coding framework'], answer: 1 },
    { q: 'What does WCAG stand for?',                                         opts: ['Web Content Accessibility Guidelines', 'Web Color Application Guide', 'Web Component Architecture Group', 'World Content Access Gateway'], answer: 0 },
    { q: 'What is the 60-30-10 rule in UI?',                                  opts: ['Animation timing', 'Color distribution rule', 'Grid column ratio', 'Typography scale'], answer: 1 },
    { q: 'What is a persona in UX?',                                          opts: ['A logo design', 'A fictional user representative', 'A color theme', 'A navigation pattern'], answer: 1 },
    { q: 'Which tool is most popular for UI prototyping?',                    opts: ['VS Code', 'Figma', 'Photoshop', 'Canva'],                                            answer: 1 },
  ],
  sql: [
    { q: 'Which SQL statement is used to retrieve data?',                     opts: ['GET', 'SELECT', 'FETCH', 'PULL'],                                                    answer: 1 },
    { q: 'What does JOIN do in SQL?',                                         opts: ['Deletes rows', 'Combines rows from two tables', 'Sorts results', 'Filters columns'], answer: 1 },
    { q: 'What is a PRIMARY KEY?',                                            opts: ['A column with duplicates', 'A unique row identifier', 'An index column', 'A foreign reference'], answer: 1 },
    { q: 'Which clause filters rows AFTER aggregation?',                      opts: ['WHERE', 'HAVING', 'GROUP BY', 'LIMIT'],                                              answer: 1 },
    { q: 'What does `COUNT(*)` return?',                                      opts: ['Non-null values in column', 'All rows count', 'Sum of all values', 'Column names'],  answer: 1 },
    { q: 'What is a FOREIGN KEY?',                                            opts: ["A primary key backup", "References another table's primary key", 'An encrypted key', 'A composite key'], answer: 1 },
    { q: 'Which SQL statement creates a new table?',                          opts: ['MAKE TABLE', 'CREATE TABLE', 'ADD TABLE', 'NEW TABLE'],                              answer: 1 },
    { q: 'What does DISTINCT do?',                                            opts: ['Removes duplicate rows', 'Orders results', 'Limits output', 'Joins tables'],        answer: 0 },
    { q: 'What is an INDEX used for?',                                        opts: ['Deleting records', 'Speeding up queries', 'Creating views', 'Defining triggers'],   answer: 1 },
    { q: 'What does NULL represent in SQL?',                                  opts: ['Zero', 'Empty string', 'Absence of a value', 'False'],                              answer: 2 },
  ],
  javascript: [
    { q: 'Which keyword declares a block-scoped variable?',                   opts: ['var', 'let', 'global', 'dim'],                                                       answer: 1 },
    { q: 'What does `===` check in JavaScript?',                              opts: ['Value only', 'Type only', 'Value and type', 'Reference'],                           answer: 2 },
    { q: 'What is a closure?',                                                opts: ['A syntax error', 'A function with access to its outer scope', 'A loop construct', 'A promise handler'], answer: 1 },
    { q: 'What does `Array.prototype.map()` return?',                        opts: ['A filtered array', 'A new array with results', 'The original array', 'A boolean'],  answer: 1 },
    { q: 'What is the event loop?',                                           opts: ['A for-each loop', 'JS concurrency mechanism', 'A DOM method', 'A CSS animation'], answer: 1 },
    { q: 'What does `async/await` help with?',                               opts: ['Type checking', 'Writing async code synchronously', 'DOM manipulation', 'Variable hoisting'], answer: 1 },
    { q: 'What does `typeof null` return?',                                   opts: ['"null"', '"undefined"', '"object"', '"boolean"'],                                   answer: 2 },
    { q: 'Which method adds an element to the END of an array?',             opts: ['shift', 'push', 'unshift', 'splice'],                                                answer: 1 },
    { q: 'What is hoisting?',                                                 opts: ['Variables moved to top of scope at runtime', 'A CSS property', 'A sorting algorithm', 'A React pattern'], answer: 0 },
    { q: 'What does `Promise.all()` do?',                                     opts: ['Runs one promise', 'Runs promises sequentially', 'Runs all promises concurrently', 'Cancels promises'], answer: 2 },
  ],
  ml: [
    { q: 'What is overfitting?',                                              opts: ['Underfitting on training data', 'Model performs well on training but poorly on new data', 'A regularization technique', 'A feature selection method'], answer: 1 },
    { q: 'What does a confusion matrix show?',                                opts: ['Model training loss', 'Classification results vs actual labels', 'Feature importance', 'Gradient values'], answer: 1 },
    { q: 'Which algorithm is used for both classification and regression?',   opts: ['KMeans', 'Decision Tree', 'PCA', 'DBSCAN'],                                          answer: 1 },
    { q: 'What is gradient descent?',                                         opts: ['A data cleaning technique', 'An optimization algorithm minimizing a loss function', 'A feature scaling method', 'A neural network layer'], answer: 1 },
    { q: 'What does PCA stand for?',                                          opts: ['Pattern Classification Analysis', 'Principal Component Analysis', 'Predictive Cluster Algorithm', 'Probabilistic Confusion Analysis'], answer: 1 },
    { q: 'What is the purpose of a validation set?',                          opts: ['Training the model', 'Tuning hyperparameters', 'Final evaluation', 'Feature extraction'], answer: 1 },
    { q: 'What does an activation function do in a neural network?',          opts: ['Load data', 'Introduce non-linearity', 'Initialize weights', 'Compute loss'],       answer: 1 },
    { q: 'What is the k in KNN?',                                             opts: ['Number of features', 'Number of nearest neighbors', 'Number of clusters', 'Number of epochs'], answer: 1 },
    { q: 'What does regularization prevent?',                                 opts: ['Underfitting', 'Overfitting', 'Data leakage', 'Class imbalance'],                    answer: 1 },
    { q: 'Which library is most popular for ML in Python?',                   opts: ['NumPy', 'scikit-learn', 'Pandas', 'Matplotlib'],                                    answer: 1 },
  ],
};

/** STRICT: user must score AT LEAST this many to pass */
const PASSING_SCORE  = 8;
const TOTAL_QUESTIONS = 10;

// ─── Supabase Integration Stubs ───────────────────────────────────────────────

/**
 * Adds a verified skill to the user's Supabase profile.
 * Called ONLY when quiz score >= PASSING_SCORE (8/10).
 *
 * Uncomment the code below and remove the stub when your DB schema is ready.
 *
 * @param {string} userId      - Auth user ID
 * @param {string} skillId     - Skill identifier  (e.g. 'react')
 * @param {string} skillLabel  - Human-readable name (e.g. 'React')
 */
async function addVerifiedSkillToProfile(userId, skillId, skillLabel) {
  // ── Step 1: upsert into verified_skills table ──────────────────────────────
  // const { error: vsError } = await supabase
  //   .from('verified_skills')
  //   .upsert(
  //     {
  //       user_id:             userId,
  //       skill_id:            skillId,
  //       skill_label:         skillLabel,
  //       is_verified:         true,
  //       verified_at:         new Date().toISOString(),
  //       verification_method: 'quiz',
  //     },
  //     { onConflict: 'user_id,skill_id' }
  //   );
  // if (vsError) throw vsError;
  //
  // ── Step 2: append to the profiles.skills array (deduplicated) ─────────────
  // const { data: profile, error: fetchErr } = await supabase
  //   .from('profiles')
  //   .select('skills')
  //   .eq('id', userId)
  //   .single();
  // if (fetchErr) throw fetchErr;
  //
  // const updatedSkills = [...new Set([...(profile?.skills ?? []), skillLabel])];
  // const { error: updateErr } = await supabase
  //   .from('profiles')
  //   .update({ skills: updatedSkills })
  //   .eq('id', userId);
  // if (updateErr) throw updateErr;

  console.log('[Supabase STUB] addVerifiedSkillToProfile:', { userId, skillId, skillLabel, is_verified: true });
  await new Promise(r => setTimeout(r, 900)); // simulate network latency
}

/**
 * Uploads a skill certificate to Supabase Storage and records it in the DB.
 * Skill is ONLY added to the profile after a successful upload.
 *
 * @param {File}    file      - The certificate file (PDF / image)
 * @param {string}  userId    - Auth user ID
 * @param {string}  skillId   - Skill identifier
 * @param {string}  skillLabel
 * @param {boolean} isPublic  - Whether other students can view the certificate
 * @returns {{ publicUrl: string }}
 */
async function uploadCertificateToSupabase(file, userId, skillId, skillLabel, isPublic) {
  // ── Step 1: Upload file to Storage ─────────────────────────────────────────
  // const filePath = `certificates/${userId}/${skillId}/${Date.now()}_${file.name}`;
  // const { error: storageErr } = await supabase.storage
  //   .from('certificates') // bucket must exist & have appropriate RLS
  //   .upload(filePath, file, { upsert: true });
  // if (storageErr) throw storageErr;
  //
  // const { data: { publicUrl } } = supabase.storage
  //   .from('certificates')
  //   .getPublicUrl(filePath);
  //
  // ── Step 2: Record in verified_skills ──────────────────────────────────────
  // const { error: dbErr } = await supabase
  //   .from('verified_skills')
  //   .upsert(
  //     {
  //       user_id:                userId,
  //       skill_id:               skillId,
  //       skill_label:            skillLabel,
  //       is_verified:            true,
  //       verified_at:            new Date().toISOString(),
  //       verification_method:    'certificate',
  //       certificate_url:        publicUrl,
  //       is_certificate_public:  isPublic,
  //     },
  //     { onConflict: 'user_id,skill_id' }
  //   );
  // if (dbErr) throw dbErr;
  //
  // ── Step 3: Append skill label to profiles.skills ──────────────────────────
  // const { data: profile } = await supabase
  //   .from('profiles').select('skills').eq('id', userId).single();
  // const updatedSkills = [...new Set([...(profile?.skills ?? []), skillLabel])];
  // await supabase.from('profiles').update({ skills: updatedSkills }).eq('id', userId);

  console.log('[Supabase STUB] uploadCertificateToSupabase:', {
    fileName: file.name,
    fileSize: `${(file.size / 1024).toFixed(1)} KB`,
    userId,
    skillId,
    isPublic,
  });
  await new Promise(r => setTimeout(r, 2200)); // simulate upload time
  return { publicUrl: `https://supabase.co/storage/v1/object/public/certificates/${userId}/${skillId}/cert` };
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

/** Animated "..." loading indicator */
function LoadingDots() {
  return (
    <span className="inline-flex gap-1 items-center ml-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

/** Clean solid progress bar */
function ProgressBar({ current, total, color = '#3b82f6' }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-1.5 rounded-full transition-all duration-300 ease-out"
        style={{
          width: `${pct}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

/**
 * Toggle switch — matches the project's existing Toggle style.
 * Includes optional label + description.
 */
function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1">
        <p className="font-medium text-[var(--color-gs-text-main)] text-sm">{label}</p>
        {description && (
          <p className="text-xs text-[var(--color-gs-text-muted)] mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onChange}
        aria-checked={checked}
        role="switch"
        className={
          'relative flex items-center w-11 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D6AF6] border border-gs-border cursor-pointer ' +
          (checked ? 'bg-[#6D6AF6]' : 'bg-black/20 dark:bg-white/10')
        }
      >
        <div
          className={
            'w-5 h-5 rounded-full transition-all duration-200 ' +
            (checked ? 'translate-x-[21px] bg-white' : 'translate-x-[1px] bg-white/90')
          }
        />
      </button>
    </div>
  );
}

// ─── Step 1: Skill Selector ───────────────────────────────────────────────────
function SkillSelector({ onSelect }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c6af6]/15 border border-[#7c6af6]/30 text-[#9182f8] text-xs font-medium tracking-wide">
          <Shield size={12} /> Skill Verification
        </div>
        <h2 className="text-xl font-semibold text-[var(--color-gs-text-main)] tracking-tight">
          Verify a Skill
        </h2>
        <p className="text-[var(--color-gs-text-muted)] text-xs max-w-md mx-auto leading-relaxed">
          Verified skills are highlighted in squad matches — boosting your chances of being
          selected for high-demand groups by up to{' '}
          <span className="text-[#9182f8] font-semibold">3×</span>.
        </p>
      </div>

      {/* Skill Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SKILLS.map((skill) => {
          const Icon = skill.icon;
          return (
            <button
              key={skill.id}
              id={`skill-select-${skill.id}`}
              onClick={() => onSelect(skill)}
              className={`
                group relative flex flex-col items-center gap-3 p-4 rounded-xl border
                transition-colors duration-150 text-center cursor-pointer
                ${skill.bg} ${skill.border} hover:border-[#7c6af6]/40
              `}
            >
              <div className={`p-2.5 rounded-lg ${skill.bg} border ${skill.border}`}>
                <Icon size={20} className={skill.color} />
              </div>
              <span className={`font-medium text-xs ${skill.color}`}>{skill.label}</span>
              <ChevronRight
                size={14}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${skill.color} opacity-0 group-hover:opacity-100 transition-opacity`}
              />
            </button>
          );
        })}
      </div>

      {/* Tip banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#6D6AF6]/5 border border-[#7c6af6]/20">
        <Shield size={15} className="text-[#9182f8] mt-0.5 shrink-0" />
        <p className="text-xs text-[var(--color-gs-text-muted)] leading-relaxed">
          Verification is optional but recommended. Verify via a quick quiz or upload a certificate
          from Coursera, Udemy, or freeCodeCamp.
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Method Selector ──────────────────────────────────────────────────
function MethodSelector({ skill, onSelectMethod, onBack }) {
  const Icon = skill.icon;
  return (
    <div className="space-y-6">
      {/* Back + skill badge */}
      <div className="flex items-center gap-3">
        <button
          id="method-back-btn"
          onClick={onBack}
          className="p-2 rounded-lg border border-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-text-main)] hover:bg-[var(--color-gs-bg)] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${skill.bg} border ${skill.border}`}>
          <Icon size={15} className={skill.color} />
          <span className={`font-semibold text-xs ${skill.color}`}>{skill.label}</span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-[var(--color-gs-text-main)]">Choose Verification Method</h2>
        <p className="text-[var(--color-gs-text-muted)] text-sm">
          How would you like to prove your{' '}
          <span className={`font-semibold ${skill.color}`}>{skill.label}</span> skills?
        </p>
      </div>

      {/* Method Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Path A — Quiz */}
        <button
          id="method-quiz-btn"
          onClick={() => onSelectMethod('quiz')}
          className="group flex flex-col gap-3.5 p-5 rounded-xl border border-gs-border bg-gs-card hover:border-[#7c6af6]/40 hover:bg-[#6D6AF6]/[0.02] transition-colors duration-150 text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-[#7c6af6]/15 border border-[#7c6af6]/30 flex items-center justify-center">
            <BookOpen size={20} className="text-[#9182f8]" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[var(--color-gs-text-main)] mb-1">Take the Quiz</p>
            <p className="text-xs text-[var(--color-gs-text-muted)] leading-relaxed">
              Answer 10 multiple-choice questions. Score <strong className="text-[#9182f8]">8 or higher</strong> to earn your verified badge.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
            {['10 Questions', '≥ 8/10 to Pass', 'Instant Result'].map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-[#6D6AF6]/10 text-[#9182f8] border border-[#7c6af6]/20">{tag}</span>
            ))}
          </div>
        </button>

        {/* Path B — Certificate */}
        <button
          id="method-certificate-btn"
          onClick={() => onSelectMethod('certificate')}
          className="group flex flex-col gap-3.5 p-5 rounded-xl border border-gs-border bg-gs-card hover:border-[#7c6af6]/40 hover:bg-[#6D6AF6]/[0.02] transition-colors duration-150 text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-[#7c6af6]/15 border border-[#7c6af6]/30 flex items-center justify-center">
            <Award size={20} className="text-[#9182f8]" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[var(--color-gs-text-main)] mb-1">Upload Certificate</p>
            <p className="text-xs text-[var(--color-gs-text-muted)] leading-relaxed">
              Upload proof of certification from Coursera, Udemy, freeCodeCamp, or similar platforms.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
            {['PDF / Image', 'Privacy Control', 'Manual Review'].map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-[var(--color-gs-text-muted)] border border-gs-border">{tag}</span>
            ))}
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Path A: Quiz Flow ────────────────────────────────────────────────────────
function QuizFlow({ skill, onComplete, onCancel }) {
  const [questions, setQuestions] = useState(() => getRandomQuestionsForSkill(skill.id, 10, 'module'));

  // Quiz state
  const [currentIndex, setCurrentIndex]   = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers]               = useState([]); // chosen option index per question
  const [quizStatus, setQuizStatus]         = useState('in_progress'); // 'in_progress' | 'passed' | 'failed'
  const [score, setScore]                   = useState(0);
  const [isSaving, setIsSaving]             = useState(false);

  const { user, updateLocalUser, showToast } = useAppContext();

  const currentQ     = questions[currentIndex];
  const isLastQuestion = currentIndex === TOTAL_QUESTIONS - 1;

  // ── Handle moving to next question / submitting ──────────────────────────────
  const handleNext = () => {
    const newAnswers = [...answers, selectedOption];

    if (isLastQuestion) {
      const finalScore = newAnswers.reduce(
        (acc, ans, idx) => acc + (ans === questions[idx].answer ? 1 : 0),
        0
      );
      setScore(finalScore);
      setAnswers(newAnswers);

      // STRICT: only pass if score >= PASSING_SCORE (8)
      if (finalScore >= PASSING_SCORE) {
        setQuizStatus('passed');
        handlePassQuiz(finalScore);
      } else {
        // Score < 8: skill MUST NOT be added to profile
        setQuizStatus('failed');
      }
    } else {
      setAnswers(newAnswers);
      setSelectedOption(null);
      setCurrentIndex(i => i + 1);
    }
  };

  // ── Supabase call — only reached when score >= PASSING_SCORE ────────────────
  const handlePassQuiz = async (finalScore) => {
    setIsSaving(true);
    try {
      await addVerifiedSkillToProfile(user?.id, skill.id, skill.label);

      // Optimistic local update — keeps UI in sync without a refetch
      if (user && updateLocalUser) {
        const existing = user.skills || [];
        if (!existing.includes(skill.label)) {
          updateLocalUser({ skills: [...existing, skill.label] });
        }
      }

      showToast?.(`🎉 ${skill.label} verified! Badge added to your profile.`, 'success');
    } catch (err) {
      console.error('[SkillVerificationModule] Failed to save verified skill:', err);
      showToast?.('Skill earned but could not be saved. Try again later.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    setQuestions(getRandomQuestionsForSkill(skill.id, 10, 'module'));
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setScore(0);
    setQuizStatus('in_progress');
    setIsSaving(false);
  };

  // ── PASSED state ─────────────────────────────────────────────────────────────
  if (quizStatus === 'passed') {
    return (
      <div className="text-center space-y-5 py-2">
        {/* Success icon */}
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
          <CheckCircle size={28} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-semibold text-[var(--color-gs-text-main)]">Skill Verified</h3>
          <p className="text-[var(--color-gs-text-muted)] text-sm max-w-sm mx-auto leading-relaxed">
            You scored{' '}
            <span className="font-semibold text-emerald-500">{score}/{TOTAL_QUESTIONS}</span> — your{' '}
            <span className={`font-semibold ${skill.color}`}>{skill.label}</span>{' '}
            skill is now marked as <strong className="text-emerald-500">verified</strong> on your profile.
          </p>
        </div>

        {/* Score bar */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 max-w-sm mx-auto text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-[var(--color-gs-text-muted)]">Your Score</span>
            <span className="font-bold text-emerald-500 text-base">{score} / {TOTAL_QUESTIONS}</span>
          </div>
          <ProgressBar current={score} total={TOTAL_QUESTIONS} color="#10b981" />
          <div className="flex justify-between text-xs text-[var(--color-gs-text-muted)] mt-1.5">
            <span>0</span>
            <span className="text-emerald-500 font-medium">Pass ≥ {PASSING_SCORE}</span>
            <span>{TOTAL_QUESTIONS}</span>
          </div>
        </div>

        {/* Answer review — shows which questions were right/wrong */}
        <div className="bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-2xl p-5 max-w-sm mx-auto text-left space-y-2">
          <p className="text-xs font-semibold text-[var(--color-gs-text-muted)] uppercase tracking-wide mb-3">Answer Review</p>
          {questions.map((q, i) => {
            const wasCorrect = answers[i] === q.answer;
            return (
              <div key={i} className={`flex items-center gap-2.5 text-xs ${wasCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                {wasCorrect
                  ? <Check size={13} className="shrink-0" />
                  : <X size={13} className="shrink-0" />}
                <span className="truncate text-[var(--color-gs-text-muted)]">Q{i + 1}:</span>
                <span className="truncate flex-1">{q.opts[q.answer]}</span>
              </div>
            );
          })}
        </div>

        {isSaving ? (
          <div className="flex items-center justify-center gap-2 text-[var(--color-gs-text-muted)] text-sm">
            <Loader2 size={16} className="animate-spin" /> Saving to profile...
          </div>
        ) : (
          <button
            id="quiz-done-btn"
            onClick={() => onComplete({ method: 'quiz', score, passed: true })}
            className="px-6 py-2.5 bg-[#6D6AF6] hover:bg-[#7E7BF8] text-white font-medium rounded-lg transition-colors text-sm shadow-xs"
          >
            Done — View Profile
          </button>
        )}
      </div>
    );
  }

  // ── FAILED state — skill is NOT added to profile ──────────────────────────
  if (quizStatus === 'failed') {
    return (
      <div className="text-center space-y-5 py-2">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
          <XCircle size={28} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-semibold text-[var(--color-gs-text-main)]">Not Quite There</h3>
          <p className="text-[var(--color-gs-text-muted)] text-sm max-w-sm mx-auto leading-relaxed">
            You scored{' '}
            <span className="font-semibold text-red-500">{score}/{TOTAL_QUESTIONS}</span>. You need at
            least{' '}
            <span className="font-semibold text-[var(--color-gs-text-main)]">{PASSING_SCORE}/10</span>{' '}
            to verify this skill. Your profile has <strong className="text-red-400">not</strong> been updated.
          </p>
        </div>

        {/* Score bar */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 max-w-sm mx-auto text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-[var(--color-gs-text-muted)]">Your Score</span>
            <span className="font-bold text-red-400 text-lg">{score} / {TOTAL_QUESTIONS}</span>
          </div>
          <ProgressBar current={score} total={TOTAL_QUESTIONS} color="#ef4444" />
          <div className="flex justify-between text-xs text-[var(--color-gs-text-muted)] mt-1.5">
            <span>0</span>
            <span className="text-red-400 font-medium">Needed: {PASSING_SCORE}</span>
            <span>{TOTAL_QUESTIONS}</span>
          </div>
        </div>

        {/* Answer review */}
        <div className="bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-2xl p-5 max-w-sm mx-auto text-left space-y-2">
          <p className="text-xs font-semibold text-[var(--color-gs-text-muted)] uppercase tracking-wide mb-3">Answer Review</p>
          {questions.map((q, i) => {
            const wasCorrect = answers[i] === q.answer;
            return (
              <div key={i} className={`flex items-center gap-2.5 text-xs ${wasCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {wasCorrect
                  ? <Check size={13} className="shrink-0" />
                  : <X size={13} className="shrink-0" />}
                <span className="truncate text-[var(--color-gs-text-muted)]">Q{i + 1}:</span>
                <span className="truncate flex-1">{wasCorrect ? 'Correct' : q.opts[q.answer]}</span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            id="quiz-retry-btn"
            onClick={handleRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#6D6AF6] text-white font-medium rounded-lg hover:bg-[#7E7BF8] transition-colors text-sm shadow-xs"
          >
            <RotateCcw size={15} /> Retry Quiz
          </button>
          <button
            id="quiz-cancel-btn"
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2.5 border border-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] rounded-lg hover:bg-[var(--color-gs-bg)] hover:text-[var(--color-gs-text-main)] transition-colors text-sm"
          >
            <X size={15} /> Cancel
          </button>
        </div>

        <p className="text-xs text-[var(--color-gs-text-muted)]">
          💡 Tip: You can also verify this skill by uploading a certificate instead.
        </p>
      </div>
    );
  }

  // ── IN PROGRESS state ─────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-[#9182f8]" />
            <span className="text-sm font-semibold text-[var(--color-gs-text-main)]">
              {skill.label} Quiz
            </span>
          </div>
          <span className="text-xs text-[var(--color-gs-text-muted)] font-mono bg-[var(--color-gs-bg)] px-2.5 py-1 rounded-lg border border-[var(--color-gs-border)]">
            {currentIndex + 1} / {TOTAL_QUESTIONS}
          </span>
        </div>
        <ProgressBar current={currentIndex + 1} total={TOTAL_QUESTIONS} />
        <p className="text-xs text-[var(--color-gs-text-muted)]">
          Score <strong>{PASSING_SCORE}</strong> or more to earn the verified badge — your profile won't be updated unless you pass.
        </p>
      </div>

      {/* Question card */}
      <div
        key={currentIndex}
        className="bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl p-5 space-y-4"
      >
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-7 h-7 rounded-lg bg-[#7c6af6]/15 border border-[#7c6af6]/30 flex items-center justify-center text-[#9182f8] text-xs font-semibold">
            {currentIndex + 1}
          </span>
          <p className="text-[var(--color-gs-text-main)] font-medium leading-relaxed pt-0.5 text-sm">
            {currentQ.q}
          </p>
        </div>

        {/* Options — styled radio buttons */}
        <div className="space-y-2">
          {currentQ.opts.map((opt, i) => {
            const isSelected = selectedOption === i;
            return (
              <button
                key={i}
                id={`quiz-option-${i}`}
                onClick={() => setSelectedOption(i)}
                className={`
                  w-full flex items-center gap-3 p-3.5 rounded-lg border text-left transition-colors duration-150
                  ${isSelected
                    ? 'border-[#7c6af6] bg-[#6D6AF6]/10 text-[var(--color-gs-text-main)] font-medium'
                    : 'border-[var(--color-gs-border)] hover:border-[#7c6af6]/30 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-text-main)]'
                  }
                `}
              >
                {/* Custom radio indicator */}
                <div className={`
                  shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                  ${isSelected ? 'border-[#7c6af6] bg-[#6D6AF6]' : 'border-[var(--color-gs-border)]'}
                `}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-sm">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation row */}
      <div className="flex items-center justify-between">
        <button
          id="quiz-cancel-inline-btn"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-text-main)] border border-transparent hover:border-[var(--color-gs-border)] rounded-lg transition-colors text-xs"
        >
          <X size={14} /> Cancel
        </button>

        <button
          id="quiz-next-btn"
          onClick={handleNext}
          disabled={selectedOption === null}
          className={`
            flex items-center gap-1.5 px-5 py-2 rounded-lg font-medium text-xs transition-colors
            ${selectedOption !== null
              ? 'bg-[#6D6AF6] hover:bg-[#7E7BF8] text-white shadow-xs cursor-pointer'
              : 'bg-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] cursor-not-allowed opacity-50'
            }
          `}
        >
          {isLastQuestion ? 'Submit Quiz' : <>Next <ChevronRight size={14} /></>}
        </button>
      </div>
    </div>
  );
}

// ─── Path B: Certificate Upload Flow ─────────────────────────────────────────
function CertificateFlow({ skill, onComplete, onCancel }) {
  const [certificateFile, setCertificateFile]       = useState(null);
  const [isCertificatePublic, setIsCertificatePublic] = useState(false);
  const [verificationStatus, setVerificationStatus]   = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [isDragOver, setIsDragOver]                   = useState(false);
  const fileInputRef = useRef(null);

  const { user, updateLocalUser, showToast } = useAppContext();
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
    setVerificationStatus('idle'); // reset error state if re-uploading
  }, [showToast]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = ()  => setIsDragOver(false);

  const handleSubmit = async () => {
    if (!certificateFile || verificationStatus === 'uploading') return;
    setVerificationStatus('uploading');
    try {
      await uploadCertificateToSupabase(
        certificateFile,
        user?.id,
        skill.id,
        skill.label,
        isCertificatePublic
      );

      // Only update local profile AFTER successful upload
      if (user && updateLocalUser) {
        const existing = user.skills || [];
        if (!existing.includes(skill.label)) {
          updateLocalUser({ skills: [...existing, skill.label] });
        }
      }

      setVerificationStatus('success');
      showToast?.(`📜 Certificate submitted! ${skill.label} is pending review.`, 'success');
    } catch (err) {
      console.error('[SkillVerificationModule] Certificate upload failed:', err);
      setVerificationStatus('error');
      showToast?.('Upload failed. Please check your connection and try again.', 'error');
    }
  };

  const getFileIcon = () => {
    if (!certificateFile) return null;
    return certificateFile.type === 'application/pdf'
      ? <FileText size={26} className="text-[#9182f8]" />
      : <ImageIcon size={26} className="text-[#9182f8]" />;
  };

  // ── SUCCESS state ─────────────────────────────────────────────────────────
  if (verificationStatus === 'success') {
    return (
      <div className="text-center space-y-5 py-2">
        <div className="w-14 h-14 rounded-full bg-[#7c6af6]/15 border border-[#7c6af6]/30 flex items-center justify-center mx-auto text-[#9182f8]">
          <Award size={28} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-semibold text-[var(--color-gs-text-main)]">Certificate Submitted</h3>
          <p className="text-[var(--color-gs-text-muted)] text-sm max-w-sm mx-auto leading-relaxed">
            Your{' '}<span className={`font-medium ${skill.color}`}>{skill.label}</span>{' '}
            certificate has been uploaded and is <strong>pending review</strong>. You'll be notified once verified.
          </p>
        </div>

        {/* Submission summary card */}
        <div className="bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl p-4 max-w-sm mx-auto space-y-2.5 text-left">
          {[
            { label: 'File', value: certificateFile.name },
            { label: 'Size', value: `${(certificateFile.size / 1024).toFixed(1)} KB` },
            {
              label: 'Visibility',
              value: isCertificatePublic ? 'Public' : 'Private',
              color: isCertificatePublic ? 'text-[#9182f8]' : 'text-[var(--color-gs-text-muted)]',
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-gs-text-muted)]">{label}</span>
              <span className={`font-medium truncate max-w-[180px] ${color || 'text-[var(--color-gs-text-main)]'}`}>{value}</span>
            </div>
          ))}
        </div>

        <button
          id="cert-done-btn"
          onClick={() => onComplete({ method: 'certificate', isPublic: isCertificatePublic })}
          className="px-6 py-2.5 bg-[#6D6AF6] hover:bg-[#7E7BF8] text-white font-medium rounded-lg transition-colors text-sm shadow-xs"
        >
          Done — Back to Profile
        </button>
      </div>
    );
  }

  // ── UPLOAD form ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          id="cert-back-btn"
          onClick={onCancel}
          className="p-2 rounded-lg border border-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-text-main)] hover:bg-[var(--color-gs-bg)] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-gs-text-main)]">Upload Certificate</h2>
          <p className="text-xs text-[var(--color-gs-text-muted)]">
            Verify your{' '}<span className={`font-semibold ${skill.color}`}>{skill.label}</span>{' '}skill with a certificate
          </p>
        </div>
      </div>

      {/* Drag-and-drop zone */}
      <div
        id="cert-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center gap-3.5 p-6 rounded-xl border-2 border-dashed cursor-pointer
          transition-colors duration-150 select-none
          ${isDragOver
            ? 'border-[#7c6af6] bg-[#7c6af6]/12'
            : certificateFile
              ? 'border-[#7c6af6]/40 bg-[#6D6AF6]/[0.03]'
              : 'border-[var(--color-gs-border)] hover:border-[#7c6af6]/40 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]'
          }
        `}
      >
        <input
          ref={fileInputRef}
          id="cert-file-input"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="sr-only"
          onChange={e => handleFile(e.target.files?.[0])}
        />

        {certificateFile ? (
          <>
            <div className="w-12 h-12 rounded-xl bg-[#7c6af6]/15 border border-[#7c6af6]/30 flex items-center justify-center">
              {getFileIcon()}
            </div>
            <div className="text-center">
              <p className="font-semibold text-[var(--color-gs-text-main)] text-sm">{certificateFile.name}</p>
              <p className="text-xs text-[var(--color-gs-text-muted)] mt-0.5">
                {(certificateFile.size / 1024).toFixed(1)} KB · Click to change
              </p>
            </div>
            <button
              id="cert-remove-file-btn"
              type="button"
              onClick={e => { e.stopPropagation(); setCertificateFile(null); }}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDragOver ? 'bg-[#6D6AF6]/20' : 'bg-black/5 dark:bg-white/5 border border-[var(--color-gs-border)]'}`}>
              <Upload size={22} className={isDragOver ? 'text-[#9182f8]' : 'text-[var(--color-gs-text-muted)]'} />
            </div>
            <div className="text-center">
              <p className="font-medium text-[var(--color-gs-text-main)] text-sm">
                Drop your certificate here
              </p>
              <p className="text-xs text-[var(--color-gs-text-muted)] mt-1">
                or <span className="text-[#9182f8] underline underline-offset-2">browse files</span>
              </p>
              <p className="text-[11px] text-[var(--color-gs-text-muted)] mt-1.5">PDF, JPG, PNG or WebP · Max {MAX_SIZE_MB} MB</p>
            </div>
          </>
        )}
      </div>

      {/* ── Privacy Toggle ─────────────────────────────── */}
      <div className="p-4 rounded-xl bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] space-y-3">
        <Toggle
          checked={isCertificatePublic}
          onChange={() => setIsCertificatePublic(v => !v)}
          label="Allow other students to view this certificate on my profile"
          description={
            isCertificatePublic
              ? 'Your certificate will be visible to all students browsing your profile.'
              : 'Only you and administrators can view this certificate.'
          }
        />
        <div className="flex items-center gap-2 pt-2.5 border-t border-[var(--color-gs-border)]">
          {isCertificatePublic
            ? <><Eye size={13} className="text-[#9182f8] shrink-0" /><span className="text-xs text-[#9182f8]">This certificate will be publicly visible on your profile</span></>
            : <><Lock size={13} className="text-[var(--color-gs-text-muted)] shrink-0" /><span className="text-xs text-[var(--color-gs-text-muted)]">This certificate is private — only visible to you and admins</span></>
          }
        </div>
      </div>

      {/* Error state */}
      {verificationStatus === 'error' && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <AlertTriangle size={15} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-400">Upload failed. Please check your connection and try again.</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        id="cert-submit-btn"
        onClick={handleSubmit}
        disabled={!certificateFile || verificationStatus === 'uploading'}
        className={`
          w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-xs transition-colors
          ${certificateFile && verificationStatus !== 'uploading'
            ? 'bg-[#6D6AF6] hover:bg-[#7E7BF8] text-white shadow-xs cursor-pointer'
            : 'bg-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] cursor-not-allowed opacity-50'
          }
        `}
      >
        {verificationStatus === 'uploading'
          ? <><Loader2 size={15} className="animate-spin" /> Uploading<LoadingDots /></>
          : <><Award size={15} /> Submit Proof</>
        }
      </button>
    </div>
  );
}

// ─── Step Dots Tracker ────────────────────────────────────────────────────────
const STEP_ORDER = ['select_skill', 'select_method', 'active']; // 3-dot indicator

function StepDots({ step }) {
  const activeIdx = step === 'select_skill' ? 0 : step === 'select_method' ? 1 : 2;
  return (
    <div className="flex items-center gap-2 mb-6 justify-center">
      {STEP_ORDER.map((_, idx) => (
        <React.Fragment key={idx}>
          <div className={`rounded-full transition-all duration-200 ${
            idx < activeIdx
              ? 'w-2 h-2 bg-[#6D6AF6]'
              : idx === activeIdx
                ? 'w-5 h-2 bg-[#6D6AF6]'
                : 'w-2 h-2 bg-black/10 dark:bg-white/10'
          }`} />
          {idx < STEP_ORDER.length - 1 && (
            <div className={`w-8 h-px transition-colors duration-200 ${idx < activeIdx ? 'bg-[#6D6AF6]/40' : 'bg-black/10 dark:bg-white/10'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main SkillVerificationModule ─────────────────────────────────────────────
/**
 * SkillVerificationModule
 *
 * Props
 * ─────
 * @param {() => void}  onClose          — dismiss the module
 * @param {(result) => void} onVerified  — called after a successful verify
 *   result shape: { skillId, skillLabel, method, score?, passed?, isPublic? }
 * @param {{ id, label, ... } | null} preselectedSkill — skip skill-selection step
 */
export default function SkillVerificationModule({
  onClose,
  onVerified,
  preselectedSkill = null,
}) {
  // Step machine: 'select_skill' | 'select_method' | 'quiz' | 'certificate'
  const [step, setStep]                   = useState(preselectedSkill ? 'select_method' : 'select_skill');
  const [selectedSkill, setSelectedSkill] = useState(preselectedSkill || null);

  const handleSelectSkill = (skill) => {
    setSelectedSkill(skill);
    setStep('select_method');
  };

  const handleSelectMethod = (method) => {
    setStep(method); // 'quiz' or 'certificate'
  };

  const handleComplete = (result) => {
    onVerified?.({ skillId: selectedSkill?.id, skillLabel: selectedSkill?.label, ...result });
    onClose?.();
  };

  // Cancel from quiz/cert → go back to method selector
  const handleCancel = () => {
    if (step === 'quiz' || step === 'certificate') {
      setStep('select_method');
    } else {
      onClose?.();
    }
  };

  return (
    <div
      id="skill-verification-module"
      className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-xl p-6 md:p-8 w-full max-w-xl mx-auto relative shadow-lg"
    >
      {/* Close button */}
      {onClose && (
        <button
          id="skill-module-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg border border-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-text-main)] hover:bg-[var(--color-gs-bg)] transition-colors"
        >
          <X size={16} />
        </button>
      )}

      {/* 3-step progress indicator */}
      <StepDots step={step} />

      {/* ── Step content ──────────────────────────────────────────────── */}
      {step === 'select_skill' && (
        <SkillSelector onSelect={handleSelectSkill} />
      )}

      {step === 'select_method' && selectedSkill && (
        <MethodSelector
          skill={selectedSkill}
          onSelectMethod={handleSelectMethod}
          onBack={() => { setSelectedSkill(null); setStep('select_skill'); }}
        />
      )}

      {step === 'quiz' && selectedSkill && (
        <QuizFlow
          skill={selectedSkill}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      )}

      {step === 'certificate' && selectedSkill && (
        <CertificateFlow
          skill={selectedSkill}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}



