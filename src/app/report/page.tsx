'use client';

import { useState } from 'react';
import { useSkills } from '@/hooks/useSkills';
import { useCertificates } from '@/hooks/useCertificates';
import { useOngoingCourses } from '@/hooks/useOngoingCourses';
import { useMatches } from '@/hooks/useMatches';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuthContext } from '@/context/AuthContext';
import { jsPDF } from 'jspdf';

export default function ReportPage() {
  const { skills } = useSkills();
  const { certificates } = useCertificates();
  const { courses } = useOngoingCourses();
  const { matches } = useMatches();
  const { user } = useAuthContext();
  
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    if (!user) {
      setError('You must be logged in to generate a report.');
      return;
    }

    setGenerating(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills,
          certificates,
          ongoingCourses: courses,
          jobMatches: matches.filter(m => m.type === 'job'),
          learningMatches: matches.filter(m => m.type === 'learning_path'),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }

      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    // Create PDF using jsPDF
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 48;
    const contentWidth = pageWidth - margin * 2;
    const titleSize = 18;
    const headingSize = 13;
    const bodySize = 10;
    const lineHeight = bodySize * 1.55;

    let y = margin;
    const pageBottom = pageHeight - margin;

    const ensureSpace = (needed: number) => {
      if (y + needed > pageBottom) {
        doc.addPage();
        y = margin;
      }
    };

    const drawHeader = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(titleSize);
      doc.setTextColor(30, 41, 59);
      doc.text('Career Portfolio Report', margin, y);
      y += 8;
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 24;
    };

    drawHeader();

    // Split markdown-ish report into lines, handling headings and bullets
    const lines = report.split(/\r?\n/);

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        y += 8;
        continue;
      }

      // Skip markdown heading underlines (===== or ----- under a title)
      if (/^[=_-]{3,}$/.test(line)) {
        continue;
      }

      // Headings: "# ", "## ", "### ", "1." style numbered headings
      const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
      const numberedHeadingMatch = line.match(/^(\d+)\.\s+(.+)$/);

      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const size = headingSize - (level - 1) * 1.5;
        ensureSpace(size + 12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(size);
        doc.setTextColor(30, 41, 59);
        const split = doc.splitTextToSize(text, contentWidth);
        doc.text(split, margin, y);
        y += split.length * (size * 1.3) + 8;
      } else if (numberedHeadingMatch) {
        const text = `${numberedHeadingMatch[1]}. ${numberedHeadingMatch[2]}`;
        ensureSpace(headingSize + 12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(headingSize);
        doc.setTextColor(30, 41, 59);
        const split = doc.splitTextToSize(text, contentWidth);
        doc.text(split, margin, y);
        y += split.length * (headingSize * 1.3) + 8;
      } else {
        // Body text: bullets get indent + marker
        const isBullet = /^[-*•+]\s+/.test(line);
        const isNumbered = /^\d+[.)]\s+/.test(line);
        const text = isBullet
          ? line.replace(/^[-*•+]\s+/, '')
          : line.replace(/^\d+[.)]\s+/, '');
        const indent = isBullet || isNumbered ? 18 : 0;
        const bulletMarker = isBullet ? '• ' : isNumbered ? '' : '';

        // Strip markdown emphasis so literal ** and * don't appear in the PDF
        const clean = text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/_([^_]+)_/g, '$1');
        const effectiveWidth = contentWidth - indent;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(bodySize);
        doc.setTextColor(51, 65, 85);
        const split = doc.splitTextToSize(clean, effectiveWidth);
        ensureSpace(split.length * lineHeight);
        doc.text(bulletMarker + (split[0] || ''), margin + indent, y);
        if (split.length > 1) {
          doc.text(split.slice(1), margin + indent + (isBullet ? 10 : 0), y + lineHeight);
        }
        y += split.length * lineHeight;
      }
    }

    // Footer with generation date
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const footer = `Generated on ${new Date().toLocaleString()}`;
    const footerY = pageBottom;
    doc.text(footer, margin, footerY);

    // Save PDF
    doc.save(`career-portfolio-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const printReport = () => {
    if (!report) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Career Portfolio Report</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
              h1, h2, h3 { color: #1e293b; }
              h1 { border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
              h2 { border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-top: 30px; }
              ul { margin: 10px 0; padding-left: 20px; }
              li { margin: 5px 0; }
              .generated-at { color: #64748b; font-size: 12px; margin-top: 40px; }
            </style>
          </head>
          <body>
            <h1>Career Portfolio Report</h1>
            <pre style="white-space: pre-wrap; font-family: inherit;">${report}</pre>
            <div class="generated-at">Generated on ${new Date().toLocaleString()}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const verifiedSkills = skills.filter(s => s.is_verified).length;
  const hasPortfolioData = skills.length > 0 || certificates.length > 0 || courses.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-3">Career Portfolio Report</h1>
      <p className="text-gray-600 mb-8">
        Generate a comprehensive report analyzing your skills, certificates, and career recommendations.
      </p>

      {!hasPortfolioData ? (
        <Card className="text-center py-12">
          <p className="text-gray-600 mb-4">
            Build your portfolio first to generate a report.
          </p>
          <a href="/upload">
            <Button>Build Your Portfolio</Button>
          </a>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <div className="p-4 bg-primary-50 rounded-lg mb-4">
              <p className="text-sm text-primary-800">
                <strong>Portfolio Summary:</strong> {skills.length} total skills ({verifiedSkills} verified), {certificates.length} certificates, {courses.length} ongoing courses
              </p>
            </div>
            
            {!report ? (
              <Button 
                onClick={generateReport} 
                disabled={generating}
                className="w-full"
              >
                {generating ? 'Generating Report...' : 'Generate Comprehensive Report'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={generateReport} disabled={generating}>
                  Regenerate Report
                </Button>
                <Button variant="outline" onClick={downloadReport}>
                  Download Report
                </Button>
                <Button variant="outline" onClick={printReport}>
                  Print Report
                </Button>
              </div>
            )}
          </Card>

          {generating && (
            <Card className="mb-6 text-center">
              <div className="animate-pulse text-primary-600">
                Analyzing your portfolio and generating personalized recommendations...
              </div>
            </Card>
          )}

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <p className="text-red-600 font-semibold mb-2">Error generating report:</p>
              <p className="text-red-600 text-sm">{error}</p>
            </Card>
          )}

          {report && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Your Career Portfolio Report</h2>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {report}
                </pre>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
