import { writable } from 'svelte/store';
import type { Item, Notebook } from '$lib/interfaces';

export const toc = writable<Item[]>([]);
export const tof = writable<Item[]>([]);
export const tofx = writable<Item[]>([]);

export const availableNotebooks = writable<Notebook[]>([]);
