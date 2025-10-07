import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { FileUploader } from '@/components/FileUploader';
import { Plus, Search, Filter, Video, FileText, BookOpen, Upload, Eye, Edit, Trash2, Globe, Clock, BarChart3, Users, X, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  category: string;
  url: string | null;
  file_path: string | null;
  thumbnail_url: string | null;
  audio_url: string | null;
  audio_file_path: string | null;
  pdf_file_path: string | null;
  is_published: boolean;
  is_premium: boolean;
  downloads_count: number;
  likes_count: number;
  created_at: string;
  created_by: string | null;
}

const AdminResourcesEnhanced = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    content_type: 'video',
    category: 'Sensorial',
    url: '',
    file_path: '',
    thumbnail_url: '',
    audio_url: '',
    audio_file_path: '',
    pdf_file_path: '',
    is_premium: false,
    tags: [] as string[],
    duration: '',
    age_range: '4-6',
    difficulty_level: 'beginner'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCover, setSelectedCover] = useState<File | null>(null);
  const [selectedPDF, setSelectedPDF] = useState<File | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [previewMode, setPreviewMode] = useState<'grid' | 'list'>('grid');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const categories = ['Sensorial', 'Comunicação', 'Habilidades Sociais', 'Rotinas', 'Educacional', 'Terapias', 'Família', 'Escola'];
  const contentTypes = ['video', 'pdf', 'story', 'audio', 'image'];
  const difficultyLevels = ['beginner', 'intermediate', 'advanced'];
  const ageRanges = ['0-3', '4-6', '7-12', '13-18', 'adulto'];

  useEffect(() => {
    fetchResources();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

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

  const handleAddTag = () => {
    if (tagInput.trim() && !newResource.tags.includes(tagInput.trim())) {
      setNewResource(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewResource(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      // Gerar thumbnail automaticamente para vídeos do YouTube se não houver uma personalizada
      let finalThumbnailUrl = newResource.thumbnail_url;
      if (!finalThumbnailUrl && newResource.url && newResource.content_type === 'video') {
        const youtubeVideoId = getYouTubeVideoId(newResource.url);
        if (youtubeVideoId) {
          finalThumbnailUrl = `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`;
        }
      }

      const { data, error } = await supabase
        .from('resources')
        .insert({
          title: newResource.title,
          description: newResource.description,
          content_type: newResource.content_type,
          category: newResource.category,
          url: newResource.url || null,
          file_path: newResource.file_path || null,
          thumbnail_url: finalThumbnailUrl || null,
          audio_url: newResource.audio_url || null,
          audio_file_path: newResource.audio_file_path || null,
          pdf_file_path: newResource.pdf_file_path || null,
          is_published: true, // Publish immediately for admins
          is_premium: newResource.is_premium,
          created_by: user.id // Set to current authenticated user
        })
        .select()
        .single();

      if (error) throw error;

      setResources([data, ...resources]);
      setIsAddDialogOpen(false);
      resetForm();

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

  const resetForm = () => {
    setNewResource({
      title: '',
      description: '',
      content_type: 'video',
      category: 'Sensorial',
      url: '',
      file_path: '',
      thumbnail_url: '',
      audio_url: '',
      audio_file_path: '',
      pdf_file_path: '',
      is_premium: false,
      tags: [],
      duration: '',
      age_range: '4-6',
      difficulty_level: 'beginner'
    });
    setSelectedFile(null);
    setSelectedCover(null);
    setSelectedPDF(null);
    setSelectedAudio(null);
    setTagInput('');
    setUploadProgress(0);
    setCoverUploadProgress(0);
    setPdfUploadProgress(0);
    setAudioUploadProgress(0);
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setNewResource({
      title: resource.title,
      description: resource.description || '',
      content_type: resource.content_type,
      category: resource.category,
      url: resource.url || '',
      file_path: resource.file_path || '',
      thumbnail_url: resource.thumbnail_url || '',
      audio_url: resource.audio_url || '',
      audio_file_path: resource.audio_file_path || '',
      pdf_file_path: resource.pdf_file_path || '',
      is_premium: resource.is_premium,
      tags: [],
      duration: '',
      age_range: '4-6',
      difficulty_level: 'beginner'
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateResource = async () => {
    if (!editingResource || !newResource.title || !newResource.description) {
      toast({
        title: "Erro",
        description: "Título e descrição são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('resources')
        .update({
          title: newResource.title,
          description: newResource.description,
          content_type: newResource.content_type,
          category: newResource.category,
          url: newResource.url || null,
          file_path: newResource.file_path || null,
          thumbnail_url: newResource.thumbnail_url || null,
          audio_url: newResource.audio_url || null,
          audio_file_path: newResource.audio_file_path || null,
          pdf_file_path: newResource.pdf_file_path || null,
          is_premium: newResource.is_premium,
        })
        .eq('id', editingResource.id);

      if (error) throw error;

      setResources(resources.map(r => 
        r.id === editingResource.id 
          ? { ...r, ...newResource, description: newResource.description }
          : r
      ));
      
      setIsEditDialogOpen(false);
      setEditingResource(null);
      resetForm();

      toast({
        title: "Sucesso",
        description: "Recurso atualizado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao atualizar recurso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o recurso",
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
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
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
    switch (type) {
      case 'video': return Video;
      case 'pdf': return FileText;
      case 'story': return BookOpen;
      default: return FileText;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-blue-100 text-blue-800';
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'story': return 'bg-green-100 text-green-800';
      case 'audio': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Recursos</h1>
          <p className="text-muted-foreground">
            Gerencie vídeos, PDFs, histórias e outros conteúdos educativos
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Adicionar Recurso</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Recurso</DialogTitle>
              <DialogDescription>
                Crie um novo recurso educativo para a plataforma
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="content">Conteúdo</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={newResource.title}
                      onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                      placeholder="Digite o título do recurso"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={newResource.category} onValueChange={(value) => setNewResource({...newResource, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={newResource.description}
                    onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                    placeholder="Descreva o recurso..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="content_type">Tipo de Conteúdo</Label>
                    <Select value={newResource.content_type} onValueChange={(value) => setNewResource({...newResource, content_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="age_range">Faixa Etária</Label>
                    <Select value={newResource.age_range} onValueChange={(value) => setNewResource({...newResource, age_range: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ageRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Dificuldade</Label>
                    <Select value={newResource.difficulty_level} onValueChange={(value) => setNewResource({...newResource, difficulty_level: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level === 'beginner' ? 'Iniciante' : level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newResource.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Adicionar tag..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="content" className="space-y-6">
                {/* Story-specific uploads */}
                {newResource.content_type === 'story' && (
                  <>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                      <h3 className="font-semibold text-sm">Uploads para Histórias</h3>
                      
                      {/* Cover Image Upload */}
                      <div>
                        <Label>Capa da História (Thumbnail)</Label>
                        <FileUploader
                          accept=".jpg,.jpeg,.png,.webp"
                          maxSize={5}
                          onFileSelect={(file) => setSelectedCover(file)}
                          onFileRemove={() => setSelectedCover(null)}
                          onUploadComplete={(filePath) => {
                            const { data } = supabase.storage.from('resources').getPublicUrl(filePath);
                            setNewResource(prev => ({ ...prev, thumbnail_url: data.publicUrl }));
                            setCoverUploadProgress(100);
                          }}
                          selectedFile={selectedCover}
                          uploadProgress={coverUploadProgress}
                          isUploading={false}
                          userId={currentUser?.id}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Formatos: JPG, PNG, WebP (máx 5MB)</p>
                      </div>

                      {/* PDF Upload */}
                      <div>
                        <Label>PDF da História</Label>
                        <FileUploader
                          accept=".pdf"
                          maxSize={20}
                          onFileSelect={(file) => setSelectedPDF(file)}
                          onFileRemove={() => setSelectedPDF(null)}
                          onUploadComplete={(filePath) => {
                            const { data } = supabase.storage.from('resources').getPublicUrl(filePath);
                            setNewResource(prev => ({ ...prev, pdf_file_path: data.publicUrl }));
                            setPdfUploadProgress(100);
                          }}
                          selectedFile={selectedPDF}
                          uploadProgress={pdfUploadProgress}
                          isUploading={false}
                          userId={currentUser?.id}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Formato: PDF (máx 20MB)</p>
                      </div>

                      {/* Audio Upload */}
                      <div>
                        <Label>Música de Fundo (opcional)</Label>
                        <FileUploader
                          accept=".mp3,.wav,.m4a"
                          maxSize={10}
                          onFileSelect={(file) => setSelectedAudio(file)}
                          onFileRemove={() => setSelectedAudio(null)}
                          onUploadComplete={(filePath) => {
                            const { data } = supabase.storage.from('resources').getPublicUrl(filePath);
                            setNewResource(prev => ({ ...prev, audio_file_path: data.publicUrl }));
                            setAudioUploadProgress(100);
                          }}
                          selectedFile={selectedAudio}
                          uploadProgress={audioUploadProgress}
                          isUploading={false}
                          userId={currentUser?.id}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Formatos: MP3, WAV, M4A (máx 10MB)</p>
                      </div>
                    </div>
                  </>
                )}

                {/* General content uploads for other types */}
                {newResource.content_type !== 'story' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="url">URL do Recurso (YouTube, etc.)</Label>
                        <Input
                          id="url"
                          value={newResource.url}
                          onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                          placeholder="https://www.youtube.com/watch?v=... (opcional)"
                        />
                      </div>
                      
                      <div>
                        <Label>OU Upload de Arquivo Local</Label>
                        <FileUploader
                          onFileSelect={(file) => {
                            setSelectedFile(file);
                            setIsUploading(true);
                          }}
                          onFileRemove={() => setSelectedFile(null)}
                          onUploadComplete={(filePath) => {
                            const { data } = supabase.storage.from('resources').getPublicUrl(filePath);
                            setNewResource(prev => ({ ...prev, file_path: data.publicUrl }));
                            setIsUploading(false);
                            setUploadProgress(100);
                          }}
                          selectedFile={selectedFile}
                          uploadProgress={uploadProgress}
                          isUploading={isUploading}
                          userId={currentUser?.id}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="thumbnail">URL da Thumbnail (opcional)</Label>
                      <Input
                        id="thumbnail"
                        value={newResource.thumbnail_url}
                        onChange={(e) => setNewResource({...newResource, thumbnail_url: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                    
                    {newResource.content_type === 'video' && (
                      <div>
                        <Label htmlFor="duration">Duração (minutos)</Label>
                        <Input
                          id="duration"
                          value={newResource.duration}
                          onChange={(e) => setNewResource({...newResource, duration: e.target.value})}
                          placeholder="Ex: 10"
                          type="number"
                        />
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="premium"
                    checked={newResource.is_premium}
                    onCheckedChange={(checked) => setNewResource({...newResource, is_premium: checked})}
                  />
                  <Label htmlFor="premium">Conteúdo Premium</Label>
                </div>
                
                <Alert>
                  <AlertDescription>
                    O recurso será criado como rascunho e poderá ser publicado posteriormente.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddResource} disabled={isUploading}>
                {isUploading ? 'Fazendo Upload...' : 'Adicionar Recurso'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Recurso</DialogTitle>
              <DialogDescription>
                Atualize as informações do recurso
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="content">Conteúdo</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-title">Título *</Label>
                    <Input
                      id="edit-title"
                      value={newResource.title}
                      onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                      placeholder="Digite o título do recurso"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Categoria</Label>
                    <Select value={newResource.category} onValueChange={(value) => setNewResource({...newResource, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-description">Descrição *</Label>
                  <Textarea
                    id="edit-description"
                    value={newResource.description}
                    onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                    placeholder="Descreva o recurso..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-content_type">Tipo de Conteúdo</Label>
                    <Select value={newResource.content_type} onValueChange={(value) => setNewResource({...newResource, content_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-age_range">Faixa Etária</Label>
                    <Select value={newResource.age_range} onValueChange={(value) => setNewResource({...newResource, age_range: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ageRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-difficulty">Dificuldade</Label>
                    <Select value={newResource.difficulty_level} onValueChange={(value) => setNewResource({...newResource, difficulty_level: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level === 'beginner' ? 'Iniciante' : level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="content" className="space-y-4">
                <div>
                  <Label htmlFor="edit-url">URL do Recurso (YouTube, etc.)</Label>
                  <Input
                    id="edit-url"
                    value={newResource.url}
                    onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-thumbnail">URL da Thumbnail</Label>
                  <Input
                    id="edit-thumbnail"
                    value={newResource.thumbnail_url}
                    onChange={(e) => setNewResource({...newResource, thumbnail_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-premium"
                    checked={newResource.is_premium}
                    onCheckedChange={(checked) => setNewResource({...newResource, is_premium: checked})}
                  />
                  <Label htmlFor="edit-premium">Conteúdo Premium</Label>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setEditingResource(null);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateResource}>
                Atualizar Recurso
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Recursos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicados</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.filter(r => r.is_published).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vídeos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.filter(r => r.content_type === 'video').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Histórias</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.filter(r => r.content_type === 'story').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar recursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  {contentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const IconComponent = getContentTypeIcon(resource.content_type);
          return (
            <Card key={resource.id} className="group hover:shadow-lg transition-shadow">
              <div className="relative">
                {resource.thumbnail_url && (
                  <img
                    src={resource.thumbnail_url}
                    alt={resource.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <div className="absolute top-2 left-2">
                  <Badge className={getContentTypeColor(resource.content_type)}>
                    <IconComponent className="h-3 w-3 mr-1" />
                    {resource.content_type}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant={resource.is_published ? "default" : "secondary"}>
                    {resource.is_published ? "Publicado" : "Rascunho"}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <Badge variant="outline">{resource.category}</Badge>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{resource.downloads_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{resource.likes_count}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {new Date(resource.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublishStatus(resource.id, resource.is_published)}
                    >
                      {resource.is_published ? 'Despublicar' : 'Publicar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditResource(resource)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteResource(resource.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhum recurso encontrado</p>
            <p className="text-sm">Tente ajustar os filtros ou adicione um novo recurso</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResourcesEnhanced;