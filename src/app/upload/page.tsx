'use client';

import { useState } from 'react';
import FileDropzone from '@/components/upload/FileDropzone';
import SkillGrid from '@/components/skills/SkillGrid';
import { useSkills } from '@/hooks/useSkills';
import Card from '@/components/ui/Card';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { skills, loading, error, extractSkills } = useSkills();

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    await extractSkills(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Upload Your Resume</h1>

      <Card className="mb-8">
        <FileDropzone onFileSelect={handleFileSelect} />
      </Card>

      {selectedFile && (
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Selected File</h2>
          <p className="text-gray-600">{selectedFile.name}</p>
        </Card>
      )}

      {loading && (
        <Card className="mb-8 text-center">
          <div className="animate-pulse text-primary-600">
            Analyzing your resume...
          </div>
        </Card>
      )}

      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {skills.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Extracted Skills ({skills.length})
          </h2>
          <SkillGrid skills={skills} />
        </div>
      )}
    </div>
  );
}
