-- Fix RLS usability for resources: allow creators to view and delete their own records
-- Note: RLS is already enabled and INSERT/UPDATE policies exist.

-- SELECT policy for creators
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'resources' AND policyname = 'Resource creators can view their resources'
  ) THEN
    CREATE POLICY "Resource creators can view their resources"
    ON public.resources
    FOR SELECT
    USING (auth.uid() = created_by);
  END IF;
END $$;

-- DELETE policy for creators
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'resources' AND policyname = 'Resource creators can delete their resources'
  ) THEN
    CREATE POLICY "Resource creators can delete their resources"
    ON public.resources
    FOR DELETE
    USING (auth.uid() = created_by);
  END IF;
END $$;