import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';
import { format as dateFnsFormat, isValid, parseISO } from 'date-fns';

function toIsoDateString(date: Date | null | undefined): string | null {
    if (!date || !isValid(date)) return null;
    return dateFnsFormat(date, 'yyyy-MM-dd');
}

function parseToDate(value: string | null | Date | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Date) return isValid(value) ? value : null;
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : null;
}

export interface CnxDateBoxProps {
    id?: string;
    name?: string;
    placeholder?: string;
    minDate?: Date | string;
    maxDate?: Date | string;
    width?: number | string;
    value?: string | null | Date;
    disabled?: boolean;
    disabledDates?: string[] | Date[] | null;
    format?: string;
    allowEmpty?: boolean;
    autoDefault?: boolean;
    onValueChanged?: (e: {
        value: string | null;
        previousValue?: string | null;
    }) => void;
    onEnterKey?: () => void;
}

export const CnxDateBox: React.FC<CnxDateBoxProps> = ({
    id = '',
    name = '',
    placeholder = '',
    minDate,
    maxDate,
    width = 180,
    value,
    disabled = false,
    disabledDates = [],
    format = 'dd-MMM-yyyy',
    allowEmpty = true,
    autoDefault = false,
    onValueChanged,
    onEnterKey,
}) => {
    const onValueChangedRef = useRef(onValueChanged);
    const onEnterKeyRef = useRef(onEnterKey);
    const previousValueRef = useRef<string | null>(null);

    useEffect(() => {
        onValueChangedRef.current = onValueChanged;
        onEnterKeyRef.current = onEnterKey;
    }, [onValueChanged, onEnterKey]);

    const mappedValue = useMemo(() => parseToDate(value), [value]);

    const disabledDateSet = useMemo(() => {
        const dates = (disabledDates || [])
            .map((d) => parseToDate(d instanceof Date ? d : String(d)))
            .filter((d): d is Date => d !== null);
        return new Set(
            dates.map((d) => toIsoDateString(d)).filter(Boolean) as string[],
        );
    }, [disabledDates]);

    const parsedMinDate = useMemo(
        () =>
            parseToDate(minDate instanceof Date ? minDate : (minDate ?? null)),
        [minDate],
    );
    const parsedMaxDate = useMemo(
        () =>
            parseToDate(maxDate instanceof Date ? maxDate : (maxDate ?? null)),
        [maxDate],
    );

    // Auto default to today when value is empty and autoDefault=true
    useEffect(() => {
        if (!mappedValue && !disabled && autoDefault) {
            const today = new Date();
            const formatted = toIsoDateString(today);
            if (onValueChangedRef.current) {
                onValueChangedRef.current({
                    value: formatted,
                    previousValue: previousValueRef.current,
                });
                previousValueRef.current = formatted;
            }
        }
    }, [mappedValue, disabled, autoDefault]);

    const handleChange = useCallback(
        (newValue: Date | null) => {
            if (!newValue && !allowEmpty) {
                // Restore to today if empty not allowed
                const today = new Date();
                const formatted = toIsoDateString(today);
                onValueChangedRef.current?.({
                    value: formatted,
                    previousValue: previousValueRef.current,
                });
                previousValueRef.current = formatted;
                return;
            }
            const formatted = toIsoDateString(newValue);
            onValueChangedRef.current?.({
                value: formatted,
                previousValue: previousValueRef.current,
            });
            previousValueRef.current = formatted;
        },
        [allowEmpty],
    );

    const shouldDisableDate = useCallback(
        (day: Date) => {
            const key = toIsoDateString(day);
            return key ? disabledDateSet.has(key) : false;
        },
        [disabledDateSet],
    );

    const containerWidth = typeof width === 'number' ? `${width}px` : width;

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
                value={mappedValue}
                disabled={disabled}
                minDate={parsedMinDate ?? undefined}
                maxDate={parsedMaxDate ?? undefined}
                format={format}
                shouldDisableDate={shouldDisableDate}
                onChange={handleChange}
                sx={{ width: containerWidth }}
                slotProps={{
                    textField: {
                        id,
                        name,
                        placeholder,
                        size: 'small',
                        fullWidth: true,
                        onKeyDown: (e: React.KeyboardEvent) => {
                            if (e.key === 'Enter') onEnterKeyRef.current?.();
                        },
                    },
                }}
            />
        </LocalizationProvider>
    );
};

export default CnxDateBox;
