import { execFileSync, execSync } from 'node:child_process';
import { mkdirSync, appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(__dirname, '..', '..');
const packageJson = JSON.parse(readFileSync(resolve(workspaceRoot, 'package.json'), 'utf8'));
const baseVersion = process.env.RELEASE_BASE_VERSION || packageJson.version || '0.1.0';
const runNumber = Number.parseInt(process.env.GITHUB_RUN_NUMBER || '0', 10);
const runAttempt = Number.parseInt(process.env.GITHUB_RUN_ATTEMPT || '1', 10);
const branchName =
  process.env.GITHUB_REF_NAME ||
  execSync('git rev-parse --abbrev-ref HEAD', { cwd: workspaceRoot, encoding: 'utf8' }).trim();
const sha =
  process.env.GITHUB_SHA ||
  execSync('git rev-parse HEAD', { cwd: workspaceRoot, encoding: 'utf8' }).trim();
const beforeSha = process.env.GITHUB_EVENT_BEFORE;

const branchSlug = branchName.replace(/[^A-Za-z0-9._-]/g, '-');
const shortSha = sha.slice(0, 7);
const now = new Date();
const yyyymmdd = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(
  now.getUTCDate(),
).padStart(2, '0')}`;
const releaseVersion = `${baseVersion}+${branchSlug}.${runNumber}.${runAttempt}`;
const androidVersionName = releaseVersion;
const androidVersionCode = Number.parseInt(
  `${yyyymmdd}${String(runNumber % 100).padStart(2, '0')}`,
  10,
);
const releaseNotesFile = resolve(workspaceRoot, 'release-notes.md');

function execGit(command) {
  return execSync(command, { cwd: workspaceRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function gitLines(args) {
  return execFileSync('git', args, {
    cwd: workspaceRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

let commits = '';

try {
  if (beforeSha && beforeSha !== '0000000000000000000000000000000000000000') {
    commits = gitLines(['log', '--pretty=format:%h %s', `${beforeSha}..${sha}`]);
  }
} catch {
  commits = '';
}

if (!commits) {
  commits = gitLines(['log', '--pretty=format:%h %s', '-n', '20']);
}

const releaseNotes = [
  `# Release ${releaseVersion}`,
  '',
  `- branch: ${branchName}`,
  `- commit: ${shortSha}`,
  `- android version name: ${androidVersionName}`,
  `- android version code: ${androidVersionCode}`,
  '',
  '## Changes',
  ...commits
    .split('\n')
    .filter(Boolean)
    .map((line) => `- ${line}`),
].join('\n');

mkdirSync(dirname(releaseNotesFile), { recursive: true });
writeFileSync(releaseNotesFile, `${releaseNotes}\n`, 'utf8');

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `release_version=${releaseVersion}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `android_version_name=${androidVersionName}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `android_version_code=${androidVersionCode}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `release_notes_file=${releaseNotesFile}\n`);
}

console.log(releaseNotes);
