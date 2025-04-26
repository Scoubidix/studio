'use client';

import type { CertificationBadge } from '@/interfaces';
import { Award } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';

interface KineCertificationDisplayProps {
  certifications: CertificationBadge[];
  kineName: string;
}

export default function KineCertificationDisplay({ certifications, kineName }: KineCertificationDisplayProps) {
  if (!certifications || certifications.length === 0) {
    return null; // Don't display anything if no certifications
  }

  return (
    <TooltipProvider delayDuration={100}>
        <div className="mt-2 text-right">
            <p className="text-xs font-medium text-muted-foreground mb-1">Certifications de {kineName} :</p>
            <div className="flex gap-1.5 justify-end flex-wrap">
                {certifications.map((cert) => (
                <Tooltip key={cert.id}>
                    <TooltipTrigger asChild>
                    <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-900/30 cursor-default px-1.5 py-0.5">
                        <Award className="w-3 h-3 mr-1" />
                        <span className="text-xs">{cert.name}</span>
                    </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs text-center">
                       <p className="text-xs">{cert.description}</p>
                       <p className="text-[10px] text-muted-foreground mt-1">Obtenu le {new Date(cert.dateAwarded).toLocaleDateString('fr-FR')}</p>
                    </TooltipContent>
                </Tooltip>
                ))}
            </div>
        </div>
    </TooltipProvider>
  );
}
