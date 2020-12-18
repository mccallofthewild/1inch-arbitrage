import { GqlTypes } from './generated/GqlTypes';
import { Api, Token } from './generated/SwaggerTypes';
import { gql } from './helpers/gql';
import { wait } from './helpers/wait';

export class Arbitrage {
	static api = new Api();
	static pairs: GqlTypes.Query['tradingPairs'] = [];
	static tokens: Token[];
	static async loadTokens() {
		this.tokens = Object.values(
			await (await this.api.v20.getTokens()).data.tokens
		) as Token[];
	}
	static async loadPairs() {
		// this.pairs = pairs;
	}

	static async loadPairQuotesOnLoop(
		onLoadCallback: (pairs: GqlTypes.Query['tradingPairs']) => any
	) {
		console.log([
			...this.pairs.reduce((prev, curr) => {
				return [...new Set([...prev, curr.fromToken.symbol])];
			}, []),
		]);
		while (true)
			for (let [index, pair] of this.pairs.reverse().entries()) {
				try {
					console.log(pair);
					const data: GqlTypes.Query = await gql`
						query PairRequest($id: ID!) {
							pair(id: $id) {
								token0Price
								token1Price
							}
						}
					`({ id: pair.id });
					this.pairs[index] = {
						...pair,
						// ...data.pair,
					};
					// console.log(
					// 	`${pair.token0Price} ${pair.token0.symbol} == ${pair.token1Price} ${pair.token1.symbol}`
					// );
					await wait(20);
					onLoadCallback(this.pairs);
				} catch (e) {
					console.error(e);
				}
			}
	}
	static async findOpportunities() {
		// const prices =
	}
}

// async function loadAndCacheTokens() {
// 	await Arbitrage.loadTokens();
// 	const tokenMap = Arbitrage.tokens.reduce((prev, curr) => {
// 		return {
// 			...prev,
// 			[curr.symbol]: curr,
// 		};
// 	}, {});
// 	fs.writeFileSync(
// 		path`./generated/TokenDictionary.ts`,
// 		`export const TokenDictionary = ${} as const;`
// 	);
// 	Arbitrage.tokens;
// 	Arbitrage.loadPairs().then(() =>
// 		Arbitrage.loadPairQuotesOnLoop(() => Arbitrage.findOpportunities())
// 	);
// }
