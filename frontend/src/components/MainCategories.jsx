import React from 'react';
import { Calculator, Brain, BookOpen, Code, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'aptitude',
    title: 'Aptitude',
    description: 'Learn concepts, formulas, examples and practice questions.',
    icon: Calculator,
    className: 'aptitude',
    topics: ['Quantitative Aptitude', 'Number Systems', 'Percentages & Profit', 'Permutation & Combination', 'Speed & Distance']
  },
  {
    id: 'reasoning',
    title: 'Reasoning',
    description: 'Master logical reasoning with topic-wise practice.',
    icon: Brain,
    className: 'reasoning',
    topics: ['Logical Deduction', 'Coding-Decoding', 'Blood Relations', 'Seating Arrangements', 'Data Sufficiency']
  },
  {
    id: 'verbal',
    title: 'Verbal Ability',
    description: 'Improve your English and communication skills.',
    icon: BookOpen,
    className: 'verbal',
    topics: ['Reading Comprehension', 'Sentence Correction', 'Synonyms & Antonyms', 'Para Jumbles', 'Vocabulary Builder']
  },
  {
    id: 'dsa',
    title: 'DSA & LeetCode',
    description: 'Top LeetCode problems with proper links and solutions.',
    icon: Code,
    className: 'dsa',
    topics: ['Arrays & Strings', 'Trees & Graphs', 'Dynamic Programming', 'Sliding Window', 'Top 150 Interview Questions']
  }
];

export default function MainCategories({ onSelectCategory }) {
  return (
    <section className="categories-section" id="courses">
      {CATEGORIES.map((cat) => {
        const IconComponent = cat.icon;
        return (
          <div
            key={cat.id}
            className={`category-card ${cat.className}`}
            onClick={() => onSelectCategory(cat)}
          >
            <div>
              <div className="card-icon-badge">
                <IconComponent size={22} strokeWidth={2.2} />
              </div>
              <h3 className="card-title">{cat.title}</h3>
              <p className="card-desc">{cat.description}</p>
            </div>
            <button className="card-action-btn" aria-label={`Open ${cat.title}`}>
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        );
      })}
    </section>
  );
}
