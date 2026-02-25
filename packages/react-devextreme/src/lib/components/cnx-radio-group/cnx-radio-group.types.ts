export interface ModuleRadioGroupKeys {}

export type RadioGroupKey = keyof ModuleRadioGroupKeys extends never
    ? string
    : keyof ModuleRadioGroupKeys;

export interface RadioGroupParam {
    cascadeBy?: any;
}

export interface RadioGroupViewModel {
    value: string;
    text: string;
    disabled?: boolean;
}

export interface RadioGroupDataProvider {
    getService(
        key: RadioGroupKey | null | undefined,
        param: RadioGroupParam,
    ): Promise<RadioGroupViewModel[]>;
}
