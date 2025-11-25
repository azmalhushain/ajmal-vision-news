-- Fix infinite recursion by using the has_role function
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

CREATE POLICY "Admins can view all roles"
ON user_roles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));