export interface IParameterTypeDefinition<T, C extends Mocha.Context> {
  name: string;
  regexp: RegExp;
  transformer: (this: C, ...match: string[]) => T;
}

export interface IHookBody {
  (this: Mocha.Context): void;
}

export interface IStepDefinitionBody<
  T extends unknown[],
  C extends Mocha.Context
> {
  (this: C, ...args: T): void;
}

export type YieldType<T extends Generator> = T extends Generator<infer R>
  ? R
  : never;
