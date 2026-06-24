-- Tarifa y disponibilidad del prestador
ALTER TABLE perfiles
  ADD COLUMN IF NOT EXISTS tarifa_hora numeric,
  ADD COLUMN IF NOT EXISTS tarifa_modalidad text,
  ADD COLUMN IF NOT EXISTS acepta_viatico boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS viatico_diario numeric,
  ADD COLUMN IF NOT EXISTS tiene_vehiculo boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tipo_vehiculo text;
