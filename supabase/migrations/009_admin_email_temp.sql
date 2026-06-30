-- Admin temporal por email (hasta panel de roles).
-- Permite moderar llamados sin marcar es_admin manualmente en SQL Editor.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (
      SELECT p.es_admin OR lower(trim(p.email)) = 'lourdes.graciela.mendaro@gmail.com'
      FROM public.perfiles p
      WHERE p.id = auth.uid()
    ),
    false
  );
$$;
