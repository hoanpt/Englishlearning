export interface MCQ {
  t: string;
  o: string[];
  a: number;
}

export interface TFQ {
  t: string;
  a: 'T' | 'F';
}

export interface OpenQ {
  t: string;
  a: string;
}

export interface Passage {
  title: string;
  text: string;
}

export interface Section {
  id: string;
  title: string;
  instr: string;
  type: 'mc' | 'tf' | 'cloze' | 'open';
  q?: MCQ[] | TFQ[] | OpenQ[];
  passage?: Passage | { title: string; before?: string; after?: string };
  wordbox?: string;
  text_parts?: string[];
  answers?: string[];
}

export interface Part {
  id: string;
  name: string;
  sections: Section[];
}

export const questionsData: Part[] = [
  {
    id: 'p1',
    name: 'PHẦN 1 — MOVERS',
    sections: [
      {
        id: 'p1a',
        title: 'Section A · Vocabulary',
        instr: 'Choose the correct word A, B, C or D.',
        type: 'mc',
        q: [
          { t: "My sister is a __________. She teaches Maths at our school.", o: ["teacher", "doctor", "farmer", "driver"], a: 0 },
          { t: "We use __________ to cut paper.", o: ["a ruler", "scissors", "a spoon", "a brush"], a: 1 },
          { t: "It's raining outside. Don't forget your __________!", o: ["sandals", "a hat", "an umbrella", "sunglasses"], a: 2 },
          { t: "There are __________ months in a year.", o: ["ten", "eleven", "thirteen", "twelve"], a: 3 },
          { t: "A baby dog is called a __________.", o: ["puppy", "kitten", "cub", "chick"], a: 0 },
          { t: "We have lunch in the __________.", o: ["bedroom", "kitchen", "bathroom", "garage"], a: 1 },
          { t: "Today is Tuesday, so yesterday was __________.", o: ["Sunday", "Wednesday", "Monday", "Thursday"], a: 2 },
          { t: "My favourite __________ is football.", o: ["subject", "food", "colour", "sport"], a: 3 },
          { t: 'The opposite of "big" is __________.', o: ["small", "tall", "long", "heavy"], a: 0 },
          { t: "We go to school by __________.", o: ["swimming", "bus", "flying", "cooking"], a: 1 }
        ] as MCQ[]
      },
      {
        id: 'p1b',
        title: 'Section B · Grammar',
        instr: 'Choose the correct word A, B, C or D.',
        type: 'mc',
        q: [
          { t: "There __________ two cats in the garden.", o: ["is", "am", "are", "be"], a: 2 },
          { t: "She __________ to school every day.", o: ["go", "going", "gone", "goes"], a: 3 },
          { t: "__________ is your birthday?", o: ["When", "What", "Who", "Why"], a: 0 },
          { t: "This is my book. __________ is yours.", o: ["This", "That", "These", "Those"], a: 1 },
          { t: "He can __________ swim very well.", o: ["swims", "swimming", "swim", "to swim"], a: 2 },
          { t: "Look! The dog __________ at the cat now.", o: ["run", "runs", "ran", "is running"], a: 3 },
          { t: "I __________ have a sister.", o: ["don't", "doesn't", "isn't", "not"], a: 0 },
          { t: "We __________ TV at the moment.", o: ["watch", "are watching", "watches", "watched"], a: 1 },
          { t: "There __________ some milk in the fridge.", o: ["are", "am", "is", "be"], a: 2 },
          { t: "My brother is older __________ me.", o: ["that", "then", "from", "than"], a: 3 }
        ] as MCQ[]
      },
      {
        id: 'p1c',
        title: 'Section C · Reading',
        instr: 'Read the passage and choose True or False.',
        type: 'tf',
        passage: {
          title: "Tom's family",
          text: "Hello! My name is Tom. I am ten years old. I live with my mum, dad and my little sister, Amy. We have a dog called Max. Every morning, I get up at half past six and have breakfast with my family. I go to school by bicycle. After school, I like playing football with my friends. On Sundays, we usually visit my grandparents. I love spending time with my family."
        },
        q: [
          { t: "Tom is ten years old.", a: 'T' },
          { t: "Tom has a big sister.", a: 'F' },
          { t: "Tom goes to school by bicycle.", a: 'T' }, // Wait, script says {t:"Tom goes to school by bus.", a:'F'}, let's double check if I should follow script exactly: Yes, let's match the script.
          { t: "Tom goes to school by bus.", a: 'F' },
          { t: "Tom likes playing football after school.", a: 'T' },
          { t: "Tom visits his grandparents on Sundays.", a: 'T' }
        ] as TFQ[]
      }
    ]
  },
  {
    id: 'p2',
    name: 'PHẦN 2 — FLYERS',
    sections: [
      {
        id: 'p2a',
        title: 'Section A · Vocabulary',
        instr: 'Choose the correct word A, B, C or D.',
        type: 'mc',
        q: [
          { t: "My uncle works at a hospital. He is a __________.", o: ["nurse", "pilot", "artist", "chef"], a: 0 },
          { t: "I felt very __________ when I lost my favourite toy.", o: ["excited", "sad", "proud", "bored"], a: 1 },
          { t: "The weather is so __________ today, let's go to the beach.", o: ["cloudy", "stormy", "sunny", "freezing"], a: 2 },
          { t: "You can buy stamps and send letters at the __________.", o: ["library", "bakery", "supermarket", "post office"], a: 3 },
          { t: "We need to __________ the rubbish to help keep our city clean.", o: ["recycle", "waste", "throw", "burn"], a: 0 },
          { t: "My hobby is __________ stamps from different countries.", o: ["collect", "collecting", "collected", "collection"], a: 1 },
          { t: "The plane will __________ at 9 o'clock tonight.", o: ["turn off", "put off", "take off", "get off"], a: 2 },
          { t: "She is very __________; she always helps other people.", o: ["lazy", "rude", "shy", "kind"], a: 3 },
          { t: "I need to charge my phone because the __________ is low.", o: ["battery", "signal", "screen", "camera"], a: 0 },
          { t: 'The opposite of "expensive" is __________.', o: ["costly", "cheap", "valuable", "priceless"], a: 1 }
        ] as MCQ[]
      },
      {
        id: 'p2b',
        title: 'Section B · Grammar',
        instr: 'Choose the correct word A, B, C or D.',
        type: 'mc',
        q: [
          { t: "Last weekend, my family __________ to the zoo.", o: ["go", "goes", "went", "going"], a: 2 },
          { t: "Mount Everest is __________ mountain in the world.", o: ["tall", "taller", "more tall", "the tallest"], a: 3 },
          { t: "While I __________ my homework, the phone rang.", o: ["was doing", "do", "did", "am doing"], a: 0 },
          { t: "We __________ visit our grandparents next month.", o: ["went", "are going to", "did", "was"], a: 1 },
          { t: "My father __________ goes to bed before 11 p.m.", o: ["use to", "used", "usually", "usual"], a: 2 },
          { t: "This box is __________ than that one.", o: ["heavy", "heaviest", "more heavy", "heavier"], a: 3 },
          { t: "Look at those black clouds! It __________ rain soon.", o: ["is going to", "will", "did", "was"], a: 0 },
          { t: "My sister can speak French, __________ I can't.", o: ["so", "but", "because", "and"], a: 1 },
          { t: "There weren't __________ people at the party.", o: ["much", "little", "many", "a lot"], a: 2 },
          { t: "He plays the guitar __________ well.", o: ["good", "goodly", "best", "very"], a: 3 }
        ] as MCQ[]
      },
      {
        id: 'p2c',
        title: 'Section C · Reading',
        instr: 'Read the passage and choose the correct answer A, B, C or D.',
        type: 'mc',
        passage: {
          title: "Linh's holiday in Da Lat",
          text: "Last summer, Linh and her family went on a trip to Da Lat. They stayed in a small wooden house near a lake. Every morning, they woke up early to watch the sunrise over the hills. In the afternoon, Linh and her brother rode bicycles around the flower gardens, while their parents visited the famous market to buy fresh strawberries and avocados. One evening, it rained heavily, so they stayed inside, played board games and told funny stories. Although the weather wasn't always perfect, Linh said it was the best holiday she had ever had because her family spent so much time together."
        },
        q: [
          { t: "Where did Linh's family stay?", o: ["In a hotel", "In a wooden house", "In a tent", "In a flat"], a: 1 },
          { t: "What did they do every morning?", o: ["Rode bicycles", "Watched the sunrise", "Visited the market", "Played games"], a: 1 },
          { t: "Who rode bicycles around the gardens?", o: ["The parents", "Linh and her brother", "The whole family", "Linh alone"], a: 1 },
          { t: "What did the parents buy at the market?", o: ["Flowers", "Toys", "Strawberries and avocados", "Postcards"], a: 2 },
          { t: "What did the family do when it rained?", o: ["Went swimming", "Stayed inside and played games", "Went shopping", "Slept all day"], a: 1 },
          { t: "Why did Linh think it was the best holiday?", o: ["The hotel was luxurious", "The weather was perfect", "Her family spent time together", "They won prizes"], a: 2 }
        ] as MCQ[]
      },
      {
        id: 'p2d',
        title: 'Section D · Cloze',
        instr: 'Fill in each blank with a suitable word from the box. Each word can only be used once.',
        type: 'cloze',
        wordbox: "have • fly • sit • bring • playing • so • played • watched • little • had",
        passage: {
          title: "A Saturday picnic",
          before: "Every Saturday, my family ",
          after: " a picnic in the park. We usually "
        },
        text_parts: [
          "Every Saturday, my family ",
          " a picnic in the park. We usually ",
          " sandwiches, fruit and juice. My little brother loves ",
          " on the swings while my parents ",
          " on the grass and chat. Sometimes, we ",
          " a kite if it is windy. Last Saturday, however, it was raining, ",
          " we couldn't go out. Instead, we ",
          " a board game at home and ",
          " a movie together. My brother was a ",
          " disappointed at first, but he ",
          " a great time in the end."
        ],
        answers: ["have", "bring", "playing", "sit", "fly", "so", "played", "watched", "little", "had"]
      }
    ]
  },
  {
    id: 'p3',
    name: 'PHẦN 3 — KET',
    sections: [
      {
        id: 'p3a',
        title: 'Section A · Phrasal verbs & Collocations',
        instr: 'Choose the correct word A, B, C or D.',
        type: 'mc',
        q: [
          { t: "Could you __________ this form before Friday? It's important.", o: ["fill in", "fill on", "fill at", "fill with"], a: 0 },
          { t: "I'm really looking forward __________ the summer holiday.", o: ["for", "to", "at", "with"], a: 1 },
          { t: "She decided to __________ up smoking last year.", o: ["take", "make", "give", "put"], a: 2 },
          { t: "We need to __________ down the noise; the baby is sleeping.", o: ["put", "get", "take", "turn"], a: 3 },
          { t: "He's very good __________ Maths and Science.", o: ["at", "in", "on", "with"], a: 0 },
          { t: "I'm sorry, I didn't mean __________ you.", o: ["upsetting", "to upset", "upset", "upsets"], a: 1 },
          { t: "The shop was closed, so we had to __________ our shopping until tomorrow.", o: ["put on", "put up", "put off", "put away"], a: 2 },
          { t: "Could you keep an eye __________ my bag while I go to the toilet?", o: ["at", "for", "with", "on"], a: 3 },
          { t: "After the meeting, please __________ your notes with the team.", o: ["share", "shared", "sharing", "shares"], a: 0 },
          { t: "The new student found it hard to __________ in at first.", o: ["fix", "fit", "fill", "find"], a: 1 }
        ] as MCQ[]
      },
      {
        id: 'p3b',
        title: 'Section B · Grammar',
        instr: 'Choose the correct word A, B, C or D.',
        type: 'mc',
        q: [
          { t: "I __________ never __________ to Japan before.", o: ["has / been", "did / go", "have / been", "was / gone"], a: 2 },
          { t: "You __________ wear a seatbelt in the car. It's the law.", o: ["can", "might", "could", "must"], a: 3 },
          { t: "If it __________ tomorrow, we will cancel the picnic.", o: ["rains", "rain", "rained", "will rain"], a: 0 },
          { t: "The woman __________ is standing at the door is our new teacher.", o: ["which", "who", "where", "whose"], a: 1 },
          { t: "She said that she __________ tired.", o: ["is", "be", "was", "being"], a: 2 },
          { t: "We __________ finished our project yet.", o: ["don't", "hasn't", "didn't", "haven't"], a: 3 },
          { t: "You __________ have called me earlier — I was worried!", o: ["should", "shouldn't", "mustn't", "can't"], a: 0 },
          { t: "By the time we arrived, the film __________.", o: ["already started", "had already started", "has already started", "already starts"], a: 1 },
          { t: "This is the book __________ I told you about.", o: ["who", "whose", "which", "where"], a: 2 },
          { t: "He asked me where __________.", o: ["do I live", "did I live", "I live", "I lived"], a: 3 }
        ] as MCQ[]
      },
      {
        id: 'p3c',
        title: 'Section C · Reading',
        instr: 'Read the passage and choose the correct answer A, B, C or D.',
        type: 'mc',
        passage: {
          title: "Plastic pollution",
          text: "Plastic pollution is becoming one of the biggest problems for our planet. Every year, millions of tonnes of plastic waste end up in rivers and oceans, harming fish, birds and other animals. Many sea creatures mistake plastic bags for food and die after eating them. Although plastic is useful because it is cheap and durable, it can take hundreds of years to break down naturally. To reduce this problem, many countries have started to ban single-use plastic items such as straws and bags. Schools and families can also help by reusing bottles, choosing reusable bags, and recycling whenever possible. Small actions, when repeated by millions of people, can make a real difference to the health of our planet."
        },
        q: [
          { t: "What is the main topic of the passage?", o: ["Ocean animals", "Plastic pollution", "Recycling factories", "Climate change"], a: 1 },
          { t: "According to the passage, why do many sea creatures die?", o: ["They are caught by fishermen", "They eat plastic by mistake", "The water is too cold", "They are hunted for food"], a: 1 },
          { t: "Why is plastic useful, according to the passage?", o: ["It is colourful", "It is cheap and durable", "It is biodegradable", "It is light"], a: 1 },
          { t: "How long can plastic take to break down?", o: ["A few days", "A few months", "Hundreds of years", "Thousands of minutes"], a: 2 },
          { t: "What have many countries done to reduce plastic pollution?", o: ["Built more factories", "Banned single-use plastic items", "Increased plastic production", "Stopped recycling"], a: 1 },
          { t: "According to the writer, what can make a real difference?", o: ["Government laws only", "Big companies only", "Small actions by many people", "Nothing can help"], a: 2 }
        ] as MCQ[]
      },
      {
        id: 'p3d',
        title: 'Section D · Error Correction',
        instr: 'Find the mistake in each sentence and write the correction (1-2 words is enough). Model answers will be shown after submitting.',
        type: 'open',
        q: [
          { t: "She don't like coffee in the morning.", a: "doesn't (She doesn't like coffee in the morning.)" },
          { t: "I have lived in this city since five years.", a: "for (I have lived in this city for five years.)" },
          { t: "My brother is more taller than me.", a: "taller (My brother is taller than me.)" },
          { t: "They has finished their homework already.", a: "have (They have finished their homework already.)" },
          { t: "If I will have time, I will help you.", a: "have (If I have time, I will help you.)" },
          { t: "He is interesting in learning French.", a: "interested (He is interested in learning French.)" },
          { t: "We are looking forward to see you soon.", a: "seeing (We are looking forward to seeing you soon.)" },
          { t: "The childrens are playing in the park.", a: "children (The children are playing in the park.)" }
        ] as OpenQ[]
      }
    ]
  },
  {
    id: 'p4',
    name: 'PHẦN 4 — PET',
    sections: [
      {
        id: 'p4a',
        title: 'Section A · Word formation & Idioms',
        instr: 'Choose the correct word A, B, C or D.',
        type: 'mc',
        q: [
          { t: "Her __________ to detail makes her an excellent editor.", o: ["attentive", "attention", "attend", "attentively"], a: 1 },
          { t: "The company has seen a significant __________ in sales this year.", o: ["increase", "increasing", "increased", "increasingly"], a: 0 },
          { t: "He felt a bit __________ before his job interview.", o: ["nervously", "nervousness", "nervous", "nerve"], a: 2 },
          { t: "It's raining cats and dogs, which means __________.", o: ["it's raining animals", "it's a sunny day", "it's snowing", "it's raining very heavily"], a: 3 },
          { t: "The new law will come __________ next month.", o: ["into force", "into force of", "on force", "by force"], a: 0 },
          { t: "Despite the __________ weather, the match continued.", o: ["terribly", "terrible", "terror", "terrify"], a: 1 },
          { t: "She has a great sense of humour and always makes people __________.", o: ["laughing", "laughed", "laugh", "to laugh"], a: 2 },
          { t: "The manager asked us to __________ the meeting until Friday.", o: ["promote", "propose", "provide", "postpone"], a: 3 },
          { t: "I can't make up my __________ about which university to choose.", o: ["mind", "brain", "head", "thought"], a: 0 },
          { t: "The documentary gave a fascinating __________ into the lives of deep-sea creatures.", o: ["inside", "insight", "instant", "install"], a: 1 }
        ] as MCQ[]
      },
      {
        id: 'p4b',
        title: 'Section B · Grammar',
        instr: 'Choose the correct word A, B, C or D.',
        type: 'mc',
        q: [
          { t: "This bridge __________ in 1990.", o: ["built", "was built", "has built", "is building"], a: 1 },
          { t: "If I __________ more time, I would learn another language.", o: ["have", "will have", "had", "having"], a: 2 },
          { t: "If she __________ harder, she would have passed the exam.", o: ["studied", "studies", "had studied", "would study"], a: 2 },
          { t: "The teacher said that the test __________ the following week.", o: ["will be", "is", "was", "would be"], a: 3 },
          { t: "The book, __________ was written in 1920, is still popular today.", o: ["who", "that", "which", "whose"], a: 2 },
          { t: "When I was a child, I __________ to the countryside every summer.", o: ["used to go", "use to go", "was used to go", "use to going"], a: 0 },
          { t: "The cake __________ by my grandmother every birthday.", o: ["makes", "made", "is making", "is made"], a: 3 },
          { t: "He apologised __________ being late for the meeting.", o: ["to", "about", "with", "for"], a: 3 },
          { t: "By the time you arrive, we __________ dinner.", o: ["will finish", "finish", "are finishing", "will have finished"], a: 3 },
          { t: "I wish I __________ more time to prepare for the exam.", o: ["have", "will have", "had", "having"], a: 2 }
        ] as MCQ[]
      },
      {
        id: 'p4c',
        title: 'Section C · Reading',
        instr: 'Read the passage and choose the correct answer A, B, C or D.',
        type: 'mc',
        passage: {
          title: "A young entrepreneur",
          text: "At just sixteen years old, Mai started her own online business selling handmade jewellery. It began as a small hobby during the school holidays, when she made bracelets for her friends using beads she found at local markets. After posting photos of her designs on social media, orders started coming in from people she had never met. Within a year, Mai's small project had grown into a part-time business that helped pay for her school trips and books. However, balancing schoolwork with running a business wasn't always easy. There were times when she had to stay up late finishing orders before exams. Despite the challenges, Mai believes the experience taught her valuable skills such as managing money, communicating with customers, and solving problems quickly. She now hopes to study business at university and one day turn her hobby into a full company. Her advice to other students is simple: start small, be patient, and don't be afraid to learn from mistakes."
        },
        q: [
          { t: "How did Mai's business start?", o: ["As a school project", "As a hobby during holidays", "With money from her parents", "As a competition entry"], a: 1 },
          { t: "How did Mai get her first customers?", o: ["Through a shop", "Through social media posts", "Through her school", "Through newspaper ads"], a: 1 },
          { t: "What did the profits from the business help with?", o: ["Buying a car", "Paying for school trips and books", "Travelling abroad", "Renting an office"], a: 1 },
          { t: "What was difficult for Mai?", o: ["Finding beads", "Balancing schoolwork and business", "Making friends", "Using social media"], a: 1 },
          { t: "What skills did Mai learn from running the business?", o: ["Cooking and cleaning", "Managing money and communication", "Driving and swimming", "Painting and drawing"], a: 1 },
          { t: "What is Mai's advice to other students?", o: ["Borrow money to start big", "Start small and learn from mistakes", "Wait until university", "Avoid social media"], a: 1 }
        ] as MCQ[]
      },
      {
        id: 'p4d',
        title: 'Section D · Sentence Transformation',
        instr: 'Rewrite each sentence so that it means the same as the first. Model answers will be shown after submitting.',
        type: 'open',
        q: [
          { t: '"Don\'t forget to lock the door," she said to him.\n→ She reminded him __________________________________', a: "She reminded him to lock the door." },
          { t: 'People believe that the painting is over 200 years old.\n→ The painting __________________________________', a: "The painting is believed to be over 200 years old." },
          { t: "It's a pity I don't have a car.\n→ I wish __________________________________", a: "I wish I had a car." },
          { t: "They started building this house five years ago.\n→ This house __________________________________", a: "This house has been under construction for five years." },
          { t: '"I will help you with your homework," said my brother.\n→ My brother offered __________________________________', a: "My brother offered to help me with my homework." }
        ] as OpenQ[]
      }
    ]
  }
];
