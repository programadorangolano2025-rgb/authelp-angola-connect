import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Download, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useToast } from '@/hooks/use-toast';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  story: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    url: string | null;
    pdf_file_path: string | null;
    audio_url: string | null;
    audio_file_path: string | null;
    description: string | null;
  };
}

const StoryViewer = ({ isOpen, onClose, story }: StoryViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Get the PDF URL from either pdf_file_path or url
  const pdfUrl = story.pdf_file_path || story.url;
  const audioUrl = story.audio_file_path || story.audio_url;
  const isPDF = pdfUrl?.toLowerCase().endsWith('.pdf');

  useEffect(() => {
    if (isOpen && audioUrl) {
      const audio = new Audio(audioUrl);
      audio.loop = true;
      audio.volume = 0.5;
      setAudioElement(audio);

      // Auto-play audio when story opens
      audio.play()
        .then(() => setAudioPlaying(true))
        .catch(() => {
          // Auto-play might be blocked, show user they can click to play
          toast({
            title: "Música de fundo disponível",
            description: "Clique no ícone de áudio para reproduzir",
          });
        });

      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [isOpen, audioUrl, toast]);

  const handleToggleAudio = () => {
    if (!audioElement) return;

    if (audioPlaying) {
      audioElement.pause();
      setAudioPlaying(false);
    } else {
      audioElement.play()
        .then(() => setAudioPlaying(true))
        .catch(() => {
          toast({
            title: "Erro",
            description: "Não foi possível reproduzir o áudio",
            variant: "destructive"
          });
        });
    }
  };

  const handleToggleMute = () => {
    if (!audioElement) return;
    audioElement.muted = !audioMuted;
    setAudioMuted(!audioMuted);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setLoading(false);
    toast({
      title: "Erro",
      description: "Não foi possível carregar o PDF",
      variant: "destructive"
    });
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(numPages, prev + 1));
  };

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const handleClose = () => {
    if (audioElement) {
      audioElement.pause();
      setAudioPlaying(false);
    }
    setCurrentPage(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-full max-h-screen h-screen p-0 gap-0">
        {/* Header */}
        <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background border-b">
          <div className="flex-1">
            <h2 className="text-lg font-semibold truncate">{story.title}</h2>
            {story.description && (
              <p className="text-sm text-muted-foreground truncate">{story.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {audioUrl && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleToggleAudio}
                  title={audioPlaying ? "Pausar música" : "Reproduzir música"}
                >
                  {audioPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>
                {audioPlaying && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleToggleMute}
                    title={audioMuted ? "Ativar som" : "Silenciar"}
                  >
                    {audioMuted ? <VolumeX className="h-5 w-5 text-muted-foreground" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                )}
              </>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={handleClose}
              title="Fechar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4">
          {isPDF && pdfUrl ? (
            <div className="flex flex-col items-center space-y-4 w-full max-w-4xl">
              {loading && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Carregando história...</span>
                </div>
              )}
              
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div className="text-center">Carregando PDF...</div>}
                className="shadow-lg"
              >
                <Page
                  pageNumber={currentPage}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="max-w-full"
                  width={Math.min(window.innerWidth - 64, 800)}
                />
              </Document>
            </div>
          ) : story.thumbnail_url ? (
            <img
              src={story.thumbnail_url}
              alt={story.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <p>Formato de história não suportado</p>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        {isPDF && numPages > 0 && (
          <div className="sticky bottom-0 z-50 bg-background border-t p-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  Página {currentPage} de {numPages}
                </span>
                <Progress 
                  value={(currentPage / numPages) * 100} 
                  className="w-32"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage >= numPages}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              {pdfUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="ml-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StoryViewer;
