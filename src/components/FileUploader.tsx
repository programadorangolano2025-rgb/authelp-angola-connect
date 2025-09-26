import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onUploadComplete?: (filePath: string) => void;
  selectedFile: File | null;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  uploadProgress?: number;
  isUploading?: boolean;
  userId?: string;
}

export const FileUploader = ({
  onFileSelect,
  onFileRemove,
  onUploadComplete,
  selectedFile,
  accept = ".pdf,.mp4,.mp3,.jpg,.jpeg,.png,.webp",
  maxSize = 50,
  className,
  uploadProgress = 0,
  isUploading = false,
  userId
}: FileUploaderProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToStorage = async (file: File) => {
    if (!userId || !onUploadComplete) {
      setError('Usuário não autenticado');
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from('resources')
        .upload(fileName, file);

      if (error) throw error;
      
      onUploadComplete(data.path);
    } catch (error) {
      console.error('Erro no upload:', error);
      setError('Erro ao fazer upload do arquivo');
    }
  };

  const handleFileSelection = async (file: File) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`);
      return;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedTypes.includes(fileExtension)) {
      setError(`Tipo de arquivo não suportado. Tipos aceitos: ${accept}`);
      return;
    }

    setError(null);
    onFileSelect(file);
    
    // Auto upload after selection if userId is provided
    if (userId && onUploadComplete) {
      await uploadToStorage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!selectedFile ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload de Arquivo</h3>
          <p className="text-muted-foreground mb-4">
            Arraste e solte seu arquivo aqui ou clique para selecionar
          </p>
          <p className="text-sm text-muted-foreground">
            Tipos aceitos: {accept} | Tamanho máximo: {maxSize}MB
          </p>
          <Button variant="outline" className="mt-4">
            Selecionar Arquivo
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onFileRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {isUploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Fazendo upload...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
};