-- Add role column to users table for admin access control
-- Run this in your Supabase SQL Editor

-- Add role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        
        -- Add check constraint to ensure valid roles
        ALTER TABLE users ADD CONSTRAINT chk_valid_role 
        CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

-- Create index on role column for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Verify the new column was added
SELECT 'users table columns with role:' as table_info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
