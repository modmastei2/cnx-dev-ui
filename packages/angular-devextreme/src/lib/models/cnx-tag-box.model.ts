import { LoadOptions } from 'devextreme/data';

export interface ModuleTagBoxKeys {}

export type TagBoxKey = keyof ModuleTagBoxKeys extends never
    ? string
    : keyof ModuleTagBoxKeys;

export class TagBoxParam {
    key?: any;
    cascadeBy?: any;
    isByKey?: boolean;
    loadOptions?: LoadOptions;
}

export class TagBoxViewModel {
    text: string;
    value: any;
    dropdownText: string;
    [key: string]: any;
}

export class TagBoxLoadResult {
    data: TagBoxViewModel[] = [];
    totalCount: number = 0;
    hasInitialValue?: boolean;
}
