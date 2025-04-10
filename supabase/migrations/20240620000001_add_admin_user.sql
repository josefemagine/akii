-- Add admin user directly
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, role, is_admin, last_sign_in_at)
VALUES ('00000000-0000-0000-0000-000000000000', 'josef@holm.com', now(), now(), now(), 'authenticated', true, now())
ON CONFLICT (id) DO UPDATE SET email = 'josef@holm.com', updated_at = now();

-- Add corresponding profile
INSERT INTO public.profiles (id, email, role, status, created_at, updated_at, is_admin)
VALUES ('00000000-0000-0000-0000-000000000000', 'josef@holm.com', 'admin', 'active', now(), now(), true)
ON CONFLICT (id) DO UPDATE SET email = 'josef@holm.com', role = 'admin', status = 'active', updated_at = now(), is_admin = true;
