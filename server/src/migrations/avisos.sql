CREATE TABLE IF NOT EXISTS public.mathnova_presencia (
 id_usuario bigint PRIMARY KEY REFERENCES public.registro(id_usuario) ON DELETE CASCADE,
 ultima_conexion timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mathnova_avisos (
 id bigserial PRIMARY KEY,
 emisor bigint REFERENCES public.registro(id_usuario) ON DELETE SET NULL,
 nombre_emisor text NOT NULL,
 titulo varchar(80) NOT NULL,
 mensaje varchar(1000) NOT NULL,
 creado timestamptz NOT NULL DEFAULT now(),
 solicitud varchar(80) NOT NULL,
 huella text NOT NULL,
 UNIQUE(emisor,solicitud)
);
CREATE TABLE IF NOT EXISTS public.mathnova_aviso_destinos (
 aviso bigint NOT NULL REFERENCES public.mathnova_avisos(id) ON DELETE CASCADE,
 alumno bigint NOT NULL REFERENCES public.registro(id_usuario) ON DELETE CASCADE,
 enterado timestamptz,
 PRIMARY KEY(aviso,alumno)
);
CREATE INDEX IF NOT EXISTS mathnova_aviso_pendientes ON public.mathnova_aviso_destinos(alumno,aviso) WHERE enterado IS NULL;
