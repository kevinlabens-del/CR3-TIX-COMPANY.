import fs from 'node:fs/promises';

const MAP_JSON='https://kevinlabens-del.github.io/creatix-project/projects.json';
const MAP_API='https://gwqojqwcbwoulxrctaqz.supabase.co/functions/v1/cr3atix-admin';
const OWNER=process.env.CR3ATIX_OWNER||'kevinlabens-del';
const OUT='company-data/projects.json';

function clean(v,max=500){return typeof v==='string'?v.trim().slice(0,max):''}
function nodes(payload){if(Array.isArray(payload))return payload;if(Array.isArray(payload?.nodes))return payload.nodes;if(Array.isArray(payload?.projects))return payload.projects;if(Array.isArray(payload?.data?.nodes))return payload.data.nodes;return[]}
function normalizeMap(n){return{id:clean(n.id||n.source_node_id,100),name:clean(n.title||n.name,160),description:clean(n.desc||n.description,800),type:clean(n.type||n.category,80),status:clean(n.status,40)||'unknown',progress:Math.max(0,Math.min(100,Number(n.progress)||0)),url:clean(n.url,2048),repository:clean(n.github||n.repository_url,2048),source:'CR3ATIX_PROJECT'}}
function normalizeRepo(r){return{id:`github:${r.id}`,name:r.name,description:r.description||'',type:r.language||'repository',status:r.archived?'archived':'repository',progress:0,url:r.homepage||'',repository:r.html_url,defaultBranch:r.default_branch,pushedAt:r.pushed_at,source:'GITHUB'}}
async function getJson(url,headers={}){const c=new AbortController();const timer=setTimeout(()=>c.abort(),12000);try{const r=await fetch(url,{headers:{accept:'application/json',...headers},signal:c.signal});if(!r.ok)throw new Error(`${url} -> HTTP ${r.status}`);return await r.json()}finally{clearTimeout(timer)}}
async function readMap(){for(const url of [MAP_JSON,MAP_API]){try{const data=await getJson(url);const arr=nodes(data).map(normalizeMap).filter(p=>p.id&&p.name);if(arr.length)return{projects:arr,source:url}}catch(e){console.warn(`Source MAP indisponible: ${e.message}`)}}return{projects:[],source:null}}
async function readRepos(){const token=process.env.GITHUB_TOKEN;const headers=token?{authorization:`Bearer ${token}`,'x-github-api-version':'2022-11-28'}:{};const repos=await getJson(`https://api.github.com/users/${encodeURIComponent(OWNER)}/repos?per_page=100&sort=updated`,headers);return repos.filter(r=>!r.fork).map(normalizeRepo)}
function merge(mapProjects,repos){const byRepo=new Map(repos.map(r=>[r.repository.toLowerCase().replace(/\/$/,''),r]));const used=new Set();const out=mapProjects.map(p=>{const key=(p.repository||'').toLowerCase().replace(/\/$/,'');const r=key?byRepo.get(key):null;if(r){used.add(r.id);return{...r,...p,github:{defaultBranch:r.defaultBranch,pushedAt:r.pushedAt}}}return p});for(const r of repos)if(!used.has(r.id))out.push(r);return out}

export async function buildProjectRegistry(){const map=await readMap();const repos=await readRepos();const projects=merge(map.projects,repos);const result={schemaVersion:1,generatedAt:new Date().toISOString(),primarySource:map.source||'unavailable',secondarySource:'GitHub',count:projects.length,projects};await fs.mkdir('company-data',{recursive:true});await fs.writeFile(OUT,JSON.stringify(result,null,2)+'\n');console.log(`Registre COMPANY: ${projects.length} projets/dépôts.`);return result}

if(import.meta.url===`file://${process.argv[1]}`)await buildProjectRegistry();
