-- Línea base: valida módulos existentes; no vuelve a ejecutar SQL histórico.
DO $$
DECLARE nombre text;
BEGIN
 FOREACH nombre IN ARRAY ARRAY['registro','roles','grupos','grupo_alumnos','actividad_progreso','actividad_intentos','mathnova_intentos_piloto','mathnova_acceso_alumno','mathnova_acceso_grupo','mathnova_avisos','mathnova_aviso_destinos','mathnova_perfiles','mathnova_revisiones','mathnova_ayuda','mathnova_chats','mathnova_chat_mensajes','mathnova_intervenciones'] LOOP
  IF to_regclass('public.' || nombre) IS NULL THEN
   RAISE EXCEPTION 'Falta la tabla requerida: %', nombre;
  END IF;
 END LOOP;
 IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='registro' AND column_name='id_usuario') THEN
  RAISE EXCEPTION 'Falta registro.id_usuario';
 END IF;
END $$;
