-- Garantir unicidade do username (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS membros_username_lower_unique
  ON public.membros (LOWER(username));