import type { NormalizedAST, DiffSet } from '../types/index.js';
import { diffEndpoints } from './endpoint-differ.js';
import { diffSecuritySchemes } from './auth-differ.js';
import { diffServers } from './server-differ.js';

export function computeDiff(oldAST: NormalizedAST, newAST: NormalizedAST): DiffSet {
  return {
    endpointDiffs: diffEndpoints(oldAST.endpoints, newAST.endpoints),
    schemaDiffs: [], 
    securityDiffs: diffSecuritySchemes(oldAST.security, newAST.security),
    serverDiffs: diffServers(oldAST.servers, newAST.servers)
  };
}
