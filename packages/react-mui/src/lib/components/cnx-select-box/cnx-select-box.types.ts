export interface ModuleSelectBoxKeys {}

export type SelectBoxKey = keyof ModuleSelectBoxKeys extends never
    ? string
    : keyof ModuleSelectBoxKeys;

export interface SelectBoxParam {
    key?: any;
    cascadeBy?: any;
    isByKey?: boolean;
    skip?: number;
    take?: number;
    searchValue?: string;
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
