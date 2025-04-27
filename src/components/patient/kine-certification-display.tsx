
'use client';

import type { CertificationBadge } from '@/interfaces';
import { Award, Crown } from 'lucide-react'; // Added Crown icon
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns'; // Keep date formatting
import { fr } from 'date-fns/locale'; // Keep locale

interface KineCertificationDisplayProps {
  certifications: CertificationBadge[];
  kineName: string;
  showSuperKine?: boolean; // Option to show SuperKiné status distinctly
}

export default function KineCertificationDisplay({
    certifications,
    kineName,
    showSuperKine = true // Default to showing SuperKiné badge if present
}: KineCertificationDisplayProps) {

  const normalCertifications = certifications.filter(c => !c.isSuperKineBadge);
  const superKineBadge = showSuperKine ? certifications.find(c => c.isSuperKineBadge) : null;

  if ((!normalCertifications || normalCertifications.length === 0) && !superKineBadge) {
    return null; // Don't display anything if no certifications
  }

  return (
    <TooltipProvider delayDuration={100}>
        <div className="mt-2 text-right space-y-1.5">
             {superKineBadge && (
                 <div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                           <Badge variant="outline" className="border-yellow-400 text-yellow-700 bg-yellow-100 dark:border-yellow-700 dark:text-yellow-300 dark:bg-yellow-900/30 cursor-default px-1.5 py-0.5">
                                <Crown className="w-3 h-3 mr-1" />
                                <span className="text-xs font-semibold">{superKineBadge.name}</span>
                           </Badge>
                        </TooltipTrigger>
                         <TooltipContent side="bottom" className="max-w-xs text-center">
                           <p className="text-xs">{superKineBadge.description}</p>
                           <p className="text-[10px] text-muted-foreground mt-1">Obtenu le {format(new Date(superKineBadge.dateAwarded), "d MMM yyyy", { locale: fr })}</p>
                         </TooltipContent>
                    </Tooltip>
                 </div>
             )}

             {normalCertifications.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                        {superKineBadge ? 'Autres certifications:' : `Certifications de ${kineName} :`}
                    </p>
                    <div className="flex gap-1.5 justify-end flex-wrap">
                        {normalCertifications.map((cert) => (
                        <Tooltip key={cert.id}>
                            <TooltipTrigger asChild>
                            <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-900/30 cursor-default px-1.5 py-0.5">
                                <Award className="w-3 h-3 mr-1" />
                                <span className="text-xs">{cert.name}</span>
                            </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs text-center">
                            <p className="text-xs">{cert.description}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Obtenu le {format(new Date(cert.dateAwarded), "d MMM yyyy", { locale: fr })}</p>
                            </TooltipContent>
                        </Tooltip>
                        ))}
                    </div>
                </div>
             )}
        </div>
    </TooltipProvider>
  );
}
