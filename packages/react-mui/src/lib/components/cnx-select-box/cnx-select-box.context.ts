import { createContext, useContext } from 'react';
import type { SelectBoxDataProvider } from './cnx-select-box.types';

export const SelectBoxDataProviderContext =
    createContext<SelectBoxDataProvider | null>(null);

export function useSelectBoxDataProvider() {
    return useContext(SelectBoxDataProviderContext);
}
