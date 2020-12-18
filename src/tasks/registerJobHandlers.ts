import { ethers } from 'ethers';
import { ERC20__factory } from '../generated/contracts';
import { JobTypeNames } from '../utils/Database';
import { JobRunner } from '../utils/JobRunner';
import { loadTokenBalance } from './loadTokenBalance';

export const registerJobHandlers = (
	provider: ethers.providers.Provider,
	walletAddress: string
) => {
	JobRunner.registerHandler(async (job) => {
		if (job.name != JobTypeNames.BuyOneUnitOfToken) return;
		switch (job.status) {
			case 'DORMANT':
			case 'PENDING':
				const balance = await loadTokenBalance(
					job.tokenSymbol,
					job.tokenAddress,
					walletAddress,
					provider
				);
				if (!balance.isZero()) {
				}
		}
	}).start();
};
