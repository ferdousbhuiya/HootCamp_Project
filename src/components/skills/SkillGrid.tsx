"use client";

import { useState } from 'react';
import type { Skill } from '@/types';
import SkillCard from './SkillCard';
import Button from '@/components/ui/Button';

interface SkillGridProps {
  skills: Skill[];
  onAdd: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

const SkillGrid = ({ skills, onAdd, onUpdate, onRemove }: SkillGridProps) => {
  const [newSkill, setNewSkill] = useState('');
  const isAddDisabled = !newSkill.trim();

  const handleAdd = () => {
    if (isAddDisabled) return;
    onAdd(newSkill);
    setNewSkill('');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a skill the AI missed"
          className="flex-grow border-gray-300 rounded-lg shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
        />
        <Button onClick={handleAdd} disabled={isAddDisabled}>Add Skill</Button>
      </div>
      <p className="text-xs text-gray-500 mb-4">Type a skill first, then click Add Skill.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill, index) => (
          <SkillCard
            key={`${skill.id || skill.name}-${index}`}
            skill={skill}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};

export default SkillGrid;
