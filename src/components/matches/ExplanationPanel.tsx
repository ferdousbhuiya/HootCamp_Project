import Card from '@/components/ui/Card';

interface ExplanationPanelProps {
  explanation: string;
  matchedSkills: string[];
}

const ExplanationPanel = ({ explanation, matchedSkills }: ExplanationPanelProps) => {
  return (
    <Card variant="elevated">
      <h4 className="font-semibold text-gray-900 mb-3">Why This Matches</h4>
      <p className="text-gray-600 mb-4">{explanation}</p>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Matched Skills:</p>
        <div className="flex flex-wrap gap-2">
          {matchedSkills.map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ExplanationPanel;
