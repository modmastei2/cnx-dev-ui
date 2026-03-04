export interface ModuleCheckBoxKeys {}

export type CheckBoxKey = keyof ModuleCheckBoxKeys extends never
    ? string
    : keyof ModuleCheckBoxKeys;

export interface CheckBoxParam {
    cascadeBy?: any;
}

export interface CheckBoxViewModel {
    value: string;
    text: string;
    checked?: boolean;
    disabled?: boolean;
}

export interface CheckBoxDataProvider {
    getService(
        key: CheckBoxKey | null | undefined,
        param: CheckBoxParam,
    ): Promise<CheckBoxViewModel[]>;
}
