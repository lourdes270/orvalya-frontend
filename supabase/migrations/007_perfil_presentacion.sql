-- Presentación profesional del prestador
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS sobre_mi text,
  ADD COLUMN IF NOT EXISTS experiencia text,
  ADD COLUMN IF NOT EXISTS cursos text,
  ADD COLUMN IF NOT EXISTS documentacion_adicional jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.perfiles.sobre_mi IS 'Descripción breve del prestador (máx. ~300 caracteres en UI).';
COMMENT ON COLUMN public.perfiles.experiencia IS 'Experiencia laboral del prestador (máx. ~400 caracteres en UI).';
COMMENT ON COLUMN public.perfiles.cursos IS 'Cursos y estudios del prestador (máx. ~300 caracteres en UI).';
COMMENT ON COLUMN public.perfiles.documentacion_adicional IS 'Documentación opcional declarada: carne_salud, libreta_conducir, habilitacion_municipal.';
