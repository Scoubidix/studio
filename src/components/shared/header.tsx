import Link from 'next/link';
import { Stethoscope } from 'lucide-react'; // Example icon

export default function Header() {
  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Stethoscope className="w-6 h-6" />
          <h1 className="text-xl font-semibold">Mon Assistant Kiné</h1>
        </Link>
        <nav>
          {/* Add navigation links here if needed, e.g., Login/Logout */}
           {/* For now, link directly to patient dashboard for testing */}
           <Link href="/patient/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
             Tableau de bord Patient (Test)
           </Link>
        </nav>
      </div>
    </header>
  );
}
