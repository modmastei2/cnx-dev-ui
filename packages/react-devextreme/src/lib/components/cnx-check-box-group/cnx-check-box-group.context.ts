import { createContext, useContext } from 'react';
import type { CheckBoxDataProvider } from './cnx-check-box-group.types';

export const CheckBoxDataProviderContext =
    createContext<CheckBoxDataProvider | null>(null);

export function useCheckBoxDataProvider() {
    return useContext(CheckBoxDataProviderContext);
}
