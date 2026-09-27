import React from 'react';
import { FileText, CheckSquare, BarChart2, Lightbulb } from 'lucide-react';

const FEATURES = [
  {
    id: 'notes',
    title: 'Handwritten Notes',
    subtitle: 'Download high-quality notes',
    icon: FileText,
    iconColor: '#2563eb'
  },
  {
    id: 'mock',
    title: 'Mock Tests & Quizzes',
    subtitle: 'Practice and improve accuracy',
    icon: CheckSquare,
    iconColor: '#7c3aed'
  },
  {
    id: 'tracking',
    title: 'Progress Tracking',
    subtitle: 'Track your growth and stay consistent',
    icon: BarChart2,
    iconColor: '#0284c7'
  },
  {
    id: 'suggestions',
    title: 'Smart Suggestions',
    subtitle: 'Get personalized study recommendations',
    icon: Lightbulb,
    iconColor: '#eab308'
  }
];

export default function FeatureBar({ onSelectFeature }) {
  return (
    <section className="feature-bar-section">
      {FEATURES.map((item) => {
        const IconComp = item.icon;
        return (
          <div
            key={item.id}
            className="feature-bar-item"
            onClick={() => onSelectFeature(item)}
          >
            <div className="feature-item-icon">
              <IconComp size={20} color={item.iconColor} strokeWidth={2.2} />
            </div>
            <div className="feature-item-info">
              <h4>{item.title}</h4>
              <p>{item.subtitle}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
