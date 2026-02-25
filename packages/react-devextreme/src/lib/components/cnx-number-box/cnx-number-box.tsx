import React, {
    useEffect,
    useRef,
    useState,
    useMemo,
    useCallback,
} from 'react';
import { NumberBox } from 'devextreme-react/number-box';
import type { EventInfo } from 'devextreme/events';
import type { ValueChangedEvent } from 'devextreme/ui/number_box';

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
    onValueChanged?: (e: ValueChangedEvent & { fromInit?: boolean }) => void;
    onPaste?: (e: any) => void;
    onEnterKey?: () => void;
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
    onValueChanged,
    onPaste,
    onEnterKey,
}) => {
    const numberBoxRef = useRef<NumberBox>(null);

    const onValueChangedRef = useRef(onValueChanged);
    const onPasteRef = useRef(onPaste);
    const onEnterKeyRef = useRef(onEnterKey);
    useEffect(() => {
        onValueChangedRef.current = onValueChanged;
        onPasteRef.current = onPaste;
        onEnterKeyRef.current = onEnterKey;
    }, [onValueChanged, onPaste, onEnterKey]);
    const [currentFormat, setCurrentFormat] = useState(format);
    const [internalMin, setInternalMin] = useState<number | undefined>(min);
    const [internalMax, setInternalMax] = useState<number | undefined>(max);

    const orgFormat = useRef(format);
    const maxPosibleDigit = 15;

    const checkNumberType = useCallback(() => {
        let computedMax: number | undefined = max;
        let computedMin: number | undefined = min;

        const setMax = (val: number | undefined) => {
            if (max === null || max === undefined) computedMax = val;
        };
        const setMin = (val: number | undefined) => {
            if (min === null || min === undefined) computedMin = val;
        };

        let dotAndDecimalPlace = /\..*/.exec(orgFormat.current)?.[0] || '';
        let decimalPlace = dotAndDecimalPlace.replace('.', '');
        let decimalCount = decimalPlace.length;

        let integerCount = integer;
        if (!integerCount) {
            integerCount = maxPosibleDigit - decimalCount;
            if (!decimalCount) integerCount = 9; // support C# int max value
        }

        if (numberType === 'positive') {
            setMax(
                +(
                    ''.padEnd(integerCount, '9') +
                    '.' +
                    ''.padEnd(decimalCount, '9')
                ),
            );
            setMin(0);
        } else if (numberType === 'negative') {
            setMax(0);
            setMin(
                -+(
                    ''.padEnd(integerCount, '9') +
                    '.' +
                    ''.padEnd(decimalCount, '9')
                ),
            );
        } else if (numberType === 'percent') {
            setMax(100);
            setMin(-100);
        } else if (numberType === 'positivePercent') {
            setMax(100);
            setMin(0);
        } else {
            setMax(
                +(
                    ''.padEnd(integerCount, '9') +
                    '.' +
                    ''.padEnd(decimalCount, '9')
                ),
            );
            setMin(
                -+(
                    ''.padEnd(integerCount, '9') +
                    '.' +
                    ''.padEnd(decimalCount, '9')
                ),
            );
        }

        setInternalMax(computedMax);
        setInternalMin(computedMin);
    }, [integer, max, min, numberType]);

    const checkDisplayValue = useCallback(
        (val: any, isFocus: boolean) => {
            if (isFocus) {
                setCurrentFormat(orgFormat.current);
            } else if (allowEmpty) {
                if (val === 0) {
                    setCurrentFormat(orgFormat.current.replace(/0/g, '#'));
                } else {
                    setCurrentFormat(orgFormat.current);
                }
            }
        },
        [allowEmpty],
    );

    useEffect(() => {
        orgFormat.current = format;
        checkNumberType();
        checkDisplayValue(value, false);
    }, [format, checkNumberType, checkDisplayValue, value]);

    // Handle default initial value of 0 if not allowed empty
    useEffect(() => {
        if ((value === null || value === undefined) && !allowEmpty) {
            setTimeout(() => {
                if (numberBoxRef.current?.instance) {
                    numberBoxRef.current.instance.option('value', 0);
                }
            }, 0);
        }
    }, [value, allowEmpty]);

    // Arrow prevention
    useEffect(() => {
        if (disableArrow && numberBoxRef.current?.instance) {
            numberBoxRef.current.instance.registerKeyHandler(
                'upArrow',
                (e: any) => {
                    e.preventDefault();
                },
            );
            numberBoxRef.current.instance.registerKeyHandler(
                'downArrow',
                (e: any) => {
                    e.preventDefault();
                },
            );
        }
    }, [disableArrow]);

    const handleValueChanged = useCallback(
        (e: ValueChangedEvent) => {
            let _event: any = { ...e };

            if (_event.value === 0 && allowEmpty) {
                _event = { ..._event, value: null };
            }

            // Identify if it was forced by ngAfterViewInit / default zero
            if (!_event.previousValue && _event.value === 0 && !allowEmpty) {
                _event.fromInit = true;
            }

            if (onValueChangedRef.current) {
                onValueChangedRef.current(_event);
            }
        },
        [allowEmpty],
    );

    const handlePaste = useCallback((e: EventInfo<any>) => {
        if (onPasteRef.current) onPasteRef.current(e);
    }, []);

    const handleEnterKey = useCallback((e: EventInfo<any>) => {
        if (onEnterKeyRef.current) onEnterKeyRef.current();
    }, []);

    const handleFocusIn = useCallback(() => {
        checkDisplayValue(value, true);
    }, [checkDisplayValue, value]);

    const handleFocusOut = useCallback(() => {
        checkDisplayValue(value || 0, false);
    }, [checkDisplayValue, value]);

    const elementAttr = useMemo(() => ({ id, name }), [id, name]);

    return (
        <NumberBox
            ref={numberBoxRef}
            elementAttr={elementAttr}
            disabled={disabled}
            value={value === null ? undefined : value}
            format={currentFormat}
            max={internalMax}
            min={internalMin}
            tabIndex={tabIndex}
            onValueChanged={handleValueChanged}
            onPaste={handlePaste}
            onEnterKey={handleEnterKey}
            onFocusIn={handleFocusIn}
            onFocusOut={handleFocusOut}
        />
    );
};

export default CnxNumberBox;
