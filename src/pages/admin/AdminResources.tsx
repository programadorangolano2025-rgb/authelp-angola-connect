import React, { useState, useEffect } from 'react';
import { Plus, Search, Video, FileText, Headphones, Youtube, Heart, Trash2, Edit3, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  category: string;
  url: string | null;
  file_path: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  is_premium: boolean;
  downloads_count: number;
  likes_count: number;
  created_at: string;
  created_by: string | null;
}

const AdminResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { logAction } = useAdmin();

  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    content_type: 'video',
    category: 'historias',
    url: '',
    is_premium: false
  });

  const categories = [
    { value: 'all', label: 'Todas Categorias' },
    { value: 'historias', label: 'Histórias' },
    { value: 'videos-educativos', label: 'Vídeos Educativos' },
    { value: 'therapy', label: 'Terapias' },
    { value: 'communication', label: 'Comunicação' },
    { value: 'education', label: 'Educação' }
  ];

  const contentTypes = [
    { value: 'all', label: 'Todos os Tipos' },
    { value: 'video', label: 'Vídeo', icon: Video },
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'audio', label: 'Áudio', icon: Headphones },
    { value: 'story', label: 'História', icon: Heart }
  ];

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedCategory, selectedContentType]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Erro ao buscar recursos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os recursos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resource.description?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    if (selectedContentType !== 'all') {
      filtered = filtered.filter(resource => resource.content_type === selectedContentType);
    }

    setFilteredResources(filtered);
  };

  const extractYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const generateYouTubeThumbnail = (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const handleAddResource = async () => {
    if (!newResource.title || !newResource.description) {
      toast({
        title: "Erro",
        description: "Título e descrição são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const thumbnailUrl = newResource.content_type === 'video' && newResource.url 
        ? generateYouTubeThumbnail(newResource.url)
        : null;

      const { data, error } = await supabase
        .from('resources')
        .insert({
          title: newResource.title,
          description: newResource.description,
          content_type: newResource.content_type,
          category: newResource.category,
          url: newResource.url || null,
          thumbnail_url: thumbnailUrl,
          is_published: true,
          is_premium: newResource.is_premium,
          created_by: null // Admin created
        })
        .select()
        .single();

      if (error) throw error;

      await logAction('resource_created', {
        resource_id: data.id,
        title: newResource.title,
        category: newResource.category,
        content_type: newResource.content_type
      }, 'resources', data.id);

      setResources([data, ...resources]);
      setIsAddDialogOpen(false);
      setNewResource({
        title: '',
        description: '',
        content_type: 'video',
        category: 'historias',
        url: '',
        is_premium: false
      });

      toast({
        title: "Sucesso",
        description: "Recurso adicionado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao adicionar recurso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o recurso",
        variant: "destructive"
      });
    }
  };

  const togglePublishStatus = async (resourceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ is_published: !currentStatus })
        .eq('id', resourceId);

      if (error) throw error;

      await logAction('resource_publication_changed', {
        resource_id: resourceId,
        new_status: !currentStatus
      }, 'resources', resourceId);

      setResources(resources.map(resource =>
        resource.id === resourceId
          ? { ...resource, is_published: !currentStatus }
          : resource
      ));

      toast({
        title: "Sucesso",
        description: `Recurso ${!currentStatus ? 'publicado' : 'despublicado'} com sucesso`
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status",
        variant: "destructive"
      });
    }
  };

  const deleteResource = async (resourceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este recurso?')) return;

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;

      await logAction('resource_deleted', {
        resource_id: resourceId
      }, 'resources', resourceId);

      setResources(resources.filter(resource => resource.id !== resourceId));

      toast({
        title: "Sucesso",
        description: "Recurso excluído com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir recurso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o recurso",
        variant: "destructive"
      });
    }
  };

  const getContentTypeIcon = (type: string) => {
    const typeObj = contentTypes.find(ct => ct.value === type);
    return typeObj?.icon || FileText;
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-blue-500';
      case 'pdf': return 'text-red-500';
      case 'audio': return 'text-green-500';
      case 'story': return 'text-pink-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando recursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Recursos</h1>
          <p className="text-muted-foreground">
            Gerencie histórias, vídeos educativos e outros recursos da plataforma
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Recurso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Recurso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newResource.title}
                  onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                  placeholder="Digite o título do recurso"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newResource.description}
                  onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                  placeholder="Descreva o conteúdo do recurso"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="content_type">Tipo</Label>
                  <Select
                    value={newResource.content_type}
                    onValueChange={(value) => setNewResource({...newResource, content_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.slice(1).map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={newResource.category}
                    onValueChange={(value) => setNewResource({...newResource, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newResource.content_type === 'video' && (
                <div>
                  <Label htmlFor="url">URL do YouTube</Label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                    <Input
                      id="url"
                      value={newResource.url}
                      onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_premium"
                  checked={newResource.is_premium}
                  onChange={(e) => setNewResource({...newResource, is_premium: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="is_premium">Conteúdo Premium</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleAddResource} className="flex-1">
                  Adicionar Recurso
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium leading-none">Total de Recursos</p>
                <p className="text-2xl font-bold">{resources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium leading-none">Publicados</p>
                <p className="text-2xl font-bold">{resources.filter(r => r.is_published).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Video className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium leading-none">Vídeos</p>
                <p className="text-2xl font-bold">{resources.filter(r => r.content_type === 'video').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <div>
                <p className="text-sm font-medium leading-none">Histórias</p>
                <p className="text-2xl font-bold">{resources.filter(r => r.category === 'historias').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar recursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources List */}
      <div className="grid gap-4">
        {filteredResources.map((resource) => {
          const IconComponent = getContentTypeIcon(resource.content_type);
          return (
            <Card key={resource.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4 flex-1">
                    {/* Thumbnail/Icon */}
                    <div className="flex-shrink-0">
                      {resource.thumbnail_url ? (
                        <img
                          src={resource.thumbnail_url}
                          alt={resource.title}
                          className="w-20 h-14 object-cover rounded-lg"
                        />
                      ) : (
                        <div className={`w-20 h-14 flex items-center justify-center rounded-lg bg-muted ${getContentTypeColor(resource.content_type)}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {resource.description}
                          </p>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={resource.is_published ? "default" : "secondary"}>
                              {resource.is_published ? "Publicado" : "Rascunho"}
                            </Badge>
                            <Badge variant="outline">
                              {categories.find(c => c.value === resource.category)?.label}
                            </Badge>
                            <Badge variant="outline">
                              {contentTypes.find(ct => ct.value === resource.content_type)?.label}
                            </Badge>
                            {resource.is_premium && (
                              <Badge className="bg-yellow-500">Premium</Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {resource.likes_count}
                            </span>
                            <span>{resource.downloads_count} downloads</span>
                            <span>
                              {new Date(resource.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublishStatus(resource.id, resource.is_published)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteResource(resource.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum recurso encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou adicione novos recursos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminResources;