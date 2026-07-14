import type { Skill } from '@/types';
import Badge from '@/components/ui/Badge';

interface SkillCardProps {
  skill: Skill;
}

const SkillCard = ({ skill }: SkillCardProps) => {
  const confidenceColor = skill.confidence >= 0.8 ? 'success' : skill.confidence >= 0.5 ? 'warning' : 'default';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{skill.name}</h4>
        <Badge variant={confidenceColor}>
          {Math.round(skill.confidence * 100)}%
        </Badge>
      </div>
      <p className="text-sm text-gray-500 capitalize">{skill.category}</p>
    </div>
  );
};

export default SkillCard;
