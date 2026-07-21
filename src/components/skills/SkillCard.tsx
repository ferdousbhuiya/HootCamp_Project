"use client";

import { useState } from 'react';
import type { Skill } from '@/types';
import Badge from '@/components/ui/Badge';
import { TrashIcon, PencilIcon } from '@/components/icons/actions';
import Button from '@/components/ui/Button';

interface SkillCardProps {
  skill: Skill;
  onUpdate: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

const SkillCard = ({ skill, onUpdate, onRemove }: SkillCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(skill.name);
  const confidenceColor = skill.confidence >= 0.8 ? 'success' : skill.confidence >= 0.5 ? 'warning' : 'default';

  const handleSave = () => {
    onUpdate(skill.id, name);
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-md">
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-grow border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            autoFocus
          />
          <Button size="sm" onClick={handleSave}>Save</Button>
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-gray-900">{skill.name}</h4>
            <Badge variant={confidenceColor}>
              {Math.round(skill.confidence * 100)}%
            </Badge>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-sm text-gray-500 capitalize">{skill.category}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-primary-600">
                <PencilIcon className="w-4 h-4" />
              </button>
              <button onClick={() => onRemove(skill.id)} className="text-gray-400 hover:text-red-600">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SkillCard;
