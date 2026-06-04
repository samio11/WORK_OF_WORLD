import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';

export default function QuestManager() {
  const quests = useGameStore((state) => state.quests);
  const [notification, setNotification] = useState<string | null>(null);

  // Track quest completions
  useEffect(() => {
    const activeQuests = quests.filter((q) => q.status === 'active');
    const completedQuests = quests.filter((q) => q.status === 'completed');

    // We can store a local state of previously completed quest IDs
    const completedIds = completedQuests.map((q) => q.id);
    const storedCompletedStr = localStorage.getItem('completed_quest_ids') || '[]';
    const storedCompleted: string[] = JSON.parse(storedCompletedStr);

    // Find if any new quest was completed
    const newlyCompleted = completedIds.find((id) => !storedCompleted.includes(id));
    if (newlyCompleted) {
      const q = quests.find((q) => q.id === newlyCompleted);
      if (q) {
        setNotification(`Quest Completed: "${q.title}"! Talk to Captain Miller for rewards.`);
        storedCompleted.push(newlyCompleted);
        localStorage.setItem('completed_quest_ids', JSON.stringify(storedCompleted));
      }
    }

    // Clean up local storage if game resets
    if (completedQuests.length === 0 && storedCompleted.length > 0) {
      localStorage.setItem('completed_quest_ids', '[]');
    }
  }, [quests]);

  // Clear notification after 4.5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none w-full max-w-md px-4">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full bg-slate-900/90 backdrop-blur-md border border-yellow-500/50 rounded-xl p-4 shadow-2xl flex items-center gap-3"
          >
            <div className="text-3xl">🏆</div>
            <div>
              <h4 className="text-yellow-400 font-bold text-sm uppercase tracking-wider">Quest Update</h4>
              <p className="text-white text-sm font-medium mt-0.5">{notification}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
