'use client';

import { useState } from 'react';
import Link from 'next/link';
import FileDropzone from '@/components/upload/FileDropzone';
import SkillGrid from '@/components/skills/SkillGrid';
import { useSkills } from '@/hooks/useSkills';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { skills, loading, error, extractSkills, addSkill, updateSkill, removeSkill } = useSkills();

  const handleFilesSelect = async (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
    for (const file of files) {
      await extractSkills(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Upload Documents</h1>
      <p className="text-lg text-gray-600 mb-8">Upload your resume, transcripts, or certificates to extract skills.</p>

      <Card className="mb-8">
        <FileDropzone onFilesSelect={handleFilesSelect} />
      </Card>

      {selectedFiles.length > 0 && (
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Selected Files</h2>
          <ul className="list-disc list-inside text-gray-600">
            {selectedFiles.map((file, i) => <li key={i}>{file.name}</li>)}
          </ul>
        </Card>
      )}

      {loading && (
        <Card className="mb-8 text-center">
          <div className="animate-pulse text-primary-600">
            Analyzing your documents...
          </div>
        </Card>
      )}

      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">
          {skills.length > 0 ? `Extracted Skills (${skills.length})` : 'Skills'}
        </h2>

        {skills.length === 0 && !loading && (
          <Card className="mb-6 border-dashed border-gray-200 bg-gray-50">
            <p className="text-gray-600">
              No skills extracted yet. Upload a document to auto-fill this list, or add one manually below.
            </p>
          </Card>
        )}

        <SkillGrid
          skills={skills}
          onAdd={addSkill}
          onUpdate={updateSkill}
          onRemove={removeSkill}
        />

        {skills.length > 0 && (
          <Card className="mt-8">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                {skills.length} skills ready.
              </p>
              <Link href="/matches">
                <Button>Find Matches →</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
