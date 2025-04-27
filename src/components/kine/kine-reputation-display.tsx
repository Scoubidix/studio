
'use client';

import type { Kine, CertificationBadge } from '@/interfaces';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Medal, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import KineCertificationDisplay from '@/components/patient/kine-certification-display'; // Re-use for badge display logic
import KineCertificationManager from '@/components/kine/kine-certification-manager'; // Import the missing component

interface KineReputationDisplayProps {
  kine: Kine;
  rankings: { kineId: string; rank: number; area: string }[]; // Mock or real ranking data
}

export default function KineReputationDisplay({ kine, rankings }: KineReputationDisplayProps) {

  const kineRankings = rankings.filter(r => r.kineId === kine.id);
  const superKineBadge = kine.certifications?.find(c => c.isSuperKineBadge);

  return (
    <div className="space-y-6">
        {/* SuperKiné Status */}
        {superKineBadge && (
            <Card className="bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700 shadow-lg">
                 <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                     <Crown className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                     <CardTitle className="text-lg text-yellow-700 dark:text-yellow-300">{superKineBadge.name}</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <p className="text-sm text-yellow-700 dark:text-yellow-300">{superKineBadge.description}</p>
                 </CardContent>
            </Card>
        )}

        {/* Rankings Card */}
        <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Classements Publics (Exemple)
            </CardTitle>
            <CardDescription>
            Votre visibilité sur la plateforme basée sur votre activité et la satisfaction patient.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {kineRankings.length > 0 ? (
            <div className="space-y-3">
                {kineRankings.map((ranking) => (
                <div key={ranking.area} className="flex justify-between items-center p-3 border rounded-md bg-muted/30">
                    <span className="text-sm font-medium">{ranking.area}</span>
                    <Badge variant="secondary" className="text-base">
                    <Medal className="w-4 h-4 mr-1.5 text-amber-600" /> #{ranking.rank}
                    </Badge>
                </div>
                ))}
            </div>
            ) : (
            <p className="text-center text-muted-foreground">Vous n'apparaissez pas encore dans les classements publics. Continuez à utiliser l'application !</p>
            )}
             <p className="text-xs text-muted-foreground mt-4 italic">
                Note: Les classements sont basés sur des métriques combinant l'activité, l'adhérence moyenne des patients et les retours sur les programmes (ne notant pas directement le kiné).
            </p>
        </CardContent>
        </Card>

        {/* Display All Badges */}
        <KineCertificationManager
            certifications={kine.certifications || []}
            title="Vos Badges et Certifications Actuels"
            description="Tous les badges que vous avez obtenus."
            showPoints={true}
        />

    </div>
  );
}
