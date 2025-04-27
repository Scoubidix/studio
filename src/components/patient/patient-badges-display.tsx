
'use client';

import type { PatientBadge } from '@/interfaces';
import { Medal } from 'lucide-react'; // Using Medal icon for patient badges
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PatientBadgesDisplayProps {
  badges: PatientBadge[];
}

export default function PatientBadgesDisplay({ badges }: PatientBadgesDisplayProps) {
  if (!badges || badges.length === 0) {
    return null; // Don't display anything if no badges
  }

  return (
    <TooltipProvider delayDuration={100}>
        <div className="mt-1 text-right"> {/* Reduced top margin */}
            <p className="text-xs font-medium text-muted-foreground mb-1">Vos Badges :</p>
            <div className="flex gap-1.5 justify-end flex-wrap">
                {badges.map((badge) => (
                <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                    {/* Using primary color theme for patient badges */}
                    <Badge variant="outline" className="border-primary text-primary bg-primary/10 dark:bg-primary/20 cursor-default px-1.5 py-0.5">
                        <Medal className="w-3 h-3 mr-1" />
                        <span className="text-xs">{badge.name}</span>
                    </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs text-center">
                       <p className="text-xs">{badge.description}</p>
                       <p className="text-[10px] text-muted-foreground mt-1">Obtenu le {format(new Date(badge.dateAwarded), "d MMM yyyy", { locale: fr })}</p>
                    </TooltipContent>
                </Tooltip>
                ))}
            </div>
        </div>
    </TooltipProvider>
  );
}
