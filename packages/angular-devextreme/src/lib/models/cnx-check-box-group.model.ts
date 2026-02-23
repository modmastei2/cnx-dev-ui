// Extend this interface in your app module to add strongly-typed keys
export interface ModuleCheckBoxKeys {}

export type CheckBoxKey = keyof ModuleCheckBoxKeys extends never
  ? string
  : keyof ModuleCheckBoxKeys;

export class CheckBoxParam {
  cascadeBy?: any;
}

export class CheckBoxViewModel {
  value!: string;
  text!: string;
  checked!: boolean;
  disabled?: boolean;
}

