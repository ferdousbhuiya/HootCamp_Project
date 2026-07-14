import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Skills Pathfinder
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Turn your resume, transcript, or certificate into clear next-step options.
          AI-powered skill matching for career growth.
        </p>
        <div className="space-x-4">
          <Link href="/auth/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">View Demo</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <div className="text-primary-600 text-4xl mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>
            <p className="text-gray-600">
              Upload a PDF or DOCX of your resume, transcript, or certificates.
            </p>
          </Card>
          <Card>
            <div className="text-primary-600 text-4xl mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">AI Extracts Skills</h3>
            <p className="text-gray-600">
              Our AI analyzes your documents and identifies your skills with confidence scores.
            </p>
          </Card>
          <Card>
            <div className="text-primary-600 text-4xl mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Get Matched</h3>
            <p className="text-gray-600">
              Receive personalized job, learning path, and credential recommendations.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
