"use client";

import { useState } from "react";
import confetti from "canvas-confetti";

interface DialogueLine {
  speaker: string;
  text: string;
  missingWord: string;
  choices: string[];
}

interface DialogueData {
  title: string;
  lines: DialogueLine[];
}

interface DialogueTabProps {
  dialogue: DialogueData;
  onComplete?: (score: number) => void;
}

// Normalize blank patterns: replace any sequence of 2+ underscores with a uniform placeholder
const BLANK_PLACEHOLDER = "_____";
function normalizeBlanks(text: string): string {
  return text.replace(/_{2,}/g, BLANK_PLACEHOLDER);
}


const BUBBLE_COLORS = ["bg-[#EDE9FE]", "bg-[#FEF3C7]", "bg-[#DBEAFE]", "bg-[#DCF7E3]", "bg-[#FEE2E2]"];
const BUBBLE_BORDER = ["border-[#8B5CF6]", "border-[#F59E0B]", "border-[#3B82F6]", "border-[#10B981]", "border-[#EF4444]"];

function getSpeakerStyle(speakerName: string, allSpeakers: string[]) {
  const idx = allSpeakers.indexOf(speakerName);
  const colorIdx = idx % BUBBLE_COLORS.length;
  return {
    bg: BUBBLE_COLORS[colorIdx],
    border: BUBBLE_BORDER[colorIdx],
    isRight: idx % 2 !== 0,
  };
}

export default function DialogueTab({ dialogue, onComplete }: DialogueTabProps) {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [activeBlankIdx, setActiveBlankIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [wrongLines, setWrongLines] = useState<number[]>([]);

  // Normalize all line texts for consistent blank detection
  const normalizedLines = dialogue.lines.map(line => ({
    ...line,
    text: normalizeBlanks(line.text),
  }));

  // Unique speakers list (preserving order of appearance)
  const allSpeakers = [...new Set(dialogue.lines.map(l => l.speaker))];

  const handleChoiceSelect = (lineIdx: number, choice: string) => {
    setAnswers(prev => ({ ...prev, [lineIdx]: choice }));
    setActiveBlankIdx(null);
    setHasChecked(false);
    setWrongLines(prev => prev.filter(i => i !== lineIdx));
  };

  const handleCheck = () => {
    const wrong: number[] = [];
    normalizedLines.forEach((line, idx) => {
      if (line.missingWord) {
        const userAns = (answers[idx] || "").trim().toLowerCase();
        const correctAns = line.missingWord.trim().toLowerCase();
        if (userAns !== correctAns) {
          wrong.push(idx);
        }
      }
    });

    const allRight = wrong.length === 0;
    setWrongLines(wrong);
    setIsCorrect(allRight);
    setHasChecked(true);

    if (allRight) {
      setIsAnswered(true);
      if (onComplete) onComplete(100);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#10B981", "#FFD23F", "#3B82F6", "#EC4899", "#F59E0B", "#A3E635"],
      });
    }
  };

  const handleReset = () => {
    setAnswers({});
    setActiveBlankIdx(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setHasChecked(false);
    setWrongLines([]);
  };

  // Counts
  const totalBlanks = normalizedLines.filter(l => l.missingWord).length;

  // Better counting: use lineIdx directly
  const filledCountDirect = normalizedLines.reduce((acc, line, idx) => {
    if (line.missingWord && answers[idx] !== undefined) return acc + 1;
    return acc;
  }, 0);

  if (!dialogue || !dialogue.lines || dialogue.lines.length === 0) {
    return (
      <div className="text-center p-8 text-lg font-bold text-gray-400">
        📭 Bài này chưa có nội dung hội thoại.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-3 space-y-4">
      {/* Tựa đề hội thoại */}
      <div className="w-full text-center space-y-1.5 select-none">
        <span className="inline-block bg-[#F59E0B]/10 border-2 border-[#F59E0B] text-[#D97706] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
          Dialogue Challenge 💬
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-[#3C3C3C]">
          {dialogue.title || "Luyện Hội Thoại"}
        </h3>
        <p className="text-gray-400 font-semibold text-xs sm:text-sm">
          👉 Bấm vào ô trống <span className="bg-[#F97316] text-white px-2 py-0.5 rounded-lg text-xs font-black">màu cam</span> để chọn từ thích hợp!
        </p>
        {/* Thanh tiến trình */}
        <div className="w-full max-w-xs mx-auto mt-1">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
            <span>Đã điền: {filledCountDirect}/{totalBlanks}</span>
            <span>{totalBlanks > 0 ? Math.round((filledCountDirect / totalBlanks) * 100) : 100}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 border border-gray-200">
            <div
              className="bg-gradient-to-r from-orange-400 to-yellow-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${totalBlanks > 0 ? (filledCountDirect / totalBlanks) * 100 : 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Khung đoạn hội thoại chính */}
      <div className="w-full bg-white border-4 border-[#3C3C3C] p-4 sm:p-6 rounded-3xl shadow-[8px_8px_0px_0px_#3C3C3C] flex flex-col space-y-4 relative overflow-visible">
        <div className="flex flex-col space-y-3">
          {normalizedLines.map((line, idx) => {
            const hasBlank = !!line.missingWord;
            const selectedWord = answers[idx];
            const style = getSpeakerStyle(line.speaker, allSpeakers);
            const isWrong = hasChecked && wrongLines.includes(idx);
            const isCorrectLine = hasChecked && hasBlank && !wrongLines.includes(idx) && !!selectedWord;

            return (
              <div
                key={idx}
                className={`flex flex-col space-y-1 ${style.isRight ? "items-end" : "items-start"}`}
              >
                {/* Tên người nói với avatar chữ cái */}
                <div className={`flex items-center gap-1.5 ${style.isRight ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full ${style.bg} border-2 ${style.border} flex items-center justify-center text-xs font-black`}>
                    {line.speaker.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-black text-gray-400 select-none">{line.speaker}</span>
                </div>

                {/* Bong bóng hội thoại */}
                <div
                  className={`max-w-[88%] p-3 sm:p-4 rounded-2xl border-2 text-[#3C3C3C] text-base sm:text-lg font-bold shadow-[2px_2px_0px_0px_#3C3C3C] relative ${
                    style.isRight ? "rounded-tr-none" : "rounded-tl-none"
                  } ${style.bg} ${style.border} ${
                    isWrong ? "ring-2 ring-red-400 ring-offset-1" : ""
                  } ${isCorrectLine ? "ring-2 ring-green-400 ring-offset-1" : ""}`}
                >
                  {hasBlank ? (
                    <span className="leading-relaxed">
                      {/* Render text trước ô trống */}
                      {line.text.split(BLANK_PLACEHOLDER)[0]}

                      {/* Nút ô trống */}
                      <button
                        onClick={() =>
                          !isAnswered && setActiveBlankIdx(activeBlankIdx === idx ? null : idx)
                        }
                        disabled={isAnswered}
                        className={`inline-block mx-1 px-3 py-1 rounded-xl border-2 font-black text-sm transition-all ${
                          selectedWord
                            ? isWrong
                              ? "bg-red-400 border-red-600 text-white"
                              : isCorrectLine
                              ? "bg-green-500 border-green-700 text-white"
                              : "bg-[#3B82F6] border-[#1E3A8A] text-white"
                            : "bg-[#F97316] border-[#C2410C] text-white animate-pulse"
                        }`}
                      >
                        {selectedWord
                          ? isWrong
                            ? `❌ ${selectedWord}`
                            : isCorrectLine
                            ? `✓ ${selectedWord}`
                            : selectedWord
                          : "❓ Chọn từ"}
                      </button>

                      {/* Render text sau ô trống */}
                      {line.text.split(BLANK_PLACEHOLDER)[1] || ""}
                      
                      {/* Gợi ý đáp án khi sai */}
                      {isWrong && (
                        <span className="block text-xs font-black text-green-600 mt-1">
                          ✅ Đáp án đúng: <span className="underline">{line.missingWord}</span>
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="leading-relaxed">{line.text}</span>
                  )}

                  {/* Popover danh sách 4 lựa chọn */}
                  {activeBlankIdx === idx && !isAnswered && (
                    <div
                      className={`absolute z-50 mt-2 bg-white border-3 border-[#3C3C3C] p-3 rounded-2xl shadow-[6px_6px_0px_0px_#3C3C3C] flex flex-wrap gap-2 w-max max-w-[260px] justify-center ${
                        style.isRight ? "right-0" : "left-0"
                      } top-full`}
                    >
                      <div className="w-full text-center text-xs font-black text-gray-400 mb-1 select-none">
                        Chọn từ đúng 👇
                      </div>
                      {line.choices.map((choice) => (
                        <button
                          key={choice}
                          onClick={() => handleChoiceSelect(idx, choice)}
                          className="bg-yellow-100 hover:bg-yellow-300 border-2 border-[#3C3C3C] text-[#3C3C3C] px-4 py-2 rounded-xl text-sm font-extrabold capitalize transition-transform hover:scale-105 active:scale-95 shadow-[2px_2px_0px_0px_#3C3C3C]"
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Nút hành động */}
        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 bg-gray-200 border-2 border-gray-400 text-gray-700 font-extrabold rounded-xl hover:bg-gray-300 active:translate-y-[1px] transition-all"
          >
            🔄 RESET
          </button>

          <button
            onClick={handleCheck}
            disabled={filledCountDirect < totalBlanks || isAnswered}
            className="flex-2 py-2.5 px-6 bg-[#10B981] text-white border-2 border-[#047857] font-black rounded-xl shadow-[3px_3px_0px_0px_#047857] hover:bg-[#059669] active:translate-y-[1px] transition-all disabled:opacity-45 disabled:cursor-not-allowed"
          >
            🔍 KIỂM TRA ĐÁP ÁN ({filledCountDirect}/{totalBlanks})
          </button>
        </div>
      </div>

      {/* Hiển thị kết quả */}
      {hasChecked && (
        <div
          className={`w-full p-5 rounded-3xl border-3 flex flex-col items-center justify-center text-center ${
            isCorrect
              ? "bg-[#D1FAE5] border-[#10B981] text-[#065F46]"
              : "bg-[#FEF9C3] border-[#F59E0B] text-[#92400E]"
          }`}
        >
          {isCorrect ? (
            <div className="space-y-2">
              <h4 className="text-2xl font-black">🎉 Bé Quá Xuất Sắc! Đúng Hết Rồi! 🌟</h4>
              <p className="font-bold text-sm sm:text-base">
                Bé đã hoàn thành xuất sắc đoạn hội thoại! Hãy chuyển sang bài học khác nhé!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="text-xl font-black">⚠️ Còn {wrongLines.length} từ chưa đúng!</h4>
              <p className="font-bold text-sm sm:text-base">
                Bé hãy xem gợi ý màu xanh lá bên dưới ô trống sai và thử lại nhé! Cố lên bé ơi! 💪
              </p>
              <button
                onClick={() => {
                  // Tự động điền đáp án đúng cho các ô sai
                  const corrected = { ...answers };
                  wrongLines.forEach(idx => {
                    corrected[idx] = normalizedLines[idx].missingWord;
                  });
                  setAnswers(corrected);
                  setWrongLines([]);
                  setHasChecked(false);
                }}
                className="mt-2 px-5 py-2 bg-[#F59E0B] text-white border-2 border-[#B45309] font-black rounded-xl hover:bg-[#D97706] active:translate-y-[1px] transition-all text-sm"
              >
                💡 Xem Đáp Án Gợi Ý
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
