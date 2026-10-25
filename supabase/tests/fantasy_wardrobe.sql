-- Read-only fixtures. This never writes sample data to a family save.
with schema as (
 select split_part(pg_get_functiondef('public.valid_game_state(jsonb)'::regprocedure),'$schema$',2)::jsonb as j
), equipment as (
 select slot, jsonb_array_elements_text(rule->'enum') as id
 from schema cross join lateral jsonb_each(j#>'{properties,pets,items,properties,outfit,properties}') as rules(slot,rule)
), species as (
 select jsonb_array_elements_text(j#>'{properties,pets,items,properties,species,enum}') as id from schema
), fixtures as (
 select jsonb_set(jsonb_set(jsonb_set(jsonb_set(
 '{"version":1,"pets":[{"id":"pet-1","species":"cat","name":"test","points":0,"generation":1,"location":"home","food":0,"eggReady":false,"eggProgress":0,"outfit":{"hand":"wand"}}],"selected":"pet-1","stars":0,"tickets":0,"lessons":[],"owned":["wand"],"eggs":0,"hatched":1,"routes":{"out":[[10,72],[90,25]],"back":[[90,25],[10,72]]},"trip":null}'::jsonb,
 '{owned}',j#>'{properties,owned,items,enum}'),'{pets,0,species}',to_jsonb(species.id)),array['pets','0','outfit',slot],to_jsonb(equipment.id)),'{pets,0,points}',to_jsonb(age)) as s
 from schema cross join species cross join equipment cross join (values(0),(2),(5)) as ages(age)
)
select count(*) as tested_species_outfits_ages,
 bool_and(public.valid_game_state(s)) as all_combinations_valid,
 bool_and(not public.valid_game_state(jsonb_set(s,'{pets,0,outfit,makeup}','"unknown-item"'::jsonb))) as unknown_items_rejected,
 (select coalesce(bool_and(public.valid_game_state(state)),true) from public.game_saves) as existing_saves_valid,
 (select coalesce(bool_and(public.valid_game_state(state)),true) from public.game_save_history) as existing_history_valid
from fixtures;
