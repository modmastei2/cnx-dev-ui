import { useCallback, useEffect, useRef, useState } from 'react';
import { CascadeRule } from '../cnx-cascade-value.types';
import { ValueChangedEvent } from '../cnx-value-changed.types';
import { useTagBoxDataProvider } from './cnx-tag-box.context';
import {
    TagBoxLoadResult,
    TagBoxParam,
    TagBoxViewModel,
} from './cnx-tag-box.types';
import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';

export interface CnxTagBoxProps {
    id?: string;
    name?: string;
    width?: string | number;
    placeholder?: string;
    displayExpr?: string;
    valueExpr?: string;
    searchExpr?: string;
    searchEnabled?: boolean;
    groupByExpr?: string;
    showClearButton?: boolean;
    showSelectionControl?: boolean;
    value?: (string | number)[] | string | number | null;
    customDataSource?: any[];
    disabled?: boolean;
    cascadeRule?: CascadeRule | CascadeRule[];
    cascadeBy?: any;
    tagBoxKey?: string;
    ignoreValue?: string | string[];
    maxDispayTag?: number;
    onValueChanged?: (e: ValueChangedEvent) => void;
    onEnterKey?: () => void;
}

export const CnxTagBox: React.FC<CnxTagBoxProps> = ({
    id,
    name,
    placeholder = 'Please select...',
    displayExpr = 'text',
    valueExpr = 'value',
    searchExpr = 'text',
    searchEnabled = true,
    groupByExpr,
    showClearButton = true,
    showSelectionControl,
    value = null,
    customDataSource,
    disabled = false,
    cascadeRule,
    cascadeBy,
    tagBoxKey = null,
    ignoreValue,
    maxDispayTag,
    onValueChanged,
    onEnterKey,
}) => {
    const service = useTagBoxDataProvider();

    const [dataSource, setDataSource] = useState<TagBoxLoadResult | null>(null);
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
                (Array.isArray(currentValue)
                    ? currentValue.length > 0
                    : currentValue !== '')
            ) {
                onValueChangedRef.current?.({
                    previousValue: currentValue,
                    value: [],
                });
            }
        }
    }, [cascadeBy]);

    const applyCascadeRule = useCallback(
        (
            items: TagBoxViewModel[],
            rule: CascadeRule | CascadeRule[] | undefined,
            by: any,
        ): TagBoxViewModel[] => {
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
            items: TagBoxViewModel[],
            ignore: string | string[] | undefined,
        ): TagBoxViewModel[] => {
            if (!ignore || !ignore.length) return items;
            const ignores = Array.isArray(ignore) ? ignore : [ignore];
            return items.filter((item) => !ignores.includes(item[valueExpr]));
        },
        [valueExpr],
    );

    const setupDataSource = useCallback(async (): Promise<TagBoxLoadResult> => {
        if (
            customDataSourceRef.current &&
            Array.isArray(customDataSourceRef.current)
        ) {
            let filtered = [...customDataSourceRef.current];
            filtered = applyCascadeRule(filtered, cascadeRule, cascadeBy);
            filtered = applyIgnoreValue(filtered, ignoreValue);
            return { data: filtered, totalCount: filtered.length };
        }

        if (tagBoxKey && service) {
            const result = await service.getService(tagBoxKey, {
                cascadeBy,
            } as TagBoxParam);
            result.data = applyIgnoreValue(result?.data, ignoreValue);
            return { data: result.data, totalCount: result.totalCount };
        }

        return { data: [], totalCount: 0 };
    }, [
        tagBoxKey,
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
    const selectedOption = React.useMemo(() => {
        if (!dataSource?.data) return [];
        if (value === null || value === undefined || value === '') return [];
        const valuesArray = Array.isArray(value) ? value : [value];
        return dataSource.data.filter((option) =>
            valuesArray.includes(option[valueExpr] as string | number),
        );
    }, [dataSource, value, valueExpr]);

    return (
        <Autocomplete
            id={`cnx_tag_box_search_${id}`}
            multiple
            limitTags={maxDispayTag}
            options={dataSource?.data ?? []}
            loading={isLoading}
            disabled={disabled}
            disableClearable={!showClearButton}
            disableCloseOnSelect={showSelectionControl}
            groupBy={(option) => (groupByExpr ? option[groupByExpr] : '')}
            value={selectedOption}
            getOptionLabel={(option) => option[displayExpr] ?? ''}
            renderOption={(props, option, { selected }) => {
                const { key, ...optionProps } = props;
                const SelectionIcon = selected
                    ? CheckBoxIcon
                    : CheckBoxOutlineBlankIcon;
                return (
                    <li key={key} {...optionProps}>
                        {showSelectionControl ? (
                            <SelectionIcon
                                fontSize="medium"
                                style={{
                                    marginRight: 4,
                                    padding: 4,
                                    boxSizing: 'content-box',
                                }}
                            />
                        ) : null}
                        {option[displayExpr]}
                    </li>
                );
            }}
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
            slotProps={{
                chip: { size: 'small', variant: 'filled' },
            }}
            onChange={(_, newOptions) => {
                const newValues = Array.isArray(newOptions)
                    ? newOptions.map((opt) => opt[valueExpr])
                    : [];
                handleChange(newValues);
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') onEnterKeyRef.current?.();
            }}
            renderInput={(params) => (
                <TextField
                    name={`cnx_tag_box_search_${name}`}
                    {...params}
                    inputProps={{
                        ...params.inputProps,
                        readOnly: !searchEnabled,
                        style: {
                            cursor: !searchEnabled ? 'pointer' : undefined,
                            ...params.inputProps?.style,
                        },
                    }}
                    size="small"
                    placeholder={!selectedOption?.length ? placeholder : ''}
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

export default React.memo(CnxTagBox);
