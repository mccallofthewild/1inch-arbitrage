import { Arbitrage } from '../Arbitrage';
import fs from 'fs';
import { path } from '../helpers/path';
async function generateTokenDictionary() {
	await Arbitrage.loadTokens();
	const tokenMap = Arbitrage.tokens.reduce((prev, curr) => {
		return {
			...prev,
			[curr.symbol]: curr,
		};
	}, {});
	fs.writeFileSync(
		path`./generated/TokenDictionary.ts`,
		`export const TokenDictionary = ${JSON.stringify(tokenMap)} as const;`
	);
	Arbitrage.tokens;
	Arbitrage.loadPairs().then(() =>
		Arbitrage.loadPairQuotesOnLoop(() => Arbitrage.findOpportunities())
	);
}
