import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ValueChangedEvent } from '../cnx-value-changed.types';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

export interface CnxDateBoxProps {
    id?: string;
    name?: string;
    placeholder?: string;
    minDate?: string;
    maxDate?: string;
    value?: string | null;
    displayFormat?:
        | 'DD-MM-YYYY'
        | 'DD/MM/YYYY'
        | 'DD-MMM-YYYY'
        | 'DD/MMM/YYYY'
        | 'YYYY-MM-DD'
        | 'YYYY/MM/DD'
        | 'YYYY-MMM-DD'
        | 'YYYY/MMM/DD';
    valueFormat?:
        | 'DD-MM-YYYY'
        | 'DD/MM/YYYY'
        | 'DD-MMM-YYYY'
        | 'DD/MMM/YYYY'
        | 'YYYY-MM-DD'
        | 'YYYY/MM/DD'
        | 'YYYY-MMM-DD'
        | 'YYYY/MMM/DD';
    disabled?: boolean;
    disabledDate?: string[] | Date[] | null;
    allowEmpty?: boolean;
    autoDefault?: boolean;
    showClearButton?: boolean;
    onValueChanged?: (e: ValueChangedEvent) => void;
    onEnterKey?: () => void;
}

export const CnxDateBox: React.FC<CnxDateBoxProps> = ({
    id,
    name,
    placeholder = 'YYYY-MM-DD',
    minDate,
    maxDate,
    value = null,
    displayFormat = 'DD-MMM-YYYY',
    valueFormat = 'YYYY-MM-DD',
    disabled = false,
    disabledDate,
    allowEmpty = true,
    autoDefault = false,
    showClearButton = true,
    onValueChanged,
    onEnterKey,
}) => {
    const valueRef = useRef(value);
    const onValueChangedRef = useRef(onValueChanged);
    const onEnterKeyRef = useRef(onEnterKey);

    useEffect(() => {
        valueRef.current = value;
        onValueChangedRef.current = onValueChanged;
        onEnterKeyRef.current = onEnterKey;
    }, [value, onValueChanged, onEnterKey]);

    const formatedValue = useMemo(() => (value ? dayjs(value) : null), [value]);

    const parsedMinDate = useMemo(
        () => (minDate ? dayjs(minDate) : null),
        [minDate],
    );

    const parsedMaxDate = useMemo(
        () => (maxDate ? dayjs(maxDate) : null),
        [maxDate],
    );

    const handleChange = useCallback(
        (newValue: Dayjs | null) => {
            let newDate: string | null = null;
            let oldValue = valueRef.current;

            if (newValue && newValue.isValid()) {
                newDate = newValue.format(valueFormat);
            }

            if (!allowEmpty && !newDate) {
                if (oldValue) {
                    onValueChangedRef.current?.({
                        previousValue: oldValue,
                        value: oldValue,
                    });
                } else {
                    const fallbackDate = dayjs().format(valueFormat);
                    onValueChangedRef.current?.({
                        previousValue: oldValue,
                        value: fallbackDate,
                    });
                }
                return;
            }

            if (Object.is(oldValue, newDate)) return;

            onValueChangedRef.current?.({
                previousValue: oldValue,
                value: newDate,
            });
        },
        [valueFormat, allowEmpty],
    );

    useEffect(() => {
        if (!valueRef.current && !disabled && (!allowEmpty || autoDefault)) {
            handleChange(dayjs());
        }
    }, [allowEmpty, autoDefault, disabled, handleChange]);

    const disabledSet = useMemo(() => {
        if (!disabledDate?.length) return null;

        return new Set(
            disabledDate.map((d) => dayjs(d).startOf('day').valueOf()),
        );
    }, [disabledDate, valueFormat]);

    const shouldDisableDate = useCallback(
        (day: Dayjs) => disabledSet?.has(day.startOf('day').valueOf()) ?? false,
        [disabledSet, valueFormat],
    );

    const slotProps = useMemo(
        () => ({
            day: {
                sx: {
                    '&.MuiPickersDay-root.Mui-disabled': {
                        backgroundColor: 'rgba(255, 0, 0, 0.05)',
                        color: '#d32f2f',
                        textDecoration: 'line-through',
                        fontWeight: 600,
                    },
                },
            },
            field: {
                clearable: allowEmpty && showClearButton,
                onClear: () => handleChange(null),
            },
            textField: {
                id: `cnx_date_box_${id}`,
                name: `cnx_date_box_${name}`,
                placeholder,
                size: 'small' as const,
                fullWidth: true,
                onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') onEnterKeyRef.current?.();
                },
                sx:
                    allowEmpty && showClearButton
                        ? {
                              '& .MuiIconButton-root': {
                                  visibility: 'visible',
                                  opacity: 1,
                              },
                          }
                        : undefined,
            },
        }),
        [id, name, placeholder, showClearButton, allowEmpty, handleChange],
    );

    return (
        <DatePicker
            value={formatedValue}
            onChange={handleChange}
            format={displayFormat}
            minDate={parsedMinDate ?? undefined}
            maxDate={parsedMaxDate ?? undefined}
            disabled={disabled}
            shouldDisableDate={shouldDisableDate}
            slotProps={slotProps}
        />
    );
};

export default React.memo(CnxDateBox);
