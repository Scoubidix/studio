import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoadingPatientDashboard() {
  return (
    <div className="space-y-8">
       {/* Header Skeleton */}
       <div className="flex justify-between items-center mb-6 p-4 bg-card rounded-lg shadow-sm border">
           <div>
               <Skeleton className="h-6 w-48 mb-2" /> {/* Date skeleton */}
               <Skeleton className="h-4 w-64" /> {/* Quote skeleton */}
           </div>
            <div className="text-right">
                 <Skeleton className="h-5 w-24 mb-1" /> {/* Gamification line 1 */}
                 <Skeleton className="h-3 w-32" /> {/* Gamification line 2 */}
            </div>
       </div>

      {/* Exercise Program Skeleton */}
      <Card className="shadow-md">
        <CardHeader>
          <Skeleton className="h-6 w-1/2 mb-2" /> {/* Card title */}
          <Skeleton className="h-4 w-3/4" /> {/* Card description */}
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((i) => ( // Skeleton for 3 exercises
            <div key={i}>
               <Card className="overflow-hidden border border-border/60 bg-card/80">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="md:col-span-1 h-40 md:h-full rounded-l-lg" /> {/* Image Placeholder */}
                    <div className="p-4 md:col-span-2 space-y-3">
                       <Skeleton className="h-5 w-3/4" /> {/* Exercise name */}
                       <Skeleton className="h-4 w-full" /> {/* Description */}
                       <Skeleton className="h-4 w-1/2" /> {/* Details (Series/Reps) */}
                       <Skeleton className="h-4 w-1/3" /> {/* Details (Level) */}
                    </div>
                 </div>
               </Card>
              {i < 3 && <Skeleton className="h-px w-full my-6 bg-border/50" />} {/* Separator */}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Feedback Form Skeleton */}
       <Card className="shadow-md">
         <CardHeader>
           <Skeleton className="h-6 w-1/3 mb-2" /> {/* Card title */}
           <Skeleton className="h-4 w-1/2" /> {/* Card description */}
         </CardHeader>
         <CardContent className="space-y-8">
            <Skeleton className="h-5 w-1/4 mb-1" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Slider/Input (Pain) */}

            <Skeleton className="h-5 w-1/4 mb-1" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Slider/Input (Difficulty) */}

            {/* Fatigue Skeleton - REMOVED */}
            {/* Adherence Skeleton - REMOVED */}

            <Skeleton className="h-5 w-1/4 mb-1" /> {/* Label */}
            <Skeleton className="h-20 w-full" /> {/* Textarea */}
            <Skeleton className="h-10 w-32" /> {/* Button */}
         </CardContent>
       </Card>

      {/* Chatbot Skeleton - REMOVED (Now a popup) */}

      {/* History Skeleton */}
      <Card className="shadow-md">
        <CardHeader>
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  );
}
