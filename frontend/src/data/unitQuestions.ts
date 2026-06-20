export interface MCQChallenge {
  type: 'mc';
  text: string;
  options: string[];
  correctIndex: number;
}

export interface SpellingChallenge {
  type: 'spelling';
  text: string;
  scrambled: string;
  word: string;
  options: string[];
  correctIndex: number;
}

export interface TFChallenge {
  type: 'tf';
  text: string;
  answer: boolean;
  explanation: string;
}

export interface ClozeChallenge {
  type: 'cloze';
  text: string;
  options: string[];
  correctIndex: number;
}

export interface SentenceChallenge {
  type: 'sentence_builder';
  text: string;
  scrambledWords: string[];
  correctSentence: string;
}

export type UnitChallenge =
  | MCQChallenge
  | SpellingChallenge
  | TFChallenge
  | ClozeChallenge
  | SentenceChallenge;

export interface UnitQuestions {
  unitNumber: number;
  challenges: UnitChallenge[];
}

export const unitQuestions: UnitQuestions[] = [
  {
    unitNumber: 1,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Pretty" có nghĩa tiếng Việt là gì?',
        options: ['Buồn cười, khôi hài', 'Xinh đẹp, dễ thương', 'Khát nước', 'Chú hề'],
        correctIndex: 1
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "C - L - O - W - N"',
        scrambled: 'C - L - O - W - N',
        word: 'CLOWN',
        options: ['CLOWN', 'CROWN', 'CLONW', 'COWNL'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Trong tiếng Anh, Đại từ tân ngữ (Object Pronoun - me, him, her...) luôn luôn đứng TRƯỚC động từ chính trong câu. Đúng hay Sai?',
        answer: false,
        explanation: 'Sai rồi con nhé! Đại từ tân ngữ đứng SAU động từ chính hoặc giới từ (ví dụ: "Help me", "Look at him").'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "He has got fair hair and glasses. He _____ run very fast."',
        options: ['are', 'is', 'can', 'have'],
        correctIndex: 2
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['cat', 'Pat is', 'pretty', 'a', 'little'],
        correctSentence: 'Pat is a pretty little cat'
      }
    ]
  },
  {
    unitNumber: 2,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Thief" có nghĩa tiếng Việt là gì?',
        options: ['Đứa trẻ', 'Máy ảnh', 'Kẻ trộm', 'Ổ bánh mì'],
        correctIndex: 2
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "C - H - I - L - D"',
        scrambled: 'C - H - I - L - D',
        word: 'CHILD',
        options: ['CHILD', 'CHLID', 'CHILDS', 'CHILDE'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Danh từ số nhiều của "child" (đứa trẻ) là "childrens". Đúng hay Sai?',
        answer: false,
        explanation: 'Sai rồi con nhé! "child" là danh từ số nhiều bất quy tắc, số nhiều của nó là "children" (không thêm s).'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "These books near me are heavy, but __________ ones far away on the shelf are light."',
        options: ['this', 'these', 'that', 'those'],
        correctIndex: 3
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['loaves', 'of', 'two', 'bread', 'I need'],
        correctSentence: 'I need two loaves of bread'
      }
    ]
  },
  {
    unitNumber: 3,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Mane" có nghĩa tiếng Việt là gì?',
        options: ['Mái nhà', 'Bờm (sư tử, ngựa)', 'Thân cây', 'Sở hữu'],
        correctIndex: 1
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "T - R - U - N - K"',
        scrambled: 'T - R - U - N - K',
        word: 'TRUNK',
        options: ['TRUNK', 'TURNC', 'TRUNC', 'TRUNKK'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Ta có thể dùng sở hữu cách "\'s" cho cả người và đồ vật. Ví dụ viết "the car\'s roof" là hoàn toàn chính xác. Đúng hay Sai?',
        answer: false,
        explanation: 'Sai rồi con nhé! Với đồ vật ta nên dùng giới từ "of", ví dụ: "the roof of the car". Ta chỉ dùng "\'s" cho người hoặc động vật thôi.'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "Whose hat is this? It is __________."',
        options: ["Mike's", 'Mikes', 'of Mike', 'Mike'],
        correctIndex: 0
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['mane', 'is', 'the', "lion's", 'long'],
        correctSentence: "the lion's mane is long"
      }
    ]
  },
  {
    unitNumber: 4,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Baker\'s" có nghĩa tiếng Việt là gì?',
        options: ['Cửa hàng kẹo', 'Nhà hát', 'Tiệm bánh mì', 'Bột mì'],
        correctIndex: 2
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "F - L - O - U - R"',
        scrambled: 'F - L - O - U - R',
        word: 'FLOUR',
        options: ['FLOUR', 'FLOURE', 'FLOURR', 'FLOWR'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Chúng ta sử dụng "any" trong câu phủ định và câu hỏi cho cả danh từ đếm được số nhiều và danh từ không đếm được. Đúng hay Sai?',
        answer: true,
        explanation: 'Đúng rồi con ơi! Ví dụ: "Are there any trees?" hay "There isn\'t any flour".'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "There is some bread, but there aren\'t __________ apples in the sweet shop."',
        options: ['some', 'any', 'many', 'much'],
        correctIndex: 1
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['there is', "baker's", 'and', 'a bank', 'a'],
        correctSentence: "there is a baker's and a bank"
      }
    ]
  },
  {
    unitNumber: 5,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Shine" có nghĩa tiếng Việt là gì?',
        options: ['Đánh nhau', 'Tuyết rơi', 'Tỏa sáng, chiếu sáng', 'Diễn kịch câm'],
        correctIndex: 2
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "F - I - G - H - T"',
        scrambled: 'F - I - G - H - T',
        word: 'FIGHT',
        options: ['FIGHT', 'FITGH', 'FIGTH', 'FITEG'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Thì Hiện tại tiếp diễn (Present Continuous) được dùng để diễn tả các thói quen lặp đi lặp lại hàng ngày. Đúng hay Sai?',
        answer: false,
        explanation: 'Sai rồi con! Thì Hiện tại tiếp diễn dùng cho hành động đang xảy ra ngay tại thời điểm nói. Thói quen hàng ngày ta dùng Hiện tại đơn nhé!'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "Look! The sun __________ brightly today. It isn\'t snowing."',
        options: ['shine', 'shines', 'is shining', 'shining'],
        correctIndex: 2
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['children', 'are', 'the', 'fighting'],
        correctSentence: 'the children are fighting'
      }
    ]
  },
  {
    unitNumber: 6,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Routine" có nghĩa tiếng Việt là gì?',
        options: ['Trò đùa', 'Hiếm khi', 'Thói quen hàng ngày', 'Bát đĩa'],
        correctIndex: 2
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "J - O - K - E"',
        scrambled: 'J - O - K - E',
        word: 'JOKE',
        options: ['JOKE', 'JOCK', 'JOKEE', 'JOK'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Trạng từ chỉ tần suất (always, often, usually...) luôn đứng TRƯỚC động từ thường nhưng đứng SAU động từ "to be". Đúng hay Sai?',
        answer: true,
        explanation: 'Đúng rồi con! Ví dụ: "I often play games" và "I am always happy".'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "My father __________ tells good jokes to us on weekends."',
        options: ['often', 'is often', 'often is', 'always is'],
        correctIndex: 0
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['dishes', 'always', 'washes', 'mother', 'the'],
        correctSentence: 'mother always washes the dishes'
      }
    ]
  },
  {
    unitNumber: 7,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Shout" có nghĩa tiếng Việt là gì?',
        options: ['Với tới', 'La hét, hét lên', 'Ủng, giày cao cổ', 'Câu mệnh lệnh'],
        correctIndex: 1
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "B - O - O - T - S"',
        scrambled: 'B - O - O - T - S',
        word: 'BOOTS',
        options: ['BOOTS', 'BOTOS', 'BOOTES', 'BOOTSS'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Câu mệnh lệnh khẳng định bắt đầu bằng động từ nguyên mẫu và KHÔNG cần có chủ ngữ đứng trước. Đúng hay Sai?',
        answer: true,
        explanation: 'Hoàn toàn chính xác con ơi! Ví dụ: "Stand up!" hoặc "Take your boots off!" mà không cần chủ ngữ.'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "__________ shout in the class, please! The teacher is talking."',
        options: ["Don't", 'Please', 'Do', 'Not'],
        correctIndex: 0
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['boots', 'take', 'your', 'off', 'please'],
        correctSentence: 'take your boots off please'
      }
    ]
  },
  {
    unitNumber: 8,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Opposite" có nghĩa tiếng Việt là gì?',
        options: ['Ở giữa', 'Ở phía trên', 'Đối diện', 'Tấm thảm'],
        correctIndex: 2
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "B - E - L - O - W"',
        scrambled: 'B - E - L - O - W',
        word: 'BELOW',
        options: ['BELOW', 'BELOWW', 'BELLOW', 'BELOWE'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Giới từ "above" và "on" đều có nghĩa là ở trên, nhưng "on" dùng khi vật chạm bề mặt vật dưới, còn "above" dùng khi vật lơ lửng không chạm bề mặt. Đúng hay Sai?',
        answer: true,
        explanation: 'Chính xác! "The book is on the table" (chạm bàn), còn "The clock is above the table" (treo lơ lửng trên bàn).'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "Peter is sitting __________ his mother and his father in the car."',
        options: ['between', 'opposite', 'under', 'next to'],
        correctIndex: 0
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['above', 'the bed', 'poster', 'is', 'a', 'there'],
        correctSentence: 'there is a poster above the bed'
      }
    ]
  },
  {
    unitNumber: 9,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Midnight" có nghĩa tiếng Việt là gì?',
        options: ['Mùa thu', 'Nửa đêm', 'Mặc quần áo', 'Hơn 15 phút'],
        correctIndex: 1
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "A - U - T - U - M - N"',
        scrambled: 'A - U - T - U - M - N',
        word: 'AUTUMN',
        options: ['AUTUMN', 'AUTUM', 'AUTUMNN', 'ATUUMN'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Chúng ta sử dụng giới từ "on" đi trước các tháng hoặc các mùa trong năm. Đúng hay Sai?',
        answer: false,
        explanation: 'Sai rồi con nhé! Chúng ta phải dùng giới từ "in" cho tháng và mùa. Ví dụ: "in Autumn", "in July". Ta dùng "on" cho ngày và thứ thôi.'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "I have breakfast __________ the morning, and Independence Day is __________ July 4th."',
        options: ['in / on', 'on / in', 'at / in', 'in / at'],
        correctIndex: 0
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['July 4th', 'is', 'on', 'Independence Day'],
        correctSentence: 'Independence Day is on July 4th'
      }
    ]
  },
  {
    unitNumber: 10,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Yoghurt" có nghĩa tiếng Việt là gì?',
        options: ['Sữa chua', 'Mỳ Ý', 'Bánh táo', 'Đan len'],
        correctIndex: 0
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "P - A - S - T - A"',
        scrambled: 'P - A - S - T - A',
        word: 'PASTA',
        options: ['PASTA', 'PASTAA', 'PATSAS', 'PASAT'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Để trả lời ngắn cho câu hỏi lượng, ta dùng "Not many" cho danh từ đếm được số nhiều và "Not much" cho danh từ không đếm được. Đúng hay Sai?',
        answer: true,
        explanation: 'Đúng rồi con! Ví dụ: "How many apples? Not many." và "How much milk? Not much".'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "How __________ flour do you need to make the apple pie?"',
        options: ['much', 'many', 'some', 'any'],
        correctIndex: 0
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['wool', 'do', 'you', 'need', 'how much'],
        correctSentence: 'how much wool do you need'
      }
    ]
  },
  {
    unitNumber: 11,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Intention" có nghĩa tiếng Việt là gì?',
        options: ['Bằng chứng', 'Chữ ký', 'Nhật ký', 'Ý định, dự định'],
        correctIndex: 3
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "D - I - A - R - Y"',
        scrambled: 'D - I - A - R - Y',
        word: 'DIARY',
        options: ['DIARY', 'DAIRY', 'DIARIE', 'DIYAR'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Cấu trúc "be going to" dùng để nói về một quyết định bộc phát được đưa ra ngay tại thời điểm nói chứ không lên kế hoạch trước. Đúng hay Sai?',
        answer: false,
        explanation: 'Sai rồi con nhé! "be going to" diễn tả ý định, kế hoạch đã có từ trước khi nói. Quyết định bộc phát ta dùng "will" nhé!'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "Look at those dark clouds in the sky! It __________ rain very soon."',
        options: ['is going to', 'will', 'goes', 'is go to'],
        correctIndex: 0
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['going', 'to', 'are', 'we', 'the Statue of Liberty', 'visit'],
        correctSentence: 'we are going to visit the Statue of Liberty'
      }
    ]
  },
  {
    unitNumber: 12,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Dentist" có nghĩa tiếng Việt là gì?',
        options: ['Nha sĩ', 'Phi công', 'Táo nướng', 'Kẻ trộm'],
        correctIndex: 0
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "P - I - L - O - T"',
        scrambled: 'P - I - L - O - T',
        word: 'PILOT',
        options: ['PILOT', 'PILLOT', 'PILOTTE', 'POLIT'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Sau động từ cảm xúc như "like", "love", "hate", ta sử dụng động từ nguyên mẫu có "to" (to-infinitive). Đúng hay Sai?',
        answer: false,
        explanation: 'Sai rồi con! Sau các động từ like, love, hate, ta dùng động từ đuôi "-ing" (gerund). Ví dụ: "I like eating apples".'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "Do you like __________ baked apples with your father?"',
        options: ['eat', 'eating', 'to eating', 'eats'],
        correctIndex: 1
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['be', 'want', 'to', 'dentists', 'they'],
        correctSentence: 'they want to be dentists'
      }
    ]
  },
  {
    unitNumber: 13,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Rubbish" có nghĩa tiếng Việt là gì?',
        options: ['Cái ao', 'Rác thải', 'Đói lả', 'Sự cấm đoán'],
        correctIndex: 1
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "P - O - N - D"',
        scrambled: 'P - O - N - D',
        word: 'POND',
        options: ['POND', 'PONDE', 'PONDSS', 'PONDY'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Chúng ta sử dụng "mustn\'t" để diễn tả một hành động bị cấm đoán (không được phép làm). Đúng hay Sai?',
        answer: true,
        explanation: 'Đúng rồi con! "mustn\'t" chỉ sự cấm đoán, ví dụ: "You mustn\'t swim here" (Cấm bơi ở đây).'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "The pond is very deep and dangerous. You __________ swim in it!"',
        options: ['must', 'mustn\'t', 'have to', 'don\'t have to'],
        correctIndex: 1
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['throw', 'don\'t', 'rubbish', 'on the street'],
        correctSentence: 'don\'t throw rubbish on the street'
      }
    ]
  },
  {
    unitNumber: 14,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Circus" có nghĩa tiếng Việt là gì?',
        options: ['Rạp xiếc', 'Có nắng', 'Chán nản', 'Đối diện'],
        correctIndex: 0
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "S - U - N - N - Y"',
        scrambled: 'S - U - N - N - Y',
        word: 'SUNNY',
        options: ['SUNNY', 'SUNIE', 'SUNNYY', 'SUNY'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Trong thì Quá khứ đơn của động từ "to be", ta dùng "was" cho các ngôi: I, he, she, it. Đúng hay Sai?',
        answer: true,
        explanation: 'Hoàn toàn chính xác con nhé! "I was bored", "He was at home". Còn you, we, they đi với "were".'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "Last Saturday, Marek and Anna __________ very bored at home."',
        options: ['was', 'were', 'did', 'are'],
        correctIndex: 1
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['at the circus', 'was', 'yesterday', 'Mark'],
        correctSentence: 'Mark was at the circus yesterday'
      }
    ]
  },
  {
    unitNumber: 15,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Hurry" có nghĩa tiếng Việt là gì?',
        options: ['Phần kết', 'Giày patin', 'Vội vã, vội vàng', 'Đánh vần'],
        correctIndex: 2
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "S - P - E - L - L"',
        scrambled: 'S - P - E - L - L',
        word: 'SPELL',
        options: ['SPELL', 'SPELE', 'SPELLSS', 'SPEL'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Trợ động từ "could" là dạng quá khứ của "can", dùng để nói về khả năng trong quá khứ. Đúng hay Sai?',
        answer: true,
        explanation: 'Đúng rồi con! Ví dụ: "She could climb trees when she was ten" (Cô ấy đã có thể leo cây).'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "Albert Einstein __________ spell when he was a young boy."',
        options: ["couldn't", "can't", 'had', "didn't"],
        correctIndex: 0
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['breakfast', 'didn\'t', 'have', 'yesterday', 'I'],
        correctSentence: 'I didn\'t have breakfast yesterday'
      }
    ]
  },
  {
    unitNumber: 16,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Tidy" có nghĩa tiếng Việt là gì?',
        options: ['Hủy bỏ', 'Dự báo', 'Dọn dẹp ngăn nắp', 'Ủi quần áo'],
        correctIndex: 2
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "I - R - O - N"',
        scrambled: 'I - R - O - N',
        word: 'IRON',
        options: ['IRON', 'IRONE', 'IRONN', 'IORON'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Với động từ tận cùng bằng phụ âm + y, khi đổi sang quá khứ đơn, ta chỉ việc thêm "-ed" vào sau "y". Ví dụ: tidy -> tidyed. Đúng hay Sai?',
        answer: false,
        explanation: 'Sai rồi con nhé! Phải đổi y thành i rồi mới thêm ed: tidy -> tidied.'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "George __________ his room an hour ago before we went out."',
        options: ['tidy', 'tidies', 'tidied', 'tidyed'],
        correctIndex: 2
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['returned', 'home', 'late', 'we', 'last night'],
        correctSentence: 'we returned home late last night'
      }
    ]
  },
  {
    unitNumber: 17,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Feed" có nghĩa tiếng Việt là gì?',
        options: ['Cho ăn', 'Câu cá', 'Bắp rang bơ', 'Cái vòng'],
        correctIndex: 0
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "P - O - P - C - O - R - N"',
        scrambled: 'P - O - P - C - O - R - N',
        word: 'POPCORN',
        options: ['POPCORN', 'POPCORNE', 'POPCORNN', 'POPOCRN'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Động từ bất quy tắc (Irregular Verbs) không thêm đuôi "-ed" ở quá khứ đơn, mà mỗi từ tự thay đổi theo cách riêng của nó (ví dụ: go -> went). Đúng hay Sai?',
        answer: true,
        explanation: 'Đúng rồi con! Động từ bất quy tắc cần học thuộc lòng, ví dụ: buy -> bought, feed -> fed.'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "He __________ us some popcorn and candy at the circus yesterday."',
        options: ['buy', 'bought', 'buyed', 'is buying'],
        correctIndex: 1
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['lions', 'through', 'hoops', 'jumped', 'the'],
        correctSentence: 'the lions jumped through hoops'
      }
    ]
  },
  {
    unitNumber: 18,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Probably" có nghĩa tiếng Việt là gì?',
        options: ['Có lẽ', 'Lau nhà', 'Có khả năng, có lẽ', 'Kiểm tra'],
        correctIndex: 2
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "P - E - R - H - A - P - S"',
        scrambled: 'P - E - R - H - A - P - S',
        word: 'PERHAPS',
        options: ['PERHAPS', 'PREHAPS', 'PERHAPSS', 'PERHAP'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Ta dùng "will" cho quyết định bộc phát ngay lúc nói, còn "be going to" cho dự định, kế hoạch định trước. Đúng hay Sai?',
        answer: true,
        explanation: 'Chính xác rồi con! Ví dụ: "Oh, it\'s cold. I will close the window." (bộc phát) và "I am going to visit Spain." (dự định trước).'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "I think she __________ probably come to the cinema with us next Sunday."',
        options: ['will', 'is going to', 'did', 'does'],
        correctIndex: 0
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['floor', 'I\'ll', 'you', 'mop', 'the kitchen'],
        correctSentence: 'I\'ll help you mop the kitchen floor'
      }
    ]
  },
  {
    unitNumber: 19,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Nationality" có nghĩa tiếng Việt là gì?',
        options: ['Quốc tịch', 'Dàn hợp xướng', 'Giá bao nhiêu', 'Đốt, châm'],
        correctIndex: 0
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "C - H - O - I - R"',
        scrambled: 'C - H - O - I - R',
        word: 'CHOIR',
        options: ['CHOIR', 'CHOR', 'CHOIRE', 'CHIOR'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Từ hỏi "Whose" dùng để hỏi xem vật gì đó thuộc về ai (hỏi về sở hữu). Đúng hay Sai?',
        answer: true,
        explanation: 'Đúng rồi con! Ví dụ: "Whose jacket is this? It\'s Sara\'s." (Áo khoác này của ai? Của Sara).'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "__________ does this beautiful bee costume cost? It costs 20 euros."',
        options: ['How much', 'How many', 'Whose', 'Who'],
        correctIndex: 0
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['bees', 'do', 'you', 'need', 'how many'],
        correctSentence: 'how many bees do you need'
      }
    ]
  },
  {
    unitNumber: 20,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Clever" có nghĩa tiếng Việt là gì?',
        options: ['Cư xử', 'Thông minh, khôn khéo', 'Một cách lịch sự', 'Hoang dã'],
        correctIndex: 1
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "B - E - H - A - V - E"',
        scrambled: 'B - E - H - A - V - E',
        word: 'BEHAVE',
        options: ['BEHAVE', 'BEHAV', 'BEHAVEE', 'BHEAVE'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Trạng từ chỉ cách thức (Adverb of Manner, ví dụ: politely, slowly) thường được dùng để bổ nghĩa cho động từ thường và đứng sau động từ. Đúng hay Sai?',
        answer: true,
        explanation: 'Hoàn toàn chính xác con nhé! Ví dụ: "They behave very well", "She talks politely to me".'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "He behaves very well, and all the children behave very __________ too."',
        options: ['good', 'well', 'polite', 'slow'],
        correctIndex: 1
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['talks', 'politely', 'she', 'to', 'me'],
        correctSentence: 'she talks politely to me'
      }
    ]
  },
  {
    unitNumber: 21,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Lizard" có nghĩa tiếng Việt là gì?',
        options: ['Hà mã', 'So sánh hơn', 'Mảnh khảnh', 'Con thằn lằn'],
        correctIndex: 3
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "H - I - P - P - O"',
        scrambled: 'H - I - P - P - O',
        word: 'HIPPO',
        options: ['HIPPO', 'HIPO', 'HIPPOO', 'HPPIO'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Với tính từ ngắn 1 âm tiết có cấu trúc Phụ âm - Nguyên âm - Phụ âm (như big, slim), khi chuyển sang so sánh hơn ta phải nhân đôi phụ âm cuối trước khi thêm "-er". Đúng hay Sai?',
        answer: true,
        explanation: 'Đúng rồi con! Ví dụ: big -> bigger, slim -> slimmer. Đây là quy tắc chính tả cực kỳ quan trọng!'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "The hippo in picture A is much __________ than the hippo in picture B."',
        options: ['bigger', 'biggest', 'more big', 'big'],
        correctIndex: 0
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['slimmer', 'is', 'he', 'than', 'his brother'],
        correctSentence: 'he is slimmer than his brother'
      }
    ]
  },
  {
    unitNumber: 22,
    challenges: [
      {
        type: 'mc',
        text: 'Từ vựng tiếng Anh "Conjunction" có nghĩa tiếng Việt là gì?',
        options: ['Trượt tuyết', 'Lý do', 'Cái gương', 'Liên từ'],
        correctIndex: 3
      },
      {
        type: 'spelling',
        text: 'Hãy chọn từ tiếng Anh viết đúng chính tả cho các ký tự xáo trộn sau: "M - I - R - R - O - R"',
        scrambled: 'M - I - R - R - O - R',
        word: 'MIRROR',
        options: ['MIRROR', 'MIROR', 'MIRRORE', 'MIROOR'],
        correctIndex: 0
      },
      {
        type: 'tf',
        text: 'Quy tắc: Liên từ "because" dùng để đưa ra một lý do, nguyên nhân để giải thích cho một hành động. Đúng hay Sai?',
        answer: true,
        explanation: 'Đúng rồi con! Ví dụ: "I am starving because I didn\'t have lunch" (Tớ đói lả vì tớ chưa ăn trưa).'
      },
      {
        type: 'cloze',
        text: 'Điền từ vào chỗ trống: "I wanted to go skiing with my dad, __________ I didn\'t have any skis."',
        options: ['and', 'but', 'because', 'or'],
        correctIndex: 1
      },
      {
        type: 'sentence_builder',
        text: 'Sắp xếp các từ thành câu đúng theo mẫu câu đã học:',
        scrambledWords: ['starving', 'am', 'I', 'because', 'I didn\'t have lunch'],
        correctSentence: 'I am starving because I didn\'t have lunch'
      }
    ]
  }
];
