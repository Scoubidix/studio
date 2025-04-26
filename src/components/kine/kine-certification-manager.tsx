'use client';

import type { CertificationBadge } from '@/interfaces';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface KineCertificationManagerProps {
  certifications: CertificationBadge[];
}

// TODO: Implement logic to award badges based on Kine's activity within the app
// (e.g., number of patients managed, programs created, blog posts written, etc.)

export default function KineCertificationManager({ certifications }: KineCertificationManagerProps) {

  // Function to simulate checking and awarding new badges (replace with actual logic)
  const checkAndAwardBadges = () => {
      console.log("Checking for new badges to award (simulated)...");
      // Example: Award a badge if not already present
      // if (!certifications.some(c => c.id === 'cert_active_user')) {
      //     const newBadge: CertificationBadge = { ... };
      //     // Save new badge to DB and update state
      // }
  };

  // useEffect(() => {
  //     checkAndAwardBadges(); // Check on component mount (or based on specific triggers)
  // }, []); // Add dependencies if needed


  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" /> Mes Certifications & Badges
        </CardTitle>
        <CardDescription>
          Vos badges de compétence et certifications obtenus grâce à votre activité et vos formations. Ils sont visibles par vos patients.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {certifications.length > 0 ? (
           <TooltipProvider delayDuration={100}>
              <div className="flex flex-wrap gap-4">
                {certifications.map((cert) => (
                  <Tooltip key={cert.id}>
                      <TooltipTrigger asChild>
                         <Card className="p-4 border border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/30 w-fit cursor-default">
                            <div className="flex items-center gap-2">
                                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                                <div>
                                    <h4 className="font-semibold text-sm text-green-800 dark:text-green-200">{cert.name}</h4>
                                    <p className="text-xs text-green-700 dark:text-green-300">Obtenu le {format(new Date(cert.dateAwarded), "d MMM yyyy", { locale: fr })}</p>
                                </div>
                            </div>
                         </Card>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs text-center">
                         <p className="text-xs">{cert.description}</p>
                      </TooltipContent>
                  </Tooltip>
                ))}
              </div>
           </TooltipProvider>
        ) : (
          <p className="text-center text-muted-foreground">Aucune certification ou badge obtenu pour le moment. Continuez à utiliser l'application !</p>
        )}

         {/* Placeholder for future badge awarding logic display */}
         {/* <div className="mt-6 pt-4 border-t">
             <p className="text-sm text-muted-foreground">De nouveaux badges seront débloqués en fonction de votre activité...</p>
         </div> */}
      </CardContent>
    </Card>
  );
}
