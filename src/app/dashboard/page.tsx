import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-semibold mb-2">Skills Found</h3>
          <p className="text-4xl font-bold text-primary-600">0</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Matches</h3>
          <p className="text-4xl font-bold text-primary-600">0</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Documents</h3>
          <p className="text-4xl font-bold text-primary-600">0</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="space-x-4">
          <Link href="/upload">
            <Button>Upload Resume</Button>
          </Link>
          <Link href="/matches">
            <Button variant="outline">View Matches</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
