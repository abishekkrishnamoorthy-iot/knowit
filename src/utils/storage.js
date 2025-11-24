import { ref, set, get, remove } from 'firebase/database';
import { database } from '../config/firebase';

export const storage = {
  getQuizzes: async () => {
    try {
      const quizzesRef = ref(database, 'quizzes');
      const snapshot = await get(quizzesRef);
      
      if (snapshot.exists()) {
        const quizzesData = snapshot.val();
        return Object.values(quizzesData);
      }
      return [];
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return [];
    }
  },

  saveQuiz: async (quiz) => {
    try {
      const quizId = Date.now().toString();
      const newQuiz = {
        ...quiz,
        id: quizId,
        createdAt: new Date().toISOString(),
        shareLink: `${window.location.origin}/quiz/${quizId}`
      };

      const quizRef = ref(database, `quizzes/${quizId}`);
      await set(quizRef, newQuiz);
      return newQuiz;
    } catch (error) {
      console.error('Error saving quiz:', error);
      throw error;
    }
  },

  getQuizById: async (id) => {
    try {
      const quizRef = ref(database, `quizzes/${id}`);
      const snapshot = await get(quizRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      return null;
    }
  },

  deleteQuiz: async (id) => {
    try {
      const quizRef = ref(database, `quizzes/${id}`);
      await remove(quizRef);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  },

  getAttempts: async () => {
    try {
      const attemptsRef = ref(database, 'attempts');
      const snapshot = await get(attemptsRef);
      
      if (snapshot.exists()) {
        const attemptsData = snapshot.val();
        return Object.values(attemptsData);
      }
      return [];
    } catch (error) {
      console.error('Error fetching attempts:', error);
      return [];
    }
  },

  saveAttempt: async (attempt) => {
    try {
      const attemptId = Date.now().toString();
      const newAttempt = {
        ...attempt,
        id: attemptId,
        timestamp: new Date().toISOString()
      };

      const attemptRef = ref(database, `attempts/${attemptId}`);
      await set(attemptRef, newAttempt);
      return newAttempt;
    } catch (error) {
      console.error('Error saving attempt:', error);
      throw error;
    }
  },

  getLeaderboard: async (quizId = null) => {
    try {
      const attempts = await storage.getAttempts();
      let filtered = attempts;

      if (quizId) {
        filtered = attempts.filter(a => a.quizId === quizId);
      }

      return filtered
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return new Date(a.timestamp) - new Date(b.timestamp);
        });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
};
