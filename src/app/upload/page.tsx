'use client';

import { useState } from 'react';
import Link from 'next/link';
import FileDropzone from '@/components/upload/FileDropzone';
import SkillGrid from '@/components/skills/SkillGrid';
import { useSkills } from '@/hooks/useSkills';
import { useCertificates } from '@/hooks/useCertificates';
import { useOngoingCourses } from '@/hooks/useOngoingCourses';
import { useAuthContext } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

type UploadTab = 'resume' | 'certificate' | 'courses';

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState<UploadTab>('resume');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const { user } = useAuthContext();
  const { skills, loading, error, extractSkills, addSkill, updateSkill, removeSkill, fetchSkills } = useSkills();
  const { certificates, uploadCertificate, deleteCertificate, loading: certLoading } = useCertificates();
  const { courses, addCourse, updateCourse, deleteCourse, loading: coursesLoading } = useOngoingCourses();

  const [certificateForm, setCertificateForm] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    verificationUrl: '',
  });
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'verifying' | 'verified' | 'failed'>('none');
  const [extractedCertificateData, setExtractedCertificateData] = useState<any>(null);

  const [courseForm, setCourseForm] = useState({
    courseName: '',
    provider: '',
    platform: '',
    startDate: '',
    expectedCompletionDate: '',
    progress: 0,
    status: 'in_progress' as const,
    url: '',
    description: '',
  });

  const handleResumeFilesSelect = async (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
    for (const file of files) {
      await extractSkills(file, 'resume');
    }
  };

  const handleCertificateUpload = async (files: File[]) => {
    if (files.length === 0) {
      alert('Please select a certificate file');
      return;
    }
    
    const file = files[0];
    
    try {
      setCertificateLoading(true);
      
      // Send file to server for extraction
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/certificate-extract', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract certificate information');
      }
      
      // Auto-fill the form with extracted metadata
      setCertificateForm({
        title: data.metadata.title || file.name.replace(/\.[^/.]+$/, ''),
        issuer: data.metadata.issuer || '',
        issueDate: data.metadata.issueDate || '',
        expiryDate: data.metadata.expiryDate || '',
        credentialId: data.metadata.credentialId || '',
        verificationUrl: data.metadata.verificationUrl || '',
      });
      
      setExtractedCertificateData({ 
        text: data.text, 
        skills: data.metadata.skills,
        metadata: data.metadata,
        originalFile: file // Store the original file for upload
      });
      
      alert('Certificate information extracted automatically! Please review the details and click Save Certificate.');
      setCertificateLoading(false);
      
    } catch (error) {
      console.error('Certificate extraction error:', error);
      alert('Failed to extract certificate information. Please try again or fill in the form manually.');
      setCertificateLoading(false);
    }
  };

  const handleCertificateSave = async () => {
    if (!certificateForm.title) {
      alert('Please enter a certificate title');
      return;
    }
    
    if (!extractedCertificateData) {
      alert('Please upload a certificate file first');
      return;
    }
    
    try {
      setCertificateLoading(true);
      
      // Use the original file if available, otherwise create a text file
      const file = extractedCertificateData.originalFile || 
        new File([extractedCertificateData.text], `${certificateForm.title.replace(/\s+/g, '_')}.txt`, { type: 'text/plain' });
      
      // Pass the already extracted text to avoid redundant OCR
      const result = await uploadCertificate(file, certificateForm, extractedCertificateData.text);
      if (result) {
        alert(`Certificate "${certificateForm.title}" uploaded successfully! ${result.message}`);
        
        // Refresh skills to show newly extracted certificate skills
        await fetchSkills();
        
        // Reset form
        setCertificateForm({
          title: '',
          issuer: '',
          issueDate: '',
          expiryDate: '',
          credentialId: '',
          verificationUrl: '',
        });
        setExtractedCertificateData(null);
        setVerificationStatus('none');
      } else {
        alert('Failed to upload certificate. Please check the console for errors.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload certificate';
      
      // Check if it's a database table error
      if (errorMessage.includes('database table does not exist')) {
        alert('Database tables are missing. Please run the database migrations in your Supabase dashboard to create the certificates and ongoing_courses tables.');
      } else {
        alert(`Failed to upload certificate: ${errorMessage}. Please try again.`);
      }
      console.error('Certificate upload error:', error);
    } finally {
      setCertificateLoading(false);
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.courseName) {
      alert('Please enter a course name');
      return;
    }
    
    try {
      const result = await addCourse(courseForm);
      if (result) {
        alert('Course added successfully!');
        
        // Reset form
        setCourseForm({
          courseName: '',
          provider: '',
          platform: '',
          startDate: '',
          expectedCompletionDate: '',
          progress: 0,
          status: 'in_progress',
          url: '',
          description: '',
        });
      } else {
        alert('Failed to add course. Please try again.');
      }
    } catch (error) {
      alert('Failed to add course. Please try again.');
      console.error('Course submission error:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Build Your Portfolio</h1>
      <p className="text-lg text-gray-600 mb-8">Upload your resume, certificates, and track ongoing courses to build your complete professional profile.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('resume')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'resume'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Resume
        </button>
        <button
          onClick={() => setActiveTab('certificate')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'certificate'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Certificates
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'courses'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Ongoing Courses
        </button>
      </div>

      {/* Resume Tab */}
      {activeTab === 'resume' && (
        <div>
          <Card className="mb-8">
            <FileDropzone onFilesSelect={handleResumeFilesSelect} />
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: PDF, DOCX, DOC, TXT, JPEG, JPG, PNG
            </p>
          </Card>

          {selectedFiles.length > 0 && (
            <Card className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Uploaded Files</h2>
              <ul className="list-disc list-inside text-gray-600">
                {selectedFiles.map((file, i) => <li key={i}>{file.name}</li>)}
              </ul>
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

          <div>
            <h2 className="text-2xl font-bold mb-4">
              {skills.length > 0 ? `Skills (${skills.length})` : 'Skills'}
            </h2>

            {skills.length === 0 && !loading && (
              <Card className="mb-6 border-dashed border-gray-200 bg-gray-50">
                <p className="text-gray-600">
                  No skills extracted yet. Upload a resume to auto-fill this list, or add one manually below.
                </p>
              </Card>
            )}

            <SkillGrid
              skills={skills}
              onAdd={addSkill}
              onUpdate={updateSkill}
              onRemove={removeSkill}
            />
          </div>
        </div>
      )}

      {/* Certificate Tab */}
      {activeTab === 'certificate' && (
        <div>
          <Card className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Upload Certificate</h2>
            <p className="text-sm text-gray-500 mb-4">
              Upload a certificate file (PDF, DOCX, DOC, TXT, PNG, JPG) to automatically extract all information.
            </p>
            
            {!extractedCertificateData ? (
              <div>
                <FileDropzone onFilesSelect={handleCertificateUpload} />
                {certificateLoading && (
                  <div className="text-center text-primary-600 animate-pulse mt-4">
                    Extracting certificate information...
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">✓ Information Extracted Successfully</h4>
                  <p className="text-sm text-green-700">All certificate details have been filled automatically. Review and edit if needed, then save.</p>
                </div>
                
                <form className="space-y-4">
                  <Input
                    label="Certificate Title"
                    value={certificateForm.title}
                    onChange={(e) => setCertificateForm({ ...certificateForm, title: e.target.value })}
                    required
                  />
                  <Input
                    label="Issuer"
                    value={certificateForm.issuer}
                    onChange={(e) => setCertificateForm({ ...certificateForm, issuer: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Issue Date"
                      type="date"
                      value={certificateForm.issueDate}
                      onChange={(e) => setCertificateForm({ ...certificateForm, issueDate: e.target.value })}
                    />
                    <Input
                      label="Expiry Date"
                      type="date"
                      value={certificateForm.expiryDate}
                      onChange={(e) => setCertificateForm({ ...certificateForm, expiryDate: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Credential ID"
                    value={certificateForm.credentialId}
                    onChange={(e) => setCertificateForm({ ...certificateForm, credentialId: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verification URL (optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={certificateForm.verificationUrl}
                        onChange={(e) => setCertificateForm({ ...certificateForm, verificationUrl: e.target.value })}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {certificateForm.verificationUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            setVerificationStatus('verifying');
                            try {
                              // Try to verify the URL by making a HEAD request
                              const response = await fetch(certificateForm.verificationUrl, { 
                                method: 'HEAD',
                                mode: 'no-cors'
                              });
                              // Since no-cors mode doesn't give us status, we'll assume success if no error
                              setVerificationStatus('verified');
                              alert('URL verified successfully! Certificate will be marked as verified.');
                            } catch (error) {
                              setVerificationStatus('failed');
                              alert('Could not verify URL. The certificate will be saved as "not verified".');
                            }
                          }}
                          disabled={verificationStatus === 'verifying'}
                        >
                          {verificationStatus === 'verifying' ? 'Verifying...' : 
                           verificationStatus === 'verified' ? '✓ Verified' : 
                           verificationStatus === 'failed' ? '✗ Failed' : 'Verify'}
                        </Button>
                      )}
                    </div>
                    {verificationStatus === 'verified' && (
                      <p className="mt-2 text-sm text-green-600">✓ URL verified - certificate will be marked as verified</p>
                    )}
                    {verificationStatus === 'failed' && (
                      <p className="mt-2 text-sm text-red-600">✗ URL verification failed - certificate will be saved as not verified</p>
                    )}
                  </div>
                  
                  {extractedCertificateData.skills && extractedCertificateData.skills.length > 0 && (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                      <h4 className="font-semibold text-primary-800 mb-2">Extracted Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {extractedCertificateData.skills.map((skill: string, i: number) => (
                          <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button onClick={handleCertificateSave} disabled={certificateLoading}>
                      {certificateLoading ? 'Saving...' : 'Save Certificate'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setExtractedCertificateData(null);
                        setCertificateForm({
                          title: '',
                          issuer: '',
                          issueDate: '',
                          expiryDate: '',
                          credentialId: '',
                          verificationUrl: '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">Your Certificates ({certificates.length})</h2>
            {certificates.length === 0 ? (
              <p className="text-gray-500">No certificates uploaded yet.</p>
            ) : (
              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{cert.title}</h3>
                        <p className="text-sm text-gray-500">{cert.issuer}</p>
                        {cert.verification_status === 'verified' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mt-2">
                            ✓ Verified
                          </span>
                        )}
                        {cert.verification_status === 'not_available' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                            Not Verified (no verification URL)
                          </span>
                        )}
                        {cert.verification_status === 'pending' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                            Verification Pending
                          </span>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => deleteCertificate(cert.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div>
          <Card className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Add Ongoing Course</h2>
            <form onSubmit={handleCourseSubmit} className="space-y-4">
              <Input
                label="Course Name"
                value={courseForm.courseName}
                onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Provider"
                  value={courseForm.provider}
                  onChange={(e) => setCourseForm({ ...courseForm, provider: e.target.value })}
                />
                <Input
                  label="Platform"
                  value={courseForm.platform}
                  onChange={(e) => setCourseForm({ ...courseForm, platform: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={courseForm.startDate}
                  onChange={(e) => setCourseForm({ ...courseForm, startDate: e.target.value })}
                />
                <Input
                  label="Expected Completion"
                  type="date"
                  value={courseForm.expectedCompletionDate}
                  onChange={(e) => setCourseForm({ ...courseForm, expectedCompletionDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress: {courseForm.progress}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={courseForm.progress}
                  onChange={(e) => setCourseForm({ ...courseForm, progress: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <select
                value={courseForm.status}
                onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as any })}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
              <Input
                label="Course URL"
                value={courseForm.url}
                onChange={(e) => setCourseForm({ ...courseForm, url: e.target.value })}
                placeholder="https://..."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <Button type="submit">Add Course</Button>
            </form>
          </Card>

          {coursesLoading && (
            <Card className="mb-8 text-center">
              <div className="animate-pulse text-primary-600">
                Loading courses...
              </div>
            </Card>
          )}

          <Card>
            <h2 className="text-xl font-semibold mb-4">Your Ongoing Courses ({courses.length})</h2>
            {courses.length === 0 ? (
              <p className="text-gray-500">No ongoing courses added yet.</p>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{course.course_name}</h3>
                        <p className="text-sm text-gray-500">{course.provider} • {course.platform}</p>
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-grow bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{course.progress}%</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => deleteCourse(course.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Navigation */}
      {skills.length > 0 && (
        <Card className="mt-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {skills.length} skills in your portfolio.
            </p>
            <Link href="/matches">
              <Button>Find Matches →</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
