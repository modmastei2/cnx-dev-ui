import React, {
    useEffect,
    useState,
    useCallback,
    useMemo,
    useRef,
} from 'react';
import { RadioGroup } from 'devextreme-react/radio-group';
import type { ValueChangedEvent } from 'devextreme/ui/radio_group';
import { useRadioGroupDataProvider } from './cnx-radio-group.context';
import type {
    RadioGroupKey,
    RadioGroupParam,
    RadioGroupViewModel,
} from './cnx-radio-group.types';

export interface CnxRadioGroupProps {
    id?: string;
    name?: string;
    disabled?: boolean;
    layout?: 'vertical' | 'horizontal';
    autoDefault?: boolean;
    displayExpr?: string;
    valueExpr?: string;
    radioGroupKey?: RadioGroupKey | null;
    cascadeBy?: any;
    ignoreValue?: string[];
    customDataSource?: any[];
    value?: string | null;
    onValueChanged?: (e: ValueChangedEvent) => void;
}

export const CnxRadioGroup: React.FC<CnxRadioGroupProps> = ({
    id = '',
    name = '',
    disabled = false,
    layout = 'horizontal',
    autoDefault = true,
    displayExpr = 'text',
    valueExpr = 'value',
    radioGroupKey = null,
    cascadeBy,
    ignoreValue,
    customDataSource,
    value,
    onValueChanged,
}) => {
    const service = useRadioGroupDataProvider();
    const [rawData, setRawData] = useState<RadioGroupViewModel[]>([]);

    const valueRef = useRef<string | null | undefined>(value);
    const onValueChangedRef = useRef(onValueChanged);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        onValueChangedRef.current = onValueChanged;
    }, [onValueChanged]);

    const applyAutoDefault = useCallback(
        (data: any[]) => {
            if (autoDefault && !value && data.length > 0) {
                // Trigger default initial value async
                setTimeout(() => {
                    if (onValueChangedRef.current) {
                        onValueChangedRef.current({
                            value: data[0][valueExpr],
                        } as ValueChangedEvent);
                    }
                }, 0);
            }
        },
        [autoDefault, value, valueExpr],
    );

    // โหลด data
    useEffect(() => {
        const applyIgnore = (items: any[]) =>
            ignoreValue?.length
                ? items.filter((item) => !ignoreValue.includes(item[valueExpr]))
                : items;

        if (customDataSource && Array.isArray(customDataSource)) {
            setRawData(applyIgnore([...customDataSource]));
            return;
        }

        if (radioGroupKey && service) {
            service
                .getService(radioGroupKey, {
                    cascadeBy: cascadeBy,
                } as RadioGroupParam)
                .then((items) => setRawData(applyIgnore(items || [])));
        } else {
            setRawData([]);
        }
    }, [radioGroupKey, cascadeBy, customDataSource, ignoreValue, valueExpr]);

    const dataSource = useMemo(() => {
        return rawData;
    }, [rawData]);

    const handleValueChanged = useCallback((e: ValueChangedEvent) => {
        if (onValueChangedRef.current) onValueChangedRef.current(e);
    }, []);

    const elementAttr = useMemo(() => ({ id, name }), [id, name]);

    return (
        <RadioGroup
            elementAttr={elementAttr}
            disabled={disabled}
            layout={layout}
            displayExpr={displayExpr}
            valueExpr={valueExpr}
            dataSource={dataSource}
            value={value === null ? undefined : value}
            onValueChanged={handleValueChanged}
        />
    );
};

export default CnxRadioGroup;
