import mongoose from 'mongoose';

const topicProgressSchema = new mongoose.Schema({
  topicId: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true }, // Aptitude | Reasoning | Verbal Ability | DSA
  solved: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  lastAttempted: { type: Date }
});

const dailyActivitySchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  problemsSolved: { type: Number, default: 0 },
  minutesStudied: { type: Number, default: 0 },
  topicsCompleted: { type: Number, default: 0 }
});

const dailyGoalSchema = new mongoose.Schema({
  label: { type: String, required: true },
  category: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // Overall stats
    problemsSolved: { type: Number, default: 0 },
    quizzesTaken: { type: Number, default: 0 },
    studyStreakDays: { type: Number, default: 0 },
    bestStreakDays: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: '' }, // YYYY-MM-DD
    todayMinutes: { type: Number, default: 0 },

    // Per-topic progress
    topics: [topicProgressSchema],

    // Activity log (last 30 days)
    activityLog: [dailyActivitySchema],

    // Today's goals
    dailyGoals: [dailyGoalSchema],
    dailyGoalsDate: { type: String, default: '' }, // YYYY-MM-DD when goals were last reset

    // Bookmarks: array of { itemId, itemType, title, category, source }
    bookmarks: [
      {
        itemId: { type: String, required: true },
        itemType: { type: String, required: true }, // 'topic' | 'note' | 'mock'
        title: { type: String, required: true },
        category: { type: String, required: true },
        source: { type: String, default: '' },
        savedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// Virtual: overall percentage
progressSchema.virtual('overallPercent').get(function () {
  const topics = this.topics || [];
  if (!topics.length) return 0;
  const solved = topics.reduce((sum, t) => sum + (t.solved || 0), 0);
  const total = topics.reduce((sum, t) => sum + (t.total || 0), 0);
  return total > 0 ? Math.round((solved / total) * 100) : 0;
});

// Virtual: per-category progress
progressSchema.virtual('categoryProgress').get(function () {
  const categories = ['Aptitude', 'Reasoning', 'Verbal Ability', 'DSA'];
  return categories.map((cat) => {
    const catTopics = (this.topics || []).filter((t) => t.category === cat);
    const solved = catTopics.reduce((s, t) => s + (t.solved || 0), 0);
    const total = catTopics.reduce((s, t) => s + (t.total || 0), 0);
    return { category: cat, percent: total > 0 ? Math.round((solved / total) * 100) : 0, solved, total };
  });
});

progressSchema.set('toJSON', { virtuals: true });
progressSchema.set('toObject', { virtuals: true });

export default mongoose.model('Progress', progressSchema);
