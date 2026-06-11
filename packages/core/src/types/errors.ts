export class ApidiffError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class LoadError extends ApidiffError {}
export class ParseError extends ApidiffError {
  constructor(
    message: string,
    public line?: number,
    public col?: number,
    public filePath?: string,
    cause?: Error
  ) {
    super(message, cause);
  }
}
export class RefError extends ApidiffError {
  constructor(message: string, public ref: string, cause?: Error) {
    super(message, cause);
  }
}
export class ConfigError extends ApidiffError {}
export class FormatError extends ApidiffError {}
