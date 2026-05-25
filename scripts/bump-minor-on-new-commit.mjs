import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packagePath = resolve(rootDir, 'package.json');
const lockPath = resolve(rootDir, 'package-lock.json');
const commitField = 'x-version-commit';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => {
	writeFileSync(path, `${JSON.stringify(value, null, '\t')}\n`);
};

const getCurrentCommit = () => {
	try {
		return execFileSync('git', ['rev-parse', 'HEAD'], {
			cwd: rootDir,
			encoding: 'utf8'
		}).trim();
	} catch {
		return null;
	}
};

const bumpMinor = (version) => {
	const match = version.match(/^(\d+)\.(\d+)\.(\d+)(-.+)?$/);

	if (!match) {
		throw new Error(`Unsupported package version "${version}". Expected semver like 1.2.3.`);
	}

	const major = Number(match[1]);
	const minor = Number(match[2]) + 1;

	return `${major}.${minor}.0`;
};

const currentCommit = getCurrentCommit();

if (!currentCommit) {
	console.log('No git commit found; keeping package version unchanged.');
	process.exit(0);
}

const packageJson = readJson(packagePath);

if (packageJson[commitField] === currentCommit) {
	console.log(`Version ${packageJson.version} is already assigned to commit ${currentCommit.slice(0, 7)}.`);
	process.exit(0);
}

const nextVersion = bumpMinor(packageJson.version);
packageJson.version = nextVersion;
packageJson[commitField] = currentCommit;
writeJson(packagePath, packageJson);

if (existsSync(lockPath)) {
	const lockJson = readJson(lockPath);
	lockJson.version = nextVersion;

	if (lockJson.packages?.['']) {
		lockJson.packages[''].version = nextVersion;
	}

	writeJson(lockPath, lockJson);
}

console.log(`Bumped llamaswap-widget to ${nextVersion} for commit ${currentCommit.slice(0, 7)}.`);
