import React, {
    useEffect,
    useState,
    useCallback,
    useMemo,
    useRef,
} from 'react';
import { FormGroup, FormControlLabel, Checkbox, Box } from '@mui/material';
import { useCheckBoxDataProvider } from './cnx-check-box-group.context';
import type {
    CheckBoxKey,
    CheckBoxParam,
    CheckBoxViewModel,
} from './cnx-check-box-group.types';

export interface CnxCheckBoxGroupProps {
    id?: string;
    name?: string;
    value?: string[] | null;
    disabled?: boolean;
    layout?: 'vertical' | 'horizontal';
    mode?: 'multiple' | 'single';
    checkBoxKey?: CheckBoxKey | null;
    cascadeBy?: any;
    ignoreValue?: string[];
    displayExpr?: string;
    valueExpr?: string;
    customDataSource?: any[];
    onValueChanged?: (e: { value: string[] }) => void;
}

export const CnxCheckBoxGroup: React.FC<CnxCheckBoxGroupProps> = ({
    id = '',
    name = '',
    value,
    disabled = false,
    layout = 'horizontal',
    mode = 'multiple',
    checkBoxKey = null,
    cascadeBy,
    ignoreValue,
    displayExpr = 'text',
    valueExpr = 'value',
    customDataSource,
    onValueChanged,
}) => {
    const service = useCheckBoxDataProvider();
    const [rawData, setRawData] = useState<CheckBoxViewModel[]>([]);

    const valueRef = useRef<string[] | null | undefined>(value);
    const onValueChangedRef = useRef(onValueChanged);
    const modeRef = useRef(mode);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        onValueChangedRef.current = onValueChanged;
    }, [onValueChanged]);

    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);

    useEffect(() => {
        const applyIgnore = (items: any[]) =>
            ignoreValue?.length
                ? items.filter((item) => !ignoreValue.includes(item[valueExpr]))
                : items;

        if (customDataSource && Array.isArray(customDataSource)) {
            setRawData(applyIgnore([...customDataSource]));
            return;
        }

        if (checkBoxKey && service) {
            service
                .getService(checkBoxKey, { cascadeBy } as CheckBoxParam)
                .then((result) => setRawData(applyIgnore(result || [])));
        } else {
            setRawData([]);
        }
    }, [
        checkBoxKey,
        cascadeBy,
        customDataSource,
        ignoreValue,
        valueExpr,
        service,
    ]);

    const toggleByKey = useCallback((key: string, checked: boolean) => {
        const current = valueRef.current || [];
        const currentMode = modeRef.current;

        let next: string[];
        if (currentMode === 'single') {
            next = checked ? [key] : [];
        } else {
            next = checked
                ? current.includes(key)
                    ? [...current]
                    : [...current, key]
                : current.filter((item) => item !== key);
        }

        if (JSON.stringify(current) === JSON.stringify(next)) return;
        onValueChangedRef.current?.({ value: next });
    }, []);

    const dataSource = useMemo(() => {
        const current = value || [];
        return rawData.map((item) => ({
            ...item,
            checked: current.includes((item as any)[valueExpr]),
        }));
    }, [rawData, value, valueExpr]);

    return (
        <Box id={id} component="div">
            <FormGroup
                row={layout === 'horizontal'}
                sx={{ flexWrap: 'wrap', gap: layout === 'horizontal' ? 1 : 0 }}
            >
                {dataSource.map((item) => {
                    const itemKey = (item as any)[valueExpr];
                    const itemDisabled = (item as any).disabled || disabled;
                    const domId = `${id}_${itemKey}`;
                    const domName = `${name}_${itemKey}`;

                    return (
                        <FormControlLabel
                            key={itemKey}
                            htmlFor={domId}
                            label={(item as any)[displayExpr] || ''}
                            disabled={itemDisabled}
                            control={
                                <Checkbox
                                    id={domId}
                                    name={domName}
                                    checked={item.checked ?? false}
                                    disabled={itemDisabled}
                                    size="small"
                                    onChange={(e) =>
                                        toggleByKey(itemKey, e.target.checked)
                                    }
                                />
                            }
                        />
                    );
                })}
            </FormGroup>
        </Box>
    );
};

export default CnxCheckBoxGroup;
