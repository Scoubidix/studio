import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center">
      <h1 className="text-4xl font-bold mb-4">Bienvenue sur Mon Assistant Kiné</h1>
      <p className="text-lg text-muted-foreground mb-8">Votre plateforme de suivi patient personnalisée.</p>
      {/* Placeholder links - Replace with actual auth flow later */}
      <div className="space-x-4">
         <Button asChild>
           <Link href="/patient/dashboard">Accéder au Tableau de Bord Patient</Link>
         </Button>
         {/* Add Kine dashboard link later */}
         {/* <Button variant="outline" asChild>
           <Link href="/kine/dashboard">Accéder au Tableau de Bord Kiné</Link>
         </Button> */}
      </div>
      <p className="mt-10 text-sm text-muted-foreground">
        (Ceci est une page d'accueil temporaire. L'authentification sera ajoutée ultérieurement.)
      </p>
    </div>
  );
}
