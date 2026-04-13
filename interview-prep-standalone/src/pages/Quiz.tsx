import { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle, ChevronRight, Trophy, RotateCcw, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const quizQuestions = [
  {
    id: 1,
    question: "What is the time complexity of searching in a balanced Binary Search Tree?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correct: 1,
    explanation: "In a balanced BST, the height is O(log n), so search operations take O(log n) time.",
    category: "Data Structures",
  },
  {
    id: 2,
    question: "Which HTTP method is idempotent and should be used for updating an existing resource?",
    options: ["POST", "PATCH", "PUT", "DELETE"],
    correct: 2,
    explanation: "PUT is idempotent — calling it multiple times with the same data produces the same result. It replaces the entire resource.",
    category: "API Design",
  },
  {
    id: 3,
    question: "In React, when does useEffect run by default (without a dependency array)?",
    options: ["Only on mount", "Only on unmount", "After every render", "Only when props change"],
    correct: 2,
    explanation: "Without a dependency array, useEffect runs after every render cycle. An empty [] array means it runs only on mount.",
    category: "React",
  },
  {
    id: 4,
    question: "What does SOLID stand for in software design principles?",
    options: [
      "Single, Open, Liskov, Interface, Dependency",
      "Simple, Optimized, Layered, Integrated, Design",
      "Scalable, Object, Linear, Interface, Dynamic",
      "Sequential, Ordered, Linked, Instance, Data",
    ],
    correct: 0,
    explanation: "SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.",
    category: "Design Patterns",
  },
  {
    id: 5,
    question: "What is the purpose of a database index?",
    options: [
      "To encrypt sensitive data",
      "To speed up data retrieval operations",
      "To prevent duplicate entries",
      "To backup data automatically",
    ],
    correct: 1,
    explanation: "Indexes improve read performance by creating a data structure that allows faster lookups, at the cost of slightly slower writes and more storage.",
    category: "Databases",
  },
];

const TIME_PER_QUESTION = 30;

export default function Quiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(quizQuestions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = quizQuestions[currentQ];
  const progress = ((currentQ) / quizQuestions.length) * 100;

  useEffect(() => {
    if (answered || finished) return;
    setTimeLeft(TIME_PER_QUESTION);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimedOut(true);
          setAnswered(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentQ, finished]);

  const handleSelect = (optionIndex: number) => {
    if (answered) return;
    setSelected(optionIndex);
    setAnswered(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = optionIndex === question.correct;
    if (isCorrect) setScore((s) => s + 1);

    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setAnswered(false);
      setTimedOut(false);
    } else {
      setFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setAnswers(new Array(quizQuestions.length).fill(null));
    setTimedOut(false);
  };

  const getScoreGrade = () => {
    const pct = (score / quizQuestions.length) * 100;
    if (pct >= 80) return { grade: "A", label: "Excellent!", color: "text-green-400" };
    if (pct >= 60) return { grade: "B", label: "Good Job!", color: "text-blue-400" };
    if (pct >= 40) return { grade: "C", label: "Keep Practicing", color: "text-yellow-400" };
    return { grade: "D", label: "Study More", color: "text-red-400" };
  };

  const timerPct = (timeLeft / TIME_PER_QUESTION) * 100;
  const timerColor = timeLeft > 15 ? "#a855f7" : timeLeft > 8 ? "#f59e0b" : "#ef4444";

  if (finished) {
    const gradeInfo = getScoreGrade();
    return (
      <div className="p-4 md:p-6 page-enter flex items-center justify-center min-h-[80vh]">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="glass-card rounded-3xl p-8 neon-border">
            <div className="w-20 h-20 rounded-2xl btn-gradient mx-auto flex items-center justify-center mb-5">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Quiz Complete!</h2>
            <p className={`text-lg font-semibold ${gradeInfo.color} mb-6`}>{gradeInfo.label}</p>

            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">{score}/{quizQuestions.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Correct</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className={`text-3xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</div>
                <div className="text-xs text-muted-foreground mt-1">Grade</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{Math.round((score / quizQuestions.length) * 100)}%</div>
                <div className="text-xs text-muted-foreground mt-1">Score</div>
              </div>
            </div>

            {/* Answer review */}
            <div className="space-y-2 mb-6">
              {quizQuestions.map((q, i) => {
                const ans = answers[i];
                const isCorrect = ans === q.correct;
                const didAnswer = ans !== null;
                return (
                  <div key={i} className="flex items-center gap-2 text-left p-2.5 rounded-xl bg-white/3">
                    {!didAnswer ? (
                      <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    ) : isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <span className="text-xs text-muted-foreground truncate">Q{i + 1}: {q.category}</span>
                    <span className={cn("text-xs ml-auto font-medium flex-shrink-0", isCorrect ? "text-green-400" : "text-red-400")}>
                      {!didAnswer ? "Timeout" : isCorrect ? "+20pts" : "0pts"}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              data-testid="button-restart-quiz"
              onClick={handleRestart}
              className="w-full btn-gradient text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 page-enter">
      {/* Top progress + timer */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground font-medium">
              Question {currentQ + 1} of {quizQuestions.length}
            </span>
            <span className="text-xs text-purple-400 font-semibold">
              Score: {score * 20}pts
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full progress-gradient transition-all duration-500"
              style={{ width: `${progress + (1 / quizQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Timer */}
        <div
          data-testid="timer-display"
          className="flex items-center gap-2 glass rounded-xl px-3 py-2 flex-shrink-0 border transition-colors"
          style={{ borderColor: `${timerColor}40` }}
        >
          <Clock className="w-3.5 h-3.5" style={{ color: timerColor }} />
          <span className="text-sm font-bold font-mono" style={{ color: timerColor }}>{timeLeft}s</span>
          <div className="w-10 h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${timerPct}%`, background: timerColor }}
            />
          </div>
        </div>
      </div>

      {/* Question dots */}
      <div className="flex items-center gap-1.5 mb-6">
        {quizQuestions.map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-full transition-all duration-300",
              i === currentQ ? "w-6 h-2 bg-purple-500" :
              answers[i] !== null
                ? answers[i] === quizQuestions[i].correct
                  ? "w-2 h-2 bg-green-500"
                  : "w-2 h-2 bg-red-500"
                : "w-2 h-2 bg-white/10"
            )}
          />
        ))}
      </div>

      {/* Question card */}
      <div className="max-w-2xl mx-auto">
        <div className="glass-card rounded-2xl p-6 mb-4 neon-border">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">{question.category}</span>
          </div>
          <p className="text-lg font-semibold text-white leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            const isCorrect = i === question.correct;
            const showResult = answered;

            let state: "default" | "correct" | "wrong" | "missed" = "default";
            if (showResult) {
              if (isCorrect) state = "correct";
              else if (isSelected && !isCorrect) state = "wrong";
            }
            if (isSelected && !showResult) state = "default";

            return (
              <button
                key={i}
                data-testid={`button-option-${i}`}
                onClick={() => handleSelect(i)}
                disabled={answered}
                className={cn(
                  "w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-3",
                  state === "correct"
                    ? "bg-green-500/15 border-green-500/40 text-green-300"
                    : state === "wrong"
                    ? "bg-red-500/15 border-red-500/40 text-red-300"
                    : !answered && "hover:bg-white/5 hover:border-purple-500/40 hover:scale-[1.01]",
                  !answered && "border-white/10 text-white/80 cursor-pointer",
                  answered && state === "default" && "border-white/5 text-muted-foreground cursor-default opacity-50"
                )}
              >
                <span className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all",
                  state === "correct" ? "bg-green-500/20 text-green-400" :
                  state === "wrong" ? "bg-red-500/20 text-red-400" :
                  "bg-white/5 text-muted-foreground"
                )}>
                  {state === "correct" ? <CheckCircle className="w-3.5 h-3.5" /> : state === "wrong" ? <XCircle className="w-3.5 h-3.5" /> : String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div className={cn(
            "rounded-xl p-4 mb-4 text-sm",
            timedOut
              ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300"
              : selected === question.correct
              ? "bg-green-500/10 border border-green-500/20 text-green-300"
              : "bg-red-500/10 border border-red-500/20 text-red-300"
          )}>
            <div className="font-semibold mb-1 flex items-center gap-2">
              {timedOut ? (
                <><Clock className="w-4 h-4" /> Time's up!</>
              ) : selected === question.correct ? (
                <><CheckCircle className="w-4 h-4" /> Correct! +20pts</>
              ) : (
                <><XCircle className="w-4 h-4" /> Incorrect</>
              )}
            </div>
            <p className="text-xs opacity-80 leading-relaxed">{question.explanation}</p>
          </div>
        )}

        {/* Next button */}
        {answered && (
          <button
            data-testid="button-next-quiz"
            onClick={handleNext}
            className="w-full btn-gradient text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {currentQ < quizQuestions.length - 1 ? (
              <><ChevronRight className="w-4 h-4" /> Next Question</>
            ) : (
              <><Trophy className="w-4 h-4" /> See Results</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
