import { TriviaQuestion } from './TriviaModal';

export const mockTriviaQuestions: TriviaQuestion[] = [
  {
    id: '1',
    question: 'What is the primary benefit of sampling products at retail locations?',
    answers: [
      'To get free products forever',
      'To try products before purchasing and discover new brands',
      'To avoid shopping entirely',
      'To only buy discounted items',
    ],
    correctAnswerIndex: 1,
    points: 4,
  },
  {
    id: '2',
    question: 'Which day of the week typically has the most sampling events?',
    answers: [
      'Monday',
      'Wednesday',
      'Saturday',
      'Thursday',
    ],
    correctAnswerIndex: 2,
    points: 5,
  },
  {
    id: '3',
    question: 'What should you do when you find a sampling event near you?',
    answers: [
      'Ignore it completely',
      'Visit the location during the event time to try the product',
      'Call the store to complain',
      'Wait until the event is over',
    ],
    correctAnswerIndex: 1,
    points: 3,
  },
  {
    id: '4',
    question: 'How can you earn points in the SampleFinder app?',
    answers: [
      'By uninstalling the app',
      'By answering trivia questions correctly and attending events',
      'By never opening the app',
      'By deleting your account',
    ],
    correctAnswerIndex: 1,
    points: 6,
  },
  {
    id: '5',
    question: 'What makes SampleFinder different from other shopping apps?',
    answers: [
      'It only shows expensive products',
      'It helps you discover in-store sampling events and try products before buying',
      'It requires a monthly subscription',
      'It only works in one city',
    ],
    correctAnswerIndex: 1,
    points: 4,
  },
];

/**
 * Get a random trivia question from the mock questions array
 */
export const getRandomTriviaQuestion = (): TriviaQuestion => {
  const randomIndex = Math.floor(Math.random() * mockTriviaQuestions.length);
  return mockTriviaQuestions[randomIndex];
};

