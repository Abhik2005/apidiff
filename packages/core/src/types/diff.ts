import type { Endpoint, Schema, SecurityScheme, Server } from './ast.js';

export type ChangeType = 'added' | 'removed' | 'changed';

export interface DiffSet {
  endpointDiffs: EndpointDiff[];
  schemaDiffs: SchemaDiff[];
  securityDiffs: SecurityDiff[];
  serverDiffs: ServerDiff[];
}

export interface EndpointDiff {
  type: ChangeType;
  endpointId: string;
  path: string;
  method: string;
  oldEndpoint?: Endpoint;
  newEndpoint?: Endpoint;
  fieldChanges: FieldChange[];
}

export interface SchemaDiff {
  schemaName: string;
  changeType: ChangeType;
  oldSchema?: Schema;
  newSchema?: Schema;
  fieldChanges: FieldChange[];
}

export interface SecurityDiff {
  schemeId: string;
  changeType: ChangeType;
  oldScheme?: SecurityScheme;
  newScheme?: SecurityScheme;
  fieldChanges: FieldChange[];
}

export interface ServerDiff {
  changeType: ChangeType;
  oldServer?: Server;
  newServer?: Server;
}

export interface FieldChange {
  fieldPath: string[];
  changeType: ChangeType;
  oldValue?: unknown;
  newValue?: unknown;
}
