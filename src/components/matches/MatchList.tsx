import type { Match } from '@/types';
import MatchCard from './MatchCard';

interface MatchListProps {
  matches: Match[];
}

const MatchList = ({ matches }: MatchListProps) => {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No matches found. Upload a resume to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match, index) => (
        <MatchCard key={`${match.title}-${index}`} match={match} />
      ))}
    </div>
  );
};

export default MatchList;
