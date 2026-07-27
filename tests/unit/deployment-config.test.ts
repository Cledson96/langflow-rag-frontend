import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

describe('production deployment configuration', () => {
  it('pins the VPS host key instead of trusting a scanned key', () => {
    const workflow = readProjectFile('.github/workflows/deploy.yml');

    expect(workflow).toContain('VPS_SSH_KNOWN_HOSTS');
    expect(workflow).toContain('StrictHostKeyChecking=yes');
    expect(workflow).not.toContain('ssh-keyscan');
  });

  it('keeps an existing TLS certificate and supports selecting an image tag for a rollback', () => {
    const workflow = readProjectFile('.github/workflows/deploy.yml');
    const deployScript = readProjectFile('scripts/deploy-docker.sh');
    const operations = readProjectFile('docs/operations.md');

    expect(workflow).toContain('image_tag:');
    expect(deployScript).toContain('--keep-until-expiring');
    expect(operations).toContain('image_tag');
  });
});
