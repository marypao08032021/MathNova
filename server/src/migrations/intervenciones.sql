CREATE TABLE IF NOT EXISTS public.mathnova_intervenciones(
 id uuid PRIMARY KEY,
 grupo bigint NOT NULL REFERENCES public.grupos(id_grupo) ON DELETE CASCADE,
 alumno bigint NOT NULL REFERENCES public.registro(id_usuario) ON DELETE CASCADE,
 actividad text NOT NULL,
 docente bigint REFERENCES public.registro(id_usuario) ON DELETE SET NULL,
 nombre_docente text NOT NULL,
 contenido text NOT NULL,
 pda text NOT NULL,
 inicial uuid NOT NULL REFERENCES public.mathnova_intentos_piloto(id) ON DELETE CASCADE,
 necesidad varchar(2000) NOT NULL,
 accion varchar(2000) NOT NULL,
 creado timestamptz NOT NULL DEFAULT now(),
 posterior uuid REFERENCES public.mathnova_intentos_piloto(id) ON DELETE CASCADE,
 observacion varchar(3000),
 resultado text CHECK(resultado IN ('avance_observado','dificultad_persistente','evidencia_insuficiente')),
 revisado timestamptz,
 revisado_por bigint REFERENCES public.registro(id_usuario) ON DELETE SET NULL,
 CHECK((posterior IS NULL AND observacion IS NULL AND resultado IS NULL AND revisado IS NULL) OR
       (posterior IS NOT NULL AND observacion IS NOT NULL AND resultado IS NOT NULL AND revisado IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS mathnova_intervenciones_consulta ON public.mathnova_intervenciones(grupo,alumno,actividad,creado DESC);
