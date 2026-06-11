import yaml from 'js-yaml';
import { ParseError, FormatError } from '../types/errors.js';
import type { NormalizedAST, SpecFormat } from '../types/index.js';
import type { RawSpec } from '../loader/index.js';
import type { ISpecParser } from './base.js';

import { OpenApi3Parser } from './openapi3/index.js';
import { OpenApi2Parser } from './openapi2/index.js';
import { ProtobufParser } from './protobuf/index.js';
import { GraphqlParser } from './graphql/index.js';

const parsers: ISpecParser[] = [
  new OpenApi3Parser(),
  new OpenApi2Parser(),
  new ProtobufParser(),
  new GraphqlParser()
];

export function registerParser(parser: ISpecParser) {
  parsers.push(parser);
}

export function detectFormat(raw: RawSpec): SpecFormat {
  if (raw.format) return raw.format;

  const content = raw.content.trim();
  
  if (content.startsWith('syntax = "proto')) return 'protobuf';
  if (content.includes('type Query') || content.includes('type Mutation')) return 'graphql';
  
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    try {
      parsed = yaml.load(content);
    } catch {
      // not yaml or json
    }
  }

  if (parsed && typeof parsed === 'object') {
    if (parsed.openapi && typeof parsed.openapi === 'string' && parsed.openapi.startsWith('3.')) {
      return 'openapi3';
    }
    if (parsed.swagger && typeof parsed.swagger === 'string' && parsed.swagger.startsWith('2.')) {
      return 'openapi2';
    }
  }

  throw new FormatError('Could not detect format. Use --format openapi3|openapi2|protobuf|graphql');
}

export async function parseSpec(raw: RawSpec): Promise<NormalizedAST> {
  const format = detectFormat(raw);
  const parser = parsers.find(p => p.format === format);
  if (!parser) {
    throw new FormatError(`Parser for format '${format}' not implemented yet.`);
  }
  return parser.parse(raw);
}
