CREATE TABLE IF NOT EXISTS public.mathnova_perfiles(
 id_usuario bigint PRIMARY KEY REFERENCES public.registro(id_usuario) ON DELETE CASCADE,
 avatar varchar(60) NOT NULL DEFAULT 'explorador-brisa',
 preferencias jsonb NOT NULL DEFAULT '{"sonidos":true,"movimiento_reducido":false,"texto_grande":false}',
 max_nivel int NOT NULL DEFAULT 1 CHECK(max_nivel BETWEEN 1 AND 100),
 actualizado timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mathnova_ayuda(
 id bigserial PRIMARY KEY,
 alumno bigint NOT NULL REFERENCES public.registro(id_usuario) ON DELETE CASCADE,
 grupo bigint NOT NULL REFERENCES public.grupos(id_grupo) ON DELETE CASCADE,
 actividad varchar(100),
 detalle varchar(500) NOT NULL DEFAULT '',
 creado timestamptz NOT NULL DEFAULT now(),
 atendido timestamptz,
 atendido_por bigint REFERENCES public.registro(id_usuario) ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS mathnova_ayuda_abierta ON public.mathnova_ayuda(alumno,grupo) WHERE atendido IS NULL;
CREATE TABLE IF NOT EXISTS public.mathnova_revisiones(
 id bigserial PRIMARY KEY,
 grupo bigint NOT NULL REFERENCES public.grupos(id_grupo) ON DELETE CASCADE,
 alumno bigint NOT NULL REFERENCES public.registro(id_usuario) ON DELETE CASCADE,
 actividad varchar(100) NOT NULL,
 docente bigint REFERENCES public.registro(id_usuario) ON DELETE SET NULL,
 nombre_docente text NOT NULL,
 contenido jsonb NOT NULL,
 publicado jsonb,
 version int NOT NULL DEFAULT 1,
 actualizado timestamptz NOT NULL DEFAULT now(),
 publicado_en timestamptz,
 UNIQUE(grupo,alumno,actividad)
);
