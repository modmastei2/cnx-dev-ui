import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    useMemo,
} from 'react';
import { TagBox } from 'devextreme-react/tag-box';
import DataSource from 'devextreme/data/data_source';
import type { EventInfo } from 'devextreme/events';
import type { ValueChangedEvent } from 'devextreme/ui/tag_box';
import type { LoadOptions } from 'devextreme/data';
import { useTagBoxDataProvider } from './cnx-tag-box.context';
import type {
    TagBoxKey,
    TagBoxParam,
    TagBoxViewModel,
} from './cnx-tag-box.types';
import type { CascadeRule } from '../cnx-cascade-value.types';

export interface CnxTagBoxProps {
    id?: string;
    name?: string;
    width?: string | number;
    placeholder?: string;
    displayExpr?: string;
    valueExpr?: string;
    searchExpr?: string;
    dropdownExpr?: string;
    searchEnabled?: boolean;
    searchTimeout?: number;
    showClearButton?: boolean;
    showSelectionControls?: boolean;
    value?: string[] | number[] | null;
    customDataSource?: any[];
    dropdownWidth?: string | number;
    maxLength?: number;
    maxDisplayedTags?: number;
    disabled?: boolean;
    cascadeRule?: CascadeRule | CascadeRule[];
    cascadeBy?: any;
    ignoreValue?: any[];
    tagBoxKey?: TagBoxKey | null;
    onValueChanged?: (e: ValueChangedEvent) => void;
    onEnterKey?: () => void;
}

export const CnxTagBox: React.FC<CnxTagBoxProps> = ({
    id = '',
    name = '',
    width = '100%',
    placeholder = 'Please select...',
    displayExpr = 'text',
    valueExpr = 'value',
    searchExpr = 'dropdownText',
    dropdownExpr = 'dropdownText',
    searchEnabled = true,
    searchTimeout = 500,
    showClearButton = true,
    showSelectionControls = true,
    value = [],
    customDataSource,
    dropdownWidth,
    maxLength = 0,
    maxDisplayedTags,
    disabled = false,
    cascadeRule,
    cascadeBy,
    ignoreValue,
    tagBoxKey = null,
    onValueChanged,
    onEnterKey,
}) => {
    const service = useTagBoxDataProvider();
    const tagBoxRef = useRef<TagBox>(null);

    // Normalize internal value to string array to match Angular behavior
    const valueStr = JSON.stringify(value);
    const normalizedValue = useMemo(() => {
        return (value || []).map((e) => e.toString());
    }, [valueStr]);

    // Stable refs — ทำให้ callback ไม่ถูก recreate ทุกครั้งที่ prop เปลี่ยน
    const normalizedValueRef = useRef(normalizedValue);
    const customDataSourceRef = useRef(customDataSource);
    const cascadeRuleRef = useRef(cascadeRule);
    const cascadeByRef = useRef(cascadeBy);
    const ignoreValueRef = useRef(ignoreValue);

    useEffect(() => {
        normalizedValueRef.current = normalizedValue;
    }, [normalizedValue]);
    useEffect(() => {
        customDataSourceRef.current = customDataSource;
    }, [customDataSource]);
    useEffect(() => {
        cascadeRuleRef.current = cascadeRule;
    }, [cascadeRule]);
    useEffect(() => {
        cascadeByRef.current = cascadeBy;
    }, [cascadeBy]);
    useEffect(() => {
        ignoreValueRef.current = ignoreValue;
    }, [ignoreValue]);

    const onValueChangedRef = useRef(onValueChanged);
    const onEnterKeyRef = useRef(onEnterKey);
    useEffect(() => {
        onValueChangedRef.current = onValueChanged;
        onEnterKeyRef.current = onEnterKey;
    }, [onValueChanged, onEnterKey]);

    const [dataSource, setDataSource] = useState<DataSource | null>(null);

    const paginate = true;
    const pageSize = 50;

    const resolvedSearchExpr = dropdownExpr || searchExpr;

    // ---- Helpers (อ่านจาก ref → stable ไม่เพิ่ม dependency ให้ useCallback) ----

    const applyCascadeRule = useCallback(
        (items: TagBoxViewModel[]): TagBoxViewModel[] => {
            const rule = cascadeRuleRef.current;
            const by = cascadeByRef.current;
            if (!rule || by === undefined || by == null) return items;

            const rules = Array.isArray(rule) ? rule : [rule];
            return items.filter((item) =>
                rules.every((r) => {
                    const parentValue =
                        typeof by === 'object' && by !== null
                            ? by[r.childKey]
                            : by;
                    return item[r.childKey] === parentValue;
                }),
            );
        },
        [],
    ); // stable — อ่าน ref เสมอ ไม่มี dependency

    const applyIgnoreValue = useCallback(
        (items: TagBoxViewModel[]): TagBoxViewModel[] => {
            const ignore = ignoreValueRef.current;
            if (!ignore?.length) return items;
            return items.filter(
                (item) => !ignore.includes((item as any)[valueExpr]),
            );
        },
        [valueExpr],
    );

    // ---- Load callback ----

    const setupDataSourceOnLoad = useCallback(
        async (loadOptions: LoadOptions) => {
            let fromFilter = loadOptions?.filter
                ?.filter((item: any) => typeof item === 'object')
                .map((item: any[]) => {
                    let index = item?.length - 1 >= 0 ? item?.length - 1 : 0;
                    let i = item[index];
                    return i;
                });

            // Handle In-Memory Custom DataSource
            if (
                customDataSourceRef.current &&
                Array.isArray(customDataSourceRef.current)
            ) {
                let filtered = applyCascadeRule([
                    ...customDataSourceRef.current,
                ]);
                filtered = applyIgnoreValue(filtered);

                if (loadOptions?.searchValue) {
                    const search = loadOptions.searchValue
                        .toString()
                        .toLowerCase();
                    filtered = filtered.filter(
                        (item) =>
                            (item[resolvedSearchExpr]?.toString() || '')
                                .toLowerCase()
                                .includes(search) ||
                            (item[displayExpr]?.toString() || '')
                                .toLowerCase()
                                .includes(search),
                    );
                }

                const skip = loadOptions?.skip ?? 0;
                const take = loadOptions?.take ?? 50;
                const pagedData = filtered.slice(skip, skip + take);

                return {
                    data: pagedData,
                    totalCount: filtered.length,
                    hasInitialValue: false,
                };
            }

            // Key-based service
            if (tagBoxKey && service) {
                const result = await service.getService(tagBoxKey, {
                    key: (fromFilter?.length ?? 0) > 0 ? fromFilter : [],
                    cascadeBy: cascadeByRef.current,
                    loadOptions: {
                        ...loadOptions,
                        searchValue: loadOptions.searchValue,
                        take: pageSize,
                    } as LoadOptions,
                } as TagBoxParam);

                result.data = applyIgnoreValue(result.data);

                const hasInitialValue = result?.hasInitialValue ?? false;

                // Optionally mutate current TagBox instance value if missing loaded dependencies
                if (hasInitialValue && tagBoxRef.current?.instance) {
                    let all = new Set(
                        result.data.map((x: TagBoxViewModel) => x.value),
                    );
                    const safeValue = normalizedValueRef.current.filter((x) =>
                        all.has(x),
                    );
                    tagBoxRef.current.instance.option('value', safeValue);
                }

                return result || { data: [], totalCount: 0 };
            }

            return { data: [], totalCount: 0 };
        },
        [
            tagBoxKey,
            service,
            pageSize,
            displayExpr,
            resolvedSearchExpr,
            applyCascadeRule,
            applyIgnoreValue,
        ],
    );

    const setupDataSourceByKey = useCallback(
        async (key: any | string | number) => {
            if (!key) return [];

            if (
                customDataSourceRef.current &&
                Array.isArray(customDataSourceRef.current)
            ) {
                let keys = Array.isArray(key) ? key : [key];
                let filtered = applyCascadeRule([
                    ...customDataSourceRef.current,
                ]);
                filtered = applyIgnoreValue(filtered);
                return filtered.filter((item) =>
                    keys.includes(item[valueExpr]),
                );
            }

            if (tagBoxKey && service) {
                const result = await service.getService(tagBoxKey, {
                    isByKey: true,
                    key: key,
                } as TagBoxParam);

                result.data = applyIgnoreValue(result.data);
                return result?.data || [];
            }

            return [];
        },
        [tagBoxKey, service, valueExpr],
    );

    // สร้าง DataSource ใหม่เมื่อ callback เปลี่ยน หรือเมื่อ cascade/ignore เปลี่ยน
    useEffect(() => {
        const ds = new DataSource({
            load: setupDataSourceOnLoad,
            byKey: setupDataSourceByKey,
            paginate,
            pageSize,
            requireTotalCount: true,
        });
        setDataSource(ds);
    }, [setupDataSourceOnLoad, setupDataSourceByKey, cascadeBy, ignoreValue]);

    const handleValueChanged = useCallback((e: ValueChangedEvent) => {
        if (onValueChangedRef.current) {
            onValueChangedRef.current(e);
        }
    }, []);

    const handleEnterKey = useCallback((e: EventInfo<any>) => {
        if (onEnterKeyRef.current) {
            onEnterKeyRef.current();
        }
    }, []);

    const elementAttr = useMemo(() => ({ id, name }), [id, name]);
    const dropDownOptions = useMemo(
        () => ({ width: dropdownWidth }),
        [dropdownWidth],
    );

    return (
        <TagBox
            ref={tagBoxRef}
            dataSource={dataSource || undefined}
            elementAttr={elementAttr}
            width={width}
            placeholder={placeholder}
            displayExpr={displayExpr}
            valueExpr={valueExpr}
            searchExpr={resolvedSearchExpr}
            searchEnabled={searchEnabled}
            searchTimeout={searchTimeout}
            showClearButton={showClearButton}
            showSelectionControls={showSelectionControls}
            value={normalizedValue}
            dropDownOptions={dropDownOptions}
            maxLength={maxLength > 0 ? maxLength : undefined}
            maxDisplayedTags={maxDisplayedTags}
            disabled={disabled}
            onValueChanged={handleValueChanged}
            onEnterKey={handleEnterKey}
        />
    );
};

export default CnxTagBox;
