-- Migración aditiva. No altera cuentas, grupos ni progreso existentes.
CREATE TABLE IF NOT EXISTS public.mathnova_acceso_grupo (
 id_grupo bigint NOT NULL REFERENCES public.grupos(id_grupo) ON DELETE CASCADE,
 actividad_codigo text NOT NULL CHECK (actividad_codigo IN ('mathnumbers-cofre-bienvenida','mathnumbers-radar-supervivencia','mathnumbers-ascensor-bunker','mathnumbers-escuadron-tactico','mathnumbers-espejos-boveda','mathnumbers-puente-prioridades','mathnumbers-enigma-variables','mathnumbers-simulador-codigos','mathgeometry-actividad-1','mathgeometry-actividad-2','mathgeometry-actividad-3','mathgeometry-actividad-4','mathgeometry-actividad-5','mathgeometry-actividad-6','mathgeometry-actividad-7','mathgeometry-actividad-8','mathdata-generador-energia','mathdata-encuesta-tripulacion','mathdata-holograma-reportes','mathdata-sensor-frecuencias','mathdata-nucleo-decisiones','mathdata-oraculo-estacion','mathdata-sala-tres-caminos','mathdata-rampas-lanzamiento')),
 habilitada boolean NOT NULL DEFAULT false,
 actor bigint REFERENCES public.registro(id_usuario) ON DELETE SET NULL,
 actualizado timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(id_grupo,actividad_codigo)
);
CREATE TABLE IF NOT EXISTS public.mathnova_acceso_alumno (
 id_grupo bigint NOT NULL REFERENCES public.grupos(id_grupo) ON DELETE CASCADE,
 id_alumno bigint NOT NULL REFERENCES public.registro(id_usuario) ON DELETE CASCADE,
 actividad_codigo text NOT NULL CHECK (actividad_codigo IN ('mathnumbers-cofre-bienvenida','mathnumbers-radar-supervivencia','mathnumbers-ascensor-bunker','mathnumbers-escuadron-tactico','mathnumbers-espejos-boveda','mathnumbers-puente-prioridades','mathnumbers-enigma-variables','mathnumbers-simulador-codigos','mathgeometry-actividad-1','mathgeometry-actividad-2','mathgeometry-actividad-3','mathgeometry-actividad-4','mathgeometry-actividad-5','mathgeometry-actividad-6','mathgeometry-actividad-7','mathgeometry-actividad-8','mathdata-generador-energia','mathdata-encuesta-tripulacion','mathdata-holograma-reportes','mathdata-sensor-frecuencias','mathdata-nucleo-decisiones','mathdata-oraculo-estacion','mathdata-sala-tres-caminos','mathdata-rampas-lanzamiento')),
 habilitada boolean NOT NULL,
 actor bigint REFERENCES public.registro(id_usuario) ON DELETE SET NULL,
 actualizado timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(id_grupo,id_alumno,actividad_codigo)
);
CREATE INDEX IF NOT EXISTS mathnova_acceso_alumno_usuario ON public.mathnova_acceso_alumno(id_alumno);
CREATE TABLE IF NOT EXISTS public.mathnova_aula_auditoria (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 actor bigint REFERENCES public.registro(id_usuario) ON DELETE SET NULL,
 id_grupo bigint REFERENCES public.grupos(id_grupo) ON DELETE SET NULL,
 id_alumno bigint REFERENCES public.registro(id_usuario) ON DELETE SET NULL,
 actividades jsonb NOT NULL,habilitada boolean,fecha timestamptz NOT NULL DEFAULT now()
);
