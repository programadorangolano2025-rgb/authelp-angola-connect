import React, { useState, useEffect } from 'react';
import { MessageSquare, Eye, EyeOff, Flag, Trash2, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';


interface CommunityPost {
  id: string;
  title: string | null;
  content: string;
  image_url: string | null;
  author_id: string;
  likes_count: number;
  comments_count: number;
  is_approved: boolean;
  is_moderated: boolean;
  created_at: string;
  updated_at: string;
}

interface Profile {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
}

const AdminCommunity = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [profiles, setProfiles] = useState<{ [key: string]: Profile }>({});
  const [selectedTab, setSelectedTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      setPosts(postsData || []);

      // Fetch profiles for all unique author_ids
      const authorIds = [...new Set(postsData?.map(post => post.author_id) || [])];
      
      if (authorIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', authorIds);

        if (profilesError) throw profilesError;

        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {} as { [key: string]: Profile });

        setProfiles(profilesMap);
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os posts da comunidade",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const approvePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ is_approved: true, is_moderated: true })
        .eq('id', postId);

      if (error) throw error;

      // Action completed successfully

      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, is_approved: true, is_moderated: true }
          : post
      ));

      toast({
        title: "Sucesso",
        description: "Post aprovado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao aprovar post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o post",
        variant: "destructive"
      });
    }
  };

  const rejectPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ is_approved: false, is_moderated: true })
        .eq('id', postId);

      if (error) throw error;

      // Action completed successfully

      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, is_approved: false, is_moderated: true }
          : post
      ));

      toast({
        title: "Sucesso",
        description: "Post rejeitado"
      });
    } catch (error) {
      console.error('Erro ao rejeitar post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o post",
        variant: "destructive"
      });
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.')) return;

    try {
      // Delete comments first (if any)
      await supabase
        .from('community_comments')
        .delete()
        .eq('post_id', postId);

      // Then delete the post
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      // Action completed successfully

      setPosts(posts.filter(post => post.id !== postId));

      toast({
        title: "Sucesso",
        description: "Post excluído com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o post",
        variant: "destructive"
      });
    }
  };

  const getFilteredPosts = () => {
    switch (selectedTab) {
      case 'pending':
        return posts.filter(post => !post.is_moderated);
      case 'approved':
        return posts.filter(post => post.is_moderated && post.is_approved);
      case 'rejected':
        return posts.filter(post => post.is_moderated && !post.is_approved);
      default:
        return posts;
    }
  };

  const PostCard = ({ post }: { post: CommunityPost }) => {
    const author = profiles[post.author_id];

    return (
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Author Info */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                {author?.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {author?.full_name || 'Usuário anônimo'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Post Title */}
            {post.title && (
              <h3 className="text-lg font-semibold text-foreground">
                {post.title}
              </h3>
            )}

            {/* Post Content */}
            <div className="text-foreground leading-relaxed">
              {post.content}
            </div>

            {/* Post Image */}
            {post.image_url && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={post.image_url}
                  alt="Post image"
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}

            {/* Post Stats */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{post.likes_count}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{post.comments_count}</span>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex items-center space-x-2">
              {!post.is_moderated && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Pendente
                </Badge>
              )}
              {post.is_moderated && post.is_approved && (
                <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
                  Aprovado
                </Badge>
              )}
              {post.is_moderated && !post.is_approved && (
                <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                  Rejeitado
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {!post.is_moderated && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => approvePost(post.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectPost(post.id)}
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => deletePost(post.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando posts da comunidade...</p>
        </div>
      </div>
    );
  }

  const filteredPosts = getFilteredPosts();
  const pendingCount = posts.filter(p => !p.is_moderated).length;
  const approvedCount = posts.filter(p => p.is_moderated && p.is_approved).length;
  const rejectedCount = posts.filter(p => p.is_moderated && !p.is_approved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Moderação da Comunidade</h1>
        <p className="text-muted-foreground">
          Gerencie posts, comentários e atividades da comunidade
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium leading-none">Total de Posts</p>
                <p className="text-2xl font-bold">{posts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Flag className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium leading-none">Pendentes</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium leading-none">Aprovados</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <EyeOff className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium leading-none">Rejeitados</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="relative">
            Pendentes
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-xs">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Aprovados</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum post encontrado</h3>
                <p className="text-muted-foreground">
                  {selectedTab === 'pending' && 'Não há posts aguardando moderação'}
                  {selectedTab === 'approved' && 'Não há posts aprovados'}
                  {selectedTab === 'rejected' && 'Não há posts rejeitados'}
                  {selectedTab === 'all' && 'Nenhum post foi criado ainda'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCommunity;