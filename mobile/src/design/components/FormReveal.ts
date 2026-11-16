import { createContext } from 'react';
import { View } from 'react-native';

/**
 * Scrolls a view of a form fully into sight, above the form's sticky bottom actions: for content
 * that unfolds under a field (e.g. the DateField calendar), which the keyboard logic doesn't cover.
 * FormLayout provides it; anywhere else it does nothing.
 */
export const FormRevealContext = createContext<(node: View | null) => void>(() => {});
