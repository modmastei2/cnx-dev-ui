import { LoadOptions } from 'devextreme/data';

export interface ModuleSelectBoxKeys {}

export type SelectBoxKey = keyof ModuleSelectBoxKeys extends never
    ? string
    : keyof ModuleSelectBoxKeys;

export class SelectBoxParam {
    key?: any;
    cascadeBy?: any;
    isByKey?: boolean;
    loadOptions?: LoadOptions;
}

export class SelectBoxViewModel {
    text: string;
    value: any;
    dropdownText: string;
    [key: string]: any;
}

export class SelectBoxLoadResult {
    data: SelectBoxViewModel[] = [];
    totalCount: number = 0;
    hasInitialValue?: boolean;
}
