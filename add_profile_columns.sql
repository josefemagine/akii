

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."check_table_exists"("table_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = $1
  );
END;
$_$;


ALTER FUNCTION "public"."check_table_exists"("table_name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_table_exists"("table_name" "text") IS 'Checks if a table exists in the public schema';



CREATE OR REPLACE FUNCTION "public"."check_tables_exist"("table_names" "text"[]) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSONB := '{}'::jsonb;
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY table_names LOOP
    result := result || jsonb_build_object(
      table_name,
      EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = table_name
      )
    );
  END LOOP;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."check_tables_exist"("table_names" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_ai_instances_table_if_not_exists"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Check if ai_instances table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_instances') THEN
    -- Create ai_instances table
    CREATE TABLE public.ai_instances (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      model TEXT NOT NULL,
      owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      settings JSONB DEFAULT '{}'::jsonb,
      status TEXT DEFAULT 'active'
    );

    -- Enable row level security
    ALTER TABLE public.ai_instances ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view their own AI instances"
      ON public.ai_instances FOR SELECT
      USING (owner_id = auth.uid() OR id IN (
        SELECT ai_instance_id FROM public.team_ai_instance_access 
        WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
      ));

    CREATE POLICY "Users can manage their own AI instances"
      ON public.ai_instances FOR ALL
      USING (owner_id = auth.uid());

    -- Enable realtime
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_instances;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END;
$$;


ALTER FUNCTION "public"."create_ai_instances_table_if_not_exists"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_team_ai_instance_access_table_if_not_exists"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Check if team_ai_instance_access table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_ai_instance_access') THEN
    -- Create team_ai_instance_access table
    CREATE TABLE public.team_ai_instance_access (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
      ai_instance_id UUID NOT NULL,
      access_level TEXT NOT NULL DEFAULT 'read',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(team_id, ai_instance_id)
    );

    -- Enable row level security
    ALTER TABLE public.team_ai_instance_access ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Team members can view their team's AI instance access"
      ON public.team_ai_instance_access FOR SELECT
      USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

    CREATE POLICY "Team owners can manage AI instance access"
      ON public.team_ai_instance_access FOR ALL
      USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'owner'));

    -- Enable realtime
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.team_ai_instance_access;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END;
$$;


ALTER FUNCTION "public"."create_team_ai_instance_access_table_if_not_exists"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_team_members_table_if_not_exists"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Check if team_members table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_members') THEN
    -- Create team_members table
    CREATE TABLE public.team_members (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      ai_instance_access JSONB DEFAULT '[]'::jsonb,
      UNIQUE(team_id, user_id)
    );

    -- Enable row level security
    ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Team members can view their team members"
      ON public.team_members FOR SELECT
      USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

    CREATE POLICY "Team owners can manage team members"
      ON public.team_members FOR ALL
      USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'owner'));

    -- Enable realtime
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END;
$$;


ALTER FUNCTION "public"."create_team_members_table_if_not_exists"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_teams_table_if_not_exists"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Check if teams table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'teams') THEN
    -- Create teams table
    CREATE TABLE public.teams (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      created_by UUID REFERENCES auth.users(id),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Enable row level security
    ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Team members can view their teams"
      ON public.teams FOR SELECT
      USING (id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

    CREATE POLICY "Team owners can update their teams"
      ON public.teams FOR UPDATE
      USING (id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'owner'));

    -- Enable realtime
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END;
$$;


ALTER FUNCTION "public"."create_teams_table_if_not_exists"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "company" "text",
    "role" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subscription_updated_at" timestamp with time zone DEFAULT "now"(),
    "subscription_renews_at" timestamp with time zone,
    "payment_method_type" "text",
    "payment_customer_id" "text",
    "payment_subscription_id" "text",
    "trial_notification_sent" boolean DEFAULT false,
    "usage_limit_notification_sent" boolean DEFAULT false,
    "subscription_addons" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "text" DEFAULT 'active'::"text",
    "first_name" "text",
    "last_name" "text",
    "company_name" "text",
    "is_admin" boolean DEFAULT false,
    "address1" "text",
    "address2" "text",
    "city" "text",
    "state" "text",
    "zip" "text",
    "country" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."is_admin" IS 'Indicates if the user has admin privileges';



COMMENT ON COLUMN "public"."profiles"."address1" IS 'Primary address line';



COMMENT ON COLUMN "public"."profiles"."address2" IS 'Secondary address line (apt, suite, etc.)';



COMMENT ON COLUMN "public"."profiles"."city" IS 'City';



COMMENT ON COLUMN "public"."profiles"."state" IS 'State or province';



COMMENT ON COLUMN "public"."profiles"."zip" IS 'Postal/ZIP code';



COMMENT ON COLUMN "public"."profiles"."country" IS 'Country';



CREATE OR REPLACE FUNCTION "public"."ensure_profile_exists"("profile_id" "uuid", "user_email" "text", "user_role" "text" DEFAULT 'user'::"text", "user_status" "text" DEFAULT 'active'::"text") RETURNS SETOF "public"."profiles"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if profile exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = profile_id) THEN
    -- Update if it exists
    UPDATE profiles 
    SET 
      email = COALESCE(user_email, email),
      role = COALESCE(user_role, role, 'user'),
      status = COALESCE(user_status, status, 'active'),
      updated_at = NOW()
    WHERE id = profile_id;
  ELSE
    -- Insert if it doesn't exist
    INSERT INTO profiles (
      id, 
      email, 
      role, 
      status,
      created_at, 
      updated_at
    )
    VALUES (
      profile_id, 
      user_email, 
      user_role, 
      user_status,
      NOW(), 
      NOW()
    );
  END IF;
  
  -- Return the profile
  RETURN QUERY SELECT * FROM profiles WHERE id = profile_id;
END;
$$;


ALTER FUNCTION "public"."ensure_profile_exists"("profile_id" "uuid", "user_email" "text", "user_role" "text", "user_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profile_by_id"("profile_id" "uuid") RETURNS SETOF "public"."profiles"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM profiles WHERE id = profile_id;
END;
$$;


ALTER FUNCTION "public"."get_profile_by_id"("profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_bedrock_usage"("user_uuid" "uuid") RETURNS TABLE("total_tokens" bigint, "input_tokens" bigint, "output_tokens" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(bu.total_tokens), 0) AS total_tokens,
    COALESCE(SUM(bu.input_tokens), 0) AS input_tokens,
    COALESCE(SUM(bu.output_tokens), 0) AS output_tokens
  FROM public.bedrock_usage bu
  WHERE bu.user_id = user_uuid
  AND bu.created_at >= date_trunc('month', CURRENT_DATE);
END;
$$;


ALTER FUNCTION "public"."get_user_bedrock_usage"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    first_name,
    last_name,
    company_name,
    avatar_url,
    role,
    status
  )
  VALUES (
    NEW.id,
    NEW.email,
    coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'company_name',
    coalesce(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    'user',
    'active'
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."profile_exists"("profile_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = profile_id);
END;
$$;


ALTER FUNCTION "public"."profile_exists"("profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_modified_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_teams"() RETURNS SETOF "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY SELECT team_id FROM team_members WHERE user_id = auth.uid();
EXCEPTION
  WHEN OTHERS THEN
    RETURN;
END;
$$;


ALTER FUNCTION "public"."user_teams"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_ratings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "agent_id" "uuid",
    "user_id" "uuid",
    "rating" integer,
    "feedback" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "agent_ratings_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."agent_ratings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "messages" integer DEFAULT 0,
    "conversations" integer DEFAULT 0,
    "rating" double precision DEFAULT 0
);


ALTER TABLE "public"."agents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_instances" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "text" DEFAULT 'active'::"text"
);


ALTER TABLE "public"."ai_instances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "avg_response_time" double precision DEFAULT 0,
    "satisfaction_rate" double precision DEFAULT 0,
    "total_requests" integer DEFAULT 0,
    "error_rate" double precision DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "visitors" integer DEFAULT 0,
    "page_views" integer DEFAULT 0,
    "bounce_rate" double precision DEFAULT 0,
    "avg_session_duration" integer DEFAULT 0,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."api_keys" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "instance_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "key_prefix" character varying(50) NOT NULL,
    "key_hash" character varying(255) NOT NULL,
    "permissions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "last_used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone
);


ALTER TABLE "public"."api_keys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."api_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "instance_id" "uuid" NOT NULL,
    "api_key_id" "uuid",
    "endpoint" character varying(255) NOT NULL,
    "request_data" "jsonb",
    "response_data" "jsonb",
    "status_code" integer,
    "tokens_used" integer,
    "processing_time_ms" integer,
    "ip_address" character varying(45),
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."api_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."api_usage" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "instance_id" "uuid" NOT NULL,
    "api_key_id" "uuid",
    "endpoint" "text" NOT NULL,
    "method" "text" NOT NULL,
    "status_code" integer,
    "tokens_input" integer DEFAULT 0,
    "tokens_output" integer DEFAULT 0,
    "latency_ms" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."api_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bedrock_credentials" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "aws_access_key_id" "text" NOT NULL,
    "aws_secret_access_key" "text" NOT NULL,
    "aws_region" "text" DEFAULT 'us-east-1'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bedrock_credentials" OWNER TO "postgres";


COMMENT ON TABLE "public"."bedrock_credentials" IS 'Stores AWS Bedrock credentials for users';



CREATE TABLE IF NOT EXISTS "public"."bedrock_instances" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "instance_id" "text" NOT NULL,
    "model_id" "text" NOT NULL,
    "commitment_duration" "text" NOT NULL,
    "model_units" integer NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."bedrock_instances" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."bedrock_instances_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."bedrock_instances_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."bedrock_instances_id_seq" OWNED BY "public"."bedrock_instances"."id";



CREATE TABLE IF NOT EXISTS "public"."bedrock_usage" (
    "id" bigint NOT NULL,
    "instance_id" integer,
    "user_id" "uuid" NOT NULL,
    "input_tokens" integer DEFAULT 0 NOT NULL,
    "output_tokens" integer DEFAULT 0 NOT NULL,
    "total_tokens" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bedrock_usage" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."bedrock_usage_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."bedrock_usage_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."bedrock_usage_id_seq" OWNED BY "public"."bedrock_usage"."id";



CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "agent_id" "uuid",
    "user_id" "uuid",
    "title" "text" DEFAULT 'New Conversation'::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_chunks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "document_id" "uuid",
    "content" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "embedding" "text"
);


ALTER TABLE "public"."document_chunks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_tag_relations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."document_tag_relations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "agent_id" "uuid",
    "name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "file_size" integer NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "subscription_id" "uuid",
    "amount" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text",
    "status" "text" NOT NULL,
    "billing_reason" "text",
    "payment_method_id" "uuid",
    "invoice_pdf_url" "text",
    "invoice_number" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "paid_at" timestamp with time zone,
    CONSTRAINT "invoices_status_check" CHECK (("status" = ANY (ARRAY['paid'::"text", 'unpaid'::"text", 'pending'::"text", 'failed'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "conversation_id" "uuid",
    "role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "agent_id" "uuid"
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moderation_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "total_moderated" integer DEFAULT 0,
    "flagged_content" integer DEFAULT 0,
    "approval_rate" double precision DEFAULT 0,
    "active_rules" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."moderation_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_methods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "details" "jsonb" NOT NULL,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "payment_methods_type_check" CHECK (("type" = ANY (ARRAY['credit_card'::"text", 'paypal'::"text", 'bank_transfer'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."payment_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price_monthly" numeric(10,2) NOT NULL,
    "price_yearly" numeric(10,2) NOT NULL,
    "features" "jsonb" DEFAULT '[]'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."private_ai_instances" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "model_type" character varying(50) NOT NULL,
    "model_id" character varying(255) NOT NULL,
    "custom_model_url" character varying(255),
    "custom_model_key" character varying(255),
    "max_tokens" integer DEFAULT 4096 NOT NULL,
    "temperature" double precision DEFAULT 0.7 NOT NULL,
    "rate_limit_enabled" boolean DEFAULT true NOT NULL,
    "rate_limit_per_minute" integer DEFAULT 60 NOT NULL,
    "content_filtering_enabled" boolean DEFAULT true NOT NULL,
    "logging_enabled" boolean DEFAULT true NOT NULL,
    "status" character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    "endpoint_url" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."private_ai_instances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "ended_at" timestamp with time zone,
    "duration" integer,
    "ip_address" "text",
    "user_agent" "text"
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "subscription_id" "uuid",
    "price_id" "text",
    "quantity" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."subscription_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_plans" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "description" "text",
    "price_monthly" numeric(10,2) NOT NULL,
    "price_annual" numeric(10,2) NOT NULL,
    "features" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "is_popular" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "bedrock_model_id" "text" DEFAULT 'amazon.titan-text-lite-v1'::"text",
    "has_trial" boolean DEFAULT false,
    "trial_days" integer DEFAULT 0,
    "message_limit" integer DEFAULT 1000,
    "has_overage" boolean DEFAULT false,
    "overage_rate" numeric(10,5) DEFAULT 0.00
);


ALTER TABLE "public"."subscription_plans" OWNER TO "postgres";


COMMENT ON TABLE "public"."subscription_plans" IS 'Subscription plans with Bedrock model associations and pricing details';



COMMENT ON COLUMN "public"."subscription_plans"."bedrock_model_id" IS 'AWS Bedrock model ID assigned to this plan';



COMMENT ON COLUMN "public"."subscription_plans"."has_trial" IS 'Whether this plan offers a free trial';



COMMENT ON COLUMN "public"."subscription_plans"."trial_days" IS 'Number of days in the free trial period';



COMMENT ON COLUMN "public"."subscription_plans"."message_limit" IS 'Monthly message limit for this plan';



COMMENT ON COLUMN "public"."subscription_plans"."has_overage" IS 'Whether overage pricing is enabled for this plan';



COMMENT ON COLUMN "public"."subscription_plans"."overage_rate" IS 'Per-1000 token rate for overage pricing';



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "status" "text" NOT NULL,
    "plan_id" "text",
    "price_id" "text",
    "quantity" integer DEFAULT 1,
    "cancel_at_period_end" boolean DEFAULT false,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "ended_at" timestamp with time zone,
    "cancel_at" timestamp with time zone,
    "canceled_at" timestamp with time zone,
    "trial_start" timestamp with time zone,
    "trial_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "billing_cycle" "text",
    CONSTRAINT "subscriptions_billing_cycle_check" CHECK (("billing_cycle" = ANY (ARRAY['monthly'::"text", 'yearly'::"text"])))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_ai_instance_access" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "team_member_id" "uuid" NOT NULL,
    "ai_instance_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."team_ai_instance_access" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" NOT NULL,
    "token" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval) NOT NULL,
    CONSTRAINT "team_invitations_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'member'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."team_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ai_instance_access" "text"[] DEFAULT '{}'::"text"[],
    CONSTRAINT "team_members_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'member'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "settings" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."test_model_responses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tier" "text" NOT NULL,
    "model_id" "text" NOT NULL,
    "latency" integer NOT NULL,
    "tokens_used" integer NOT NULL,
    "response_preview" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."test_model_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_document_tags" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."training_document_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_documents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "file_path" "text",
    "file_type" "text",
    "file_size" integer,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."training_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_statistics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "instance_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "requests_count" integer DEFAULT 0 NOT NULL,
    "tokens_used" integer DEFAULT 0 NOT NULL,
    "avg_response_time_ms" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."usage_statistics" OWNER TO "postgres";


ALTER TABLE ONLY "public"."bedrock_instances" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."bedrock_instances_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."bedrock_usage" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."bedrock_usage_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."agent_ratings"
    ADD CONSTRAINT "agent_ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_instances"
    ADD CONSTRAINT "ai_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_metrics"
    ADD CONSTRAINT "ai_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics"
    ADD CONSTRAINT "analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_keys"
    ADD CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_requests"
    ADD CONSTRAINT "api_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_usage"
    ADD CONSTRAINT "api_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bedrock_credentials"
    ADD CONSTRAINT "bedrock_credentials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bedrock_instances"
    ADD CONSTRAINT "bedrock_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bedrock_usage"
    ADD CONSTRAINT "bedrock_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_chunks"
    ADD CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_tag_relations"
    ADD CONSTRAINT "document_tag_relations_document_id_tag_id_key" UNIQUE ("document_id", "tag_id");



ALTER TABLE ONLY "public"."document_tag_relations"
    ADD CONSTRAINT "document_tag_relations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moderation_metrics"
    ADD CONSTRAINT "moderation_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."private_ai_instances"
    ADD CONSTRAINT "private_ai_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_items"
    ADD CONSTRAINT "subscription_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_plans"
    ADD CONSTRAINT "subscription_plans_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."subscription_plans"
    ADD CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_ai_instance_access"
    ADD CONSTRAINT "team_ai_instance_access_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_ai_instance_access"
    ADD CONSTRAINT "team_ai_instance_access_team_member_id_ai_instance_id_key" UNIQUE ("team_member_id", "ai_instance_id");



ALTER TABLE ONLY "public"."team_invitations"
    ADD CONSTRAINT "team_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_invitations"
    ADD CONSTRAINT "team_invitations_team_id_email_key" UNIQUE ("team_id", "email");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_user_id_key" UNIQUE ("team_id", "user_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test_model_responses"
    ADD CONSTRAINT "test_model_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training_document_tags"
    ADD CONSTRAINT "training_document_tags_name_user_id_key" UNIQUE ("name", "user_id");



ALTER TABLE ONLY "public"."training_document_tags"
    ADD CONSTRAINT "training_document_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training_documents"
    ADD CONSTRAINT "training_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bedrock_credentials"
    ADD CONSTRAINT "unique_user_credentials" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."usage_statistics"
    ADD CONSTRAINT "usage_statistics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usage_statistics"
    ADD CONSTRAINT "usage_statistics_user_id_instance_id_date_key" UNIQUE ("user_id", "instance_id", "date");



CREATE INDEX "bedrock_instances_instance_id_idx" ON "public"."bedrock_instances" USING "btree" ("instance_id");



CREATE INDEX "document_tag_relations_document_id_idx" ON "public"."document_tag_relations" USING "btree" ("document_id");



CREATE INDEX "document_tag_relations_tag_id_idx" ON "public"."document_tag_relations" USING "btree" ("tag_id");



CREATE INDEX "idx_invoices_subscription_id" ON "public"."invoices" USING "btree" ("subscription_id");



CREATE INDEX "idx_invoices_user_id" ON "public"."invoices" USING "btree" ("user_id");



CREATE INDEX "idx_messages_agent_id" ON "public"."messages" USING "btree" ("agent_id");



CREATE INDEX "idx_payment_methods_user_id" ON "public"."payment_methods" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_id" ON "public"."profiles" USING "btree" ("id");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_profiles_status" ON "public"."profiles" USING "btree" ("status");



CREATE INDEX "idx_profiles_user_id" ON "public"."profiles" USING "btree" ("id");



CREATE INDEX "idx_subscriptions_plan_id" ON "public"."subscriptions" USING "btree" ("plan_id");



CREATE INDEX "idx_subscriptions_user_id" ON "public"."subscriptions" USING "btree" ("user_id");



CREATE INDEX "training_documents_user_id_idx" ON "public"."training_documents" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."bedrock_credentials" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_bedrock_instances_modtime" BEFORE UPDATE ON "public"."bedrock_instances" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_team_members_updated_at" BEFORE UPDATE ON "public"."team_members" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_teams_updated_at" BEFORE UPDATE ON "public"."teams" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_test_model_responses_updated_at" BEFORE UPDATE ON "public"."test_model_responses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



ALTER TABLE ONLY "public"."agent_ratings"
    ADD CONSTRAINT "agent_ratings_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_ratings"
    ADD CONSTRAINT "agent_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_instances"
    ADD CONSTRAINT "ai_instances_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_keys"
    ADD CONSTRAINT "api_keys_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "public"."private_ai_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_keys"
    ADD CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_requests"
    ADD CONSTRAINT "api_requests_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."api_requests"
    ADD CONSTRAINT "api_requests_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "public"."private_ai_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_requests"
    ADD CONSTRAINT "api_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_usage"
    ADD CONSTRAINT "api_usage_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."api_usage"
    ADD CONSTRAINT "api_usage_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "public"."private_ai_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_usage"
    ADD CONSTRAINT "api_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bedrock_credentials"
    ADD CONSTRAINT "bedrock_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bedrock_usage"
    ADD CONSTRAINT "bedrock_usage_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "public"."bedrock_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_chunks"
    ADD CONSTRAINT "document_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_tag_relations"
    ADD CONSTRAINT "document_tag_relations_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."training_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_tag_relations"
    ADD CONSTRAINT "document_tag_relations_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."training_document_tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."private_ai_instances"
    ADD CONSTRAINT "private_ai_instances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscription_items"
    ADD CONSTRAINT "subscription_items_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_ai_instance_access"
    ADD CONSTRAINT "team_ai_instance_access_ai_instance_id_fkey" FOREIGN KEY ("ai_instance_id") REFERENCES "public"."ai_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_ai_instance_access"
    ADD CONSTRAINT "team_ai_instance_access_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "public"."team_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_invitations"
    ADD CONSTRAINT "team_invitations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."training_document_tags"
    ADD CONSTRAINT "training_document_tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."training_documents"
    ADD CONSTRAINT "training_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usage_statistics"
    ADD CONSTRAINT "usage_statistics_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "public"."private_ai_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usage_statistics"
    ADD CONSTRAINT "usage_statistics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin users can manage all invoices" ON "public"."invoices" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admin users can manage all subscriptions" ON "public"."subscriptions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admin users can view all invoices" ON "public"."invoices" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admin users can view all payment methods" ON "public"."payment_methods" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can access agents" ON "public"."agents" USING ((("auth"."jwt"() ? 'role'::"text") AND (("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Admins can insert test responses" ON "public"."test_model_responses" FOR INSERT WITH CHECK ((("auth"."jwt"() ? 'role'::"text") AND (("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Admins can read AI metrics" ON "public"."ai_metrics" FOR SELECT TO "authenticated" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admins can read all agent ratings" ON "public"."agent_ratings" FOR SELECT TO "authenticated" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admins can read all sessions" ON "public"."sessions" FOR SELECT TO "authenticated" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admins can read analytics" ON "public"."analytics" FOR SELECT TO "authenticated" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admins can read moderation metrics" ON "public"."moderation_metrics" FOR SELECT TO "authenticated" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admins can view all test responses" ON "public"."test_model_responses" FOR SELECT USING ((("auth"."jwt"() ? 'role'::"text") AND (("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Allow all users to read subscription plans" ON "public"."subscription_plans" FOR SELECT USING (true);



CREATE POLICY "Conversations are viewable by users who created them" ON "public"."conversations" FOR SELECT USING (true);



CREATE POLICY "Document chunks are viewable by users who created them" ON "public"."document_chunks" FOR SELECT USING (true);



CREATE POLICY "Documents are viewable by users who created them" ON "public"."documents" FOR SELECT USING (true);



CREATE POLICY "Enable full access for service role" ON "public"."bedrock_instances" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Enable read access for all authenticated users" ON "public"."bedrock_instances" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Members can view their access" ON "public"."team_ai_instance_access" FOR SELECT USING (("team_member_id" IN ( SELECT "team_members"."id"
   FROM "public"."team_members"
  WHERE ("team_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Messages are viewable by users who created them" ON "public"."messages" FOR SELECT USING (true);



CREATE POLICY "Plans are editable by admins" ON "public"."plans" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Plans are viewable by authenticated users" ON "public"."plans" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Service role can manage all subscriptions" ON "public"."subscriptions" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Super admins can access all credentials" ON "public"."bedrock_credentials" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ((("users"."email")::"text" = 'josef@holm.com'::"text") OR (("users"."email")::"text" ~~ '%@akii.com'::"text") OR (("users"."email")::"text" ~~ '%@akii.ai'::"text"))))));



CREATE POLICY "System can insert API usage" ON "public"."api_usage" FOR INSERT WITH CHECK (true);



CREATE POLICY "Team admins can create invitations" ON "public"."team_invitations" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "team_invitations"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = 'admin'::"text")))));



CREATE POLICY "Team admins can delete invitations" ON "public"."team_invitations" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "team_invitations"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = 'admin'::"text")))));



CREATE POLICY "Team admins can delete members" ON "public"."team_members" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "team_members"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = 'admin'::"text")))));



CREATE POLICY "Team admins can insert new members" ON "public"."team_members" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "team_members"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = 'admin'::"text")))));



CREATE POLICY "Team admins can manage invitations" ON "public"."team_invitations" USING (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = 'admin'::"text")))));



CREATE POLICY "Team admins can manage members" ON "public"."team_members" USING (("team_id" IN ( SELECT "team_members_1"."team_id"
   FROM "public"."team_members" "team_members_1"
  WHERE (("team_members_1"."user_id" = "auth"."uid"()) AND ("team_members_1"."role" = 'admin'::"text")))));



CREATE POLICY "Team admins can update members" ON "public"."team_members" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "team_members"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = 'admin'::"text")))));



CREATE POLICY "Team admins can update their teams" ON "public"."teams" FOR UPDATE USING (("id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = 'admin'::"text")))));



CREATE POLICY "Team admins can view invitations" ON "public"."team_invitations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "team_invitations"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = 'admin'::"text")))));



CREATE POLICY "Team members can view instances" ON "public"."ai_instances" FOR SELECT USING (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE ("team_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Team members can view other members in their teams" ON "public"."team_members" FOR SELECT USING (("team_id" IN ( SELECT "team_members_1"."team_id"
   FROM "public"."team_members" "team_members_1"
  WHERE ("team_members_1"."user_id" = "auth"."uid"()))));



CREATE POLICY "Team members can view their team members" ON "public"."team_members" FOR SELECT USING (("team_id" IN ( SELECT "team_members_1"."team_id"
   FROM "public"."team_members" "team_members_1"
  WHERE ("team_members_1"."user_id" = "auth"."uid"()))));



CREATE POLICY "Team members can view their teams" ON "public"."teams" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members"
  WHERE (("team_members"."team_id" = "teams"."id") AND ("team_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Team owners can delete their teams" ON "public"."teams" FOR DELETE USING (("owner_id" = "auth"."uid"()));



CREATE POLICY "Team owners can manage access" ON "public"."team_ai_instance_access" USING ((EXISTS ( SELECT 1
   FROM ("public"."team_members" "tm1"
     JOIN "public"."team_members" "tm2" ON (("tm1"."team_id" = "tm2"."team_id")))
  WHERE (("tm1"."user_id" = "auth"."uid"()) AND ("tm1"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"])) AND ("tm2"."id" = "team_ai_instance_access"."team_member_id")))));



CREATE POLICY "Team owners can manage instances" ON "public"."ai_instances" USING (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Team owners can update their teams" ON "public"."teams" FOR UPDATE USING (("owner_id" = "auth"."uid"()));



CREATE POLICY "Users can access their own credentials" ON "public"."bedrock_credentials" TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create agent ratings" ON "public"."agent_ratings" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own API keys" ON "public"."api_keys" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own private AI instances" ON "public"."private_ai_instances" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own API keys" ON "public"."api_keys" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own document tag relations" ON "public"."document_tag_relations" FOR DELETE USING (("document_id" IN ( SELECT "training_documents"."id"
   FROM "public"."training_documents"
  WHERE ("training_documents"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can delete their own document tags" ON "public"."training_document_tags" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own documents" ON "public"."training_documents" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own instances" ON "public"."bedrock_instances" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own private AI instances" ON "public"."private_ai_instances" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own API keys" ON "public"."api_keys" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own API requests" ON "public"."api_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own document tag relations" ON "public"."document_tag_relations" FOR INSERT WITH CHECK (("document_id" IN ( SELECT "training_documents"."id"
   FROM "public"."training_documents"
  WHERE ("training_documents"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert their own document tags" ON "public"."training_document_tags" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can insert their own documents" ON "public"."training_documents" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can insert their own instances" ON "public"."bedrock_instances" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can insert their own private AI instances" ON "public"."private_ai_instances" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own usage" ON "public"."bedrock_usage" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can insert their own usage statistics" ON "public"."usage_statistics" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own payment methods" ON "public"."payment_methods" TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read their own agent ratings" ON "public"."agent_ratings" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their own sessions" ON "public"."sessions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own API keys" ON "public"."api_keys" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own document tags" ON "public"."training_document_tags" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own documents" ON "public"."training_documents" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own instances" ON "public"."bedrock_instances" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own private AI instances" ON "public"."private_ai_instances" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own subscriptions" ON "public"."subscriptions" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own usage statistics" ON "public"."usage_statistics" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view invitations sent to their email" ON "public"."team_invitations" FOR SELECT USING (("email" = (( SELECT "users"."email"
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())))::"text"));



CREATE POLICY "Users can view members of their teams" ON "public"."team_members" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "team_members"."team_id") AND ("tm"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own API keys" ON "public"."api_keys" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own API requests" ON "public"."api_requests" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own API usage" ON "public"."api_usage" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own document tag relations" ON "public"."document_tag_relations" FOR SELECT USING (("document_id" IN ( SELECT "training_documents"."id"
   FROM "public"."training_documents"
  WHERE ("training_documents"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own document tags" ON "public"."training_document_tags" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own documents" ON "public"."training_documents" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own instances" ON "public"."bedrock_instances" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own invoices" ON "public"."invoices" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own membership" ON "public"."team_members" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own payment methods" ON "public"."payment_methods" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own private AI instances" ON "public"."private_ai_instances" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own subscription" ON "public"."subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own subscription items" ON "public"."subscription_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."subscriptions" "s"
  WHERE (("s"."id" = "subscription_items"."subscription_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own subscriptions" ON "public"."subscriptions" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can view their own usage" ON "public"."bedrock_usage" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own usage statistics" ON "public"."usage_statistics" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their teams" ON "public"."teams" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members"
  WHERE (("team_members"."team_id" = "teams"."id") AND ("team_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "admin_insert_all_profiles" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_read_all_profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_update_all_profiles" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



ALTER TABLE "public"."agent_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_keys" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_usage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bedrock_credentials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bedrock_instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bedrock_usage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_chunks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_tag_relations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_own_profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."moderation_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_methods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."private_ai_instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "service_role_all_access" ON "public"."profiles" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_ai_instance_access" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."test_model_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."training_document_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."training_documents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update_own_profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."usage_statistics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "view_own_profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid")));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."agent_ratings";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."ai_instances";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."ai_metrics";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."analytics";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."api_keys";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."conversations";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."document_chunks";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."document_tag_relations";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."documents";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."moderation_metrics";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."private_ai_instances";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."profiles";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."sessions";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."subscription_items";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."subscription_plans";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."subscriptions";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."team_ai_instance_access";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."team_invitations";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."team_members";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."teams";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."test_model_responses";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."training_document_tags";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."training_documents";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."usage_statistics";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";










































































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."check_table_exists"("table_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_table_exists"("table_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_table_exists"("table_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_tables_exist"("table_names" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."check_tables_exist"("table_names" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_tables_exist"("table_names" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_ai_instances_table_if_not_exists"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_ai_instances_table_if_not_exists"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_ai_instances_table_if_not_exists"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_team_ai_instance_access_table_if_not_exists"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_team_ai_instance_access_table_if_not_exists"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_team_ai_instance_access_table_if_not_exists"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_team_members_table_if_not_exists"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_team_members_table_if_not_exists"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_team_members_table_if_not_exists"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_teams_table_if_not_exists"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_teams_table_if_not_exists"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_teams_table_if_not_exists"() TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT UPDATE("email") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("company") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("updated_at") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("first_name") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("last_name") ON TABLE "public"."profiles" TO "authenticated";



GRANT ALL ON FUNCTION "public"."ensure_profile_exists"("profile_id" "uuid", "user_email" "text", "user_role" "text", "user_status" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_profile_exists"("profile_id" "uuid", "user_email" "text", "user_role" "text", "user_status" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_profile_exists"("profile_id" "uuid", "user_email" "text", "user_role" "text", "user_status" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profile_by_id"("profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_by_id"("profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_by_id"("profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_bedrock_usage"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_bedrock_usage"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_bedrock_usage"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."profile_exists"("profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."profile_exists"("profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."profile_exists"("profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_teams"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_teams"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_teams"() TO "service_role";






























GRANT ALL ON TABLE "public"."agent_ratings" TO "anon";
GRANT ALL ON TABLE "public"."agent_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_ratings" TO "service_role";



GRANT ALL ON TABLE "public"."agents" TO "anon";
GRANT ALL ON TABLE "public"."agents" TO "authenticated";
GRANT ALL ON TABLE "public"."agents" TO "service_role";



GRANT ALL ON TABLE "public"."ai_instances" TO "anon";
GRANT ALL ON TABLE "public"."ai_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_instances" TO "service_role";



GRANT ALL ON TABLE "public"."ai_metrics" TO "anon";
GRANT ALL ON TABLE "public"."ai_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."analytics" TO "anon";
GRANT ALL ON TABLE "public"."analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics" TO "service_role";



GRANT ALL ON TABLE "public"."api_keys" TO "anon";
GRANT ALL ON TABLE "public"."api_keys" TO "authenticated";
GRANT ALL ON TABLE "public"."api_keys" TO "service_role";



GRANT ALL ON TABLE "public"."api_requests" TO "anon";
GRANT ALL ON TABLE "public"."api_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."api_requests" TO "service_role";



GRANT ALL ON TABLE "public"."api_usage" TO "anon";
GRANT ALL ON TABLE "public"."api_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."api_usage" TO "service_role";



GRANT ALL ON TABLE "public"."bedrock_credentials" TO "anon";
GRANT ALL ON TABLE "public"."bedrock_credentials" TO "authenticated";
GRANT ALL ON TABLE "public"."bedrock_credentials" TO "service_role";



GRANT ALL ON TABLE "public"."bedrock_instances" TO "anon";
GRANT ALL ON TABLE "public"."bedrock_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."bedrock_instances" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bedrock_instances_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bedrock_instances_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bedrock_instances_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bedrock_usage" TO "anon";
GRANT ALL ON TABLE "public"."bedrock_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."bedrock_usage" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bedrock_usage_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bedrock_usage_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bedrock_usage_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."document_chunks" TO "anon";
GRANT ALL ON TABLE "public"."document_chunks" TO "authenticated";
GRANT ALL ON TABLE "public"."document_chunks" TO "service_role";



GRANT ALL ON TABLE "public"."document_tag_relations" TO "anon";
GRANT ALL ON TABLE "public"."document_tag_relations" TO "authenticated";
GRANT ALL ON TABLE "public"."document_tag_relations" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."moderation_metrics" TO "anon";
GRANT ALL ON TABLE "public"."moderation_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."moderation_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."payment_methods" TO "anon";
GRANT ALL ON TABLE "public"."payment_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_methods" TO "service_role";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



GRANT ALL ON TABLE "public"."private_ai_instances" TO "anon";
GRANT ALL ON TABLE "public"."private_ai_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."private_ai_instances" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_items" TO "anon";
GRANT ALL ON TABLE "public"."subscription_items" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_items" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_plans" TO "anon";
GRANT ALL ON TABLE "public"."subscription_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_plans" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."team_ai_instance_access" TO "anon";
GRANT ALL ON TABLE "public"."team_ai_instance_access" TO "authenticated";
GRANT ALL ON TABLE "public"."team_ai_instance_access" TO "service_role";



GRANT ALL ON TABLE "public"."team_invitations" TO "anon";
GRANT ALL ON TABLE "public"."team_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."team_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."test_model_responses" TO "anon";
GRANT ALL ON TABLE "public"."test_model_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."test_model_responses" TO "service_role";



GRANT ALL ON TABLE "public"."training_document_tags" TO "anon";
GRANT ALL ON TABLE "public"."training_document_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."training_document_tags" TO "service_role";



GRANT ALL ON TABLE "public"."training_documents" TO "anon";
GRANT ALL ON TABLE "public"."training_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."training_documents" TO "service_role";



GRANT ALL ON TABLE "public"."usage_statistics" TO "anon";
GRANT ALL ON TABLE "public"."usage_statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_statistics" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;

-- Add this at the end of the file

-- Add is_admin field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add address fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address1 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address2 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Add comment for the is_admin column
COMMENT ON COLUMN public.profiles.is_admin IS 'Indicates if the user has admin privileges';
COMMENT ON COLUMN public.profiles.address1 IS 'Primary address line';
COMMENT ON COLUMN public.profiles.address2 IS 'Secondary address line (apt, suite, etc.)';
COMMENT ON COLUMN public.profiles.city IS 'City';
COMMENT ON COLUMN public.profiles.state IS 'State or province';
COMMENT ON COLUMN public.profiles.zip IS 'Postal/ZIP code';
COMMENT ON COLUMN public.profiles.country IS 'Country';

-- Update admin status for users with admin role
UPDATE public.profiles
SET is_admin = true
WHERE role = 'admin' AND (is_admin IS NULL OR is_admin = false);
