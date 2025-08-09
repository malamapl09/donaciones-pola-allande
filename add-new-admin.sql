-- Add a new admin user for testing
-- Run this in your Supabase SQL Editor

INSERT INTO admin_users (
    id,
    username,
    email,
    password_hash,
    name,
    role,
    is_active,
    created_at
) VALUES (
    gen_random_uuid(),
    'newadmin',
    'newadmin@test.com',
    '$2b$12$4TfbqbjgTeJ5LArHBGNon.aLSEIF5ipzX3aL6vMy9GqIKHF879EGu',  -- Password: NewAdmin123!
    'New Test Admin',
    'admin',
    true,
    CURRENT_TIMESTAMP
);

-- Verify the user was created
SELECT id, username, email, name, role, is_active, created_at 
FROM admin_users 
WHERE email = 'newadmin@test.com';