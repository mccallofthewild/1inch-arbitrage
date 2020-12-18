import { gql } from '../helpers/gql';

export const loadValidTradePairs = async () => {
	const res = await gql`
		{
			tradingPairs(
				first: 1000
				orderBy: tradeCount
				orderDirection: desc
				where: { tradeVolume_gt: 1000000 }
			) {
				tradeVolume
				fromToken {
					symbol
					tradeVolume
				}
				toToken {
					symbol
					tradeVolume
				}
			}
		}
	`;
	console.log({ graphqlRes: res });
	return res.tradingPairs.reduce((prev, curr) => {
		prev.add(curr.fromToken.symbol + '-' + curr.toToken.symbol);
		return prev;
	}, new Set<string>());
};
