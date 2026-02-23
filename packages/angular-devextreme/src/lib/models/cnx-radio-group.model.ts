// Extend this interface in your app module to add strongly-typed keys
export interface ModuleRadioGroupKeys {}

export type RadioGroupKey = keyof ModuleRadioGroupKeys extends never
  ? string
  : keyof ModuleRadioGroupKeys;

export class RadioGroupViewModel {
  value: string;
  text: string;

  constructor(value: string, text: string) {
    this.value = value;
    this.text = text;
  }
}

export class RadioGroupParam {
  cascadeBy?: any;
}
