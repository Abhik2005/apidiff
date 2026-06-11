import type { Server, ServerDiff } from '../types/index.js';

export function diffServers(oldServers: Server[], newServers: Server[]): ServerDiff[] {
  const diffs: ServerDiff[] = [];
  const oldUrls = new Set(oldServers.map(s => s.url));
  const newUrls = new Set(newServers.map(s => s.url));

  for (const server of oldServers) {
    if (!newUrls.has(server.url)) {
      diffs.push({ changeType: 'removed', oldServer: server });
    }
  }

  for (const server of newServers) {
    if (!oldUrls.has(server.url)) {
      diffs.push({ changeType: 'added', newServer: server });
    }
  }

  // We could diff server variables or descriptions, but the main semantic change is added/removed
  return diffs;
}
