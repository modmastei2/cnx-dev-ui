import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { CascadeRule } from '../cnx-cascade-value.types';
import type { ValueChangedEvent } from '../cnx-value-changed.types';
import type {
    SelectBoxLoadResult,
    SelectBoxParam,
    SelectBoxViewModel,
} from './cnx-select-box.types';
import { useSelectBoxDataProvider } from './cnx-select-box.context';

export interface CnxSelectBoxSearchProps {
    id?: string;
    name?: string;
    width?: string | number;
    placeholder?: string;
    displayExpr?: string;
    valueExpr?: string;
    searchExpr?: string;
    groupByExpr?: string;
    showClearButton?: boolean;
    value?: string | number | null;
    customDataSource?: any[];
    disabled?: boolean;
    cascadeRule?: CascadeRule | CascadeRule[];
    cascadeBy?: any;
    selectBoxKey?: string;
    ignoreValue?: string | string[];
    onValueChanged?: (e: ValueChangedEvent) => void;
    onEnterKey?: () => void;
}

export const CnxSelectBoxSearch: React.FC<CnxSelectBoxSearchProps> = ({
    id,
    name,
    placeholder = 'Please select...',
    displayExpr = 'text',
    valueExpr = 'value',
    searchExpr = 'text',
    groupByExpr,
    showClearButton = true,
    value = null,
    customDataSource,
    disabled = false,
    cascadeRule,
    cascadeBy,
    selectBoxKey = null,
    ignoreValue,
    onValueChanged,
    onEnterKey,
}) => {
    const service = useSelectBoxDataProvider();

    const [dataSource, setDataSource] = useState<SelectBoxLoadResult | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);

    // stable ref
    const customDataSourceRef = useRef(customDataSource);
    const valueRef = useRef(value);
    const onValueChangedRef = useRef(onValueChanged);
    const onEnterKeyRef = useRef(onEnterKey);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);
    useEffect(() => {
        customDataSourceRef.current = customDataSource;
    }, [customDataSource]);
    useEffect(() => {
        onValueChangedRef.current = onValueChanged;
    }, [onValueChanged]);
    useEffect(() => {
        onEnterKeyRef.current = onEnterKey;
    }, [onEnterKey]);

    const prevCascadeByRef = useRef(cascadeBy);
    useEffect(() => {
        if (
            JSON.stringify(prevCascadeByRef.current) !==
            JSON.stringify(cascadeBy)
        ) {
            prevCascadeByRef.current = cascadeBy;
            const currentValue = valueRef.current;
            if (
                currentValue !== null &&
                currentValue !== undefined &&
                currentValue !== ''
            ) {
                onValueChangedRef.current?.({
                    previousValue: currentValue,
                    value: null,
                });
            }
        }
    }, [cascadeBy]);

    const applyCascadeRule = useCallback(
        (
            items: SelectBoxViewModel[],
            rule: CascadeRule | CascadeRule[] | undefined,
            by: any,
        ): SelectBoxViewModel[] => {
            if (!rule || by == null) return items;
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
    );

    const applyIgnoreValue = useCallback(
        (
            items: SelectBoxViewModel[],
            ignore: string | string[] | undefined,
        ): SelectBoxViewModel[] => {
            if (!ignore || !ignore.length) return items;
            const ignores = Array.isArray(ignore) ? ignore : [ignore];
            return items.filter((item) => !ignores.includes(item[valueExpr]));
        },
        [valueExpr],
    );

    const setupDataSource =
        useCallback(async (): Promise<SelectBoxLoadResult> => {
            if (
                customDataSourceRef.current &&
                Array.isArray(customDataSourceRef.current)
            ) {
                let filtered = [...customDataSourceRef.current];
                filtered = applyCascadeRule(filtered, cascadeRule, cascadeBy);
                filtered = applyIgnoreValue(filtered, ignoreValue);
                return { data: filtered, totalCount: filtered.length };
            }

            if (selectBoxKey && service) {
                const result = await service.getService(selectBoxKey, {
                    cascadeBy,
                } as SelectBoxParam);
                result.data = applyIgnoreValue(result?.data, ignoreValue);
                return { data: result.data, totalCount: result.totalCount };
            }

            return { data: [], totalCount: 0 };
        }, [
            selectBoxKey,
            service,
            applyCascadeRule,
            applyIgnoreValue,
            cascadeBy,
            cascadeRule,
            ignoreValue,
        ]);

    useEffect(() => {
        let cancelled = false;
        const loadData = async () => {
            setIsLoading(true);
            const ds = await setupDataSource();
            if (!cancelled) {
                setDataSource(ds);
                setIsLoading(false);
            }
        };
        loadData();
        return () => {
            cancelled = true;
        };
    }, [setupDataSource]);

    const handleChange = useCallback((newValue: any) => {
        const oldValue = valueRef.current;
        if (oldValue === newValue) return;
        onValueChangedRef.current?.({
            previousValue: oldValue,
            value: newValue,
        });
    }, []);

    // หา option object จาก value ปัจจุบัน
    const selectedOption =
        dataSource?.data?.find((option) => option[valueExpr] === value) ?? null;

    return (
        <Autocomplete
            id={id ? `cnx_select_box_search_${id}` : undefined}
            options={dataSource?.data ?? []}
            loading={isLoading}
            disabled={disabled}
            disableClearable={!showClearButton}
            groupBy={(option) => (groupByExpr ? option[groupByExpr] : '')}
            value={selectedOption}
            getOptionLabel={(option) => option[displayExpr] ?? ''}
            isOptionEqualToValue={(option, val) =>
                option[valueExpr] === val[valueExpr]
            }
            filterOptions={(options, { inputValue }) => {
                if (!inputValue) return options;
                const lower = inputValue.toLowerCase();
                return options.filter((o) =>
                    String(o[searchExpr] ?? '')
                        .toLowerCase()
                        .includes(lower),
                );
            }}
            onChange={(_, newOption) => {
                handleChange(newOption ? newOption[valueExpr] : null);
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') onEnterKeyRef.current?.();
            }}
            renderInput={(params) => (
                <TextField
                    name={name ? `cnx_select_box_search_${name}` : undefined}
                    {...params}
                    size="small"
                    placeholder={placeholder}
                    sx={{
                        '& .MuiAutocomplete-clearIndicator': {
                            visibility: 'visible',
                        },
                    }}
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {isLoading && (
                                        <CircularProgress size={16} />
                                    )}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        },
                    }}
                />
            )}
        />
    );
};

export default React.memo(CnxSelectBoxSearch);
