import { LoadOptions } from 'devextreme/data';
import { CascadeBy } from '../cnx-cascade-value.types';

export interface ModuleSelectBoxKeys {}

export type SelectBoxKey = keyof ModuleSelectBoxKeys extends never
    ? string
    : keyof ModuleSelectBoxKeys;

export interface SelectBoxParam extends CascadeBy {
    key?: any;
    isByKey?: boolean;
    loadOptions?: LoadOptions;
}

export interface SelectBoxViewModel {
    text: string;
    value: any;
    dropdownText: string;
    [key: string]: any;
}

export interface SelectBoxLoadResult {
    data: SelectBoxViewModel[];
    totalCount: number;
    hasInitialValue?: boolean;
}

/**
 * Interface that consumer apps must implement to provide data.
 * Replaces Angular's HTTP Service injection.
 */
export interface SelectBoxDataProvider {
    getService(
        key: SelectBoxKey | null | undefined,
        param: SelectBoxParam,
    ): Promise<SelectBoxLoadResult>;
}
