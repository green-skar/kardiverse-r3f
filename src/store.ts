import create from 'zustand'
type State = { playing:boolean; setPlaying:(v:boolean)=>void; activations:number; addActivation:()=>void }
export const useAppStore = create<State>((set)=>({playing:false,setPlaying:(v)=>set({playing:v}),activations:Number(localStorage.getItem('kardi_activations')||'0'),addActivation:()=>set(s=>{const n=s.activations+1;localStorage.setItem('kardi_activations',String(n));return{activations:n}})}))
