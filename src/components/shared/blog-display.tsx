
'use client';

import { useState } from 'react'; // Import useState
import type { BlogPost } from '@/interfaces';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Calendar, Tags, BookOpen, Search, Star } from 'lucide-react'; // Added Star
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input'; // Import Input

interface BlogDisplayProps {
  posts: BlogPost[];
  title?: string; // Optional title for the section
  description?: string; // Optional description
  showAuthor?: boolean; // Option to show author (for Kine blog)
  showSearch?: boolean; // Option to show search bar (for Kine blog)
  allowRating?: boolean; // Allow rating posts (for Kine blog)
  onRatePost?: (postId: string, rating: number) => void; // Callback for rating
}

// Helper function to render stars for display
const StarRatingDisplay = ({ rating, count }: { rating?: number, count?: number }) => {
  if (rating === undefined || rating === null || count === undefined || count === null || count === 0) {
    return <span className="text-xs text-muted-foreground italic">Pas encore noté</span>;
  }
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      ))}
      {halfStar && <Star key="half" className="w-3 h-3 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-3 h-3 text-muted-foreground" />
      ))}
       <span className="ml-1 text-xs text-muted-foreground">({rating.toFixed(1)} / {count} votes)</span>
    </div>
  );
};

// Component for rating stars (interactive)
const RatingInput = ({ onRate }: { onRate: (rating: number) => void }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(0); // Track clicked rating

  const handleClick = (rate: number) => {
    setCurrentRating(rate);
    onRate(rate);
     // Reset hover after click? Optional.
    // setHoverRating(0);
  };

  return (
    <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((rate) => (
        <button
          key={rate}
          type="button"
          onClick={() => handleClick(rate)}
          onMouseEnter={() => setHoverRating(rate)}
          className="p-0 bg-transparent border-none"
          aria-label={`Noter ${rate} étoile${rate > 1 ? 's' : ''}`}
        >
          <Star
            className={`w-4 h-4 cursor-pointer transition-colors ${
              (hoverRating >= rate || currentRating >= rate)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
};


export default function BlogDisplay({
    posts,
    title = "Infos & Conseils",
    description = "Découvrez des articles pour mieux comprendre votre corps et votre rééducation.",
    showAuthor = false,
    showSearch = false, // Default to false
    allowRating = false, // Default to false
    onRatePost,
}: BlogDisplayProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = posts.filter(post => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      post.title.toLowerCase().includes(lowerSearchTerm) ||
      post.summary.toLowerCase().includes(lowerSearchTerm) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))) ||
      (showAuthor && post.author && post.author.toLowerCase().includes(lowerSearchTerm))
    );
  }).sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()); // Sort by newest first


  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
         <div className="flex-grow">
            <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
         </div>
         {showSearch && (
             <div className="relative mt-4 md:mt-0 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Rechercher par mot-clé, titre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9"
                />
            </div>
         )}
      </CardHeader>
      <CardContent>
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="flex flex-col overflow-hidden h-full">
                {post.imageUrl && (
                   <div className="relative w-full h-40">
                     <Image src={post.imageUrl} alt={post.title} fill style={{ objectFit: 'cover' }} unoptimized/>
                   </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                   <div className="text-xs text-muted-foreground flex items-center gap-2 pt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(post.publishDate), "d MMM yyyy", { locale: fr })}</span>
                        {showAuthor && post.author && <span>| Par {post.author}</span>}
                   </div>
                   {/* Display Rating for Kine view */}
                    {showAuthor && (
                        <div className="pt-1">
                             <StarRatingDisplay rating={post.rating} count={post.ratingCount} />
                        </div>
                    )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-3">{post.summary}</p>
                  {post.tags && post.tags.length > 0 && (
                     <div className="flex items-center flex-wrap gap-1 text-xs text-muted-foreground">
                          <Tags className="w-3 h-3 mr-1"/>
                          {post.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs font-normal">{tag}</Badge>
                          ))}
                     </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between items-center">
                   {/* Allow Rating Input */}
                   {allowRating && onRatePost ? (
                       <div className="flex flex-col items-start gap-1">
                           <span className="text-xs font-medium text-muted-foreground">Noter cet article :</span>
                           <RatingInput onRate={(rating) => onRatePost(post.id, rating)} />
                       </div>
                   ) : (
                        // Placeholder or Read More button for patient view
                        <Button size="sm" variant="outline" disabled={!post.contentUrl} className="text-xs">
                            Lire la suite (Bientôt)
                        </Button>
                   )}
                   {/* Keep Read More button if not rating */}
                    {!allowRating && (
                         <Button size="sm" variant="outline" disabled={!post.contentUrl} className="text-xs">
                           Lire la suite (Bientôt)
                         </Button>
                    )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground pt-6">
            {searchTerm ? `Aucun article trouvé pour "${searchTerm}".` : "Aucun article disponible pour le moment."}
            </p>
        )}
      </CardContent>
    </Card>
  );
}
