/** Development layout only; never used as an installed plugin registry. */
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
export const workspaceRoot = resolve(import.meta.dirname, "../..");
export const packageCatalog = Object.freeze(JSON.parse(readFileSync(join(workspaceRoot, 'packages/catalog.json'), 'utf8')));
export const packageEntries = () => packageCatalog.packages;
export function packageEntry(id) {
    const entry = packageEntries().find(row => row.id === id || row.name === id || row.directory.split('/').at(-1) === id);
    if (!entry) throw Error('Unknown development package: ' + id);
    return entry;
}
export const packageDirectory = id => packageEntry(id).directory;
