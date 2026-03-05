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
import { CascadeRule } from '../cnx-cascade-value.types';

export interface CnxRadioGroupProps {
    id?: string;
    name?: string;
    disabled?: boolean;
    layout?: 'vertical' | 'horizontal';
    autoDefault?: boolean;
    displayExpr?: string;
    valueExpr?: string;
    radioGroupKey?: RadioGroupKey | null;
    cascadeRule?: CascadeRule | CascadeRule[];
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
    autoDefault = false,
    displayExpr = 'text',
    valueExpr = 'value',
    radioGroupKey = null,
    cascadeRule,
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

    // โหลด data
    useEffect(() => {
        const applyCascadeRule = (items: RadioGroupViewModel[]) =>
            !cascadeRule || cascadeBy === undefined || cascadeBy == null
                ? items
                : items.filter((item) => {
                      const rules = Array.isArray(cascadeRule)
                          ? cascadeRule
                          : [cascadeRule];

                      return rules.every((r) => {
                          let parentValue: any;

                          if (
                              typeof cascadeBy === 'object' &&
                              cascadeBy !== null
                          )
                              parentValue = cascadeBy[r.childKey];
                          else if (
                              cascadeBy !== undefined &&
                              cascadeBy !== null
                          )
                              parentValue = cascadeBy;

                          return item[r.childKey] === parentValue;
                      });
                  });

        const applyIgnore = (items: RadioGroupViewModel[]) =>
            ignoreValue?.length
                ? items.filter((item) => !ignoreValue.includes(item[valueExpr]))
                : items;

        const applyAutoDefault = () => {
            if (autoDefault && !value && !disabled && rawData.length > 0) {
                value = rawData[0][valueExpr];
            }
        };

        if (customDataSource && Array.isArray(customDataSource)) {
            const filtered = applyCascadeRule(customDataSource);
            setRawData(applyIgnore(filtered));
            applyAutoDefault();
            return;
        }

        if (radioGroupKey && service) {
            service
                .getService(radioGroupKey, {
                    cascadeBy: cascadeBy,
                } as RadioGroupParam)
                .then((items) => {
                    setRawData(applyIgnore(items || []));
                    applyAutoDefault();
                });
        } else {
            setRawData([]);
        }
    }, [
        radioGroupKey,
        cascadeRule,
        cascadeBy,
        customDataSource,
        ignoreValue,
        valueExpr,
    ]);

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
            value={value}
            onValueChanged={handleValueChanged}
        />
    );
};

export default CnxRadioGroup;
