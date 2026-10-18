CREATE TABLE IF NOT EXISTS public.mathnova_chats(
 id uuid PRIMARY KEY,
 grupo bigint NOT NULL REFERENCES public.grupos(id_grupo) ON DELETE CASCADE,
 alumno bigint NOT NULL REFERENCES public.registro(id_usuario) ON DELETE CASCADE,
 docente bigint NOT NULL REFERENCES public.registro(id_usuario) ON DELETE CASCADE,
 nombre_docente text NOT NULL,
 creado timestamptz NOT NULL DEFAULT now(),
 cerrado timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS mathnova_chat_abierto ON public.mathnova_chats(grupo,alumno,docente) WHERE cerrado IS NULL;
CREATE TABLE IF NOT EXISTS public.mathnova_chat_mensajes(
 orden bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 id uuid NOT NULL UNIQUE,
 chat uuid NOT NULL REFERENCES public.mathnova_chats(id) ON DELETE CASCADE,
 emisor bigint NOT NULL REFERENCES public.registro(id_usuario) ON DELETE CASCADE,
 nombre_emisor text NOT NULL,
 tipo text NOT NULL CHECK(tipo IN ('docente','alumno')),
 mensaje varchar(1000) NOT NULL CHECK(length(trim(mensaje))>0),
 creado timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mathnova_chat_lectura ON public.mathnova_chat_mensajes(chat,orden);
