import { createClient } from '@sanity/client';

const client = createClient({
	projectId: 'x4ducbn5',
	dataset: 'production',
	apiVersion: '2023-01-01',
	useCdn: true,
});

export default client;

/*
* export interface ClientConfig {
	* projectId?: string
	* dataset?: string
	* useCdn?: boolean
	* token?: string
	* perspective?: ClientPerspective
	* apiHost?: string
	* apiVersion?: string
	* proxy?: string
	* requestTagPrefix?: string
* */