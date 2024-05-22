DO
$$
DECLARE
    tenant_id UUID := gen_random_uuid();
BEGIN
    -- Insert a new user with the tenant ID in appmetadata
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        created_at,
        updated_at,
        last_sign_in_at,
        appmetadata
    )
    VALUES (
        gen_random_uuid(),
        'test@parslai.com',
        crypt('helloworld', gen_salt('bf')),
        now(),
        now(),
        now(),
        jsonb_build_object(
            'provider', 'email',
            'providers', jsonb_build_array('email'),
            'tenant_id', tenant_id::text
        )
    );

    -- Insert a new tenant with the predefined tenant ID
    INSERT INTO tenants (id, name, created_at)
    VALUES (
        tenant_id,        -- uses the predefined tenant ID
        'local tenant',    -- tenant's name
        now()             -- sets the created_at timestamp to the current time
    );

    -- Create a storage bucket with the predefined tenant ID as the bucket name
    INSERT INTO storage.buckets (id, name, created_at)
    VALUES (
        tenant_id, -- generates a random UUID for the bucket ID
        tenant_id,         -- uses the predefined tenant ID as the bucket name
        now()              -- sets the created_at timestamp to the current time
    );

END
$$;
