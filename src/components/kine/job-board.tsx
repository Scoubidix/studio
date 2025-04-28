
'use client';

import type { JobPosting } from '@/interfaces';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, CalendarDays, MapPin, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface JobBoardProps {
  jobPostings: JobPosting[];
  currentKineId: string; // To potentially highlight own posts or allow editing/deleting
  // Add filtering/sorting state and handlers if needed
}

export default function JobBoard({ jobPostings, currentKineId }: JobBoardProps) {

  const getBadgeVariant = (type: JobPosting['type']): "default" | "secondary" | "outline" => {
    switch (type) {
      case 'remplacement': return 'secondary';
      case 'assistanat': return 'default';
      case 'collaboration': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {jobPostings.length > 0 ? (
        jobPostings.map((job) => (
          <Card key={job.id} className={`shadow-md ${job.kineId === currentKineId ? 'border-primary' : ''}`}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                 <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary flex-shrink-0"/> {job.title}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs">
                         Par <span className="font-medium">{job.kineName}</span> | Publié le {format(new Date(job.publishDate), "d MMM yyyy", { locale: fr })}
                    </CardDescription>
                 </div>
                  <Badge variant={getBadgeVariant(job.type)} className="capitalize w-fit text-xs mt-1 sm:mt-0">
                      {job.type}
                  </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{job.description}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground items-center">
                 <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3"/> {job.location}</span>
                 {job.startDate && (
                     <span className="flex items-center gap-1.5">
                         <CalendarDays className="w-3 h-3"/>
                         Du {format(new Date(job.startDate), "d MMM yyyy", { locale: fr })}
                         {job.endDate ? ` au ${format(new Date(job.endDate), "d MMM yyyy", { locale: fr })}` : ''}
                     </span>
                 )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Statut: <Badge variant={job.status === 'active' ? 'default' : 'outline'} className={`text-xs ${job.status !== 'active' ? 'opacity-70' : ''}`}>{job.status}</Badge></span>
                <Button asChild variant="outline" size="sm">
                    <a href={`mailto:${job.contactEmail}?subject=Réponse annonce MonAssistantKiné: ${job.title}`}>
                        <Mail className="w-4 h-4 mr-2"/> Contacter
                    </a>
                </Button>
                {/* TODO: Add Edit/Delete buttons if job.kineId === currentKineId */}
            </CardFooter>
          </Card>
        ))
      ) : (
        <p className="text-center text-muted-foreground py-6">Aucune annonce disponible pour le moment.</p>
      )}
    </div>
  );
}
