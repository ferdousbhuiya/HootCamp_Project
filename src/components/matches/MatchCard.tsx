'use client';

import { useState } from 'react';
import type { Match } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ExplanationPanel from './ExplanationPanel';

interface MatchCardProps {
  match: Match;
}

const MatchCard = ({ match }: MatchCardProps) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const scoreColor = match.match_score >= 0.8 ? 'success' : match.match_score >= 0.5 ? 'warning' : 'default';

  return (
    <div className="space-y-4">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowExplanation(!showExplanation)}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{match.title}</h3>
          <Badge variant={scoreColor}>
            {Math.round(match.match_score * 100)}% Match
          </Badge>
        </div>
        <p className="text-gray-600 mb-3">{match.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 capitalize">
            {match.type.replace('_', ' ')}
          </span>
          <span className="text-sm text-primary-600">
            {showExplanation ? 'Hide' : 'Show'} Details
          </span>
        </div>
      </Card>

      {showExplanation && (
        <ExplanationPanel
          explanation={match.explanation}
          matchedSkills={match.matched_skills}
        />
      )}
    </div>
  );
};

export default MatchCard;
