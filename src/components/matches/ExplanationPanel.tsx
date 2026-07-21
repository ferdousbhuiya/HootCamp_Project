import Card from '@/components/ui/Card';
import { CheckCircleIcon, ArrowRightCircleIcon, SparklesIcon } from '@/components/icons/index';

interface ExplanationPanelProps {
  explanation: string;
  matchedSkills: string[];
  missingSkills?: string[];
  nextSteps?: string[];
}

const ExplanationPanel = ({ explanation, matchedSkills, missingSkills, nextSteps }: ExplanationPanelProps) => {
  return (
    <Card variant="elevated">
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <SparklesIcon className="w-5 h-5 mr-2 text-primary-500" />
          Why This Matches
        </h4>
        <p className="text-gray-600">{explanation}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500" />
            Your Matched Skills
          </h5>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {missingSkills && missingSkills.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <ArrowRightCircleIcon className="w-5 h-5 mr-2 text-yellow-500" />
              Skills to Develop
            </h5>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {nextSteps && nextSteps.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 mb-3">Your Next Steps</h4>
          <ul className="space-y-2">
            {nextSteps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary-500 font-bold mr-3">{index + 1}.</span>
                <span className="text-gray-600">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default ExplanationPanel;
