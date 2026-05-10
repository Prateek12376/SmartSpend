import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    // ✨ Changed min-h-[100vh] to min-h-screen
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background">
      <div className="relative mb-8">
        <h1 className="text-9xl font-extrabold text-muted-foreground/20 select-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-4xl font-bold gradient-title">Lost in Space?</h2>
        </div>
      </div>

      <h3 className="text-xl font-medium mb-4">
        Even the best budgets get off track sometimes.
      </h3>
      
      <p className="text-muted-foreground mb-8 max-w-md">
        This page seems to have slipped through the cracks. Don&apos;t worry, 
        your financial data is still safe! Let&apos;s get you back to your dashboard.
      </p>

      <div className="flex gap-4">
        <Link href="/">
          <Button variant="outline" className="px-6">
            Go Home
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}