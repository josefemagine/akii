-- Verify if ensure_profile_exists function exists and has the expected signature
SELECT routine_name, routine_type, specific_name
FROM information_schema.routines
WHERE routine_type = 'FUNCTION' 
  AND routine_name = 'ensure_profile_exists';

-- Verify parameters 
SELECT 
    p.specific_schema,
    p.specific_name,
    p.ordinal_position,
    p.parameter_name,
    p.data_type,
    p.parameter_default
FROM 
    information_schema.parameters p
WHERE 
    p.specific_schema = 'public'
    AND p.specific_name LIKE '%ensure_profile_exists%'
ORDER BY 
    p.specific_name,
    p.ordinal_position; 