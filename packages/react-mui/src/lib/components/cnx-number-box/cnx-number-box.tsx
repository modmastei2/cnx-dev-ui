import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    useMemo,
} from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import { ValueChangedEvent } from '../cnx-value-changed.types';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

export interface CnxNumberBoxProps {
    id?: string;
    name?: string;
    value?: number | null;
    format?: string;
    numberType?: 'positive' | 'negative' | 'percent' | 'positivePercent' | null;
    integer?: number;
    max?: number;
    min?: number;
    allowArrowKey?: boolean;
    step?: number;
    allowEmpty?: boolean;
    showClearButton?: boolean;
    disabled?: boolean;
    valueChangeEvent?: 'change' | 'blur';
    onValueChanged?: (e: ValueChangedEvent) => void;
    onEnterKey?: () => void;
}

function formatNumberValue(val: number | null, format: string): string {
    if (val === null || val === undefined) return '';
    const dotIndex = format.indexOf('.');
    const decimalDigits = dotIndex >= 0 ? format.length - dotIndex - 1 : 0;
    const useGrouping = format.includes(',');
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimalDigits,
        maximumFractionDigits: decimalDigits,
        useGrouping,
    }).format(val);
}

export const CnxNumberBox: React.FC<CnxNumberBoxProps> = ({
    id,
    name,
    value = null,
    format = '#,##0.00',
    numberType,
    integer = 0,
    max,
    min,
    allowArrowKey = true,
    step = 1,
    allowEmpty = true,
    showClearButton = true,
    disabled = false,
    valueChangeEvent = 'blur',
    onValueChanged,
    onEnterKey,
}) => {
    const valueRef = useRef(value);
    const onValueChangedRef = useRef(onValueChanged);
    const onEnterKeyRef = useRef(onEnterKey);

    // Keep track of the last value emitted during blur to prevent duplicate emissions
    const lastEmittedValueRef = useRef(value);

    useEffect(() => {
        valueRef.current = value;
        onValueChangedRef.current = onValueChanged;
        onEnterKeyRef.current = onEnterKey;
    }, [value, onValueChanged, onEnterKey]);

    const [isFocused, setIsFocused] = useState(false);
    const [strValue, setStrValue] = useState<string>(
        value !== null && value !== undefined ? String(value) : '',
    );

    const maxPossibleDigit = 15;

    const { internalMin, internalMax } = useMemo(() => {
        let computedMax: number | undefined = max;
        let computedMin: number | undefined = min;

        const dotIndex = format.indexOf('.');
        const decimalCount = dotIndex >= 0 ? format.length - dotIndex - 1 : 0;
        let intCount = integer || maxPossibleDigit - decimalCount;
        if (!integer && !decimalCount) intCount = 9;

        const bigNum = +(
            ''.padEnd(intCount, '9') +
            (decimalCount ? '.' + ''.padEnd(decimalCount, '9') : '')
        );

        if (numberType === 'positive') {
            if (computedMax === undefined) computedMax = bigNum;
            if (computedMin === undefined) computedMin = 0;
        } else if (numberType === 'negative') {
            if (computedMax === undefined) computedMax = 0;
            if (computedMin === undefined) computedMin = -bigNum;
        } else if (numberType === 'percent') {
            if (computedMax === undefined) computedMax = 100;
            if (computedMin === undefined) computedMin = -100;
        } else if (numberType === 'positivePercent') {
            if (computedMax === undefined) computedMax = 100;
            if (computedMin === undefined) computedMin = 0;
        } else {
            if (computedMax === undefined) computedMax = bigNum;
            if (computedMin === undefined) computedMin = -bigNum;
        }

        return { internalMin: computedMin, internalMax: computedMax };
    }, [numberType, integer, max, min, format]);

    const handleChange = useCallback(
        (newValue: number | null, newStrValue?: string, forceEmit = false) => {
            const oldValue = valueRef.current;

            if (newStrValue !== undefined) {
                setStrValue(newStrValue);
            } else {
                setStrValue(
                    newValue !== null && newValue !== undefined
                        ? String(newValue)
                        : '',
                );
            }

            if (oldValue === newValue) return;

            if (valueChangeEvent === 'change' || forceEmit) {
                lastEmittedValueRef.current = newValue;
                onValueChangedRef.current?.({
                    previousValue: oldValue,
                    value: newValue,
                });
            }
        },
        [valueChangeEvent],
    );

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        setStrValue(value !== null && value !== undefined ? String(value) : '');
        lastEmittedValueRef.current = value;
    }, [value]);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
        const parsed = parseFloat(strValue.replace(/,/g, ''));
        let next: number | null =
            strValue === '' || isNaN(parsed) ? null : parsed;

        if (next !== null) {
            if (internalMax !== undefined && next > internalMax)
                next = internalMax;
            if (internalMin !== undefined && next < internalMin)
                next = internalMin;

            // Round to the number of decimal places defined in the format
            const dotIndex = format.indexOf('.');
            const decimalDigits =
                dotIndex >= 0 ? format.length - dotIndex - 1 : 0;
            const factor = Math.pow(10, decimalDigits);
            next = Math.round(next * factor) / factor;
        }

        if (!allowEmpty && (next === null || next === undefined)) {
            next = 0;
        }

        handleChange(next);

        // If mode is blur and value changed from the last emitted value
        if (
            valueChangeEvent === 'blur' &&
            lastEmittedValueRef.current !== next
        ) {
            const prev = lastEmittedValueRef.current;
            lastEmittedValueRef.current = next;
            onValueChangedRef.current?.({
                previousValue: prev,
                value: next,
            });
        }

        setStrValue(
            next !== null
                ? allowEmpty && next === 0
                    ? ''
                    : formatNumberValue(next, format)
                : '',
        );
    }, [
        strValue,
        internalMin,
        internalMax,
        allowEmpty,
        format,
        valueChangeEvent,
        handleChange,
    ]);

    useEffect(() => {
        if (!isFocused) {
            setStrValue(
                value !== null && value !== undefined
                    ? isFocused
                        ? String(value)
                        : allowEmpty && value === 0
                          ? ''
                          : formatNumberValue(value, format)
                    : allowEmpty
                      ? ''
                      : '0',
            );
        }
    }, [value, format, allowEmpty, isFocused]);

    const displayValue = isFocused
        ? strValue
        : value !== null && value !== undefined
          ? allowEmpty && value === 0
              ? ''
              : formatNumberValue(value, format)
          : allowEmpty
            ? ''
            : '0';

    const handleIncrement = useCallback(
        (e?: React.SyntheticEvent) => {
            if (e) {
                e.stopPropagation();
                if (e.type === 'keydown') e.preventDefault();
            }
            const parsed = parseFloat(strValue.replace(/,/g, ''));
            const current = (isNaN(parsed) ? valueRef.current : parsed) ?? 0;
            const next = +parseFloat((current + step).toFixed(10));
            if (internalMax !== undefined && next > internalMax) return;
            handleChange(next, String(next), true);
        },
        [step, internalMax, strValue, handleChange],
    );

    const handleDecrement = useCallback(
        (e?: React.SyntheticEvent) => {
            if (e) {
                e.stopPropagation();
                if (e.type === 'keydown') e.preventDefault();
            }
            const parsed = parseFloat(strValue.replace(/,/g, ''));
            const current = (isNaN(parsed) ? valueRef.current : parsed) ?? 0;
            const next = +parseFloat((current - step).toFixed(10));
            if (internalMin !== undefined && next < internalMin) return;
            handleChange(next, String(next), true);
        },
        [step, internalMin, strValue, handleChange],
    );

    const handleClear = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            handleChange(allowEmpty ? null : 0, '', true);
        },
        [allowEmpty, handleChange],
    );

    const handleTextInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const val = e.target.value;
            const isPositive =
                numberType === 'positive' || numberType === 'positivePercent';
            const regex = isPositive ? /^\d*\.?\d*$/ : /^-?\d*\.?\d*$/;

            if (!regex.test(val)) return;

            if (val === '' || val === '-') {
                handleChange(allowEmpty ? null : 0, val);
                return;
            }

            const parsed = parseFloat(val);
            if (!isNaN(parsed)) {
                handleChange(parsed, val);
            }
        },
        [numberType, allowEmpty, handleChange],
    );

    const inputPropsObj = useMemo(
        () => ({ inputMode: 'decimal' as const }),
        [],
    );

    const InputPropsObj = useMemo(
        () => ({
            endAdornment: (
                <React.Fragment>
                    {showClearButton &&
                        allowEmpty &&
                        value !== null &&
                        value !== 0 && (
                            <IconButton
                                size="small"
                                sx={{ mr: allowArrowKey ? 0.5 : 1 }}
                                onClick={handleClear}
                                tabIndex={-1}
                            >
                                <ClearIcon
                                    titleAccess="Clear"
                                    fontSize="small"
                                />
                            </IconButton>
                        )}
                    {allowArrowKey && (
                        <InputAdornment position="end">
                            <Box
                                display="flex"
                                flexDirection="column"
                                sx={{ mr: -1 }}
                            >
                                <IconButton
                                    size="small"
                                    sx={{ p: '1px' }}
                                    disabled={
                                        disabled ||
                                        (internalMax !== undefined &&
                                            (value ?? 0) >= internalMax)
                                    }
                                    tabIndex={-1}
                                    onClick={handleIncrement}
                                >
                                    <KeyboardArrowUpIcon
                                        sx={{ fontSize: 14 }}
                                    />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    sx={{ p: '1px' }}
                                    disabled={
                                        disabled ||
                                        (internalMin !== undefined &&
                                            (value ?? 0) <= internalMin)
                                    }
                                    tabIndex={-1}
                                    onClick={handleDecrement}
                                >
                                    <KeyboardArrowDownIcon
                                        sx={{ fontSize: 14 }}
                                    />
                                </IconButton>
                            </Box>
                        </InputAdornment>
                    )}
                </React.Fragment>
            ),
        }),
        [
            showClearButton,
            value,
            allowEmpty,
            allowArrowKey,
            handleClear,
            handleIncrement,
            handleDecrement,
        ],
    );
    return (
        <FormControl fullWidth size="small">
            <TextField
                id={`cnx_number_box_${id}`}
                name={`cnx_number_box_${name}`}
                size="small"
                value={displayValue}
                disabled={disabled}
                onChange={handleTextInput}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onEnterKeyRef.current?.();
                    } else if (allowArrowKey && e.key === 'ArrowUp') {
                        handleIncrement(e);
                    } else if (allowArrowKey && e.key === 'ArrowDown') {
                        handleDecrement(e);
                    }
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                inputProps={inputPropsObj}
                InputProps={InputPropsObj}
            />
        </FormControl>
    );
};

export default React.memo(CnxNumberBox);
