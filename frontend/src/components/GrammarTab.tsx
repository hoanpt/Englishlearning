"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

interface GrammarData {
  structure: string;
  examples: string[];
}

interface VocabItem {
  word: string;
  meaning: string;
  phonetic: string;
}

interface GrammarTabProps {
  grammar: GrammarData;
  vocabulary?: VocabItem[];
  onComplete?: (score: number) => void;
}

interface Question {
  sentenceWithBlank: string;
  correctAnswer: string;
  choices: string[];
  originalSentence: string;
}

// Lấy ngẫu nhiên N phần tử từ mảng, không trùng lặp
function sampleArray<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// Sinh câu hỏi từ một câu ví dụ ngữ pháp
function buildQuestion(example: string, allWords: string[]): Question | null {
  // Loại bỏ các từ quá ngắn, từ chức năng phổ biến và dấu câu
  const stopWords = new Set([
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "has", "have", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "to", "of", "in", "on",
    "at", "by", "for", "with", "from", "and", "but", "or", "so", "yet",
    "i", "you", "he", "she", "it", "we", "they", "me", "him", "her",
    "us", "them", "my", "your", "his", "its", "our", "their", "this",
    "that", "these", "those", "what", "who", "how", "very", "too", "not",
    "no", "s", "re", "t", "ve", "ll", "watch", "look", "our", "up", "out",
  ]);

  // Tách các từ từ câu ví dụ, giữ lại vị trí dấu câu
  const tokens = example.split(/(\s+|(?=[.,!?;:])|(?<=[.,!?;:]))/);
  
  // Tìm các từ nội dung (content words) để làm đáp án
  const candidateIndices: number[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const clean = t.replace(/[.,!?;:'"()]/g, "").toLowerCase().trim();
    if (clean.length > 2 && !stopWords.has(clean)) {
      candidateIndices.push(i);
    }
  }

  if (candidateIndices.length === 0) return null;

  // Chọn một từ ngẫu nhiên từ danh sách ứng viên
  const targetIdx = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
  const targetToken = tokens[targetIdx];
  const targetClean = targetToken.replace(/[.,!?;:'"()]/g, "").trim();

  // Tạo câu hỏi có khoảng trống
  const sentenceWithBlank = tokens
    .map((t, i) => (i === targetIdx ? "________" : t))
    .join("")
    .trim();

  // Tạo danh sách đáp án nhiễu từ từ vựng bài học + các từ trong ví dụ khác
  const distractorPool = [
    ...allWords.filter(w => w.toLowerCase() !== targetClean.toLowerCase()),
    // Thêm các biến thể hình thái học đơn giản
    targetClean + "s",
    targetClean + "ed",
    targetClean + "ing",
    "un" + targetClean,
  ].filter(w => w.length > 1 && w.toLowerCase() !== targetClean.toLowerCase());

  // Bỏ trùng lặp và giới hạn pool
  const uniquePool = [...new Set(distractorPool)];
  const distractors = sampleArray(uniquePool, 3);

  // Đảm bảo đủ 4 lựa chọn
  const choices = [targetClean, ...distractors]
    .filter((v, i, a) => a.indexOf(v) === i) // dedupe
    .slice(0, 4)
    .sort(() => Math.random() - 0.5);

  // Nếu ít hơn 4 lựa chọn, bổ sung thêm
  const extras = ["big", "fast", "good", "long", "pretty", "well", "small", "dark", "light", "strong"];
  while (choices.length < 4) {
    const e = extras.find(ex => !choices.includes(ex));
    if (e) choices.push(e);
    else break;
  }

  return {
    sentenceWithBlank,
    correctAnswer: targetClean,
    choices: choices.slice(0, 4),
    originalSentence: example,
  };
}

export default function GrammarTab({ grammar, vocabulary = [], onComplete }: GrammarTabProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Sinh câu hỏi trắc nghiệm từ các ví dụ ngữ pháp
  useEffect(() => {
    // Tập hợp tất cả từ vựng bài học để làm đáp án nhiễu
    const vocabWords = vocabulary.map(v => v.word);
    
    // Tập hợp các từ nội dung từ toàn bộ examples
    const allExampleWords: string[] = [];
    for (const ex of grammar.examples) {
      const words = ex.split(/\s+/).map(w => w.replace(/[.,!?;:'"()]/g, "").trim()).filter(w => w.length > 2);
      allExampleWords.push(...words);
    }
    
    const allWords = [...new Set([...vocabWords, ...allExampleWords])];
    
    // Sinh câu hỏi cho từng example
    const generatedQuestions: Question[] = [];
    for (const example of grammar.examples) {
      const q = buildQuestion(example, allWords);
      if (q) generatedQuestions.push(q);
    }

    // Đảm bảo tối thiểu 10 câu hỏi bằng cách lặp lại nếu cần
    const finalQuestions: Question[] = [];
    let i = 0;
    const targetLength = Math.max(10, generatedQuestions.length);
    while (finalQuestions.length < targetLength && generatedQuestions.length > 0) {
      finalQuestions.push(generatedQuestions[i % generatedQuestions.length]);
      i++;
    }

    setQuestions(finalQuestions.length > 0 ? finalQuestions : generatedQuestions);
    setCurrentQuestionIdx(0);
    setScore(0);
    setStars([]);
    setSelectedChoice(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setIsComplete(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(grammar), JSON.stringify(vocabulary)]);

  const handleChoiceClick = (choice: string) => {
    if (isAnswered) return;

    setSelectedChoice(choice);
    setIsAnswered(true);

    const isRight = choice.toLowerCase().trim() === questions[currentQuestionIdx].correctAnswer.toLowerCase().trim();
    setIsCorrect(isRight);

    if (isRight) {
      setScore((prev) => prev + 10);
      setStars((prev) => [...prev, prev.length + 1]);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FFD23F", "#FF5A5F", "#A3E635", "#3B82F6", "#EC4899"],
      });
    }
  };

  const handleNext = () => {
    setSelectedChoice(null);
    setIsAnswered(false);
    setIsCorrect(false);
    if (currentQuestionIdx === questions.length - 1) {
      setIsComplete(true);
      if (onComplete) onComplete(score);
    } else {
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };

  const restartGrammar = () => {
    setIsComplete(false);
    setCurrentQuestionIdx(0);
    setScore(0);
    setStars([]);
  };

  const currentQuestion = questions[currentQuestionIdx];

  if (questions.length === 0 || !currentQuestion) {
    return (
      <div className="text-center p-8 text-lg font-bold text-gray-400">
        🔄 Đang tải câu hỏi trắc nghiệm...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-3 space-y-4">
      {/* Khung điểm số và Huy hiệu sao vàng */}
      <div className="w-full flex items-center justify-between bg-white border-3 border-[#3C3C3C] p-4 rounded-2xl shadow-[4px_4px_0px_0px_#3C3C3C]">
        <div className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">🏆</span>
          <span className="text-lg sm:text-xl font-black text-[#3C3C3C]">
            ĐIỂM: <span className="text-[#FF5A5F] text-2xl sm:text-3xl ml-1">{score}</span>
          </span>
        </div>

        {/* Sao vàng tích lũy */}
        <div className="flex gap-1 min-h-[32px] flex-wrap max-w-[200px] justify-end">
          {stars.slice(-8).map((s) => (
            <span key={s} className="text-xl sm:text-2xl animate-bounce">⭐</span>
          ))}
          {stars.length === 0 && (
            <span className="text-gray-300 font-bold text-sm flex items-center">Chưa có sao 🌟</span>
          )}
        </div>
      </div>

      {/* Khung lý thuyết cấu trúc câu */}
      <div className="w-full bg-[#ECFDF5] border-3 border-[#10B981] p-4 sm:p-5 rounded-3xl shadow-[6px_6px_0px_0px_#10B981]">
        <h4 className="text-[#065F46] text-base sm:text-lg font-black flex items-center gap-1.5">
          💡 Cấu trúc ngữ pháp bài học:
        </h4>
        <p className="text-[#047857] font-bold text-sm sm:text-base mt-1.5 bg-white/70 px-4 py-2 rounded-2xl border border-[#A7F3D0]">
          {grammar.structure}
        </p>
      </div>

      {/* Hộp câu hỏi Trắc Nghiệm */}
      {isComplete ? (
        <div className="w-full bg-white border-4 border-[#3C3C3C] p-8 rounded-3xl shadow-[8px_8px_0px_0px_#3C3C3C] text-center space-y-6">
          <div className="text-6xl animate-bounce">🏆</div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#10B981]">Tuyệt Vời!</h2>
          <p className="text-lg font-bold text-gray-500">Bé đã hoàn thành phần kiểm tra Ngữ pháp.</p>
          <button
            onClick={restartGrammar}
            className="mt-4 px-8 py-4 bg-[#3B82F6] text-white border-3 border-[#1E3A8A] font-black rounded-xl shadow-[4px_4px_0px_0px_#1E3A8A] hover:bg-[#2563EB] transition-all text-xl"
          >
            🔄 CHƠI LẠI TỪ ĐẦU
          </button>
        </div>
      ) : (
      <div className="w-full bg-white border-4 border-[#3C3C3C] p-6 rounded-3xl shadow-[8px_8px_0px_0px_#3C3C3C] flex flex-col space-y-6">
        <div className="flex justify-between items-center select-none">
          <span className="text-[#3B82F6] font-black text-xl sm:text-2xl">🧩 TRẮC NGHIỆM</span>
          <span className="bg-gray-100 border-2 border-gray-300 px-3 py-1 rounded-xl text-xs sm:text-sm font-bold text-gray-500">
            Câu {currentQuestionIdx + 1} / {questions.length}
          </span>
        </div>

        {/* Đề bài (Khoảng trống) */}
        <div className="text-center py-4 bg-[#EFF6FF] rounded-2xl border-2 border-[#BFDBFE]">
          <p className="text-xl sm:text-2xl font-black text-[#1E3A8A] leading-relaxed px-4">
            {currentQuestion.sentenceWithBlank}
          </p>
        </div>

        {/* Danh sách 4 Đáp Án */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentQuestion.choices.map((choice) => {
            const isSelected = selectedChoice === choice;
            let btnClass = "bg-white hover:bg-gray-50 border-[#3C3C3C] text-[#3C3C3C]";

            if (isAnswered) {
              if (choice.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()) {
                btnClass = "bg-[#10B981] border-[#047857] text-white shadow-[2px_2px_0px_0px_#047857]";
              } else if (isSelected) {
                btnClass = "bg-[#EF4444] border-[#991B1B] text-white shadow-[2px_2px_0px_0px_#991B1B]";
              } else {
                btnClass = "bg-gray-100 border-gray-300 text-gray-400 opacity-60";
              }
            } else {
              btnClass =
                "bg-white hover:bg-yellow-50 border-[#3C3C3C] text-[#3C3C3C] shadow-[4px_4px_0px_0px_#3C3C3C] hover:translate-y-[-2px] active:translate-y-[2px]";
            }

            return (
              <button
                key={choice}
                onClick={() => handleChoiceClick(choice)}
                disabled={isAnswered}
                className={`py-4 px-6 border-3 text-lg sm:text-xl font-black rounded-2xl transition-all capitalize tracking-wide select-none ${btnClass}`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {/* Phản hồi kết quả */}
        {isAnswered && (
          <div className="flex flex-col items-center justify-center pt-4 border-t border-gray-100 space-y-4">
            <div className="text-center">
              {isCorrect ? (
                <span className="text-[#10B981] font-black text-xl sm:text-2xl animate-pulse">
                  🎉 Bé làm rất tốt! Đúng rồi! 🌟
                </span>
              ) : (
                <div className="text-[#EF4444] font-black text-lg sm:text-xl">
                  <span>❌ Chưa chính xác bé ơi!</span>
                  <p className="text-gray-500 font-bold text-sm sm:text-base mt-1">
                    Câu hoàn chỉnh là: <span className="underline font-black text-gray-700">"{currentQuestion.originalSentence}"</span>
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 bg-[#3B82F6] text-white border-2 border-[#1E3A8A] font-black rounded-xl shadow-[3px_3px_0px_0px_#1E3A8A] hover:bg-[#2563EB] active:translate-y-[1px] transition-all"
            >
              {currentQuestionIdx === questions.length - 1 ? "HOÀN THÀNH 🏆" : "CÂU TIẾP THEO ➡"}
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
