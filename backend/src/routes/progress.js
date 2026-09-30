import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Content from '../models/Content.js';
import Progress from '../models/Progress.js';

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

/** Get or create a user's Progress document */
async function getOrCreateProgress(userId) {
  let progress = await Progress.findOne({ user: userId });
  if (!progress) {
    progress = await Progress.create({ user: userId });
  }
  return progress;
}

/** Update streak based on lastActiveDate */
function updateStreak(progress) {
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (progress.lastActiveDate === today) return; // already updated today
  if (progress.lastActiveDate === yesterday) {
    progress.studyStreakDays += 1;
  } else if (progress.lastActiveDate !== today) {
    progress.studyStreakDays = 1; // reset
  }
  if (progress.studyStreakDays > progress.bestStreakDays) {
    progress.bestStreakDays = progress.studyStreakDays;
  }
  progress.lastActiveDate = today;
}

/** Add or update today's entry in activityLog */
function logActivity(progress, { problems = 0, minutes = 0, topics = 0 }) {
  const today = todayStr();
  let entry = progress.activityLog.find((e) => e.date === today);
  if (!entry) {
    progress.activityLog.push({ date: today, problemsSolved: problems, minutesStudied: minutes, topicsCompleted: topics });
  } else {
    entry.problemsSolved += problems;
    entry.minutesStudied += minutes;
    entry.topicsCompleted += topics;
  }
  // Keep only last 30 days
  if (progress.activityLog.length > 30) {
    progress.activityLog = progress.activityLog
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);
  }
}

/** Return the public summary shape expected by the frontend */
function buildSummary(progress) {
  const cat = progress.toObject({ virtuals: true });
  const overall = cat.overallPercent ?? 0;
  const categoryProgress = cat.categoryProgress ?? [];
  return {
    overall,
    categoryProgress,
    problemsSolved: progress.problemsSolved,
    quizzesTaken: progress.quizzesTaken,
    studyStreakDays: progress.studyStreakDays,
    bestStreakDays: progress.bestStreakDays,
    todayMinutes: progress.todayMinutes,
    topics: progress.topics,
    activityLog: progress.activityLog,
    dailyGoals: progress.dailyGoals,
    dailyGoalsDate: progress.dailyGoalsDate,
    bookmarks: progress.bookmarks
  };
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /api/progress
 * Returns the full dashboard summary for the logged-in user.
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const progress = await getOrCreateProgress(req.user._id);

    // Auto-sync topics from Content catalog if user has no topics yet
    if (!progress.topics.length) {
      const contentTopics = await Content.find({ type: 'topic' }).sort({ order: 1 });
      progress.topics = contentTopics.map((c) => ({
        topicId: c.itemId,
        title: c.title,
        category: c.category,
        solved: 0,
        total: c.totalProblems || 0,
        completed: false
      }));
      await progress.save();
    }

    // Ensure daily goals exist for today
    const today = todayStr();
    if (progress.dailyGoalsDate !== today) {
      progress.dailyGoals = [
        { label: 'Practice Percentage questions', category: 'Aptitude', completed: false },
        { label: 'Revise Blood Relations', category: 'Reasoning', completed: false },
        { label: 'Learn one DSA concept', category: 'DSA', completed: false },
        { label: 'Take a 10-question mock quiz', category: 'Mock Tests', completed: false },
        { label: 'Review your saved notes', category: 'Notes', completed: false }
      ];
      progress.dailyGoalsDate = today;
      await progress.save();
    }

    return res.json(buildSummary(progress));
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/progress/topic/:topicId/solve
 * Body: { count: number }   (number of problems just solved)
 * Increments solved count for a topic and updates streak/activity.
 */
router.post('/topic/:topicId/solve', requireAuth, async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const count = Math.max(1, parseInt(req.body.count, 10) || 1);

    const progress = await getOrCreateProgress(req.user._id);
    let topic = progress.topics.find((t) => t.topicId === topicId);

    if (!topic) {
      // Fetch metadata from Content
      const content = await Content.findOne({ itemId: topicId });
      if (!content) return res.status(404).json({ message: 'Topic not found' });
      progress.topics.push({
        topicId,
        title: content.title,
        category: content.category,
        solved: 0,
        total: content.totalProblems || 0,
        completed: false
      });
      topic = progress.topics[progress.topics.length - 1];
    }

    const previousSolved = topic.solved || 0;
    const available = topic.total > 0 ? Math.max(0, topic.total - previousSolved) : count;
    const recordedCount = Math.min(count, available);
    topic.solved = previousSolved + recordedCount;
    topic.lastAttempted = new Date();
    topic.completed = topic.solved >= topic.total && topic.total > 0;

    if (recordedCount > 0) {
      progress.problemsSolved = (progress.problemsSolved || 0) + recordedCount;
      updateStreak(progress);
      logActivity(progress, { problems: recordedCount, minutes: recordedCount * 2 });
    }

    await progress.save();
    return res.json({ topic, summary: buildSummary(progress) });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/progress/quiz
 * Body: { category, score, total }
 * Records a quiz attempt and updates quizzesTaken.
 */
router.post('/quiz', requireAuth, async (req, res, next) => {
  try {
    const progress = await getOrCreateProgress(req.user._id);
    progress.quizzesTaken = (progress.quizzesTaken || 0) + 1;
    updateStreak(progress);
    logActivity(progress, { minutes: 15, topics: 1 });
    await progress.save();
    return res.json(buildSummary(progress));
  } catch (error) {
    return next(error);
  }
});

/**
 * PATCH /api/progress/goals/:index
 * Body: { completed: boolean }
 * Marks a daily goal as complete / incomplete.
 */
router.patch('/goals/:index', requireAuth, async (req, res, next) => {
  try {
    const index = parseInt(req.params.index, 10);
    const { completed } = req.body;
    const progress = await getOrCreateProgress(req.user._id);

    if (index < 0 || index >= progress.dailyGoals.length) {
      return res.status(400).json({ message: 'Invalid goal index' });
    }
    progress.dailyGoals[index].completed = Boolean(completed);

    if (completed) {
      updateStreak(progress);
      logActivity(progress, { topics: 1, minutes: 10 });
    }

    await progress.save();
    return res.json({ dailyGoals: progress.dailyGoals, summary: buildSummary(progress) });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/progress/bookmarks
 * Body: { itemId, itemType, title, category, source }
 * Adds a bookmark (or removes it if already bookmarked).
 */
router.post('/bookmarks', requireAuth, async (req, res, next) => {
  try {
    const { itemId, itemType, title, category, source } = req.body;
    if (!itemId || !itemType || !title || !category) {
      return res.status(400).json({ message: 'itemId, itemType, title, and category are required' });
    }
    const progress = await getOrCreateProgress(req.user._id);
    const existing = progress.bookmarks.findIndex((b) => b.itemId === itemId);
    let action;
    if (existing > -1) {
      progress.bookmarks.splice(existing, 1);
      action = 'removed';
    } else {
      progress.bookmarks.push({ itemId, itemType, title, category, source: source || '', savedAt: new Date() });
      action = 'added';
    }
    await progress.save();
    return res.json({ action, bookmarks: progress.bookmarks });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/content
 * Query params: type (topic|note|mock), category
 * Returns content catalog items with the user's progress merged in.
 */
router.get('/content', requireAuth, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;

    const items = await Content.find(filter).sort({ order: 1 });
    const progress = await getOrCreateProgress(req.user._id);

    const withProgress = items.map((item) => {
      const obj = item.toObject();
      const userTopic = progress.topics.find((t) => t.topicId === item.itemId);
      const isBookmarked = progress.bookmarks.some((b) => b.itemId === item.itemId);
      return {
        ...obj,
        solved: userTopic?.solved ?? 0,
        completed: userTopic?.completed ?? false,
        lastAttempted: userTopic?.lastAttempted ?? null,
        isBookmarked
      };
    });
    return res.json(withProgress);
  } catch (error) {
    return next(error);
  }
});

export default router;
