import { LoadOptions } from 'devextreme/data';

export interface ModuleTagBoxKeys {}

export type TagBoxKey = keyof ModuleTagBoxKeys extends never
    ? string
    : keyof ModuleTagBoxKeys;

export interface TagBoxParam {
    key?: any;
    cascadeBy?: any;
    isByKey?: boolean;
    loadOptions?: LoadOptions;
}

export interface TagBoxViewModel {
    text: string;
    value: any;
    dropdownText: string;
}

export interface TagBoxLoadResult {
    data: TagBoxViewModel[];
    totalCount: number;
    hasInitialValue?: boolean;
}

export interface TagBoxDataProvider {
    getService(
        key: TagBoxKey | null | undefined,
        param: TagBoxParam,
    ): Promise<TagBoxLoadResult>;
}
