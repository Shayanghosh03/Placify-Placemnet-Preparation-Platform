/**
 * Seed script: populates the Content collection with all placement prep items.
 * Run once: node src/scripts/seedContent.js
 */
import '../config/env.js';
import { connectDatabase } from '../config/db.js';
import Content from '../models/Content.js';

const topics = [
  // ── Aptitude ───────────────────────────────────────────────────────────
  { itemId: 'apt-percentages', type: 'topic', title: 'Percentages', category: 'Aptitude', difficulty: 'Easy', totalProblems: 20, color: '#2563eb', order: 1 },
  { itemId: 'apt-profit-loss', type: 'topic', title: 'Profit & Loss', category: 'Aptitude', difficulty: 'Medium', totalProblems: 18, color: '#f59e0b', order: 2 },
  { itemId: 'apt-time-work', type: 'topic', title: 'Time & Work', category: 'Aptitude', difficulty: 'Medium', totalProblems: 15, color: '#16a34a', order: 3 },
  { itemId: 'apt-ratio-proportion', type: 'topic', title: 'Ratio & Proportion', category: 'Aptitude', difficulty: 'Easy', totalProblems: 12, color: '#0891b2', order: 4 },
  { itemId: 'apt-speed-distance', type: 'topic', title: 'Speed, Distance & Time', category: 'Aptitude', difficulty: 'Medium', totalProblems: 14, color: '#7c3aed', order: 5 },
  { itemId: 'apt-simple-compound-interest', type: 'topic', title: 'Simple & Compound Interest', category: 'Aptitude', difficulty: 'Medium', totalProblems: 16, color: '#dc2626', order: 6 },

  // ── Reasoning ──────────────────────────────────────────────────────────
  { itemId: 'rsn-blood-relations', type: 'topic', title: 'Blood Relations', category: 'Reasoning', difficulty: 'Medium', totalProblems: 15, color: '#0f766e', order: 1 },
  { itemId: 'rsn-syllogism', type: 'topic', title: 'Syllogism', category: 'Reasoning', difficulty: 'Medium', totalProblems: 14, color: '#635bff', order: 2 },
  { itemId: 'rsn-direction-sense', type: 'topic', title: 'Direction Sense', category: 'Reasoning', difficulty: 'Easy', totalProblems: 10, color: '#ea580c', order: 3 },
  { itemId: 'rsn-coding-decoding', type: 'topic', title: 'Coding & Decoding', category: 'Reasoning', difficulty: 'Medium', totalProblems: 12, color: '#0284c7', order: 4 },
  { itemId: 'rsn-seating-arrangement', type: 'topic', title: 'Seating Arrangement', category: 'Reasoning', difficulty: 'Hard', totalProblems: 10, color: '#9333ea', order: 5 },

  // ── Verbal Ability ─────────────────────────────────────────────────────
  { itemId: 'va-error-spotting', type: 'topic', title: 'Error Spotting', category: 'Verbal Ability', difficulty: 'Easy', totalProblems: 12, color: '#db2777', order: 1 },
  { itemId: 'va-reading-comprehension', type: 'topic', title: 'Reading Comprehension', category: 'Verbal Ability', difficulty: 'Hard', totalProblems: 10, color: '#16a34a', order: 2 },
  { itemId: 'va-sentence-completion', type: 'topic', title: 'Sentence Completion', category: 'Verbal Ability', difficulty: 'Medium', totalProblems: 12, color: '#2563eb', order: 3 },
  { itemId: 'va-synonyms-antonyms', type: 'topic', title: 'Synonyms & Antonyms', category: 'Verbal Ability', difficulty: 'Easy', totalProblems: 15, color: '#f59e0b', order: 4 },

  // ── DSA ────────────────────────────────────────────────────────────────
  { itemId: 'dsa-arrays-hashing', type: 'topic', title: 'Arrays & Hashing', category: 'DSA', description: 'Build strong fundamentals with the most common array patterns.', difficulty: 'Easy', totalProblems: 25, color: '#635bff', order: 1 },
  { itemId: 'dsa-two-pointers', type: 'topic', title: 'Two Pointers', category: 'DSA', description: 'Reduce nested loops and solve problems in linear time.', difficulty: 'Medium', totalProblems: 20, color: '#2563eb', order: 2 },
  { itemId: 'dsa-sliding-window', type: 'topic', title: 'Sliding Window', category: 'DSA', description: 'Master fixed and variable window techniques for subarray problems.', difficulty: 'Medium', totalProblems: 18, color: '#0f766e', order: 3 },
  { itemId: 'dsa-stacks-queues', type: 'topic', title: 'Stacks & Queues', category: 'DSA', description: 'Practice monotonic stacks, parsing, and queue-based patterns.', difficulty: 'Medium', totalProblems: 20, color: '#db2777', order: 4 },
  { itemId: 'dsa-linked-lists', type: 'topic', title: 'Linked Lists', category: 'DSA', description: 'Traversal, reversal, cycle detection and merge operations.', difficulty: 'Medium', totalProblems: 15, color: '#f59e0b', order: 5 },
  { itemId: 'dsa-binary-search', type: 'topic', title: 'Binary Search', category: 'DSA', description: 'Classic and advanced binary search patterns.', difficulty: 'Medium', totalProblems: 18, color: '#16a34a', order: 6 },
  { itemId: 'dsa-trees', type: 'topic', title: 'Trees & BST', category: 'DSA', description: 'DFS, BFS, lowest common ancestor, and BST operations.', difficulty: 'Hard', totalProblems: 22, color: '#9333ea', order: 7 },
  { itemId: 'dsa-graphs', type: 'topic', title: 'Graphs', category: 'DSA', description: 'BFS, DFS, Dijkstra, Union-Find and topological sort.', difficulty: 'Hard', totalProblems: 20, color: '#dc2626', order: 8 },
  { itemId: 'dsa-dynamic-programming', type: 'topic', title: 'Dynamic Programming', category: 'DSA', description: 'Memoization, tabulation, and classic DP patterns.', difficulty: 'Hard', totalProblems: 25, color: '#0891b2', order: 9 },

  // ── Notes ──────────────────────────────────────────────────────────────
  { itemId: 'note-aptitude-formula-sheet', type: 'note', title: 'Aptitude Formula Sheet', category: 'Aptitude', pages: '12 pages', color: '#2563eb', order: 1 },
  { itemId: 'note-logical-reasoning-shortcuts', type: 'note', title: 'Logical Reasoning Shortcuts', category: 'Reasoning', pages: '8 pages', color: '#0f766e', order: 2 },
  { itemId: 'note-grammar-error-spotting', type: 'note', title: 'Grammar & Error Spotting', category: 'Verbal Ability', pages: '15 pages', color: '#db2777', order: 3 },
  { itemId: 'note-dsa-patterns-cheat-sheet', type: 'note', title: 'DSA Patterns Cheat Sheet', category: 'DSA', pages: '10 pages', color: '#635bff', order: 4 },

  // ── Mock Tests ─────────────────────────────────────────────────────────
  { itemId: 'mock-tcs-nqt-quant', type: 'mock', title: 'TCS NQT — Quantitative Ability', category: 'Aptitude', difficulty: 'Medium', totalProblems: 20, duration: '25 min', color: '#635bff', order: 1 },
  { itemId: 'mock-infosys-foundation', type: 'mock', title: 'Infosys Foundation Test', category: 'Aptitude', difficulty: 'Medium', totalProblems: 30, duration: '35 min', color: '#2563eb', order: 2 },
  { itemId: 'mock-accenture-cognitive', type: 'mock', title: 'Accenture Cognitive Assessment', category: 'Reasoning', difficulty: 'Hard', totalProblems: 25, duration: '30 min', color: '#db2777', order: 3 },
  { itemId: 'mock-wipro-elite', type: 'mock', title: 'Wipro Elite NLTH', category: 'Aptitude', difficulty: 'Medium', totalProblems: 25, duration: '28 min', color: '#16a34a', order: 4 },
  { itemId: 'mock-placement-readiness', type: 'mock', title: 'Placement Readiness Check', category: 'Mixed', difficulty: 'Hard', totalProblems: 40, duration: '45 min', color: '#f59e0b', order: 0 }
];

async function seed() {
  await connectDatabase();
  let inserted = 0;
  let skipped = 0;
  for (const item of topics) {
    try {
      await Content.findOneAndUpdate({ itemId: item.itemId }, item, { upsert: true, returnDocument: 'after' });
      inserted++;
    } catch (e) {
      console.error(`Skip ${item.itemId}: ${e.message}`);
      skipped++;
    }
  }
  console.log(`Seeded: ${inserted} items inserted/updated, ${skipped} skipped.`);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
