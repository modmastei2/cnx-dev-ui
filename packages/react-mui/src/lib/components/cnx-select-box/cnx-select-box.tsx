import React, {
    useEffect,
    useState,
    useRef,
    useCallback,
    useMemo,
} from 'react';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useSelectBoxDataProvider } from './cnx-select-box.context';
import type { SelectBoxKey, SelectBoxViewModel } from './cnx-select-box.types';

export interface CnxSelectBoxProps {
    id?: string;
    name?: string;
    width?: string | number;
    placeholder?: string;
    displayExpr?: string;
    valueExpr?: string;
    searchExpr?: string;
    dropdownExpr?: string;
    /** @deprecated searchEnabled is not supported in Select mode */
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
    onValueChanged?: (e: { value: any; previousValue?: any }) => void;
    onEnterKey?: () => void;
}

export const CnxSelectBox: React.FC<CnxSelectBoxProps> = ({
    id = '',
    name = '',
    width = '100%',
    placeholder = 'Please select...',
    displayExpr = 'text',
    valueExpr = 'value',
    dropdownExpr = 'dropdownText',
    showClearButton = true,
    value = null,
    customDataSource,
    disabled = false,
    cascadeBy,
    selectBoxKey = null,
    ignoreValue,
    onValueChanged,
    onEnterKey,
}) => {
    const service = useSelectBoxDataProvider();
    const [options, setOptions] = useState<SelectBoxViewModel[]>([]);
    const previousValueRef = useRef<any>(value);
    const onValueChangedRef = useRef(onValueChanged);
    const onEnterKeyRef = useRef(onEnterKey);
    const cascadeByStr = JSON.stringify(cascadeBy);

    useEffect(() => {
        onValueChangedRef.current = onValueChanged;
        onEnterKeyRef.current = onEnterKey;
    }, [onValueChanged, onEnterKey]);

    const applyIgnore = useCallback(
        (items: any[]) => {
            if (!ignoreValue?.length) return items;
            return items.filter(
                (item) => !ignoreValue.includes(item[valueExpr]),
            );
        },
        [ignoreValue, valueExpr],
    );

    // Load data on mount / cascadeBy / key change
    useEffect(() => {
        if (customDataSource && Array.isArray(customDataSource)) {
            setOptions(applyIgnore([...customDataSource]));
            return;
        }

        if (selectBoxKey && service) {
            const parsedCascade = cascadeByStr
                ? JSON.parse(cascadeByStr)
                : undefined;
            service
                .getService(selectBoxKey, {
                    key: value,
                    cascadeBy: parsedCascade,
                    skip: 0,
                    take: 500,
                })
                .then((result) => setOptions(applyIgnore(result?.data || [])));
        } else if (!customDataSource) {
            setOptions([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectBoxKey, cascadeByStr, customDataSource, applyIgnore]);

    const safeValue = value ?? '';

    const hasValue =
        safeValue !== '' && safeValue !== null && safeValue !== undefined;

    const handleChange = useCallback(
        (e: SelectChangeEvent<string | number>) => {
            const prev = previousValueRef.current;
            const next = e.target.value === '' ? null : e.target.value;
            previousValueRef.current = next;
            onValueChangedRef.current?.({ value: next, previousValue: prev });
        },
        [],
    );

    const handleClear = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const prev = previousValueRef.current;
        previousValueRef.current = null;
        onValueChangedRef.current?.({ value: null, previousValue: prev });
    }, []);

    const containerWidth = typeof width === 'number' ? `${width}px` : width;

    // The display label shown in the Select box (can use dropdownExpr or displayExpr)
    const getLabel = useCallback(
        (item: any) => item[dropdownExpr] || item[displayExpr] || '',
        [dropdownExpr, displayExpr],
    );

    const renderValue = useCallback(
        (selected: any) => {
            if (!selected && selected !== 0) {
                return (
                    <span style={{ color: 'rgba(0,0,0,0.38)' }}>
                        {placeholder}
                    </span>
                );
            }
            const found = options.find((o: any) => o[valueExpr] === selected);
            return found ? getLabel(found) : String(selected);
        },
        [options, valueExpr, getLabel, placeholder],
    );

    const endIcon = useMemo(() => {
        if (hasValue && showClearButton && !disabled) {
            return (
                <IconButton
                    size="small"
                    onClick={handleClear}
                    sx={{ mr: 0.5 }}
                    tabIndex={-1}
                >
                    <ClearIcon fontSize="small" />
                </IconButton>
            );
        }
        return (props: any) => <ArrowDropDownIcon {...props} />;
    }, [hasValue, showClearButton, disabled, handleClear]);

    return (
        <FormControl
            fullWidth
            size="small"
            disabled={disabled}
            style={{ width: containerWidth }}
        >
            <Select
                id={id}
                name={name}
                value={safeValue as string}
                displayEmpty
                disabled={disabled}
                renderValue={renderValue}
                IconComponent={
                    hasValue && showClearButton && !disabled
                        ? () => (
                              <IconButton
                                  size="small"
                                  onClick={handleClear}
                                  sx={{ mr: 0.5, p: '4px' }}
                                  tabIndex={-1}
                              >
                                  <ClearIcon fontSize="small" />
                              </IconButton>
                          )
                        : ArrowDropDownIcon
                }
                onChange={handleChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') onEnterKeyRef.current?.();
                }}
                MenuProps={
                    {
                        // keep default MUI dropdown styling
                    }
                }
            >
                {placeholder && (
                    <MenuItem disabled value="">
                        <em>{placeholder}</em>
                    </MenuItem>
                )}
                {options.map((option: any) => (
                    <MenuItem key={option[valueExpr]} value={option[valueExpr]}>
                        {getLabel(option)}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default CnxSelectBox;
