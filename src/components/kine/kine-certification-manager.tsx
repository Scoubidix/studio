
'use client';

import type { CertificationBadge } from '@/interfaces';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Star } from 'lucide-react'; // Added Star for points
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
  title?: string;
  description?: string;
  showPoints?: boolean; // Option to show points required
}

// TODO: Implement logic to award badges based on Kine's activity within the app
// (e.g., number of patients managed, programs created, blog posts written, etc.)

export default function KineCertificationManager({
    certifications,
    title = "Mes Certifications & Badges",
    description = "Vos badges de compétence et certifications obtenus grâce à votre activité et vos formations. Ils sont visibles par vos patients.",
    showPoints = false // Default to not showing points in this standalone component
}: KineCertificationManagerProps) {

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
          <Award className="w-5 h-5 text-primary" /> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {certifications.length > 0 ? (
           <TooltipProvider delayDuration={100}>
              <div className="flex flex-wrap gap-4">
                {certifications.map((cert) => (
                  <Tooltip key={cert.id}>
                      <TooltipTrigger asChild>
                         {/* Updated Card styling for badges */}
                         <Badge
                           variant="outline"
                           className="border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-900/30 h-auto py-1.5 px-3 cursor-default"
                         >
                           <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <div>
                                    <h4 className="font-semibold text-sm text-green-800 dark:text-green-200">{cert.name}</h4>
                                    <p className="text-xs text-green-700 dark:text-green-300">Obtenu le {format(new Date(cert.dateAwarded), "d MMM yyyy", { locale: fr })}</p>
                                     {showPoints && cert.pointsRequired && (
                                         <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-0.5">
                                             <Star className="w-3 h-3"/> {cert.pointsRequired} pts requis
                                         </p>
                                     )}
                                </div>
                            </div>
                         </Badge>
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
