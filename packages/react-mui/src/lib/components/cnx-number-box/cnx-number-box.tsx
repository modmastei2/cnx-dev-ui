import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    useMemo,
} from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';

export interface CnxNumberBoxProps {
    id?: string;
    name?: string;
    disabled?: boolean;
    value?: number | null;
    format?: string;
    numberType?: 'positive' | 'negative' | 'percent' | 'positivePercent' | null;
    integer?: number;
    max?: number;
    min?: number;
    allowEmpty?: boolean;
    tabIndex?: number;
    disableArrow?: boolean;
    step?: number;
    onValueChanged?: (e: {
        value: number | null;
        previousValue?: number | null;
        fromInit?: boolean;
    }) => void;
    onEnterKey?: () => void;
}

function formatNumberValue(val: number | null, format: string): string {
    if (val === null || val === undefined) return '';
    // Parse format like '#,##0' or '#,##0.00'
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
    id = '',
    name = '',
    disabled = false,
    value = null,
    format = '#,##0',
    numberType = null,
    integer = 0,
    max,
    min,
    allowEmpty = false,
    tabIndex,
    disableArrow = false,
    step = 1,
    onValueChanged,
    onEnterKey,
}) => {
    const onValueChangedRef = useRef(onValueChanged);
    const onEnterKeyRef = useRef(onEnterKey);
    const previousValueRef = useRef<number | null>(value ?? null);

    useEffect(() => {
        onValueChangedRef.current = onValueChanged;
        onEnterKeyRef.current = onEnterKey;
    }, [onValueChanged, onEnterKey]);

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

    // Local display state for text field
    const [isFocused, setIsFocused] = useState(false);
    const [rawInput, setRawInput] = useState<string>(
        value !== null && value !== undefined ? String(value) : '',
    );

    useEffect(() => {
        if (!isFocused) {
            setRawInput(
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

    const emitChange = useCallback((next: number | null, fromInit = false) => {
        const prev = previousValueRef.current;
        previousValueRef.current = next;
        onValueChangedRef.current?.({
            value: next,
            previousValue: prev,
            fromInit,
        });
    }, []);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        setRawInput(value !== null && value !== undefined ? String(value) : '');
    }, [value]);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
        const parsed = parseFloat(rawInput.replace(/,/g, ''));
        let next: number | null =
            rawInput === '' || isNaN(parsed) ? null : parsed;

        if (next !== null) {
            if (internalMax !== undefined && next > internalMax)
                next = internalMax;
            if (internalMin !== undefined && next < internalMin)
                next = internalMin;
        }

        if (!allowEmpty && (next === null || next === undefined)) {
            next = 0;
        }

        emitChange(next);
        setRawInput(
            next !== null
                ? allowEmpty && next === 0
                    ? ''
                    : formatNumberValue(next, format)
                : '',
        );
    }, [rawInput, internalMin, internalMax, allowEmpty, format, emitChange]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setRawInput(e.target.value);
        },
        [],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                onEnterKeyRef.current?.();
                return;
            }
            if (
                disableArrow &&
                (e.key === 'ArrowUp' || e.key === 'ArrowDown')
            ) {
                e.preventDefault();
                return;
            }
        },
        [disableArrow],
    );

    const handleIncrement = useCallback(() => {
        const current = value ?? 0;
        const next = +parseFloat((current + step).toFixed(10));
        if (internalMax !== undefined && next > internalMax) return;
        emitChange(next);
    }, [value, step, internalMax, emitChange]);

    const handleDecrement = useCallback(() => {
        const current = value ?? 0;
        const next = +parseFloat((current - step).toFixed(10));
        if (internalMin !== undefined && next < internalMin) return;
        emitChange(next);
    }, [value, step, internalMin, emitChange]);

    const displayValue = isFocused
        ? rawInput
        : value !== null && value !== undefined
          ? allowEmpty && value === 0
              ? ''
              : formatNumberValue(value, format)
          : allowEmpty
            ? ''
            : '0';

    return (
        <TextField
            id={id}
            name={name}
            disabled={disabled}
            value={displayValue}
            inputProps={{ tabIndex, inputMode: 'decimal' }}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            size="small"
            fullWidth
            InputProps={
                !disableArrow
                    ? {
                          endAdornment: (
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
                                          onClick={handleIncrement}
                                          tabIndex={-1}
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
                                          onClick={handleDecrement}
                                          tabIndex={-1}
                                      >
                                          <KeyboardArrowDownIcon
                                              sx={{ fontSize: 14 }}
                                          />
                                      </IconButton>
                                  </Box>
                              </InputAdornment>
                          ),
                      }
                    : undefined
            }
        />
    );
};

export default CnxNumberBox;
