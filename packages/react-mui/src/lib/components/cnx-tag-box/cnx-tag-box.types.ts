import { CascadeBy } from '../cnx-cascade-value.types';

export interface ModuleTagBoxKeys {}

export type TagBoxKey = keyof ModuleTagBoxKeys extends never
    ? string
    : keyof ModuleTagBoxKeys;

export interface TagBoxParam extends CascadeBy {}

export interface TagBoxViewModel {
    text: string;
    value: string;
    [key: string]: string;
}

export interface TagBoxLoadResult {
    data: TagBoxViewModel[];
    totalCount: number;
}

export interface TagBoxDataProvider {
    getService(
        key: TagBoxKey | null | undefined,
        param: TagBoxParam,
    ): Promise<TagBoxLoadResult>;
}
