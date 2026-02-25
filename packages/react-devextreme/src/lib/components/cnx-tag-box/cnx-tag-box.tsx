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
    cascadeBy?: any;
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
    cascadeBy,
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

    const normalizedValueRef = useRef(normalizedValue);
    useEffect(() => {
        normalizedValueRef.current = normalizedValue;
    }, [normalizedValue]);

    const customDataSourceRef = useRef(customDataSource);
    const cascadeByStr = JSON.stringify(cascadeBy);
    useEffect(() => {
        customDataSourceRef.current = customDataSource;
    }, [customDataSource]);

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

                return {
                    data: pagedData,
                    totalCount: filtered.length,
                    hasInitialValue: false,
                };
            }

            // Key-based service
            if (tagBoxKey && service) {
                const parsedCascade = cascadeByStr
                    ? JSON.parse(cascadeByStr)
                    : undefined;
                const result = await service.getService(tagBoxKey, {
                    key: (fromFilter?.length ?? 0) > 0 ? fromFilter : [],
                    cascadeBy: parsedCascade,
                    loadOptions: {
                        ...loadOptions,
                        searchValue: loadOptions.searchValue,
                        take: pageSize,
                    } as LoadOptions,
                } as TagBoxParam);

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
            cascadeByStr,
            pageSize,
            displayExpr,
            resolvedSearchExpr,
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
                return customDataSourceRef.current.filter((item) =>
                    keys.includes(item[valueExpr]),
                );
            }

            if (tagBoxKey && service) {
                const result = await service.getService(tagBoxKey, {
                    isByKey: true,
                    key: key,
                } as TagBoxParam);
                return result?.data || [];
            }

            return [];
        },
        [tagBoxKey, service, valueExpr],
    );

    useEffect(() => {
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
