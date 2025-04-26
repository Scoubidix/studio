import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoadingPatientDashboard() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-9 w-1/3" /> {/* Title skeleton */}

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
                       <Skeleton className="h-4 w-1/2" /> {/* Details */}
                       <Skeleton className="h-4 w-2/3" /> {/* Details */}
                    </div>
                 </div>
               </Card>
              {i < 3 && <Skeleton className="h-px w-full my-6" />} {/* Separator */}
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
            <Skeleton className="h-5 w-1/4" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Slider/Input */}
            <Skeleton className="h-5 w-1/4" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Slider/Input */}
             <Skeleton className="h-5 w-1/4" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Slider/Input */}
            <Skeleton className="h-5 w-1/4" /> {/* Label */}
            <Skeleton className="h-20 w-full" /> {/* Textarea */}
            <Skeleton className="h-10 w-32" /> {/* Button */}
         </CardContent>
       </Card>

      {/* Chatbot Skeleton */}
       <Card className="shadow-md">
         <CardHeader>
           <Skeleton className="h-6 w-1/3 mb-2" /> {/* Card title */}
           <Skeleton className="h-4 w-1/2" /> {/* Card description */}
         </CardHeader>
         <CardContent className="flex flex-col h-[500px]">
           <Skeleton className="flex-grow border rounded-md p-4 mb-4" /> {/* Chat area */}
           <div className="flex gap-2">
             <Skeleton className="h-10 flex-grow" /> {/* Input */}
             <Skeleton className="h-10 w-24" /> {/* Button */}
           </div>
         </CardContent>
       </Card>

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
