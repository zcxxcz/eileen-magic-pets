// Selection is a local view preference, never an independent cloud write.
export class PetSelection {
 constructor(){this.account=undefined;this.id=null;}
 choose(id,state){if(state.pets.some(p=>p.id===id))this.id=id;}
 view(state,account=null){
  if(this.account!==account){this.account=account;this.id=null;}
  if(!state.pets.some(p=>p.id===this.id))this.id=state.pets.some(p=>p.id===state.selected)?state.selected:state.pets[0]?.id||null;
  return this.id===state.selected?state:{...state,selected:this.id};
 }
}
