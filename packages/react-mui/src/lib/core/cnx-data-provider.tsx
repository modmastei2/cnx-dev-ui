import React, { ReactNode } from 'react';
import { CheckBoxDataProvider } from '../components/cnx-check-box-group/cnx-check-box-group.types';
import { RadioGroupDataProvider } from '../components/cnx-radio-group/cnx-radio-group.types';
import { SelectBoxDataProvider } from '../components/cnx-select-box/cnx-select-box.types';
import { SelectBoxDataProviderContext } from '../components/cnx-select-box/cnx-select-box.context';
import { CheckBoxDataProviderContext } from '../components/cnx-check-box-group/cnx-check-box-group.context';
import { RadioGroupDataProviderContext } from '../components/cnx-radio-group/cnx-radio-group.context';
import { TagBoxDataProviderContext } from '../components/cnx-tag-box/cnx-tag-box.context';
import { TagBoxDataProvider } from '../components/cnx-tag-box/cnx-tag-box.types';

export interface CnxDataProviderProps {
    selectBox?: SelectBoxDataProvider | null;
    tagBox?: TagBoxDataProvider | null;
    checkBoxGroup?: CheckBoxDataProvider | null;
    radioGroup?: RadioGroupDataProvider | null;
    children: ReactNode;
}

export const CnxDataProvider: React.FC<CnxDataProviderProps> = ({
    selectBox = null,
    tagBox = null,
    checkBoxGroup = null,
    radioGroup = null,
    children,
}) => {
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
