import React, {
    useEffect,
    useState,
    useCallback,
    useMemo,
    useRef,
} from 'react';
import { CheckBox } from 'devextreme-react/check-box';
import type { ValueChangedEvent } from 'devextreme/ui/check_box';
import { useCheckBoxDataProvider } from './cnx-check-box-group.context';
import type {
    CheckBoxKey,
    CheckBoxParam,
    CheckBoxViewModel,
} from './cnx-check-box-group.types';
import './cnx-check-box-group.css';

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

    // stable ref
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

        if (checkBoxKey && service) {
            service
                .getService(checkBoxKey, { cascadeBy } as CheckBoxParam)
                .then((result) => setRawData(applyIgnore(result || [])));
        } else {
            setRawData([]);
        }
    }, [checkBoxKey, cascadeBy, customDataSource, ignoreValue, valueExpr]);

    const toggleByKey = useCallback((key: string, checked: boolean) => {
        const current = valueRef.current || [];
        const currentMode = modeRef.current;

        let next: string[];
        if (currentMode === 'single') {
            //single
            next = checked ? [key] : [];
        } else {
            // multiple
            next = checked
                ? current.includes(key)
                    ? [...current]
                    : [...current, key]
                : current.filter((item) => item !== key);
        }

        if (JSON.stringify(current) === JSON.stringify(next)) return;

        onValueChangedRef.current?.({ value: next });
    }, []); // ไม่มี dependency สร้างครั้งเดียว

    const dataSource = useMemo(() => {
        const current = value || [];
        return rawData.map((item) => ({
            ...item,
            checked: current.includes((item as any)[valueExpr]),
        }));
    }, [rawData, value, valueExpr]);

    const externalValueKey = useMemo(
        () => JSON.stringify([...(value || [])].sort()),
        [value],
    );

    return (
        <div
            className={`cnx-check-box-group ${layout === 'horizontal' ? 'horizontal' : 'vertical'}`}
        >
            {dataSource.map((item) => {
                const itemDisabled = item.disabled || disabled;
                const itemKey = (item as any)[valueExpr];
                const domId = `cnx_check_box_group_${id}_${itemKey}`;
                const domName = `cnx_check_box_group_${name}_${itemKey}`;

                return (
                    <div className="check-box-item" key={itemKey}>
                        <CheckBox
                            key={`${domId}_${externalValueKey}`}
                            id={domId}
                            name={domName}
                            defaultValue={item.checked}
                            iconSize={13}
                            disabled={itemDisabled}
                            onValueChanged={(e: ValueChangedEvent) =>
                                toggleByKey(itemKey, e.value)
                            }
                        />
                        {!!(item as any)[displayExpr] && (
                            <span
                                className={`check-box-label ${!itemDisabled ? 'clickable' : ''} ${itemDisabled ? 'muted' : ''}`}
                                onClick={() =>
                                    !itemDisabled &&
                                    toggleByKey(itemKey, !item.checked)
                                }
                            >
                                {(item as any)[displayExpr]}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default CnxCheckBoxGroup;
