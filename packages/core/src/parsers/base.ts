import type { NormalizedAST, SpecFormat } from '../types/index.js';
import type { RawSpec } from '../loader/index.js';

export interface ISpecParser {
  readonly format: SpecFormat;
  canParse(raw: RawSpec): boolean;
  parse(raw: RawSpec): Promise<NormalizedAST>;
}
