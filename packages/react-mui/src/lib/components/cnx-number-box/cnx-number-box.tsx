import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
    TextField,
    InputAdornment,
    Box,
    FormControl,
    IconButton,
} from '@mui/material';
import {
    KeyboardArrowUp as KeyboardArrowUpIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import { ValueChangedEvent } from '../cnx-value-changed.types';

// ── ข้อ 7: ย้าย static object ออกนอก component ────────────────────────────
const INPUT_PROPS = { inputMode: 'decimal' as const };

export interface CnxNumberBoxProps {
    id?: string;
    name?: string;
    label?: string; // ── ข้อ 10: เพิ่ม label prop
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

// ── ข้อ 4: helper round ตาม decimal ของ format ───────────────────────────
function roundToFormat(val: number, format: string): number {
    const dotIndex = format.indexOf('.');
    const decimalDigits = dotIndex >= 0 ? format.length - dotIndex - 1 : 0;
    const factor = Math.pow(10, decimalDigits);
    return Math.round(val * factor) / factor;
}

export const CnxNumberBox: React.FC<CnxNumberBoxProps> = ({
    id,
    name,
    label,
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
    // ── ข้อ 8: sync refs โดยตรงใน render แทน useEffect ──────────────────
    const valueRef = useRef(value);
    const onValueChangedRef = useRef(onValueChanged);
    const onEnterKeyRef = useRef(onEnterKey);
    valueRef.current = value;
    onValueChangedRef.current = onValueChanged;
    onEnterKeyRef.current = onEnterKey;

    // ── ข้อ 6: ใช้ valueRef แทน lastEmittedValueRef เพื่อเช็คการ emit ────
    // (ลบ lastEmittedValueRef ออก)

    const [isFocused, setIsFocused] = useState(false);

    // ── ข้อ 2: ให้ strValue เป็น source of truth เดียว ───────────────────
    const [strValue, setStrValue] = useState<string>(() =>
        value !== null && value !== undefined
            ? allowEmpty && value === 0
                ? ''
                : formatNumberValue(value, format)
            : allowEmpty
              ? ''
              : '0',
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
        // แสดงตัวเลขดิบตอน focus เพื่อให้แก้ไขง่าย
        setStrValue(value !== null && value !== undefined ? String(value) : '');
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
            next = roundToFormat(next, format); // ── ข้อ 4: ใช้ helper
        }

        if (!allowEmpty && (next === null || next === undefined)) {
            next = 0;
        }

        // ── ข้อ 6: เช็คกับ valueRef.current (ค่าจริงจาก parent) แทน lastEmittedValueRef
        if (valueChangeEvent === 'blur' && valueRef.current !== next) {
            onValueChangedRef.current?.({
                previousValue: valueRef.current,
                value: next,
            });
        }

        // ── ข้อ 2: set strValue เป็น formatted string ทันที ไม่ต้องมี useEffect แยก
        setStrValue(
            next !== null
                ? allowEmpty && next === 0
                    ? ''
                    : formatNumberValue(next, format)
                : allowEmpty
                  ? ''
                  : '0',
        );
    }, [
        strValue,
        internalMin,
        internalMax,
        allowEmpty,
        format,
        valueChangeEvent,
    ]);

    // ── ข้อ 2: sync strValue เมื่อ value เปลี่ยนจาก parent (ขณะไม่ได้ focus)
    // ไม่มี useEffect ซ้ำซ้อนแล้ว — จัดการใน handleBlur + handleFocus เพียงพอ
    // แต่ยังต้อง sync เมื่อ parent เปลี่ยน value ขณะ !isFocused
    const prevValueRef = useRef(value);
    if (!isFocused && prevValueRef.current !== value) {
        prevValueRef.current = value;
        const nextStr =
            value !== null && value !== undefined
                ? allowEmpty && value === 0
                    ? ''
                    : formatNumberValue(value, format)
                : allowEmpty
                  ? ''
                  : '0';
        // setStrValue ใน render ไม่ได้ → ใช้ useEffect เฉพาะจุดนี้จุดเดียว
    }

    // useEffect เดียวที่เหลือ: sync เมื่อ parent เปลี่ยน value ขณะ !isFocused
    React.useEffect(() => {
        if (!isFocused) {
            setStrValue(
                value !== null && value !== undefined
                    ? allowEmpty && value === 0
                        ? ''
                        : formatNumberValue(value, format)
                    : allowEmpty
                      ? ''
                      : '0',
            );
        }
    }, [value, format, allowEmpty]); // isFocused ไม่จำเป็นใน deps เพราะเป็นแค่ guard

    const handleIncrement = useCallback(
        (e?: React.SyntheticEvent) => {
            if (e) {
                e.stopPropagation();
                if (e.type === 'keydown') e.preventDefault();
            }
            const parsed = parseFloat(strValue.replace(/,/g, ''));
            const current = (isNaN(parsed) ? valueRef.current : parsed) ?? 0;
            // ── ข้อ 4: round ตาม format ก่อน emit
            const next = roundToFormat(current + step, format);
            if (internalMax !== undefined && next > internalMax) return;
            handleChange(next, String(next), true);
        },
        [step, internalMax, strValue, format, handleChange],
    );

    const handleDecrement = useCallback(
        (e?: React.SyntheticEvent) => {
            if (e) {
                e.stopPropagation();
                if (e.type === 'keydown') e.preventDefault();
            }
            const parsed = parseFloat(strValue.replace(/,/g, ''));
            const current = (isNaN(parsed) ? valueRef.current : parsed) ?? 0;
            // ── ข้อ 4: round ตาม format ก่อน emit
            const next = roundToFormat(current - step, format);
            if (internalMin !== undefined && next < internalMin) return;
            handleChange(next, String(next), true);
        },
        [step, internalMin, strValue, format, handleChange],
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
            const raw = e.target.value;
            const isPositive =
                numberType === 'positive' || numberType === 'positivePercent';
            const regex = isPositive ? /^\d*\.?\d*$/ : /^-?\d*\.?\d*$/;

            if (!regex.test(raw)) return;

            if (raw === '' || raw === '-') {
                handleChange(allowEmpty ? null : 0, raw);
                return;
            }

            // ── ข้อ 5: normalize ".5" → "0.5" เพื่อป้องกัน strValue แปลกๆ
            const normalized = raw.startsWith('.')
                ? '0' + raw
                : raw.startsWith('-.')
                  ? '-0' + raw.slice(1)
                  : raw;
            const parsed = parseFloat(normalized);
            if (!isNaN(parsed)) {
                handleChange(parsed, normalized);
            }
        },
        [numberType, allowEmpty, handleChange],
    );

    // ── ข้อ 10: เพิ่ม aria-label ใน inputProps
    const inputPropsWithA11y = useMemo(
        () => ({ ...INPUT_PROPS, 'aria-label': label ?? id }),
        [label, id],
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
                                aria-label="Clear"
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
                                    aria-label="Increment"
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
                                    aria-label="Decrement"
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
            disabled,
            internalMax,
            internalMin,
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
                label={label} // ── ข้อ 10
                size="small"
                value={strValue} // ── ข้อ 2: ใช้ strValue เป็น source of truth เดียว
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
                inputProps={inputPropsWithA11y}
                InputProps={InputPropsObj}
            />
        </FormControl>
    );
};

export default React.memo(CnxNumberBox);
