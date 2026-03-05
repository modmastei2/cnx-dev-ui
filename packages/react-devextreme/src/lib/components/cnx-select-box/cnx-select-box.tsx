import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback,
} from 'react';
import { SelectBox } from 'devextreme-react/select-box';
import DataSource from 'devextreme/data/data_source';
import type { EventInfo } from 'devextreme/events';
import type { ValueChangedEvent } from 'devextreme/ui/select_box';
import type { LoadOptions } from 'devextreme/data';
import { useSelectBoxDataProvider } from './cnx-select-box.context';
import type {
    SelectBoxKey,
    SelectBoxParam,
    SelectBoxViewModel,
} from './cnx-select-box.types';
import type { CascadeRule } from '../cnx-cascade-value.types';

export interface CnxSelectBoxProps {
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
    value?: string | number | null;
    customDataSource?: any[];
    dropdownWidth?: string | number;
    maxLength?: number;
    disabled?: boolean;
    cascadeRule?: CascadeRule | CascadeRule[];
    cascadeBy?: any;
    selectBoxKey?: SelectBoxKey | null;
    ignoreValue?: any[];
    onValueChanged?: (e: ValueChangedEvent) => void;
    onEnterKey?: () => void;
}

export const CnxSelectBox: React.FC<CnxSelectBoxProps> = ({
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
    value = '',
    customDataSource,
    dropdownWidth,
    maxLength = 0,
    disabled = false,
    cascadeRule,
    cascadeBy,
    selectBoxKey = null,
    ignoreValue,
    onValueChanged,
    onEnterKey,
}) => {
    const service = useSelectBoxDataProvider();
    const selectBoxRef = useRef<SelectBox>(null);

    // States
    const [dataSource, setDataSource] = useState<DataSource | null>(null);

    // Stable refs — ทำให้ setupDataSourceOnLoad/ByKey ไม่ถูก recreate ทุกครั้ง
    const valueRef = useRef(value);
    const customDataSourceRef = useRef(customDataSource);
    const cascadeRuleRef = useRef(cascadeRule);
    const cascadeByRef = useRef(cascadeBy);
    const ignoreValueRef = useRef(ignoreValue);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);
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

    const paginate = true;
    const pageSize = 50;

    const resolvedSearchExpr = dropdownExpr || searchExpr;

    // ---- Helpers (อ่านจาก ref ทำให้ stable ไม่เพิ่ม dependency ให้ useCallback) ----

    const applyCascadeRule = useCallback(
        (items: SelectBoxViewModel[]): SelectBoxViewModel[] => {
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
        (items: SelectBoxViewModel[]): SelectBoxViewModel[] => {
            const ignore = ignoreValueRef.current;
            if (!ignore?.length) return items;
            return items.filter((item) => !ignore.includes(item[valueExpr]));
        },
        [valueExpr],
    ); // valueExpr แทบไม่เปลี่ยน แต่เป็น string prop จึงใส่ไว้

    // ---- Load callback (stable เพราะ helper ทั้งสองก็ stable) ----

    const setupDataSourceOnLoad = useCallback(
        async (loadOptions: LoadOptions) => {
            if ((loadOptions?.take ?? 0) === 0) {
                return { data: [], totalCount: 0 };
            }

            // Handle custom memory data source
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
            if (selectBoxKey && service) {
                const result = await service.getService(selectBoxKey, {
                    key: valueRef.current,
                    cascadeBy: cascadeByRef.current,
                    loadOptions: { ...loadOptions } as LoadOptions,
                } as SelectBoxParam);

                result.data = applyIgnoreValue(result.data);

                return result || { data: [], totalCount: 0 };
            }

            return { data: [], totalCount: 0 };
        },
        [
            selectBoxKey,
            service,
            resolvedSearchExpr,
            displayExpr,
            applyCascadeRule,
            applyIgnoreValue,
        ],
    );

    const setupDataSourceByKey = useCallback(
        async (key: any) => {
            if (!key) return [];

            if (
                customDataSourceRef.current &&
                Array.isArray(customDataSourceRef.current)
            ) {
                let filtered = [...customDataSourceRef.current];
                filtered = applyCascadeRule(filtered);
                filtered = applyIgnoreValue(filtered);
                return filtered.filter((item) => item[valueExpr] === key);
            }

            if (selectBoxKey && service) {
                const result = await service.getService(selectBoxKey, {
                    isByKey: true,
                    key,
                    cascadeBy: cascadeByRef.current,
                } as SelectBoxParam);

                result.data = applyIgnoreValue(result.data);
                return result?.data || [];
            }

            return [];
        },
        [selectBoxKey, service, valueExpr],
    );

    // ---- สร้าง DataSource ใหม่เมื่อ callback เปลี่ยน หรือเมื่อ cascade/ignore เปลี่ยน ----
    // cascadeBy/ignoreValue เป็น prop ที่ต้อง watch โดยตรงเพื่อ trigger reload
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
        <SelectBox
            ref={selectBoxRef}
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
            value={value}
            dropDownOptions={dropDownOptions}
            maxLength={maxLength > 0 ? maxLength : undefined}
            disabled={disabled}
            onValueChanged={handleValueChanged}
            onEnterKey={handleEnterKey}
        />
    );
};

export default CnxSelectBox;
