'use client';

import { useEffect, useRef, useState } from 'react';
import { useMatches } from '@/hooks/useMatches';
import { useSkills } from '@/hooks/useSkills';
import MatchList from '@/components/matches/MatchList';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type MatchType = 'job' | 'learning_path' | 'credential';

const tabs: { label: string; type: MatchType }[] = [
  { label: 'Jobs', type: 'job' },
  { label: 'Learning Paths', type: 'learning_path' },
  { label: 'Certificates', type: 'credential' },
];

export default function MatchesPage() {
  const [activeType, setActiveType] = useState<MatchType>('job');
  const hasAutoLoadedRef = useRef(false);
  const { matches, loading, error, findJobMatches } = useMatches();
  const { skills } = useSkills();

  useEffect(() => {
    if (skills.length > 0 && !hasAutoLoadedRef.current) {
      hasAutoLoadedRef.current = true;
      findJobMatches(skills, activeType);
    }
  }, [skills, findJobMatches, activeType]);

  const loadMatches = (type: MatchType) => {
    setActiveType(type);
    if (skills.length > 0) findJobMatches(skills, type);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-3">Your Career Pathfinder</h1>
      <p className="text-gray-600 mb-8">
        Explore jobs, learning paths, and credentials based on your skills.
      </p>

      {skills.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600 mb-4">
            Upload a resume, transcript, or certificate first to see your next steps.
          </p>
          <a href="/upload">
            <Button>Upload Document</Button>
          </a>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 mb-4">
              {tabs.map(tab => (
                <Button
                  key={tab.type}
                  variant={activeType === tab.type ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => loadMatches(tab.type)}
                  disabled={loading && activeType === tab.type}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                {skills.length} skills loaded from your document
              </p>
              <Button onClick={() => findJobMatches(skills, activeType)} disabled={loading}>
                {loading ? 'Finding Matches...' : 'Refresh Matches'}
              </Button>
            </div>
          </Card>

          {loading && (
            <Card className="mb-6 text-center">
              <div className="animate-pulse text-primary-600">
                Finding your best {activeType === 'job' ? 'career' : activeType === 'credential' ? 'credential' : 'learning path'} options...
              </div>
            </Card>
          )}

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <p className="text-red-600 font-semibold mb-2">Error finding matches:</p>
              <p className="text-red-600 text-sm">{error}</p>
            </Card>
          )}

          {!loading && !error && matches.length === 0 && (
            <Card className="text-center py-8">
              <p className="text-gray-600">No matches found yet. Refresh to try again.</p>
            </Card>
          )}

          {matches.length > 0 && <MatchList matches={matches} />}
        </>
      )}
    </div>
  );
}
