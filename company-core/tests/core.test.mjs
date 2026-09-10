import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {runCompanyOrder} from '../orchestrator.mjs';

const registry=JSON.parse(await fs.readFile(new URL('../employee-registry.json',import.meta.url),'utf8'));
const ids=new Set(registry.employees.map(e=>e.id));
for(const id of ['EMP-001','EMP-002','EMP-003','EMP-004','EMP-005'])assert.ok(ids.has(id),`${id} absent`);
for(const e of registry.employees){assert.ok(Array.isArray(e.capabilities)&&e.capabilities.length>0,`${e.id} sans capacités`);assert.ok(e.role,`${e.id} sans rôle`)}
const order=await runCompanyOrder({goal:'Améliorer une application CR3@TIX',project:'TEST'});
assert.equal(order.bossAction,'none_until_final_validation');
assert.equal(order.tasks.length,5);
assert.deepEqual(order.tasks.map(t=>t.employee),['EMP-002','EMP-002','EMP-003','EMP-004','EMP-005']);
console.log('COMPANY CORE tests: OK');
