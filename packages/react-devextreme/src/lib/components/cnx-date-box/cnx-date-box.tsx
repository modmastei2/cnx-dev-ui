import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { DateBox } from 'devextreme-react/date-box';
import type { ValueChangedEvent } from 'devextreme/ui/date_box';
import type { EventInfo } from 'devextreme/events';
import type { dxCalendarOptions } from 'devextreme/ui/calendar';

// Fallback utility for formatting without moment dependency
function formatDate(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    calendarOptions?: dxCalendarOptions;
    allowEmpty?: boolean;
    autoDefault?: boolean;
    onValueChanged?: (e: ValueChangedEvent) => void;
    onEnterKey?: () => void;
}

export const CnxDateBox: React.FC<CnxDateBoxProps> = ({
    id = '',
    name = '',
    placeholder = '',
    minDate,
    maxDate,
    width = 110,
    value,
    disabled = false,
    disabledDates = [],
    format = 'dd-MMM-yyyy',
    calendarOptions,
    allowEmpty = true,
    autoDefault = false,
    onValueChanged,
    onEnterKey,
}) => {
    const dateBoxRef = useRef<DateBox>(null);

    const onValueChangedRef = useRef(onValueChanged);
    const onEnterKeyRef = useRef(onEnterKey);
    useEffect(() => {
        onValueChangedRef.current = onValueChanged;
        onEnterKeyRef.current = onEnterKey;
    }, [onValueChanged, onEnterKey]);

    // Parse mapped value
    const mappedValue = useMemo(() => {
        if (!value) return null;
        return new Date(value);
    }, [value]);

    // Compute disabled date set for calendar rendering
    const disabledDateSet = useMemo(() => {
        const dates = (disabledDates || [])
            .map((d) => new Date(d))
            .filter((d) => !isNaN(d.getTime()));

        const formattedDates = dates
            .map((d) => formatDate(d))
            .filter((d): d is string => d !== null);

        return new Set(formattedDates);
    }, [disabledDates]);

    // Handle cell customization (holiday-cell)
    const handleCellTemplate = useCallback(
        (cellData: any, cellIndex: number, cellElement: any) => {
            const cellDateStr = formatDate(cellData.date);
            const isHoliday = cellDateStr
                ? disabledDateSet.has(cellDateStr)
                : false;

            return (
                <span
                    className={
                        isHoliday
                            ? `holiday-cell !rounded ${cellData.text}`
                            : cellData.text
                    }
                >
                    {cellData.text}
                </span>
            );
        },
        [disabledDateSet],
    );

    // Auto Default effect
    useEffect(() => {
        if (
            !mappedValue &&
            !disabled &&
            autoDefault &&
            dateBoxRef.current?.instance
        ) {
            setTimeout(() => {
                dateBoxRef.current?.instance.option('value', new Date());
            }, 0);
        }
    }, [mappedValue, disabled, autoDefault]);

    const handleValueChanged = useCallback(
        (e: ValueChangedEvent) => {
            if (!e.value && !allowEmpty) {
                const today = new Date();
                if (dateBoxRef.current?.instance) {
                    dateBoxRef.current.instance.option('value', today);
                }
                return;
            }

            if (onValueChangedRef.current) {
                let formattedValue: string | null = null;
                if (e.value) {
                    formattedValue = formatDate(e.value);
                }

                let formattedPrevious: string | null = null;
                if (e.previousValue) {
                    formattedPrevious = formatDate(e.previousValue);
                }

                // Propagate event up with mapped yyyy-MM-dd strings
                onValueChangedRef.current({
                    ...e,
                    value: formattedValue ? formattedValue : null,
                    previousValue: formattedPrevious ? formattedPrevious : null,
                });
            }
        },
        [allowEmpty],
    );

    const handleEnterKey = useCallback((e: EventInfo<any>) => {
        if (onEnterKeyRef.current) {
            onEnterKeyRef.current();
        }
    }, []);

    // Keep consistency for invalid typing
    const handleOptionChanged = useCallback((e: any) => {
        if (e.name === 'isValid' && !e.value && dateBoxRef.current?.instance) {
            dateBoxRef.current.instance.option('value', undefined);
        }
    }, []);

    const parsedMinDate = minDate ? new Date(minDate) : undefined;
    const parsedMaxDate = maxDate ? new Date(maxDate) : undefined;

    const elementAttr = useMemo(() => ({ id, name }), [id, name]);

    const mergedCalendarOptions = useMemo(() => {
        return {
            ...calendarOptions,
            cellRender:
                (calendarOptions as any)?.cellRender || handleCellTemplate,
        } as any;
    }, [calendarOptions, handleCellTemplate]);

    return (
        <DateBox
            ref={dateBoxRef}
            elementAttr={elementAttr}
            placeholder={placeholder}
            min={parsedMinDate}
            max={parsedMaxDate}
            width={width}
            value={mappedValue === null ? undefined : mappedValue}
            disabled={disabled}
            displayFormat={format}
            calendarOptions={mergedCalendarOptions}
            onValueChanged={handleValueChanged}
            onEnterKey={handleEnterKey}
            onOptionChanged={handleOptionChanged}
            useMaskBehavior={true}
        />
    );
};

export default CnxDateBox;
