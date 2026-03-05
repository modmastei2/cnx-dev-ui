import { CascadeBy } from '../cnx-cascade-value.types';

export interface ModuleRadioGroupKeys {}

export type RadioGroupKey = keyof ModuleRadioGroupKeys extends never
    ? string
    : keyof ModuleRadioGroupKeys;

export interface RadioGroupParam extends CascadeBy {}

export interface RadioGroupViewModel {
    value: string;
    text: string;
    disabled?: boolean;
    [key: string]: any;
}

export interface RadioGroupDataProvider {
    getService(
        key: RadioGroupKey | null | undefined,
        param: RadioGroupParam,
    ): Promise<RadioGroupViewModel[]>;
}
