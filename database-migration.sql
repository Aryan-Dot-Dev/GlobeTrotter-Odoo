-- Migration to add start_destination, end_destination, and budget to trips table
-- and trip_id to activities table
-- Run this in your Supabase SQL Editor

-- Add start_destination column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='trips' AND column_name='start_destination') THEN
        ALTER TABLE trips ADD COLUMN start_destination VARCHAR(255);
    END IF;
END $$;

-- Add end_destination column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='trips' AND column_name='end_destination') THEN
        ALTER TABLE trips ADD COLUMN end_destination VARCHAR(255);
    END IF;
END $$;

-- Add budget column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='trips' AND column_name='budget') THEN
        ALTER TABLE trips ADD COLUMN budget DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Add trip_id column to activities table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='activities' AND column_name='trip_id') THEN
        ALTER TABLE activities ADD COLUMN trip_id INTEGER;
        
        -- Add foreign key constraint to reference trips table
        ALTER TABLE activities 
        ADD CONSTRAINT fk_activities_trip_id 
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Verify the new columns were added
SELECT 'trips table columns:' as table_info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'trips' 
ORDER BY ordinal_position;

SELECT 'activities table columns:' as table_info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'activities' 
ORDER BY ordinal_position;
