import { ethers } from 'ethers';
export const getProvider = () =>
	new ethers.providers.InfuraProvider('homestead', {
		projectId: '1237f6da60064ce3ac57811805649448',
		projectSecret: '2ad8de1f44ac402c827694e262d4f37e',
	});
