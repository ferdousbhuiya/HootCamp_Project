'use client';

import { useEffect } from 'react';
import { useMatches } from '@/hooks/useMatches';
import { useSkills } from '@/hooks/useSkills';
import MatchList from '@/components/matches/MatchList';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function MatchesPage() {
  const { matches, loading, error, findJobMatches } = useMatches();
  const { skills } = useSkills();

  // Auto-fetch matches when skills are available
  useEffect(() => {
    if (skills.length > 0 && matches.length === 0 && !loading) {
      findJobMatches(skills);
    }
  }, [skills, matches.length, loading, findJobMatches]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Matches</h1>

      {skills.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600 mb-4">
            Upload a resume first to see your matches.
          </p>
          <a href="/upload">
            <Button>Upload Resume</Button>
          </a>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <Button onClick={() => findJobMatches(skills)} disabled={loading}>
              {loading ? 'Finding Matches...' : 'Refresh Matches'}
            </Button>
          </div>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <p className="text-red-600">{error}</p>
            </Card>
          )}

          <MatchList matches={matches} />
        </>
      )}
    </div>
  );
}
