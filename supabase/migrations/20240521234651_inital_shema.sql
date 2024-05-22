create extension if not exists "http" with schema "extensions";


CREATE OR REPLACE FUNCTION auth.tenant_id()
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN (
    SELECT (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'tenant_id')::uuid
  );
END;
$function$
;


set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.current_profile_project_ids()
 RETURNS TABLE(project_id uuid)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY 
  SELECT
    project_id
  FROM
    project_assignment
  WHERE
    profile_id = auth.uid();
END;
$function$
;


CREATE OR REPLACE FUNCTION public.generate_random_key(prefix text, key_length integer)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  characters text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result text := '';
  i int := 1;
BEGIN
  -- Generate the random part
  IF key_length > 0 THEN
    WHILE i <= key_length LOOP
      result := result || substr(characters, (floor(random() * char_length(characters)) + 1)::int, 1);
      i := i + 1;
    END LOOP;
  END IF;
  RETURN prefix || '_' || result;
END;
$function$
;


CREATE OR REPLACE FUNCTION public.get_users_in_project(project_id_param uuid)
 RETURNS TABLE(profile_id uuid)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY 
  SELECT
    p.id
  FROM
    profile p
  JOIN
    project_assignment pa ON p.id = pa.profile_id
  WHERE
    pa.project_id = project_id_param;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$

BEGIN
  INSERT INTO public.profile (
    id, 
    email, 
    email_confirmed_at, 
    invited_at,
    display_name,
    tenant_id
  )
  VALUES (
    new.id, 
    new.email, 
    new.email_confirmed_at, 
    new.invited_at,
    COALESCE(
      new.raw_user_meta_data->>'name', 
      SPLIT_PART(new.email, '@', 1)
    ),
    (new.raw_user_meta_data->>'tenant_id')::uuid
  );
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_user_assigned_to_project(project_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM project_assignment
    WHERE project_assignment.project_id = project_id_param
    AND project_assignment.profile_id = auth.uid()
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.process_new_contract_row()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    request_id bigint;
BEGIN
    -- Make the HTTP POST request
    request_id := net.http_post(
        url := 'https://xjedm27xqhz6bycbmrdwr4n2ve0ywpli.lambda-url.us-west-2.on.aws/',
        body := json_build_object('contractId', NEW.id)::jsonb,
        timeout_milliseconds := 15000 -- 15 seconds
    );

    -- You can log the request ID or perform other actions as needed
    RAISE NOTICE 'Request ID: %', request_id;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.process_project_file_deletion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Delete the corresponding record from the 'contract' table where id matches
    DELETE FROM public.contract WHERE id = OLD.id;

    RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.process_project_file_upload()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$DECLARE
    file_path TEXT;
    bucket_name UUID;
    project_id UUID;
    display_name TEXT;
  
BEGIN
    -- Extract file path and bucket name from the new row
    file_path := NEW.name;
    bucket_name := NEW.bucket_id;

    -- Check if the file path is in the correct format (under 'project' folder)
    IF file_path LIKE 'projects/%' THEN
        project_id := (string_to_array(file_path, '/'))[2]::uuid;
        display_name := (string_to_array(file_path, '/'))[array_upper(string_to_array(file_path, '/'), 1)];

        -- Insert into the contract table, using the id from storage.objects
        INSERT INTO public.contract (id, project_id, tenant_id, display_name, created_at, path_tokens, name)
        VALUES (NEW.id, project_id, bucket_name, display_name, NEW.created_at, NEW.path_tokens, NEW.name);

      
    END IF;

    RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.random_color()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  hex_chars CHAR[] := ARRAY['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
  color TEXT := '#';
BEGIN
  FOR i IN 1..6 LOOP
    color := color || hex_chars[1 + floor(random() * 16)];
  END LOOP;
  RETURN color;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.user_tenant_owns_contract(contract_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    -- Variable to store the result
    owns_contract BOOLEAN;
BEGIN
    -- Check if there exists a contract with the given contract_id that belongs to the current user's tenant
    SELECT EXISTS(
        SELECT 1
        FROM contract
        WHERE id = contract_id
        AND tenant_id =  auth.tenant_id()
    ) INTO owns_contract;

    -- Return the result
    RETURN owns_contract;
END;
$function$
;

create sequence "public"."job_queue_id_seq";

create table "public"."annotation" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "contract_id" uuid not null,
    "text" text not null,
    "position" jsonb not null,
    "parslet_id" uuid,
    "tenant_id" uuid default  auth.tenant_id(),
    "formatter_key" text,
    "formatter_item_id" smallint,
    "is_user" boolean not null default true,
    "zextractor_id" uuid
);


alter table "public"."annotation" enable row level security;

create table "public"."contract" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "project_id" uuid not null,
    "assigned_to" uuid,
    "display_name" text,
    "tenant_id" uuid not null,
    "completed" boolean not null default false,
    "in_scope" boolean not null default true,
    "path_tokens" text[] not null default '{}'::text[],
    "name" text not null,
    "linified" boolean not null default false,
    "npages" smallint not null default '0'::smallint,
    "tag" text,
    "description" text,
    "target" text
);


alter table "public"."contract" enable row level security;

create table "public"."contract_job_queue" (
    "id" integer not null default nextval('job_queue_id_seq'::regclass),
    "job_type" text not null,
    "payload" jsonb,
    "status" text not null default 'pending'::text,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now(),
    "contract_id" uuid not null
);


alter table "public"."contract_job_queue" enable row level security;

create table "public"."contract_line" (
    "contract_id" uuid not null,
    "text" text not null default ''::text,
    "page" integer not null default 0,
    "x1" real not null default '0'::real,
    "y2" real not null default '0'::real,
    "x2" real not null default '0'::real,
    "y1" real not null default '0'::real,
    "x_scale" real not null default '1'::real,
    "id" integer not null,
    "page_width" real not null default '0'::real,
    "page_height" real not null default '0'::real,
    "ntokens" integer not null default '-1'::integer,
    "y" real
);


alter table "public"."contract_line" enable row level security;

create table "public"."extract_jobs" (
    "updated_at" timestamp with time zone not null default now(),
    "contract_id" uuid not null default gen_random_uuid(),
    "parslet_id" uuid not null default gen_random_uuid(),
    "status" text not null default 'pending'::text
);


create table "public"."format_jobs" (
    "contract_id" uuid not null default gen_random_uuid(),
    "formatter_key" text not null,
    "updated_at" timestamp with time zone not null,
    "status" text not null default 'pending'::text
);


create table "public"."formatted_info" (
    "created_at" timestamp with time zone not null default now(),
    "contract_id" uuid not null default gen_random_uuid(),
    "formatter_key" text not null default ''::text,
    "data" jsonb,
    "id" smallint not null default '0'::smallint
);


alter table "public"."formatted_info" enable row level security;

create table "public"."formatter_dependencies" (
    "formatter_key" text not null,
    "extractor_id" uuid not null default gen_random_uuid()
);


alter table "public"."formatter_dependencies" enable row level security;

create table "public"."formatters" (
    "key" text not null default ''::text,
    "display_name" text not null,
    "priority" smallint not null default '100'::smallint,
    "hitems" boolean not null default true
);


alter table "public"."formatters" enable row level security;

create table "public"."line_ref" (
    "contract_id" uuid not null,
    "line_id" integer not null,
    "formatter_key" text,
    "extractor_key" text
);


create table "public"."parslet" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "display_name" text not null default ''::text,
    "instruction" text not null default ''::text,
    "schema" text default ''::text,
    "examples" text[] not null default '{}'::text[],
    "order" smallint not null default '20'::smallint,
    "key" text not null default ''::text
);


alter table "public"."parslet" enable row level security;

create table "public"."profile" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "display_name" text default '''"user"''::text'::text,
    "email" text not null,
    "avatar_url" text,
    "color" text not null default random_color(),
    "email_confirmed_at" timestamp with time zone,
    "invited_at" timestamp with time zone,
    "tenant_id" uuid
);


alter table "public"."profile" enable row level security;

create table "public"."project" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "tenant_id" uuid not null,
    "display_name" text,
    "deal_structure" text not null,
    "client" text not null,
    "counterparty" text not null,
    "target" text not null,
    "phase_deadline" date not null,
    "is_active" boolean not null default true
);


alter table "public"."project" enable row level security;

create table "public"."project_assignment" (
    "project_id" uuid not null,
    "profile_id" uuid not null
);


create table "public"."tenant" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null
);


alter table "public"."tenant" enable row level security;

create table "public"."zuva_dependencies" (
    "formatter_key" text not null,
    "zextractor_key" text not null default gen_random_uuid()
);


create table "public"."zuva_extraction_job" (
    "request_id" text not null,
    "status" text not null,
    "file_id" text not null,
    "contract_id" uuid not null
);


alter table "public"."zuva_extraction_job" enable row level security;

create table "public"."zuva_extractors" (
    "id" uuid not null default gen_random_uuid(),
    "display_name" text not null,
    "key" text not null
);


create table "public"."zuva_file" (
    "id" text not null,
    "expiration" timestamp with time zone not null default now(),
    "contract_id" uuid not null default gen_random_uuid()
);


alter table "public"."zuva_file" enable row level security;

alter sequence "public"."job_queue_id_seq" owned by "public"."contract_job_queue"."id";

CREATE UNIQUE INDEX annotation_pkey ON public.annotation USING btree (id);

CREATE UNIQUE INDEX contract_line_pkey ON public.contract_line USING btree (contract_id, id);

CREATE UNIQUE INDEX contract_pkey ON public.contract USING btree (id);

CREATE UNIQUE INDEX extract_jobs_pkey ON public.extract_jobs USING btree (contract_id, parslet_id);

CREATE UNIQUE INDEX format_jobs_pkey ON public.format_jobs USING btree (contract_id, formatter_key);

CREATE UNIQUE INDEX formatted_info_pkey ON public.formatted_info USING btree (contract_id, formatter_key, id);

CREATE UNIQUE INDEX formatter_dependencies_pkey ON public.formatter_dependencies USING btree (formatter_key, extractor_id);

CREATE UNIQUE INDEX formatters_key_key ON public.formatters USING btree (key);

CREATE UNIQUE INDEX formatters_pkey ON public.formatters USING btree (key);

CREATE UNIQUE INDEX job_queue_pkey ON public.contract_job_queue USING btree (id);

CREATE UNIQUE INDEX parslet_key_key ON public.parslet USING btree (key);

CREATE UNIQUE INDEX parslet_pkey ON public.parslet USING btree (id);

CREATE UNIQUE INDEX profile_email_key ON public.profile USING btree (email);

CREATE UNIQUE INDEX profile_pkey ON public.profile USING btree (id);

CREATE UNIQUE INDEX project_assignment_pkey ON public.project_assignment USING btree (project_id, profile_id);

CREATE UNIQUE INDEX project_pkey ON public.project USING btree (id);

CREATE UNIQUE INDEX tenant_pkey ON public.tenant USING btree (id);

CREATE UNIQUE INDEX unique_line ON public.contract_line USING btree (contract_id, page, y2, x1);

CREATE UNIQUE INDEX zuva_dependencies_pkey ON public.zuva_dependencies USING btree (formatter_key);

CREATE UNIQUE INDEX zuva_extraction_pkey ON public.zuva_extraction_job USING btree (request_id);

CREATE UNIQUE INDEX zuva_extractors_key_key ON public.zuva_extractors USING btree (key);

CREATE UNIQUE INDEX zuva_extractors_pkey ON public.zuva_extractors USING btree (id);

CREATE UNIQUE INDEX zuva_file_pkey ON public.zuva_file USING btree (id);

alter table "public"."annotation" add constraint "annotation_pkey" PRIMARY KEY using index "annotation_pkey";

alter table "public"."contract" add constraint "contract_pkey" PRIMARY KEY using index "contract_pkey";

alter table "public"."contract_job_queue" add constraint "job_queue_pkey" PRIMARY KEY using index "job_queue_pkey";

alter table "public"."contract_line" add constraint "contract_line_pkey" PRIMARY KEY using index "contract_line_pkey";

alter table "public"."extract_jobs" add constraint "extract_jobs_pkey" PRIMARY KEY using index "extract_jobs_pkey";

alter table "public"."format_jobs" add constraint "format_jobs_pkey" PRIMARY KEY using index "format_jobs_pkey";

alter table "public"."formatted_info" add constraint "formatted_info_pkey" PRIMARY KEY using index "formatted_info_pkey";

alter table "public"."formatter_dependencies" add constraint "formatter_dependencies_pkey" PRIMARY KEY using index "formatter_dependencies_pkey";

alter table "public"."formatters" add constraint "formatters_pkey" PRIMARY KEY using index "formatters_pkey";

alter table "public"."parslet" add constraint "parslet_pkey" PRIMARY KEY using index "parslet_pkey";

alter table "public"."profile" add constraint "profile_pkey" PRIMARY KEY using index "profile_pkey";

alter table "public"."project" add constraint "project_pkey" PRIMARY KEY using index "project_pkey";

alter table "public"."project_assignment" add constraint "project_assignment_pkey" PRIMARY KEY using index "project_assignment_pkey";

alter table "public"."tenant" add constraint "tenant_pkey" PRIMARY KEY using index "tenant_pkey";

alter table "public"."zuva_dependencies" add constraint "zuva_dependencies_pkey" PRIMARY KEY using index "zuva_dependencies_pkey";

alter table "public"."zuva_extraction_job" add constraint "zuva_extraction_pkey" PRIMARY KEY using index "zuva_extraction_pkey";

alter table "public"."zuva_extractors" add constraint "zuva_extractors_pkey" PRIMARY KEY using index "zuva_extractors_pkey";

alter table "public"."zuva_file" add constraint "zuva_file_pkey" PRIMARY KEY using index "zuva_file_pkey";

alter table "public"."annotation" add constraint "annotation_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contract(id) ON DELETE CASCADE not valid;

alter table "public"."annotation" validate constraint "annotation_contract_id_fkey";

alter table "public"."annotation" add constraint "annotation_formatted_info_fkey" FOREIGN KEY (contract_id, formatter_key, formatter_item_id) REFERENCES formatted_info(contract_id, formatter_key, id) not valid;

alter table "public"."annotation" validate constraint "annotation_formatted_info_fkey";

alter table "public"."annotation" add constraint "annotation_parslet_id_fkey" FOREIGN KEY (parslet_id) REFERENCES parslet(id) not valid;

alter table "public"."annotation" validate constraint "annotation_parslet_id_fkey";

alter table "public"."annotation" add constraint "annotation_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE not valid;

alter table "public"."annotation" validate constraint "annotation_tenant_id_fkey";

alter table "public"."annotation" add constraint "public_annotation_formatter_key_fkey" FOREIGN KEY (formatter_key) REFERENCES formatters(key) not valid;

alter table "public"."annotation" validate constraint "public_annotation_formatter_key_fkey";

alter table "public"."annotation" add constraint "public_annotation_zextractor_id_fkey" FOREIGN KEY (zextractor_id) REFERENCES zuva_extractors(id) not valid;

alter table "public"."annotation" validate constraint "public_annotation_zextractor_id_fkey";

alter table "public"."contract" add constraint "contract_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES profile(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."contract" validate constraint "contract_assigned_to_fkey";

alter table "public"."contract" add constraint "contract_project_id_fkey" FOREIGN KEY (project_id) REFERENCES project(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."contract" validate constraint "contract_project_id_fkey";

alter table "public"."contract_job_queue" add constraint "contract_job_queue_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contract(id) not valid;

alter table "public"."contract_job_queue" validate constraint "contract_job_queue_contract_id_fkey";

alter table "public"."contract_line" add constraint "contract_line_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contract(id) ON DELETE CASCADE not valid;

alter table "public"."contract_line" validate constraint "contract_line_contract_id_fkey";

alter table "public"."contract_line" add constraint "unique_line" UNIQUE using index "unique_line";

alter table "public"."extract_jobs" add constraint "public_extract_jobs_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contract(id) ON DELETE CASCADE not valid;

alter table "public"."extract_jobs" validate constraint "public_extract_jobs_contract_id_fkey";

alter table "public"."extract_jobs" add constraint "public_extract_jobs_extractor_id_fkey" FOREIGN KEY (parslet_id) REFERENCES parslet(id) not valid;

alter table "public"."extract_jobs" validate constraint "public_extract_jobs_extractor_id_fkey";

alter table "public"."format_jobs" add constraint "public_format_jobs_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contract(id) ON DELETE CASCADE not valid;

alter table "public"."format_jobs" validate constraint "public_format_jobs_contract_id_fkey";

alter table "public"."format_jobs" add constraint "public_format_jobs_formatter_key_fkey" FOREIGN KEY (formatter_key) REFERENCES formatters(key) not valid;

alter table "public"."format_jobs" validate constraint "public_format_jobs_formatter_key_fkey";

alter table "public"."formatted_info" add constraint "public_formats_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contract(id) ON DELETE CASCADE not valid;

alter table "public"."formatted_info" validate constraint "public_formats_contract_id_fkey";

alter table "public"."formatted_info" add constraint "public_formats_type_fkey" FOREIGN KEY (formatter_key) REFERENCES formatters(key) not valid;

alter table "public"."formatted_info" validate constraint "public_formats_type_fkey";

alter table "public"."formatter_dependencies" add constraint "public_formatter_dependencies_extractor_id_fkey" FOREIGN KEY (extractor_id) REFERENCES parslet(id) not valid;

alter table "public"."formatter_dependencies" validate constraint "public_formatter_dependencies_extractor_id_fkey";

alter table "public"."formatter_dependencies" add constraint "public_formatter_dependencies_formatter_key_fkey" FOREIGN KEY (formatter_key) REFERENCES formatters(key) not valid;

alter table "public"."formatter_dependencies" validate constraint "public_formatter_dependencies_formatter_key_fkey";

alter table "public"."formatters" add constraint "formatters_key_key" UNIQUE using index "formatters_key_key";

alter table "public"."line_ref" add constraint "line_ref_contract_line_fkey" FOREIGN KEY (contract_id, line_id) REFERENCES contract_line(contract_id, id) not valid;

alter table "public"."line_ref" validate constraint "line_ref_contract_line_fkey";

alter table "public"."line_ref" add constraint "public_line_extractions_formatter_key_fkey" FOREIGN KEY (formatter_key) REFERENCES formatters(key) not valid;

alter table "public"."line_ref" validate constraint "public_line_extractions_formatter_key_fkey";

alter table "public"."parslet" add constraint "parslet_key_key" UNIQUE using index "parslet_key_key";

alter table "public"."profile" add constraint "profile_email_key" UNIQUE using index "profile_email_key";

alter table "public"."profile" add constraint "profile_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profile" validate constraint "profile_id_fkey";

alter table "public"."profile" add constraint "public_profile_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES tenant(id) not valid;

alter table "public"."profile" validate constraint "public_profile_tenant_id_fkey";

alter table "public"."project" add constraint "project_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."project" validate constraint "project_tenant_id_fkey";

alter table "public"."project_assignment" add constraint "project_assignment_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profile(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."project_assignment" validate constraint "project_assignment_profile_id_fkey";

alter table "public"."project_assignment" add constraint "project_assignment_project_id_fkey" FOREIGN KEY (project_id) REFERENCES project(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."project_assignment" validate constraint "project_assignment_project_id_fkey";

alter table "public"."zuva_dependencies" add constraint "public_zuva_dependencies_formatter_key_fkey" FOREIGN KEY (formatter_key) REFERENCES formatters(key) not valid;

alter table "public"."zuva_dependencies" validate constraint "public_zuva_dependencies_formatter_key_fkey";

alter table "public"."zuva_dependencies" add constraint "public_zuva_dependencies_zextractor_id_fkey" FOREIGN KEY (zextractor_key) REFERENCES zuva_extractors(key) not valid;

alter table "public"."zuva_dependencies" validate constraint "public_zuva_dependencies_zextractor_id_fkey";

alter table "public"."zuva_extraction_job" add constraint "public_zuva_extraction_file_id_fkey" FOREIGN KEY (file_id) REFERENCES zuva_file(id) ON DELETE CASCADE not valid;

alter table "public"."zuva_extraction_job" validate constraint "public_zuva_extraction_file_id_fkey";

alter table "public"."zuva_extraction_job" add constraint "public_zuva_extraction_job_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contract(id) ON DELETE CASCADE not valid;

alter table "public"."zuva_extraction_job" validate constraint "public_zuva_extraction_job_contract_id_fkey";

alter table "public"."zuva_extractors" add constraint "zuva_extractors_key_key" UNIQUE using index "zuva_extractors_key_key";

alter table "public"."zuva_file" add constraint "public_zuva_file_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contract(id) ON DELETE CASCADE not valid;

alter table "public"."zuva_file" validate constraint "public_zuva_file_contract_id_fkey";



grant delete on table "public"."annotation" to "anon";

grant insert on table "public"."annotation" to "anon";

grant references on table "public"."annotation" to "anon";

grant select on table "public"."annotation" to "anon";

grant trigger on table "public"."annotation" to "anon";

grant truncate on table "public"."annotation" to "anon";

grant update on table "public"."annotation" to "anon";

grant delete on table "public"."annotation" to "authenticated";

grant insert on table "public"."annotation" to "authenticated";

grant references on table "public"."annotation" to "authenticated";

grant select on table "public"."annotation" to "authenticated";

grant trigger on table "public"."annotation" to "authenticated";

grant truncate on table "public"."annotation" to "authenticated";

grant update on table "public"."annotation" to "authenticated";

grant delete on table "public"."annotation" to "service_role";

grant insert on table "public"."annotation" to "service_role";

grant references on table "public"."annotation" to "service_role";

grant select on table "public"."annotation" to "service_role";

grant trigger on table "public"."annotation" to "service_role";

grant truncate on table "public"."annotation" to "service_role";

grant update on table "public"."annotation" to "service_role";

grant delete on table "public"."contract" to "anon";

grant insert on table "public"."contract" to "anon";

grant references on table "public"."contract" to "anon";

grant select on table "public"."contract" to "anon";

grant trigger on table "public"."contract" to "anon";

grant truncate on table "public"."contract" to "anon";

grant update on table "public"."contract" to "anon";

grant delete on table "public"."contract" to "authenticated";

grant insert on table "public"."contract" to "authenticated";

grant references on table "public"."contract" to "authenticated";

grant select on table "public"."contract" to "authenticated";

grant trigger on table "public"."contract" to "authenticated";

grant truncate on table "public"."contract" to "authenticated";

grant update on table "public"."contract" to "authenticated";

grant delete on table "public"."contract" to "service_role";

grant insert on table "public"."contract" to "service_role";

grant references on table "public"."contract" to "service_role";

grant select on table "public"."contract" to "service_role";

grant trigger on table "public"."contract" to "service_role";

grant truncate on table "public"."contract" to "service_role";

grant update on table "public"."contract" to "service_role";

grant delete on table "public"."contract_job_queue" to "anon";

grant insert on table "public"."contract_job_queue" to "anon";

grant references on table "public"."contract_job_queue" to "anon";

grant select on table "public"."contract_job_queue" to "anon";

grant trigger on table "public"."contract_job_queue" to "anon";

grant truncate on table "public"."contract_job_queue" to "anon";

grant update on table "public"."contract_job_queue" to "anon";

grant delete on table "public"."contract_job_queue" to "authenticated";

grant insert on table "public"."contract_job_queue" to "authenticated";

grant references on table "public"."contract_job_queue" to "authenticated";

grant select on table "public"."contract_job_queue" to "authenticated";

grant trigger on table "public"."contract_job_queue" to "authenticated";

grant truncate on table "public"."contract_job_queue" to "authenticated";

grant update on table "public"."contract_job_queue" to "authenticated";

grant delete on table "public"."contract_job_queue" to "service_role";

grant insert on table "public"."contract_job_queue" to "service_role";

grant references on table "public"."contract_job_queue" to "service_role";

grant select on table "public"."contract_job_queue" to "service_role";

grant trigger on table "public"."contract_job_queue" to "service_role";

grant truncate on table "public"."contract_job_queue" to "service_role";

grant update on table "public"."contract_job_queue" to "service_role";

grant delete on table "public"."contract_line" to "anon";

grant insert on table "public"."contract_line" to "anon";

grant references on table "public"."contract_line" to "anon";

grant select on table "public"."contract_line" to "anon";

grant trigger on table "public"."contract_line" to "anon";

grant truncate on table "public"."contract_line" to "anon";

grant update on table "public"."contract_line" to "anon";

grant delete on table "public"."contract_line" to "authenticated";

grant insert on table "public"."contract_line" to "authenticated";

grant references on table "public"."contract_line" to "authenticated";

grant select on table "public"."contract_line" to "authenticated";

grant trigger on table "public"."contract_line" to "authenticated";

grant truncate on table "public"."contract_line" to "authenticated";

grant update on table "public"."contract_line" to "authenticated";

grant delete on table "public"."contract_line" to "service_role";

grant insert on table "public"."contract_line" to "service_role";

grant references on table "public"."contract_line" to "service_role";

grant select on table "public"."contract_line" to "service_role";

grant trigger on table "public"."contract_line" to "service_role";

grant truncate on table "public"."contract_line" to "service_role";

grant update on table "public"."contract_line" to "service_role";

grant delete on table "public"."extract_jobs" to "anon";

grant insert on table "public"."extract_jobs" to "anon";

grant references on table "public"."extract_jobs" to "anon";

grant select on table "public"."extract_jobs" to "anon";

grant trigger on table "public"."extract_jobs" to "anon";

grant truncate on table "public"."extract_jobs" to "anon";

grant update on table "public"."extract_jobs" to "anon";

grant delete on table "public"."extract_jobs" to "authenticated";

grant insert on table "public"."extract_jobs" to "authenticated";

grant references on table "public"."extract_jobs" to "authenticated";

grant select on table "public"."extract_jobs" to "authenticated";

grant trigger on table "public"."extract_jobs" to "authenticated";

grant truncate on table "public"."extract_jobs" to "authenticated";

grant update on table "public"."extract_jobs" to "authenticated";

grant delete on table "public"."extract_jobs" to "service_role";

grant insert on table "public"."extract_jobs" to "service_role";

grant references on table "public"."extract_jobs" to "service_role";

grant select on table "public"."extract_jobs" to "service_role";

grant trigger on table "public"."extract_jobs" to "service_role";

grant truncate on table "public"."extract_jobs" to "service_role";

grant update on table "public"."extract_jobs" to "service_role";

grant delete on table "public"."format_jobs" to "anon";

grant insert on table "public"."format_jobs" to "anon";

grant references on table "public"."format_jobs" to "anon";

grant select on table "public"."format_jobs" to "anon";

grant trigger on table "public"."format_jobs" to "anon";

grant truncate on table "public"."format_jobs" to "anon";

grant update on table "public"."format_jobs" to "anon";

grant delete on table "public"."format_jobs" to "authenticated";

grant insert on table "public"."format_jobs" to "authenticated";

grant references on table "public"."format_jobs" to "authenticated";

grant select on table "public"."format_jobs" to "authenticated";

grant trigger on table "public"."format_jobs" to "authenticated";

grant truncate on table "public"."format_jobs" to "authenticated";

grant update on table "public"."format_jobs" to "authenticated";

grant delete on table "public"."format_jobs" to "service_role";

grant insert on table "public"."format_jobs" to "service_role";

grant references on table "public"."format_jobs" to "service_role";

grant select on table "public"."format_jobs" to "service_role";

grant trigger on table "public"."format_jobs" to "service_role";

grant truncate on table "public"."format_jobs" to "service_role";

grant update on table "public"."format_jobs" to "service_role";

grant delete on table "public"."formatted_info" to "anon";

grant insert on table "public"."formatted_info" to "anon";

grant references on table "public"."formatted_info" to "anon";

grant select on table "public"."formatted_info" to "anon";

grant trigger on table "public"."formatted_info" to "anon";

grant truncate on table "public"."formatted_info" to "anon";

grant update on table "public"."formatted_info" to "anon";

grant delete on table "public"."formatted_info" to "authenticated";

grant insert on table "public"."formatted_info" to "authenticated";

grant references on table "public"."formatted_info" to "authenticated";

grant select on table "public"."formatted_info" to "authenticated";

grant trigger on table "public"."formatted_info" to "authenticated";

grant truncate on table "public"."formatted_info" to "authenticated";

grant update on table "public"."formatted_info" to "authenticated";

grant delete on table "public"."formatted_info" to "service_role";

grant insert on table "public"."formatted_info" to "service_role";

grant references on table "public"."formatted_info" to "service_role";

grant select on table "public"."formatted_info" to "service_role";

grant trigger on table "public"."formatted_info" to "service_role";

grant truncate on table "public"."formatted_info" to "service_role";

grant update on table "public"."formatted_info" to "service_role";

grant delete on table "public"."formatter_dependencies" to "anon";

grant insert on table "public"."formatter_dependencies" to "anon";

grant references on table "public"."formatter_dependencies" to "anon";

grant select on table "public"."formatter_dependencies" to "anon";

grant trigger on table "public"."formatter_dependencies" to "anon";

grant truncate on table "public"."formatter_dependencies" to "anon";

grant update on table "public"."formatter_dependencies" to "anon";

grant delete on table "public"."formatter_dependencies" to "authenticated";

grant insert on table "public"."formatter_dependencies" to "authenticated";

grant references on table "public"."formatter_dependencies" to "authenticated";

grant select on table "public"."formatter_dependencies" to "authenticated";

grant trigger on table "public"."formatter_dependencies" to "authenticated";

grant truncate on table "public"."formatter_dependencies" to "authenticated";

grant update on table "public"."formatter_dependencies" to "authenticated";

grant delete on table "public"."formatter_dependencies" to "service_role";

grant insert on table "public"."formatter_dependencies" to "service_role";

grant references on table "public"."formatter_dependencies" to "service_role";

grant select on table "public"."formatter_dependencies" to "service_role";

grant trigger on table "public"."formatter_dependencies" to "service_role";

grant truncate on table "public"."formatter_dependencies" to "service_role";

grant update on table "public"."formatter_dependencies" to "service_role";

grant delete on table "public"."formatters" to "anon";

grant insert on table "public"."formatters" to "anon";

grant references on table "public"."formatters" to "anon";

grant select on table "public"."formatters" to "anon";

grant trigger on table "public"."formatters" to "anon";

grant truncate on table "public"."formatters" to "anon";

grant update on table "public"."formatters" to "anon";

grant delete on table "public"."formatters" to "authenticated";

grant insert on table "public"."formatters" to "authenticated";

grant references on table "public"."formatters" to "authenticated";

grant select on table "public"."formatters" to "authenticated";

grant trigger on table "public"."formatters" to "authenticated";

grant truncate on table "public"."formatters" to "authenticated";

grant update on table "public"."formatters" to "authenticated";

grant delete on table "public"."formatters" to "service_role";

grant insert on table "public"."formatters" to "service_role";

grant references on table "public"."formatters" to "service_role";

grant select on table "public"."formatters" to "service_role";

grant trigger on table "public"."formatters" to "service_role";

grant truncate on table "public"."formatters" to "service_role";

grant update on table "public"."formatters" to "service_role";

grant delete on table "public"."line_ref" to "anon";

grant insert on table "public"."line_ref" to "anon";

grant references on table "public"."line_ref" to "anon";

grant select on table "public"."line_ref" to "anon";

grant trigger on table "public"."line_ref" to "anon";

grant truncate on table "public"."line_ref" to "anon";

grant update on table "public"."line_ref" to "anon";

grant delete on table "public"."line_ref" to "authenticated";

grant insert on table "public"."line_ref" to "authenticated";

grant references on table "public"."line_ref" to "authenticated";

grant select on table "public"."line_ref" to "authenticated";

grant trigger on table "public"."line_ref" to "authenticated";

grant truncate on table "public"."line_ref" to "authenticated";

grant update on table "public"."line_ref" to "authenticated";

grant delete on table "public"."line_ref" to "service_role";

grant insert on table "public"."line_ref" to "service_role";

grant references on table "public"."line_ref" to "service_role";

grant select on table "public"."line_ref" to "service_role";

grant trigger on table "public"."line_ref" to "service_role";

grant truncate on table "public"."line_ref" to "service_role";

grant update on table "public"."line_ref" to "service_role";

grant delete on table "public"."parslet" to "anon";

grant insert on table "public"."parslet" to "anon";

grant references on table "public"."parslet" to "anon";

grant select on table "public"."parslet" to "anon";

grant trigger on table "public"."parslet" to "anon";

grant truncate on table "public"."parslet" to "anon";

grant update on table "public"."parslet" to "anon";

grant delete on table "public"."parslet" to "authenticated";

grant insert on table "public"."parslet" to "authenticated";

grant references on table "public"."parslet" to "authenticated";

grant select on table "public"."parslet" to "authenticated";

grant trigger on table "public"."parslet" to "authenticated";

grant truncate on table "public"."parslet" to "authenticated";

grant update on table "public"."parslet" to "authenticated";

grant delete on table "public"."parslet" to "service_role";

grant insert on table "public"."parslet" to "service_role";

grant references on table "public"."parslet" to "service_role";

grant select on table "public"."parslet" to "service_role";

grant trigger on table "public"."parslet" to "service_role";

grant truncate on table "public"."parslet" to "service_role";

grant update on table "public"."parslet" to "service_role";

grant delete on table "public"."profile" to "anon";

grant insert on table "public"."profile" to "anon";

grant references on table "public"."profile" to "anon";

grant select on table "public"."profile" to "anon";

grant trigger on table "public"."profile" to "anon";

grant truncate on table "public"."profile" to "anon";

grant update on table "public"."profile" to "anon";

grant delete on table "public"."profile" to "authenticated";

grant insert on table "public"."profile" to "authenticated";

grant references on table "public"."profile" to "authenticated";

grant select on table "public"."profile" to "authenticated";

grant trigger on table "public"."profile" to "authenticated";

grant truncate on table "public"."profile" to "authenticated";

grant update on table "public"."profile" to "authenticated";

grant delete on table "public"."profile" to "service_role";

grant insert on table "public"."profile" to "service_role";

grant references on table "public"."profile" to "service_role";

grant select on table "public"."profile" to "service_role";

grant trigger on table "public"."profile" to "service_role";

grant truncate on table "public"."profile" to "service_role";

grant update on table "public"."profile" to "service_role";

grant delete on table "public"."project" to "anon";

grant insert on table "public"."project" to "anon";

grant references on table "public"."project" to "anon";

grant select on table "public"."project" to "anon";

grant trigger on table "public"."project" to "anon";

grant truncate on table "public"."project" to "anon";

grant update on table "public"."project" to "anon";

grant delete on table "public"."project" to "authenticated";

grant insert on table "public"."project" to "authenticated";

grant references on table "public"."project" to "authenticated";

grant select on table "public"."project" to "authenticated";

grant trigger on table "public"."project" to "authenticated";

grant truncate on table "public"."project" to "authenticated";

grant update on table "public"."project" to "authenticated";

grant delete on table "public"."project" to "service_role";

grant insert on table "public"."project" to "service_role";

grant references on table "public"."project" to "service_role";

grant select on table "public"."project" to "service_role";

grant trigger on table "public"."project" to "service_role";

grant truncate on table "public"."project" to "service_role";

grant update on table "public"."project" to "service_role";

grant delete on table "public"."project_assignment" to "anon";

grant insert on table "public"."project_assignment" to "anon";

grant references on table "public"."project_assignment" to "anon";

grant select on table "public"."project_assignment" to "anon";

grant trigger on table "public"."project_assignment" to "anon";

grant truncate on table "public"."project_assignment" to "anon";

grant update on table "public"."project_assignment" to "anon";

grant delete on table "public"."project_assignment" to "authenticated";

grant insert on table "public"."project_assignment" to "authenticated";

grant references on table "public"."project_assignment" to "authenticated";

grant select on table "public"."project_assignment" to "authenticated";

grant trigger on table "public"."project_assignment" to "authenticated";

grant truncate on table "public"."project_assignment" to "authenticated";

grant update on table "public"."project_assignment" to "authenticated";

grant delete on table "public"."project_assignment" to "service_role";

grant insert on table "public"."project_assignment" to "service_role";

grant references on table "public"."project_assignment" to "service_role";

grant select on table "public"."project_assignment" to "service_role";

grant trigger on table "public"."project_assignment" to "service_role";

grant truncate on table "public"."project_assignment" to "service_role";

grant update on table "public"."project_assignment" to "service_role";

grant delete on table "public"."tenant" to "anon";

grant insert on table "public"."tenant" to "anon";

grant references on table "public"."tenant" to "anon";

grant select on table "public"."tenant" to "anon";

grant trigger on table "public"."tenant" to "anon";

grant truncate on table "public"."tenant" to "anon";

grant update on table "public"."tenant" to "anon";

grant delete on table "public"."tenant" to "authenticated";

grant insert on table "public"."tenant" to "authenticated";

grant references on table "public"."tenant" to "authenticated";

grant select on table "public"."tenant" to "authenticated";

grant trigger on table "public"."tenant" to "authenticated";

grant truncate on table "public"."tenant" to "authenticated";

grant update on table "public"."tenant" to "authenticated";

grant delete on table "public"."tenant" to "service_role";

grant insert on table "public"."tenant" to "service_role";

grant references on table "public"."tenant" to "service_role";

grant select on table "public"."tenant" to "service_role";

grant trigger on table "public"."tenant" to "service_role";

grant truncate on table "public"."tenant" to "service_role";

grant update on table "public"."tenant" to "service_role";

grant delete on table "public"."zuva_dependencies" to "anon";

grant insert on table "public"."zuva_dependencies" to "anon";

grant references on table "public"."zuva_dependencies" to "anon";

grant select on table "public"."zuva_dependencies" to "anon";

grant trigger on table "public"."zuva_dependencies" to "anon";

grant truncate on table "public"."zuva_dependencies" to "anon";

grant update on table "public"."zuva_dependencies" to "anon";

grant delete on table "public"."zuva_dependencies" to "authenticated";

grant insert on table "public"."zuva_dependencies" to "authenticated";

grant references on table "public"."zuva_dependencies" to "authenticated";

grant select on table "public"."zuva_dependencies" to "authenticated";

grant trigger on table "public"."zuva_dependencies" to "authenticated";

grant truncate on table "public"."zuva_dependencies" to "authenticated";

grant update on table "public"."zuva_dependencies" to "authenticated";

grant delete on table "public"."zuva_dependencies" to "service_role";

grant insert on table "public"."zuva_dependencies" to "service_role";

grant references on table "public"."zuva_dependencies" to "service_role";

grant select on table "public"."zuva_dependencies" to "service_role";

grant trigger on table "public"."zuva_dependencies" to "service_role";

grant truncate on table "public"."zuva_dependencies" to "service_role";

grant update on table "public"."zuva_dependencies" to "service_role";

grant delete on table "public"."zuva_extraction_job" to "anon";

grant insert on table "public"."zuva_extraction_job" to "anon";

grant references on table "public"."zuva_extraction_job" to "anon";

grant select on table "public"."zuva_extraction_job" to "anon";

grant trigger on table "public"."zuva_extraction_job" to "anon";

grant truncate on table "public"."zuva_extraction_job" to "anon";

grant update on table "public"."zuva_extraction_job" to "anon";

grant delete on table "public"."zuva_extraction_job" to "authenticated";

grant insert on table "public"."zuva_extraction_job" to "authenticated";

grant references on table "public"."zuva_extraction_job" to "authenticated";

grant select on table "public"."zuva_extraction_job" to "authenticated";

grant trigger on table "public"."zuva_extraction_job" to "authenticated";

grant truncate on table "public"."zuva_extraction_job" to "authenticated";

grant update on table "public"."zuva_extraction_job" to "authenticated";

grant delete on table "public"."zuva_extraction_job" to "service_role";

grant insert on table "public"."zuva_extraction_job" to "service_role";

grant references on table "public"."zuva_extraction_job" to "service_role";

grant select on table "public"."zuva_extraction_job" to "service_role";

grant trigger on table "public"."zuva_extraction_job" to "service_role";

grant truncate on table "public"."zuva_extraction_job" to "service_role";

grant update on table "public"."zuva_extraction_job" to "service_role";

grant delete on table "public"."zuva_extractors" to "anon";

grant insert on table "public"."zuva_extractors" to "anon";

grant references on table "public"."zuva_extractors" to "anon";

grant select on table "public"."zuva_extractors" to "anon";

grant trigger on table "public"."zuva_extractors" to "anon";

grant truncate on table "public"."zuva_extractors" to "anon";

grant update on table "public"."zuva_extractors" to "anon";

grant delete on table "public"."zuva_extractors" to "authenticated";

grant insert on table "public"."zuva_extractors" to "authenticated";

grant references on table "public"."zuva_extractors" to "authenticated";

grant select on table "public"."zuva_extractors" to "authenticated";

grant trigger on table "public"."zuva_extractors" to "authenticated";

grant truncate on table "public"."zuva_extractors" to "authenticated";

grant update on table "public"."zuva_extractors" to "authenticated";

grant delete on table "public"."zuva_extractors" to "service_role";

grant insert on table "public"."zuva_extractors" to "service_role";

grant references on table "public"."zuva_extractors" to "service_role";

grant select on table "public"."zuva_extractors" to "service_role";

grant trigger on table "public"."zuva_extractors" to "service_role";

grant truncate on table "public"."zuva_extractors" to "service_role";

grant update on table "public"."zuva_extractors" to "service_role";

grant delete on table "public"."zuva_file" to "anon";

grant insert on table "public"."zuva_file" to "anon";

grant references on table "public"."zuva_file" to "anon";

grant select on table "public"."zuva_file" to "anon";

grant trigger on table "public"."zuva_file" to "anon";

grant truncate on table "public"."zuva_file" to "anon";

grant update on table "public"."zuva_file" to "anon";

grant delete on table "public"."zuva_file" to "authenticated";

grant insert on table "public"."zuva_file" to "authenticated";

grant references on table "public"."zuva_file" to "authenticated";

grant select on table "public"."zuva_file" to "authenticated";

grant trigger on table "public"."zuva_file" to "authenticated";

grant truncate on table "public"."zuva_file" to "authenticated";

grant update on table "public"."zuva_file" to "authenticated";

grant delete on table "public"."zuva_file" to "service_role";

grant insert on table "public"."zuva_file" to "service_role";

grant references on table "public"."zuva_file" to "service_role";

grant select on table "public"."zuva_file" to "service_role";

grant trigger on table "public"."zuva_file" to "service_role";

grant truncate on table "public"."zuva_file" to "service_role";

grant update on table "public"."zuva_file" to "service_role";

create policy "Contract owner has full access"
on "public"."annotation"
as permissive
for all
to authenticated
using (user_tenant_owns_contract(contract_id))
with check (user_tenant_owns_contract(contract_id));


create policy "Allow project members full access"
on "public"."contract"
as permissive
for all
to public
using (is_user_assigned_to_project(project_id))
with check (is_user_assigned_to_project(project_id));


create policy "full access for owning tennat"
on "public"."contract_job_queue"
as permissive
for all
to authenticated
using (user_tenant_owns_contract(contract_id))
with check (user_tenant_owns_contract(contract_id));


create policy "contract_line_policy"
on "public"."contract_line"
as permissive
for all
to public
using ((contract_id IN ( SELECT contract.id
   FROM contract
  WHERE (contract.tenant_id = auth.tenant_id()))));


create policy "Contract owner has full access"
on "public"."formatted_info"
as permissive
for all
to authenticated
using (user_tenant_owns_contract(contract_id))
with check (user_tenant_owns_contract(contract_id));


create policy "Enable read access for all users"
on "public"."formatter_dependencies"
as permissive
for select
to public
using (true);


create policy "Allow read access to all rows."
on "public"."formatters"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."parslet"
as permissive
for select
to public
using (true);


create policy "Team members can update team members if they belong to the team"
on "public"."profile"
as permissive
for all
to public
using ((auth.tenant_id() = tenant_id));


create policy "Allow members full access"
on "public"."project"
as permissive
for all
to public
using ((tenant_id = auth.tenant_id()))
with check ((tenant_id = auth.tenant_id()));


create policy "Tenant members have full access"
on "public"."tenant"
as permissive
for all
to public
using ((id = auth.tenant_id()))
with check ((id = auth.tenant_id()));


create policy "contract owner full access"
on "public"."zuva_extraction_job"
as permissive
for all
to public
using (user_tenant_owns_contract(contract_id));


create policy "contract owner full access"
on "public"."zuva_file"
as permissive
for all
to public
using (user_tenant_owns_contract(contract_id))
with check (user_tenant_owns_contract(contract_id));


CREATE TRIGGER trigger_new_contract_row AFTER INSERT ON public.contract FOR EACH ROW EXECUTE FUNCTION process_new_contract_row();

CREATE TRIGGER update_job_queue_updated_at BEFORE UPDATE ON public.contract_job_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER after_file_upload AFTER INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION process_project_file_upload();

CREATE TRIGGER trigger_file_deletion AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION process_project_file_deletion();
