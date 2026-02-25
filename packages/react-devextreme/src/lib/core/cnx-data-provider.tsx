import React, { ReactNode } from 'react';

import { SelectBoxDataProviderContext } from '../components/cnx-select-box/cnx-select-box.context';
import type { SelectBoxDataProvider } from '../components/cnx-select-box/cnx-select-box.types';

import { TagBoxDataProviderContext } from '../components/cnx-tag-box/cnx-tag-box.context';
import type { TagBoxDataProvider } from '../components/cnx-tag-box/cnx-tag-box.types';

import { CheckBoxDataProviderContext } from '../components/cnx-check-box-group/cnx-check-box-group.context';
import type { CheckBoxDataProvider } from '../components/cnx-check-box-group/cnx-check-box-group.types';

import { RadioGroupDataProviderContext } from '../components/cnx-radio-group/cnx-radio-group.context';
import type { RadioGroupDataProvider } from '../components/cnx-radio-group/cnx-radio-group.types';

export interface CnxDataProviderProps {
    selectBox?: SelectBoxDataProvider | null;
    tagBox?: TagBoxDataProvider | null;
    checkBoxGroup?: CheckBoxDataProvider | null;
    radioGroup?: RadioGroupDataProvider | null;
    children: ReactNode;
}

/**
 * A unified Provider component to avoid nested context declarations in React.
 * You can pass your data provider services here, and they will be injected
 * into all child Cnx components.
 */
export const CnxDataProvider: React.FC<CnxDataProviderProps> = ({
    selectBox = null,
    tagBox = null,
    checkBoxGroup = null,
    radioGroup = null,
    children,
}) => {
    // 💡 การรวม Context หลายๆ ตัวใน React ให้ดู Clean ขึ้น (ลด Provider Hell)
    // สามารถใช้ reduceRight ร่วมกับ React.cloneElement เพื่อผสม Provider เข้าด้วยกันได้แบบ Flat
    const providers = [
        <SelectBoxDataProviderContext.Provider
            value={selectBox}
            key="select"
        />,
        <TagBoxDataProviderContext.Provider value={tagBox} key="tag" />,
        <CheckBoxDataProviderContext.Provider
            value={checkBoxGroup}
            key="check"
        />,
        <RadioGroupDataProviderContext.Provider
            value={radioGroup}
            key="radio"
        />,
    ];

    return providers.reduceRight(
        (kids, parent) => React.cloneElement(parent, { children: kids }),
        children as React.ReactElement,
    ) as React.ReactElement;
};

export default CnxDataProvider;
