import type { Skill } from '@/types';
import SkillCard from './SkillCard';

interface SkillGridProps {
  skills: Skill[];
}

const SkillGrid = ({ skills }: SkillGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {skills.map((skill, index) => (
        <SkillCard key={`${skill.name}-${index}`} skill={skill} />
      ))}
    </div>
  );
};

export default SkillGrid;
