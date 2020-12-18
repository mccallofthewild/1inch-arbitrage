import { ethers } from 'ethers';
import { ERC20__factory } from '../generated/contracts';

export const loadTokenBalance = async (
	tokenSymbol: string,
	tokenAddress: string,
	walletAddress: string,
	provider: ethers.providers.Provider
) => {
	return tokenSymbol == 'ETH'
		? await provider.getBalance(tokenAddress)
		: await ERC20__factory.connect(tokenAddress, provider).balanceOf(
				walletAddress
		  );
};
