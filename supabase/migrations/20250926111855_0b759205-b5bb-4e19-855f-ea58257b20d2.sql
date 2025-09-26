-- Create storage bucket for resources
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

-- Create policies for resource uploads
CREATE POLICY "Authenticated users can upload resources" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'resources' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view resources" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resources');

CREATE POLICY "Users can update their own resource files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);