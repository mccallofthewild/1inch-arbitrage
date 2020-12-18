import { Token } from 'graphql';
import { Arbitrage } from '../Arbitrage';
import { TokenDictionary } from '../generated/TokenDictionary';
export const loadTokenDictionary = async () => {
	await Arbitrage.loadTokens();
	return Arbitrage.tokens.reduce((prev, curr) => {
		return {
			...prev,
			[curr.symbol]: curr,
		};
	}, {}) as typeof TokenDictionary;
};
