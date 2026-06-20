import Vocabulary from '../models/Vocabulary';

const initialVocabs = [
  {
    word: 'Persistent',
    ipa: '/pəˈsɪstənt/',
    type: 'adjective',
    meaning: 'Kiên trì, bền bỉ, dai dẳng',
    example: 'Her persistent efforts finally paid off when she passed the English exam.',
    exampleTranslation: 'Những nỗ lực kiên trì của cô ấy cuối cùng đã được đền đáp khi cô ấy đỗ kỳ thi tiếng Anh.',
    isLearned: false
  },
  {
    word: 'Abundant',
    ipa: '/əˈbʌndənt/',
    type: 'adjective',
    meaning: 'Phong phú, dồi dào, nhiều',
    example: 'There is an abundant supply of fresh water in the mountain area.',
    exampleTranslation: 'Có một nguồn cung cấp nước sạch dồi dào ở vùng núi.',
    isLearned: false
  },
  {
    word: 'Diligent',
    ipa: '/ˈdɪl.ɪ.dʒənt/',
    type: 'adjective',
    meaning: 'Siêng năng, cần cù, chăm chỉ',
    example: 'A diligent student will always review lessons before class.',
    exampleTranslation: 'Một học sinh siêng năng sẽ luôn ôn lại bài học trước khi lên lớp.',
    isLearned: false
  },
  {
    word: 'Vibrant',
    ipa: '/ˈvaɪ.brənt/',
    type: 'adjective',
    meaning: 'Rực rỡ, sống động, đầy sức sống',
    example: 'The city has a vibrant nightlife with many street foods and music shows.',
    exampleTranslation: 'Thành phố có cuộc sống ban đêm sống động với nhiều món ăn đường phố và chương trình ca nhạc.',
    isLearned: false
  }
];

export const seedDB = async (): Promise<void> => {
  try {
    const count = await Vocabulary.countDocuments();
    if (count === 0) {
      await Vocabulary.insertMany(initialVocabs);
      console.log('🌱 Database seeded with initial vocabulary words.');
    } else {
      console.log('ℹ️ Database already has vocabulary data, skipping seeding.');
    }
  } catch (error) {
    console.error(`❌ Seeding failed: ${(error as Error).message}`);
  }
};
