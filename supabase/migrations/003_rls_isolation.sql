-- RLS: aislamiento entre contratantes y acceso documental por relación activa
-- Asunción: contratos(prestador_id, contratante_id, estado) con estado 'activo'|'pendiente'|'cancelado'

-- ─── perfiles ───
DROP POLICY IF EXISTS perfiles_select_own ON public.perfiles;
CREATE POLICY perfiles_select_own ON public.perfiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS perfiles_select_linked_prestador ON public.perfiles;
CREATE POLICY perfiles_select_linked_prestador ON public.perfiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contratos c
      WHERE c.contratante_id = auth.uid()
        AND c.prestador_id = perfiles.id
        AND c.estado = 'activo'
    )
  );

DROP POLICY IF EXISTS perfiles_update_own ON public.perfiles;
CREATE POLICY perfiles_update_own ON public.perfiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS perfiles_insert_own ON public.perfiles;
CREATE POLICY perfiles_insert_own ON public.perfiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- ─── documentos ───
DROP POLICY IF EXISTS documentos_prestador_insert ON public.documentos;
CREATE POLICY documentos_prestador_insert ON public.documentos
  FOR INSERT TO authenticated
  WITH CHECK (prestador_id = auth.uid());

DROP POLICY IF EXISTS documentos_prestador_select ON public.documentos;
CREATE POLICY documentos_prestador_select ON public.documentos
  FOR SELECT TO authenticated
  USING (prestador_id = auth.uid());

DROP POLICY IF EXISTS documentos_contratante_select_vigente ON public.documentos;
CREATE POLICY documentos_contratante_select_vigente ON public.documentos
  FOR SELECT TO authenticated
  USING (
    estado = 'vigente'::estado_documento
    AND EXISTS (
      SELECT 1 FROM public.contratos c
      WHERE c.contratante_id = auth.uid()
        AND c.prestador_id = documentos.prestador_id
        AND c.estado = 'activo'
    )
  );

-- ─── contratos (datos por contratante) ───
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contratos_select_partes ON public.contratos;
CREATE POLICY contratos_select_partes ON public.contratos
  FOR SELECT TO authenticated
  USING (contratante_id = auth.uid() OR prestador_id = auth.uid());

DROP POLICY IF EXISTS contratos_insert_contratante ON public.contratos;
CREATE POLICY contratos_insert_contratante ON public.contratos
  FOR INSERT TO authenticated
  WITH CHECK (contratante_id = auth.uid());

DROP POLICY IF EXISTS contratos_update_partes ON public.contratos;
CREATE POLICY contratos_update_partes ON public.contratos
  FOR UPDATE TO authenticated
  USING (contratante_id = auth.uid() OR prestador_id = auth.uid())
  WITH CHECK (contratante_id = auth.uid() OR prestador_id = auth.uid());
