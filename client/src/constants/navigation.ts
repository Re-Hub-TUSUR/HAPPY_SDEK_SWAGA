export const NAVIGATION_TABS = ['Тесты', 'Результаты', 'AI-ассистент'] as const;
export type NavigationTab = typeof NAVIGATION_TABS[number];
export const DEFAULT_TAB: NavigationTab = 'Результаты';