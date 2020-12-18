import { IMarket } from './Market';
import { ValueOf } from 'type-fest';
/**
 *
 *
 * @export
 * @class OnExchangeArbitrage
 */
export class OnExchangeArbitrage {
	// coins to trade
	coins: string[];
	// name of exchange to trade on
	exchange: IMarket;
	baseCurrencies: string[];

	homeCurrency: string;
	maxTradesPerSequence: number;
	/**
	 * Creates an instance of OnExchangeArbitrage.
	 * @param {Object} arg
	 * @param {Exchange} arg.exchangeName - Name of Exchange to trade on
	 * @param {string[]} arg.baseCurrencies - Base currencies to arbitrage trade against
	 * @param {number} arg.maxTradesPerSequence - Maximum number of trades to take in a trade sequence
	 * @memberof OnExchangeArbitrage
	 */
	constructor(
		exchange: IMarket,
		baseCurrencies: string[],
		maxTradesPerSequence = 3,
		homeCurrency: string,
		tradePairs: {}
	) {
		this.exchange = exchange;
		this.coins = coins;
		this.homeCurrency = homeCurrency;
		this.maxTradesPerSequence = maxTradesPerSequence;

		const marketsMap = new Map();
		this.baseCurrencies.forEach((currency) => {
			let exchange = ApplicationFactory.exchange({
				name: this.exchangeName,
				options: {
					defaultBaseCurrency: currency,
				},
			});
			marketsMap.set(currency, exchange);
		});
		this.markets = marketsMap;
	}

	static get PRICE_TYPES() {
		return {
			BID: 'BID',
			ASK: 'ASK',
			UNKNOWN: 'UNKNOWN',
		};
	}

	/**
	 *
	 *
	 * @param { Object } arg
	 * @param { TickerData } arg.ticker
	 * @param { String } arg.symbol
	 * @memberof OnExchangeArbitrage
	 */
	selectBidOrAsk({ ticker, symbol }) {
		const { hour, day, week } = ticker.percentChange(symbol);

		let bidWeight = 1;
		let askWeight = 1;

		// MUST BE 4 OR ABOVE!!!
		// We are subtracting 1 for each interval below,
		// so outcomes will be inverted if `weightMod` dips
		// below 1.
		let weightMod = 4;

		// if prices go up during a time period, the weight of a trade type goes up
		// by multiplying by weightMod.
		// Longer terms are more indicative of trends, so `weightMod` decreases as we
		// move towards shorter terms.

		// COMMENTED OUT TO TEST SHORT TERM FOCUS
		// if (week > 0) askWeight *= weightMod;
		// else bidWeight *= weightMod;
		// weightMod--;

		if (day > 0) askWeight *= weightMod;
		else bidWeight *= weightMod;
		weightMod--;

		if (hour > 0) askWeight *= weightMod;
		else bidWeight *= weightMod;
		weightMod--;

		let priceType = OnExchangeArbitrage.PRICE_TYPES.BID;

		if (askWeight > bidWeight) priceType = OnExchangeArbitrage.PRICE_TYPES.ASK;

		if (askWeight == bidWeight)
			priceType = OnExchangeArbitrage.PRICE_TYPES.UNKNOWN;

		return priceType;
	}

	/**
	 * Recursively calculates rates along a trade path by guessing whether a trade pair
	 * will drift towards bid or ask price, based on current coinmarketcap trends.
	 *
	 * @param {*} {
	 *         tradePairs,
	 *         currency,
	 *         remainingTrades,
	 *         ticker,
	 *     }
	 * @returns
	 * @memberof OnExchangeArbitrage
	 */
	buildOpportunityBranch({ tradePairs, currency, remainingTrades }) {
		const homeCurrency = this.homeCurrency;
		const opportunities = [];
		const currencyIsBase = new Set(this.baseCurrencies).has(currency);
		const isLastTrade = remainingTrades <= 1;

		for (let pair of tradePairs) {
			try {
				let nextCurrency = null;
				if (pair.base == currency) nextCurrency = pair.quote;
				if (pair.quote == currency) nextCurrency = pair.base;
				if (!nextCurrency) {
					continue;
				}
				if (isLastTrade && homeCurrency !== nextCurrency) continue;

				let nextOpportunities = null;
				const done = nextCurrency == homeCurrency;
				if (!(isLastTrade || done)) {
					nextOpportunities = this.buildOpportunityBranch({
						tradePairs,
						currency: nextCurrency,
						remainingTrades: remainingTrades - 1,
					});
				}

				// let priceType = this.selectBidOrAsk({
				// 	ticker,
				// 	symbol: pair.quote,
				// });

				const isSelling = nextCurrency == pair.base;

				const marketPriceType = isSelling
					? OnExchangeArbitrage.PRICE_TYPES.BID
					: OnExchangeArbitrage.PRICE_TYPES.ASK;
				// Default to market price
				priceType =
					priceType == OnExchangeArbitrage.PRICE_TYPES.UNKNOWN
						? marketPriceType
						: priceType;

				const range = pair.ask - pair.bid;
				/* 
					Shift is how far across the range between bid & ask you're willing to go
					to split the gap on non-market orders.
					A shift of 1 on a bid would put you at the ask price, and vice versa.
					A shift of 0.5 would put you exactly between the bid and the ask. (average)
					A shift of 0 would keep you at the same place.
				*/

				const shift = 0.05;
				const motion = range * shift;
				let rate;

				switch (priceType) {
					case OnExchangeArbitrage.PRICE_TYPES.BID:
						rate = pair.bid;
						if (!isSelling) rate += motion;
						break;
					case OnExchangeArbitrage.PRICE_TYPES.ASK:
						rate = pair.ask;
						if (isSelling) rate -= motion;
						break;
				}

				const opp = {
					rate: rate,
					priceType: priceType,
					pair: pair,
					from: currency,
					to: nextCurrency,
					opportunities: nextOpportunities,
					done: done,
				};
				opportunities.push(opp);
			} catch (e) {
				console.error(e);
			}
		}
		return opportunities;
	}

	async buildOpportunityTree() {
		const opportunities = this.buildOpportunityBranch({
			tradePairs: allTradePairs,
			currency: this.homeCurrency,
			remainingTrades: this.maxTradesPerSequence,
		});
		return opportunities;
	}

	findMostProfitableOpportunityPath({ opportunities, value, currency }) {
		let mostProfitable = null;
		let highestValue = -Infinity;
		if (!opportunities) console.log('No opportunities.');
		opportunities.forEach((opp) => {
			let opportunityPath = [];

			opportunityPath.push(opp);

			if (!opp.done && !opp.opportunities) return;

			let nextValue;
			let nextCurrency;
			if (currency == opp.pair.base) {
				// console.log(opp.pair.base, opp.pair.quote, opp.rate)
				// Buy Order
				nextValue = value / opp.rate;
				nextValue = nextValue - nextValue * opp.pair.exchange.takerFee;
				nextCurrency = opp.pair.quote;
			} else if (currency == opp.pair.quote) {
				// Sell Order
				nextValue = value * opp.rate;
				nextValue = nextValue - nextValue * opp.pair.exchange.makerFee;
				nextCurrency = opp.pair.base;
			} else {
				return;
			}
			let { opportunityPath: endOfPath, endValue } = opp.done
				? { opportunityPath: [], endValue: nextValue }
				: this.findMostProfitableOpportunityPath({
						opportunities: opp.opportunities,
						value: nextValue,
						currency: nextCurrency,
				  });
			endOfPath = endOfPath || [];
			opportunityPath.push(...endOfPath);
			if (endValue > highestValue) {
				highestValue = endValue;
				mostProfitable = opportunityPath;
			}
		});
		return {
			opportunityPath: mostProfitable,
			endValue: highestValue,
		};
	}

	analyzeOpportunities(opps) {
		const startValue = 1;
		let { opportunityPath, endValue } = this.findMostProfitableOpportunityPath({
			opportunities: opps,
			value: startValue,
			currency: this.homeCurrency,
		});
		// debugger
		return {
			mostProfitable: opportunityPath,
			endValue,
			profitPercentage: (endValue - startValue) * 100,
		};
	}
}
