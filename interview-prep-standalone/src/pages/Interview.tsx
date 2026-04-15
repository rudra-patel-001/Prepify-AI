import { useState, useRef, useEffect } from "react";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Play,
  Square,
  Send,
  ChevronRight,
  ChevronLeft,
  Clock,
  Lightbulb,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const questions = [
  {
    id: 1,
    category: "Behavioral",
    difficulty: "Medium",
    question: "Tell me about a time when you had to lead a project with tight deadlines. How did you handle the pressure and ensure the team stayed on track?",
    hints: ["Use the STAR method", "Focus on specific actions you took", "Highlight measurable outcomes"],
    timeLimit: 120,
  },
  {
    id: 2,
    category: "Technical",
    difficulty: "Hard",
    question: "Design a URL shortening service like bit.ly. Walk me through the system design, including scalability considerations and how you'd handle millions of requests per day.",
    hints: ["Consider database choice (SQL vs NoSQL)", "Talk about caching strategies", "Mention CDN and load balancing"],
    timeLimit: 300,
  },
  {
    id: 3,
    category: "Problem Solving",
    difficulty: "Easy",
    question: "Explain the difference between synchronous and asynchronous programming. When would you choose one approach over the other in a real application?",
    hints: ["Give concrete examples", "Mention performance implications", "Discuss error handling differences"],
    timeLimit: 90,
  },
];

const difficultyColor: Record<string, string> = {
  Easy: "text-green-400 bg-green-400/10",
  Medium: "text-yellow-400 bg-yellow-400/10",
  Hard: "text-red-400 bg-red-400/10",
};

export default function Interview() {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  
  const [answerText, setAnswerText] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Refs for Voice features
  const recognitionRef = useRef<any>(null);
  const preRecordingTextRef = useRef(""); 

  const question = questions[currentQ];

  // 1. Initialize Webcam
  useEffect(() => {
    const startCamera = async () => {
      if (isVideoOff) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setIsVideoOff(true);
      }
    };

    startCamera();

    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (recognitionRef.current) recognitionRef.current.stop();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [isVideoOff]);

  // 2. Text-to-Speech Helper (AI Voice)
  const speakFeedback = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel(); 

    const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Samantha") || v.lang === "en-US");
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  // --- THE FIX IS HERE ---
  const handleStart = () => {
    // We clear fields manually instead of calling resetState() so sessionStarted stays true!
    setSubmitted(false);
    setAiFeedback("");
    setAnswerText("");
    setElapsed(0);
    setSessionStarted(true); 
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  // 3. Speech-to-Text Handler (User Mic)
  const handleRecord = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert("Speech Recognition is not supported in this browser. Please use Google Chrome or Edge.");
        return;
      }

      preRecordingTextRef.current = answerText;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setAnswerText((preRecordingTextRef.current + " " + currentTranscript).trim());
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    }
  };

  const handleSubmit = async () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitted(true);
    setIsAnalyzing(true);
    setAiFeedback("");

    try {
      const res = await fetch("https://prepify-ai-wuil.onrender.com/api/interview/analyze-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: question.question,
          answer: answerText || "The candidate provided no written answer.",
          category: question.category
        }),
      });

      if (!res.ok) throw new Error("Network error");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponseString = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "");
              try {
                const data = JSON.parse(dataStr);
                if (data.done) break;
                if (data.content) {
                  setAiFeedback((prev) => prev + data.content);
                  fullResponseString += data.content;
                }
              } catch (e) {
                // Ignore incomplete JSON chunks
              }
            }
          }
        }
      }

      speakFeedback(fullResponseString);

    } catch (error) {
      console.error(error);
      setAiFeedback("❌ Failed to get analysis. Ensure the backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      resetState();
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      resetState();
    }
  };

  const resetState = () => {
    setSubmitted(false);
    setSessionStarted(false);
    setElapsed(0);
    setAnswerText("");
    setAiFeedback("");
    
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const formatFeedback = (text: string) => {
    return text.split("\n").map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="p-4 md:p-6 page-enter bg-black min-h-full">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">Mock Interview</h1>
        <p className="text-muted-foreground text-sm mt-1">Practice with AI-powered interviews and get real-time feedback</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Webcam Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Camera view */}
          <div
            className={cn(
              "relative rounded-2xl overflow-hidden aspect-video flex items-center justify-center bg-zinc-900",
              "border-2 transition-all duration-500",
              isRecording
                ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                : sessionStarted
                ? "border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                : "border-white/10"
            )}
          >
            {/* Real Video Element */}
            {!isVideoOff && (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="absolute inset-0 w-full h-full object-cover z-0 transform -scale-x-100" 
              />
            )}

            {isVideoOff && (
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  PS
                </div>
                <span className="text-xs text-muted-foreground">Camera is off</span>
              </div>
            )}

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 rounded-lg px-2 py-1 z-20">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-400 font-medium">Listening...</span>
              </div>
            )}

            {/* Timer */}
            {sessionStarted && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1 z-20">
                <Clock className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-white font-mono font-bold">{formatTime(elapsed)}</span>
              </div>
            )}
          </div>

          {/* Camera controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 border",
                isMuted ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-white/5 border-white/10 text-white hover:border-purple-500/30"
              )}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 border",
                isVideoOff ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-white/5 border-white/10 text-white hover:border-purple-500/30"
              )}
            >
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { if ("speechSynthesis" in window) window.speechSynthesis.cancel() }}
              title="Stop AI Voice"
              className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 hover:border-purple-500/30"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="space-y-2.5">
            {!sessionStarted ? (
              <button
                onClick={handleStart}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4" />
                Start Session
              </button>
            ) : (
              <>
                <button
                  onClick={handleRecord}
                  className={cn(
                    "w-full font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all border",
                    isRecording
                      ? "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                      : "bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30"
                  )}
                >
                  {isRecording ? (
                    <><Square className="w-4 h-4" /> Stop Recording</>
                  ) : (
                    <><Mic className="w-4 h-4" /> Record Voice Answer</>
                  )}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitted || !answerText.trim()}
                  className={cn(
                    "w-full font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all border",
                    submitted
                      ? "bg-green-500/20 border-green-500/30 text-green-400"
                      : !answerText.trim() 
                      ? "bg-white/5 text-muted-foreground border-white/5 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:scale-[1.02] border-transparent"
                  )}
                >
                  {submitted ? (
                    <><CheckCircle className="w-4 h-4" /> Submitted!</>
                  ) : (
                    <><Send className="w-4 h-4" /> Submit Answer</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Question & Feedback Panel */}
        <div className="lg:col-span-3 space-y-4 flex flex-col h-full">
          {/* Question nav */}
          <div className="flex items-center gap-3">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentQ(i);
                  resetState();
                }}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-all",
                  i === currentQ ? "bg-purple-500" : i < currentQ ? "bg-purple-500/40" : "bg-white/10"
                )}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span className="text-purple-400 font-medium">{formatTime(question.timeLimit)} time limit</span>
          </div>

          {/* Question card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-white/5 px-2 py-1 rounded-md">
                {question.category}
              </span>
              <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md", difficultyColor[question.difficulty])}>
                {question.difficulty}
              </span>
            </div>

            <p className="text-white text-base font-medium leading-relaxed mb-5">
              {question.question}
            </p>

            {/* Hint section */}
            <div>
              <button
                onClick={() => setShowHints(!showHints)}
                className="flex items-center gap-2 text-sm text-yellow-400/80 hover:text-yellow-400 transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                {showHints ? "Hide hints" : "Show hints"}
              </button>
              {showHints && (
                <div className="mt-3 space-y-2">
                  {question.hints.map((hint, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground bg-yellow-400/5 border border-yellow-400/10 rounded-lg px-3 py-2">
                      <span className="text-yellow-400 font-bold text-xs mt-0.5">{i + 1}.</span>
                      {hint}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Answer Input Area */}
          {!submitted ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white">Your Transcript</span>
                </div>
                {isRecording && <span className="text-xs text-purple-400 animate-pulse">Listening to your mic...</span>}
              </div>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Click 'Record Voice Answer' to start speaking, or type manually..."
                className="flex-1 w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-purple-500/50 resize-none transition-all min-h-[120px]"
              />
            </div>
          ) : (
            /* AI Feedback Area */
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-400">AI Coach Feedback</span>
              </div>
              
              {isAnalyzing && !aiFeedback ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  Analyzing your response...
                </div>
              ) : (
                <div className="text-sm text-white/90 leading-relaxed space-y-4">
                  {formatFeedback(aiFeedback)}
                  {isAnalyzing && <span className="inline-block w-2 h-4 ml-1 bg-purple-400 animate-pulse" />}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              disabled={currentQ === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white disabled:opacity-30 hover:border-purple-500/30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={resetState}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-muted-foreground hover:text-white transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={handleNext}
              disabled={currentQ === questions.length - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-sm text-white disabled:opacity-30 transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}