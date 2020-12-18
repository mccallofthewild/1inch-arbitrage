import { calc } from '../helpers/calc';
import { Database, Models } from '../utils/Database';

type ArbitrageTrade = {
	cumulativePrice?: string;
	tradePair?: Models.TradePair;
	paths: ArbitrageTrade[];
};
export const findArbitrageOpportunities = async (
	rootTokenSymbol: string,
	maxTradeDepth: number,
	_prevTokenSymbol?: string,
	_cumulativePrice?: string,
	_tradePair?: Models.TradePair,
	_finalTrades: ArbitrageTrade[] = []
): Promise<ArbitrageTrade> => {
	if (maxTradeDepth == 0 || _prevTokenSymbol == rootTokenSymbol) return null;
	const baseTokenSymbol = _prevTokenSymbol || rootTokenSymbol;
	const matchingPairs = (await Database.TradePair.all()).filter(
		(pair) => pair.fromTokenSymbol == baseTokenSymbol
	);
	return {
		cumulativePrice: _cumulativePrice || null,
		tradePair: _tradePair || null,
		paths: await Promise.all(
			matchingPairs.map(async (tradePair) => {
				const cumulativePrice = calc`${tradePair.priceInFromToken}`;
				const tradeDepth = maxTradeDepth - 1;
				return await findArbitrageOpportunities(
					rootTokenSymbol,
					tradeDepth,
					tradePair.toTokenSymbol,
					tradePair.priceInFromToken,
					tradePair,
					_finalTrades
				);
			})
		),
	};
};
