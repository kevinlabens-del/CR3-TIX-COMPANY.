import fs from 'node:fs/promises';
const REGISTRY=new URL('./employee-registry.json',import.meta.url);
const POLICY=new URL('./company-policy.json',import.meta.url);
const read=async u=>JSON.parse(await fs.readFile(u,'utf8'));
const stamp=()=>new Date().toISOString();
function choose(task){const t=(task.type||'').toLowerCase();if(['architecture','analysis','plan'].includes(t))return'EMP-002';if(['code','implement','fix','refactor','build'].includes(t))return'EMP-003';if(['qa','test','verify'].includes(t))return'EMP-004';if(['release','deploy','artifact'].includes(t))return'EMP-005';return'EMP-001'}
function decompose(goal){return[
 {type:'analysis',title:`Analyser : ${goal}`},
 {type:'architecture',title:`Préparer le plan technique : ${goal}`},
 {type:'code',title:`Implémenter : ${goal}`},
 {type:'qa',title:`Tester et contrôler : ${goal}`},
 {type:'release',title:`Préparer la livraison : ${goal}`}
]}
export async function runCompanyOrder(order){const registry=await read(REGISTRY),policy=await read(POLICY);if(!order?.goal)throw new Error('goal requis');const tasks=decompose(order.goal).map((x,i)=>({...x,id:`TASK-${Date.now()}-${i+1}`,employee:choose(x),status:'queued'}));return{company:policy.company,createdAt:stamp(),order:{goal:order.goal,project:order.project||null,source:order.source||'BOSS'},status:'planned',bossAction:'none_until_final_validation',tasks,employees:registry.employees.filter(e=>tasks.some(t=>t.employee===e.id)).map(e=>({id:e.id,name:e.name,role:e.role})),next:'Dispatch tasks to employee runners, collect verified outputs, then create one final Boss decision.'}}
if(import.meta.url===`file://${process.argv[1]}`){const arg=process.argv[2]||'';const input=arg.startsWith('{')?JSON.parse(arg):{goal:arg||'Analyser et améliorer les projets CR3@TIX'};console.log(JSON.stringify(await runCompanyOrder(input),null,2))}
