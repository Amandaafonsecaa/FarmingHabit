export type HabitIcon = 'water' | 'book' | 'leaf' | 'sun' | 'moon';
export interface Habit { id: string; title: string; description: string; category: string; icon: HabitIcon; xp: number; coins: number; completed: boolean }
export interface User { name: string; level: number; xp: number; xpPerLevel: number; coins: number; mood: string; energy: number }
export interface Mission { title: string; description: string; target: number }
