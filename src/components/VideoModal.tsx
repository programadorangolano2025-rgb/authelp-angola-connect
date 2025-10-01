import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

export const VideoModal = ({ isOpen, onClose, videoUrl, title }: VideoModalProps) => {
  const getYouTubeVideoId = (url: string | null) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getEmbedUrl = (url: string | null) => {
    if (!url) return '';
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    // Se não for YouTube, verifica se é URL do Supabase Storage
    if (url.includes('supabase.co/storage')) {
      return url;
    }
    return url;
  };

  const isYouTubeVideo = (url: string | null) => {
    if (!url) return false;
    return getYouTubeVideoId(url) !== null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <DialogTitle className="text-lg font-semibold line-clamp-1">{title}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative w-full h-0 pb-[56.25%]"> {/* 16:9 aspect ratio */}
          {isYouTubeVideo(videoUrl) ? (
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
          ) : (
            <video
              src={getEmbedUrl(videoUrl)}
              className="absolute top-0 left-0 w-full h-full"
              controls
              autoPlay
              title={title}
            >
              Seu navegador não suporta a reprodução de vídeo.
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};