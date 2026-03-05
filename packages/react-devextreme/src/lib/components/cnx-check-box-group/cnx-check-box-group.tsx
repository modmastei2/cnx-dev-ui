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
import { CascadeRule } from '../cnx-cascade-value.types';

export interface CnxCheckBoxGroupProps {
    id?: string;
    name?: string;
    value?: string[] | null;
    disabled?: boolean;
    layout?: 'vertical' | 'horizontal';
    mode?: 'multiple' | 'single';
    checkBoxKey?: CheckBoxKey | null;
    cascadeRule?: CascadeRule | CascadeRule[];
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
    cascadeRule,
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
        const applyCascadeRule = (items: CheckBoxViewModel[]) =>
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

        const applyIgnoreValue = (items: CheckBoxViewModel[]) =>
            ignoreValue?.length
                ? items.filter((item) => !ignoreValue.includes(item[valueExpr]))
                : items;

        if (customDataSource && Array.isArray(customDataSource)) {
            const filtered = applyCascadeRule(customDataSource);
            setRawData(applyIgnoreValue(filtered));
            return;
        }

        if (checkBoxKey && service) {
            service
                .getService(checkBoxKey, { cascadeBy } as CheckBoxParam)
                .then((result) => setRawData(applyIgnoreValue(result || [])));
        } else {
            setRawData([]);
        }
    }, [
        checkBoxKey,
        cascadeRule,
        cascadeBy,
        customDataSource,
        ignoreValue,
        valueExpr,
    ]);

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
            style={{
                display: 'flex',
                gap: layout === 'horizontal' ? 12 : 6,
                flexWrap: 'wrap',
                flexDirection: layout === 'horizontal' ? 'row' : 'column',
            }}
        >
            {dataSource.map((item) => {
                const itemDisabled = item.disabled || disabled;
                const itemKey = (item as any)[valueExpr];
                const domId = `cnx_check_box_group_${id}_${itemKey}`;
                const domName = `cnx_check_box_group_${name}_${itemKey}`;

                return (
                    <div
                        key={itemKey}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            flexBasis: 'auto',
                            marginInlineEnd: 8,
                        }}
                    >
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
                                style={{
                                    fontSize: 12,
                                    userSelect: 'none',
                                    cursor: !itemDisabled
                                        ? 'pointer'
                                        : 'default',
                                    color: !itemDisabled
                                        ? 'inherit'
                                        : '#9ca3af',
                                }}
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
