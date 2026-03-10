import { createContext, useContext } from 'react';
import type { TagBoxDataProvider } from './cnx-tag-box.types';

export const TagBoxDataProviderContext =
    createContext<TagBoxDataProvider | null>(null);

export function useTagBoxDataProvider() {
    return useContext(TagBoxDataProviderContext);
}
