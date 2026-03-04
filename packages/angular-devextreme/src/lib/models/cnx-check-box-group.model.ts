// Extend this interface in your app module to add strongly-typed keys
export interface ModuleCheckBoxKeys {}

export type CheckBoxKey = keyof ModuleCheckBoxKeys extends never
    ? string
    : keyof ModuleCheckBoxKeys;

export class CascadeRule {
    parentKey: string;
    childKey: string;
}

export interface Cascading {
    cascadeRule?: CascadeRule | CascadeRule[];
}

export interface CascadeBy {
    cascadeBy?: any;
}

export interface CheckBoxParam extends CascadeBy {}

export class CheckBoxViewModel {
    value!: string;
    text!: string;
    checked!: boolean;
    disabled?: boolean;
    [key: string]: any; // เสริม keyได้ตามสะดวก
}
