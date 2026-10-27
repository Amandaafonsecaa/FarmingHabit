-- Login com Supabase Auth: o id do jogador é o UUID de auth.users (o backend não gera mais o id).
-- users.id é TEXT e auth.users.id é UUID, e o Postgres não aceita FK entre tipos diferentes.
-- O vínculo fica em dois gatilhos, com o mesmo efeito de uma FK:
--   1) jogador novo (ou com id alterado) precisa existir em auth.users;
--   2) apagar a conta em auth.users apaga o jogador (e tudo dele, pelas FKs em cascata das outras tabelas).
-- Jogadores criados antes do login continuam como estão (só linhas novas são conferidas).

CREATE OR REPLACE FUNCTION public.ensure_player_is_auth_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.id::uuid) THEN
    RAISE EXCEPTION 'Jogador % não existe em auth.users', NEW.id USING ERRCODE = 'foreign_key_violation';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER users_must_be_auth_users
BEFORE INSERT OR UPDATE OF "id" ON public."users"
FOR EACH ROW EXECUTE FUNCTION public.ensure_player_is_auth_user();

CREATE OR REPLACE FUNCTION public.delete_player_of_auth_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  DELETE FROM public."users" WHERE "id" = OLD.id::text;
  RETURN OLD;
END $$;

CREATE TRIGGER on_auth_user_deleted_delete_player
AFTER DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.delete_player_of_auth_user();

-- Funções de gatilho não devem ser chamáveis pela API pública
REVOKE ALL ON FUNCTION public.ensure_player_is_auth_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_player_of_auth_user() FROM PUBLIC, anon, authenticated;
