-- Read-only check. Fixtures are evaluated in memory, never written to family saves.
with pet_save as (
 select '{"version":1,"pets":[{"id":"pet-1","species":"cat","name":"test","points":0,"generation":1,"location":"home","food":0,"eggReady":false,"eggProgress":0,"outfit":{"hand":"wand"}}],"selected":"pet-1","stars":0,"tickets":0,"lessons":[],"owned":["wand"],"eggs":0,"hatched":1,"routes":{"out":[[10,72],[90,25]],"back":[[90,25],[10,72]]},"trip":null}'::jsonb as s
), fixtures as (
 select s as old_save, jsonb_set(jsonb_set(s,'{owned}',jsonb_build_array('wand',id)),
   '{pets,0,outfit,necklace}',to_jsonb(id)) as equipped
 from pet_save cross join (values ('moonlight-necklace'),('strawberry-necklace')) necklaces(id)
)
select count(*) as tested_necklaces,
 bool_and(public.valid_game_state(equipped)) as both_necklaces_valid,
 bool_and(not public.valid_game_state(jsonb_set(equipped,'{owned}','["wand"]'::jsonb))) as unowned_necklaces_rejected,
 bool_and(not public.valid_game_state(jsonb_set(equipped,'{pets,0,outfit,necklace}','"wand"'::jsonb))) as wrong_slot_rejected,
 bool_and(public.valid_game_state(old_save)) as old_format_valid,
 (select coalesce(bool_and(public.valid_game_state(state)),true) from public.game_saves) as existing_saves_valid,
 (select coalesce(bool_and(public.valid_game_state(state)),true) from public.game_save_history) as existing_history_valid
from fixtures;
