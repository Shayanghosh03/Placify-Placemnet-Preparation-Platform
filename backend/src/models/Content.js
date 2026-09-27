import mongoose from 'mongoose';

/**
 * Content items: topics, notes, mock tests.
 * Pre-seeded with the placement prep content.
 */
const contentSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true, unique: true }, // stable slug e.g. "aptitude-percentages"
    type: {
      type: String,
      enum: ['topic', 'note', 'mock'],
      required: true
    },
    title: { type: String, required: true },
    category: { type: String, required: true }, // Aptitude | Reasoning | Verbal Ability | DSA
    description: { type: String, default: '' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    totalProblems: { type: Number, default: 0 }, // for topics / mocks
    pages: { type: String, default: '' },         // for notes e.g. "12 pages"
    duration: { type: String, default: '' },       // for mocks e.g. "25 min"
    color: { type: String, default: '#635bff' },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Content', contentSchema);
