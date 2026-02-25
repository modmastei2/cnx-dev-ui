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
import type { SelectBoxKey, SelectBoxParam } from './cnx-select-box.types';

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

    // Refs for stable callbacks
    const valueRef = useRef(value);
    const ignoreValueRef = useRef(ignoreValue);
    const customDataSourceRef = useRef(customDataSource);

    // Track cascading changes securely without inline object identity issues
    const cascadeByStr = JSON.stringify(cascadeBy);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const onValueChangedRef = useRef(onValueChanged);
    const onEnterKeyRef = useRef(onEnterKey);
    useEffect(() => {
        onValueChangedRef.current = onValueChanged;
        onEnterKeyRef.current = onEnterKey;
    }, [onValueChanged, onEnterKey]);

    useEffect(() => {
        ignoreValueRef.current = ignoreValue;
    }, [ignoreValue]);

    useEffect(() => {
        customDataSourceRef.current = customDataSource;
    }, [customDataSource]);

    const paginate = true;
    const pageSize = 50;

    const resolvedSearchExpr = dropdownExpr || searchExpr;

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
                let filtered = [...customDataSourceRef.current];
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
                let pagedData = filtered.slice(skip, skip + take);

                if (ignoreValueRef.current?.length) {
                    pagedData = pagedData.filter(
                        (f) => !ignoreValueRef.current!.includes(f[valueExpr]),
                    );
                }

                return {
                    data: pagedData,
                    totalCount: filtered.length,
                    hasInitialValue: false,
                };
            }

            // Key-based service
            if (selectBoxKey && service) {
                const parsedCascade = cascadeByStr
                    ? JSON.parse(cascadeByStr)
                    : undefined;
                const result = await service.getService(selectBoxKey, {
                    key: valueRef.current,
                    cascadeBy: parsedCascade,
                    loadOptions: { ...loadOptions } as LoadOptions,
                } as SelectBoxParam);

                if (ignoreValueRef.current?.length && result?.data) {
                    result.data = result.data.filter(
                        (f) => !ignoreValueRef.current!.includes(f.value),
                    );
                }
                return result || { data: [], totalCount: 0 };
            }

            return { data: [], totalCount: 0 };
        },
        [
            selectBoxKey,
            service,
            cascadeByStr,
            resolvedSearchExpr,
            displayExpr,
            valueExpr,
        ],
    );

    const setupDataSourceByKey = useCallback(
        async (key: any) => {
            if (!key) return [];

            if (
                customDataSourceRef.current &&
                Array.isArray(customDataSourceRef.current)
            ) {
                return customDataSourceRef.current.filter(
                    (item) => item[valueExpr] === key,
                );
            }

            if (selectBoxKey && service) {
                const parsedCascade = cascadeByStr
                    ? JSON.parse(cascadeByStr)
                    : undefined;
                const result = await service.getService(selectBoxKey, {
                    isByKey: true,
                    key,
                    cascadeBy: parsedCascade,
                } as SelectBoxParam);
                return result?.data || [];
            }

            return [];
        },
        [selectBoxKey, service, cascadeByStr, valueExpr],
    );

    useEffect(() => {
        // Wrap setup inside useEffect to respond to props change
        const ds = new DataSource({
            load: setupDataSourceOnLoad,
            byKey: setupDataSourceByKey,
            paginate,
            pageSize,
            requireTotalCount: true,
        });
        setDataSource(ds);
    }, [setupDataSourceOnLoad, setupDataSourceByKey]);

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
