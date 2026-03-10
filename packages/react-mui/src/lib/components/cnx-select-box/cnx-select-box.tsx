import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import MenuItem from '@mui/material/MenuItem';

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import type {
    SelectBoxLoadResult,
    SelectBoxParam,
    SelectBoxViewModel,
} from './cnx-select-box.types';
import { useSelectBoxDataProvider } from './cnx-select-box.context';
import { CascadeRule } from '../cnx-cascade-value.types';
import { ValueChangedEvent } from '../cnx-value-changed.types';

export interface CnxSelectBoxProps {
    id?: string;
    name?: string;
    width?: string | number;
    placeholder?: string;
    displayExpr?: string;
    valueExpr?: string;
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

export const CnxSelectBox: React.FC<CnxSelectBoxProps> = ({
    id,
    name,
    placeholder = 'Please select...',
    displayExpr = 'text',
    valueExpr = 'value',
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
    const selectBoxRef = useRef<HTMLSelectElement>(null);

    const [dataSource, setDataSource] = useState<SelectBoxLoadResult | null>(
        null,
    );

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
                    cascadeBy: cascadeBy,
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
            const ds = await setupDataSource();
            if (!cancelled) setDataSource(ds);
        };

        loadData();
        return () => {
            cancelled = true;
        };
    }, [setupDataSource]);

    const handleChange = (newValue: any) => {
        const oldValue = valueRef.current;

        if (oldValue === newValue) return;

        onValueChangedRef.current?.({
            previousValue: oldValue,
            value: newValue,
        });
    };

    const renderIcon = useCallback((iconProp: any) => {
        return <ArrowDropDown titleAccess="Open" {...iconProp} />;
    }, []);

    const renderClearIcon = useCallback(
        () =>
            showClearButton && value ? (
                <IconButton
                    size="small"
                    sx={{ mr: 2 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleChange(null);
                    }}
                >
                    <ClearIcon titleAccess="Clear" fontSize="small" />
                </IconButton>
            ) : null,
        [showClearButton, value, handleChange],
    );

    const menuItems = useMemo(() => {
        return dataSource?.data?.map((option) => (
            <MenuItem key={option[valueExpr]} value={option[valueExpr]}>
                {option[displayExpr]}
            </MenuItem>
        ));
    }, [dataSource, valueExpr, displayExpr]);

    const isValueInOptions = useMemo(() => {
        if (!dataSource?.data || value == null || value === '') return false;
        return dataSource.data.some((option) => option[valueExpr] === value);
    }, [dataSource, value, valueExpr]);

    return (
        <FormControl fullWidth size="small">
            <Select
                id={`cnx_select_box_${id}`}
                name={`cnx_select_box_${name}`}
                ref={selectBoxRef}
                value={value ?? ''}
                disabled={disabled}
                onChange={(e) => {
                    handleChange(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') onEnterKeyRef.current?.();
                }}
                IconComponent={renderIcon}
                endAdornment={renderClearIcon()}
                displayEmpty
            >
                {placeholder && (
                    <MenuItem value="" disabled sx={{ display: 'none' }}>
                        <span className="text-content-1/45">{placeholder}</span>
                    </MenuItem>
                )}
                {value != null && value !== '' && !isValueInOptions && (
                    <MenuItem value={value as any} sx={{ display: 'none' }}>
                        {String(value)}
                    </MenuItem>
                )}
                {menuItems}
            </Select>
        </FormControl>
    );
};

export default React.memo(CnxSelectBox);
