-- Historial aditivo: no modifica progreso ni intentos anteriores.
CREATE TABLE IF NOT EXISTS public.mathnova_intentos_piloto(
 orden bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 id uuid NOT NULL UNIQUE,
 alumno bigint NOT NULL REFERENCES public.registro(id_usuario) ON DELETE CASCADE,
 actividad text NOT NULL CHECK(actividad IN ('mathnumbers-radar-supervivencia','mathgeometry-actividad-5','mathnumbers-cofre-bienvenida','mathnumbers-ascensor-bunker','mathnumbers-escuadron-tactico','mathnumbers-espejos-boveda','mathnumbers-puente-prioridades','mathnumbers-enigma-variables','mathnumbers-simulador-codigos','mathgeometry-actividad-1','mathgeometry-actividad-2','mathgeometry-actividad-3','mathgeometry-actividad-4','mathgeometry-actividad-6','mathgeometry-actividad-7','mathgeometry-actividad-8','mathdata-encuesta-tripulacion','mathdata-holograma-reportes','mathdata-sensor-frecuencias','mathdata-nucleo-decisiones','mathdata-generador-energia','mathdata-oraculo-estacion','mathdata-sala-tres-caminos','mathdata-rampas-lanzamiento')),
 sesion uuid NOT NULL,
 version text NOT NULL CHECK(version='piloto-v1'),
 tipo text NOT NULL CHECK(tipo IN ('revision','cierre')),
 respuestas jsonb NOT NULL,
 evaluacion jsonb NOT NULL,
 huella text NOT NULL,
 recibo jsonb,
 creado timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mathnova_intentos_piloto DROP CONSTRAINT IF EXISTS mathnova_intentos_piloto_actividad_check;
ALTER TABLE public.mathnova_intentos_piloto ADD CONSTRAINT mathnova_intentos_piloto_actividad_check CHECK(actividad IN ('mathnumbers-radar-supervivencia','mathgeometry-actividad-5','mathnumbers-cofre-bienvenida','mathnumbers-ascensor-bunker','mathnumbers-escuadron-tactico','mathnumbers-espejos-boveda','mathnumbers-puente-prioridades','mathnumbers-enigma-variables','mathnumbers-simulador-codigos','mathgeometry-actividad-1','mathgeometry-actividad-2','mathgeometry-actividad-3','mathgeometry-actividad-4','mathgeometry-actividad-6','mathgeometry-actividad-7','mathgeometry-actividad-8','mathdata-encuesta-tripulacion','mathdata-holograma-reportes','mathdata-sensor-frecuencias','mathdata-nucleo-decisiones','mathdata-generador-energia','mathdata-oraculo-estacion','mathdata-sala-tres-caminos','mathdata-rampas-lanzamiento'));
CREATE INDEX IF NOT EXISTS mathnova_piloto_alumno_actividad ON public.mathnova_intentos_piloto(alumno,actividad,orden DESC);

CREATE OR REPLACE FUNCTION public.mathnova_proteger_intento_piloto() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF ROW(NEW.id,NEW.alumno,NEW.actividad,NEW.sesion,NEW.version,NEW.tipo,NEW.respuestas,NEW.evaluacion,NEW.huella,NEW.creado) IS DISTINCT FROM ROW(OLD.id,OLD.alumno,OLD.actividad,OLD.sesion,OLD.version,OLD.tipo,OLD.respuestas,OLD.evaluacion,OLD.huella,OLD.creado) THEN
  RAISE EXCEPTION 'La evidencia piloto no puede sobrescribirse';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS mathnova_intento_inmutable ON public.mathnova_intentos_piloto;
CREATE TRIGGER mathnova_intento_inmutable BEFORE UPDATE ON public.mathnova_intentos_piloto FOR EACH ROW EXECUTE FUNCTION public.mathnova_proteger_intento_piloto();
