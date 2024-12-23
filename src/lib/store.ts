import { writable } from 'svelte/store';

export interface Item {
	id: string;
	text: string;
	level: number;
}

export const toc = writable<Item[]>([]);
export const tof = writable<Item[]>([]);
