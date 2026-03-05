import { CascadeBy } from './cnx-cascade-value';

// Extend this interface in your app module to add strongly-typed keys
export interface ModuleRadioGroupKeys {}

export type RadioGroupKey = keyof ModuleRadioGroupKeys extends never
    ? string
    : keyof ModuleRadioGroupKeys;

export class RadioGroupViewModel {
    value: string;
    text: string;
    [key: string]: any;
}

export class RadioGroupParam implements CascadeBy {
    cascadeBy?: any;
}
