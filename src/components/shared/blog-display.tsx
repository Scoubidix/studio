'use client';

import type { BlogPost } from '@/interfaces';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Calendar, Tags, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface BlogDisplayProps {
  posts: BlogPost[];
  title?: string; // Optional title for the section
  description?: string; // Optional description
  showAuthor?: boolean; // Option to show author (for Kine blog)
}

export default function BlogDisplay({
    posts,
    title = "Infos & Conseils",
    description = "Découvrez des articles pour mieux comprendre votre corps et votre rééducation.",
    showAuthor = false
}: BlogDisplayProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
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
                <CardFooter className="border-t pt-4">
                  {/* In a real app, this button would link to the full article */}
                  <Button size="sm" variant="outline" disabled={!post.contentUrl} className="text-xs">
                    Lire la suite (Bientôt)
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Aucun article disponible pour le moment.</p>
        )}
      </CardContent>
    </Card>
  );
}
