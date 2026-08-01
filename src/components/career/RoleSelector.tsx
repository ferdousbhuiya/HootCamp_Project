'use client';

import { useState, useMemo } from 'react';
import type { JobRole } from '@/types';
import Badge from '@/components/ui/Badge';

interface RoleSelectorProps {
  roles: JobRole[];
  analyzedTitles: string[];
  selectedRole: JobRole | null;
  onSelect: (role: JobRole) => void;
}

export default function RoleSelector({ roles, analyzedTitles, selectedRole, onSelect }: RoleSelectorProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) => r.title.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q)
    );
  }, [roles, query]);

  const analyzedSet = useMemo(() => new Set(analyzedTitles.map((t) => t.toLowerCase())), [analyzedTitles]);

  return (
    <div>
      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a career role..."
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No roles match &quot;{query}&quot;.</p>
        ) : (
          filtered.map((role) => {
            const isSelected = selectedRole?.id === role.id;
            const isAnalyzed = analyzedSet.has(role.title.toLowerCase());
            return (
              <button
                key={role.id}
                onClick={() => onSelect(role)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-600 text-white shadow-soft'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-primary-300 hover:shadow-soft'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{role.title}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    {isAnalyzed && (
                      <Badge variant={isSelected ? 'info' : 'default'}>Analyzed</Badge>
                    )}
                  </div>
                </div>
                {role.description && (
                  <p className={`mt-0.5 text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {role.description}
                  </p>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
