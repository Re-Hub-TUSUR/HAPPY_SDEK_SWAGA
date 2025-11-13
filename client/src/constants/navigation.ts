export const NAVIGATION_TABS = ['Тесты', 'Результаты', 'Для настроения'] as const;
export type NavigationTab = typeof NAVIGATION_TABS[number];
export const DEFAULT_TAB: NavigationTab = 'Результаты';