import { LoadOptions } from 'devextreme/data';
import { CascadeBy } from '../cnx-cascade-value.types';

export interface ModuleTagBoxKeys {}

export type TagBoxKey = keyof ModuleTagBoxKeys extends never
    ? string
    : keyof ModuleTagBoxKeys;

export interface TagBoxParam extends CascadeBy {
    key?: any;
    isByKey?: boolean;
    loadOptions?: LoadOptions;
}

export interface TagBoxViewModel {
    text: string;
    value: any;
    dropdownText: string;
    [key: string]: any;
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
