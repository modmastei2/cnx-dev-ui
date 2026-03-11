import React, {
    useEffect,
    useState,
    useCallback,
    useMemo,
    useRef,
} from 'react';
import { RadioGroup, FormControlLabel, Radio, FormControl } from '@mui/material';
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
    onValueChanged?: (e: { value: any }) => void;
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
            if (autoDefault && !valueRef.current && data.length > 0) {
                setTimeout(() => {
                    onValueChangedRef.current?.({ value: data[0][valueExpr] });
                }, 0);
            }
        },
        [autoDefault, valueExpr],
    );

    useEffect(() => {
        const applyIgnore = (items: any[]) =>
            ignoreValue?.length
                ? items.filter((item) => !ignoreValue.includes(item[valueExpr]))
                : items;

        if (customDataSource && Array.isArray(customDataSource)) {
            const filtered = applyIgnore([...customDataSource]);
            setRawData(filtered);
            applyAutoDefault(filtered);
            return;
        }

        if (radioGroupKey && service) {
            service
                .getService(radioGroupKey, { cascadeBy } as RadioGroupParam)
                .then((items) => {
                    const filtered = applyIgnore(items || []);
                    setRawData(filtered);
                    applyAutoDefault(filtered);
                });
        } else {
            setRawData([]);
        }
    }, [
        radioGroupKey,
        cascadeBy,
        customDataSource,
        ignoreValue,
        valueExpr,
        service,
        applyAutoDefault,
    ]);

    const dataSource = useMemo(() => rawData, [rawData]);

    const handleChange = useCallback(
        (_: React.ChangeEvent<HTMLInputElement>, newValue: string) => {
            onValueChangedRef.current?.({ value: newValue });
        },
        [],
    );

    return (
        <FormControl component="fieldset" id={id}>
            <RadioGroup
                name={name}
                value={value ?? ''}
                row={layout === 'horizontal'}
                onChange={handleChange}
                sx={{ gap: layout === 'horizontal' ? 1 : 0 }}
            >
                {dataSource.map((item: any) => (
                    <FormControlLabel
                        key={item[valueExpr]}
                        value={item[valueExpr]}
                        label={item[displayExpr] || ''}
                        disabled={item.disabled || disabled}
                        control={<Radio size="small" />}
                    />
                ))}
            </RadioGroup>
        </FormControl>
    );
};

export default CnxRadioGroup;
