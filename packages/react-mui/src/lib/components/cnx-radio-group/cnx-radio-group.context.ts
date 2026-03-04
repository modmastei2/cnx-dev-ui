import { createContext, useContext } from 'react';
import type { RadioGroupDataProvider } from './cnx-radio-group.types';

export const RadioGroupDataProviderContext =
    createContext<RadioGroupDataProvider | null>(null);

export function useRadioGroupDataProvider() {
    return useContext(RadioGroupDataProviderContext);
}
