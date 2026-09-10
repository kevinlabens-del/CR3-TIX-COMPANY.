import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const taskPath = process.env.COMPANY_TASK || 'company-core/tasks/example-task.json';
const task = JSON.parse(fs.readFileSync(taskPath, 'utf8'));
const registry = JSON.parse(fs.readFileSync('company-core/employee-registry.json', 'utf8'));
const employee = registry.employees.find(e => e.id === task.employeeId);

if (!employee) throw new Error(`Employé inconnu: ${task.employeeId}`);
if (!task.id || !task.type || !task.project) throw new Error('Tâche invalide: id, type et project sont requis');

const reportDir = 'company-core/reports';
fs.mkdirSync(reportDir, { recursive: true });
const report = {
  taskId: task.id,
  employeeId: employee.id,
  employeeRole: employee.role,
  project: task.project,
  startedAt: new Date().toISOString(),
  status: 'running',
  steps: []
};

function step(name, fn) {
  const startedAt = new Date().toISOString();
  try {
    const output = fn();
    report.steps.push({ name, startedAt, finishedAt: new Date().toISOString(), status: 'success', output: String(output ?? '').slice(0, 20000) });
    return output;
  } catch (error) {
    report.steps.push({ name, startedAt, finishedAt: new Date().toISOString(), status: 'failure', output: String(error?.stdout ?? error?.message ?? error).slice(0, 20000) });
    throw error;
  }
}

function run(cmd, args = [], cwd = '.') {
  return execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

try {
  step('validate-permissions', () => {
    const capability = task.requiredCapability;
    if (capability && !employee.capabilities.includes(capability)) throw new Error(`${employee.id} n'a pas la capacité ${capability}`);
    return 'Permissions validées';
  });

  if (task.type === 'repository-inspection') {
    step('repository-inventory', () => run('git', ['ls-files']));
    step('recent-commit', () => run('git', ['log', '-1', '--oneline']));
  } else if (task.type === 'web-quality-check') {
    step('check-index', () => {
      if (!fs.existsSync('index.html')) throw new Error('index.html absent');
      return `${fs.statSync('index.html').size} octets`;
    });
    step('check-manifest', () => {
      JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
      return 'manifest.json valide';
    });
  } else if (task.type === 'command') {
    if (!Array.isArray(task.command) || task.command.length === 0) throw new Error('Commande absente');
    const [cmd, ...args] = task.command;
    const allowed = new Set(['npm', 'node', 'gradle', './gradlew', 'git']);
    if (!allowed.has(cmd)) throw new Error(`Commande non autorisée: ${cmd}`);
    step(`command:${cmd}`, () => run(cmd, args, task.cwd || '.'));
  } else {
    throw new Error(`Type de tâche non pris en charge: ${task.type}`);
  }

  report.status = 'success';
} catch (error) {
  report.status = 'failure';
  report.error = String(error?.message ?? error);
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  const out = path.join(reportDir, `${task.id}.json`);
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
