import type { HabitIcon } from '../types/dashboard';
type IconName = HabitIcon | 'sprout' | 'check' | 'coin' | 'spark' | 'home' | 'arrow' | 'heart';
const paths: Record<IconName, string> = {
 water: 'M12 3C10 7 5 11 5 15a7 7 0 0 0 14 0c0-4-5-8-7-12Z M9 16c0 2 1 3 3 3',
 book: 'M12 6v15M12 6C8 3 3 4 3 4v15s5-1 9 2c4-3 9-2 9-2V4s-5-1-9 2Z',
 leaf: 'M5 19C1 6 14 3 21 3c0 8-2 18-12 15M4 21 16 9',
 sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
 moon: 'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z',
 sprout: 'M12 22V12M12 12C4 13 3 7 3 3c6 0 10 3 9 9Zm0 4c0-7 4-9 9-9 0 6-3 9-9 9Z',
 check: 'm5 12 4 4L19 6', coin: 'M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM12 8v8m-2-7h3m-3 6h3',
 spark: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z',
 home: 'm3 11 9-8 9 8M5 9v12h5v-7h4v7h5V9', arrow: 'M5 12h14m-5-5 5 5-5 5',
 heart: 'M20 5c-3-3-7-1-8 2-1-3-5-5-8-2-5 5 3 11 8 15 5-4 13-10 8-15Z',
};
export function Icon({ name, className = 'size-5' }: { name: IconName; className?: string }) {
 return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
