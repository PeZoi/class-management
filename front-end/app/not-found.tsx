import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-primary/20 dark:text-primary/10">404</h1>
          <div className="h-1 w-24 bg-linear-to-r from-primary to-primary/50 mx-auto rounded-full" />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground text-lg">
            The page you are looking for does not exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/vi">Go Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/vi/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

