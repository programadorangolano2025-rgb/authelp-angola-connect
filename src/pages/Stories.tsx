import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Heart, Download, ArrowLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StoryResource {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail_url: string;
  category: string;
  likes_count: number;
  downloads_count: number;
  created_at: string;
}

const Stories = () => {
  const [stories, setStories] = useState<StoryResource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = ['Emoções', 'Rotinas', 'Habilidades Sociais', 'Família', 'Escola', 'Sensorial'];

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('content_type', 'story')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || story.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStoryClick = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      // Handle local files or other URLs
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando histórias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Histórias Sociais</h1>
            <p className="text-muted-foreground">Histórias para desenvolvimento social e emocional</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar histórias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStories.map((story) => (
            <Card key={story.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={story.thumbnail_url || '/placeholder.svg'}
                  alt={story.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <Button
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={() => handleStoryClick(story.url)}
                  >
                    <Eye className="h-6 w-6" />
                  </Button>
                </div>
                <Badge className="absolute top-2 left-2 bg-primary/90">
                  {story.category}
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm line-clamp-2">{story.title}</CardTitle>
                {story.description && (
                  <CardDescription className="text-xs line-clamp-2">
                    {story.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{story.likes_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>{story.downloads_count}</span>
                    </div>
                  </div>
                  <span>{new Date(story.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhuma história encontrada</p>
              <p className="text-sm">Tente ajustar sua busca ou filtros</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;