-- Extend the existing whitelist without changing saves, permissions or game rules.
-- Safe to reapply. New installations already include these items in 001_validation.sql.
do $upgrade$
declare definition text;
begin
 definition := pg_get_functiondef('public.valid_game_state(jsonb)'::regprocedure);
 definition := replace(definition, '"pearl","jade"', '"pearl","jade","bell-bracelet","ribbon-bracelet","star-bracelet","leaf-bracelet"');
 definition := replace(definition, '"bow","flower"', '"bow","flower","moon-clip","cherry-clip","butterfly-clip","rainbow-clip"');
 definition := replace(definition, '"rose-dress","sky-dress"', '"rose-dress","sky-dress","sailor-dress","strawberry-dress","ballet-dress","leaf-dress"');
 -- Only replace old sequences; skip an already-updated function to avoid duplicate enums.
 if position('"moon-clip"' in pg_get_functiondef('public.valid_game_state(jsonb)'::regprocedure)) = 0 then
  definition := replace(definition, '"maxItems":18,"uniqueItems":true', '"maxItems":30,"uniqueItems":true');
  if position('"leaf-dress"' in definition)=0 or position('"rainbow-clip"' in definition)=0 or position('"leaf-bracelet"' in definition)=0 or position('"maxItems":30,"uniqueItems":true' in definition)=0 then
   raise exception 'Unexpected existing wardrobe schema; no update applied';
  end if;
  execute definition;
 end if;
end;
$upgrade$;
