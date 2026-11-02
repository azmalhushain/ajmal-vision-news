CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.phone),
    new.phone
  );

  -- Assign default 'user' role
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');

  return new;
end;
$function$;