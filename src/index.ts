global.fetch = require('cross-fetch');
import { ethers } from 'ethers';
import { calc } from './helpers/calc';
import { ERC20__factory, OneSplit__factory } from './generated/contracts';
import { Arbitrage } from './Arbitrage';
import { getProvider } from './tasks/getProvider';
import { loadValidTokens } from './tasks/loadValidTokens';
import { Database, JobTypeNames } from './utils/Database';
import { loadValidTradePairs } from './tasks/loadValidTradePairs';
import { loadWallet } from './tasks/loadWallet';
import { loadTokenDictionary } from './tasks/loadtokenDictionary';
import { addRateLimiterFor1inchREST } from './helpers/addRateLimiterFor1inchREST';
import { registerJobHandlers } from './tasks/registerJobHandlers';
import { scheduleMinimalTokenPurchase } from './tasks/scheduleMinimalTokenPurchase';
import { Swap } from './generated/SwaggerTypes';
import { loadTokenBalance } from './tasks/loadTokenBalance';
setInterval(() => {}, 1000000);

const WHALE_ADDRESS = '0xD2Af803ad747ea12Acf5Ae468056703aE48785b5';
// separator
const main = async () => {
	const provider = getProvider();
	const wallet = await loadWallet(provider);
	const TX_ADDRESS = WHALE_ADDRESS;
	const oneSplitContractAddress = await provider.resolveName('1proto.eth');
	const tokenDictionary = await loadTokenDictionary();
	registerJobHandlers(provider, TX_ADDRESS);
	addRateLimiterFor1inchREST(Arbitrage.api);
	const validTokenPairs = await loadValidTradePairs();
	const validTokens = await loadValidTokens(validTokenPairs);
	console.log({ validTokens });
	const validBaseTokens = ['TUSD', 'USDT', 'DAI', 'USDC'];
	const validFromTokens = [...validTokens].filter((t) =>
		validBaseTokens.includes(t)
	);
	const oneSplitContract = OneSplit__factory.connect(
		oneSplitContractAddress,
		provider
	);

	// e.g. { USDT: { DAI: { price: 0.992 }, TUSD: { price: 1.0115 }, ... }, ... }
	const pairs: Record<
		string,
		Record<
			string,
			{
				price: string;
			}
		>
	> = {};
	while (true)
		for (let fromTokenSymbol of validFromTokens) {
			const fromToken = tokenDictionary[fromTokenSymbol];
			const currentBalance = await loadTokenBalance(
				fromTokenSymbol,
				fromToken.address,
				TX_ADDRESS,
				provider
			);
			if (currentBalance.isZero()) {
				await scheduleMinimalTokenPurchase(fromToken.address, fromTokenSymbol);
				continue;
			}
			const promises: Promise<any>[] = [];
			// Must have enough token for swap to actually work
			for (let toTokenSymbol of validTokens) {
				const toToken = tokenDictionary[toTokenSymbol];
				const pairSymbol = `${fromTokenSymbol}-${toTokenSymbol}`;

				const promise = (async () => {
					try {
						// Token validation
						if (
							!validTokenPairs.has(pairSymbol) ||
							fromTokenSymbol == toTokenSymbol
						)
							return;
						const fromTokenAmount = '100.01';
						// const res = await oneSplitContract
						// 	.getExpectedReturn(
						// 		tokenDictionary[fromTokenSymbol].address,
						// 		tokenDictionary[toTokenSymbol].address,
						// 		ethers.utils.parseUnits(
						// 			fromTokenAmount,
						// 			tokenDictionary[fromTokenSymbol].decimals
						// 		),
						// 		calc.BN`1`,
						// 		calc.BN`${calc`20000000 + 40000000`}`,
						// 		{
						// 			from: TX_ADDRESS,
						// 		}
						// 	)
						// 	.catch((e) => console.error(e));

						// if (!res || !res[0] || res[0].isZero()) return;
						console.log('-------------------------------');
						console.log(pairSymbol);
						// if (res) console.log('Contract Call: ');
						// const toTokenContractAmount = ethers.utils.formatUnits(
						// 	res.returnAmount.toString(),
						// 	tokenDictionary[toTokenSymbol].decimals
						// );
						console.log('loading swap');
						// referral address lets you charge customers to use your ui
						const { data: swap }: { data: Swap } = await Arbitrage.api.v20
							.swap({
								fromTokenAddress: tokenDictionary[fromTokenSymbol].address,
								toTokenAddress: tokenDictionary[toTokenSymbol].address,
								// @ts-ignore
								// connectorTokens: ['DAI', 'USDB', 'VEE', 'CREAM', toTokenSymbol].map(
								// 	(t) => tokenDictionary[t].address
								// ),
								parts: 100,
								virtualParts: 100,
								mainRouteParts: 50,
								complexityLevel: '1',
								// amount: ethers.utils
								// 	.formatUnits(
								// 		ethers.BigNumber.from(fromTokenAmount),
								// 		tokenDictionary[fromTokenSymbol].decimals
								// 	)
								// 	.toString(),
								amount: ethers.utils
									.parseUnits(
										fromTokenAmount,
										tokenDictionary[fromTokenSymbol].decimals
									)
									.toString(),
								disableEstimate: true,
								fromAddress: TX_ADDRESS,
								slippage: 0,
							})
							.catch((e) => {
								console.error('error loading swap', e);
								return { data: null };
							});
						if (!swap) return;

						const toTokenAmount = ethers.utils
							.formatUnits(
								ethers.BigNumber.from(swap.toTokenAmount),
								tokenDictionary[toTokenSymbol].decimals
							)
							.toString();

						if (!toTokenAmount) {
							debugger;
						}
						console.log({ toTokenAmount });

						console.log({
							fromTokenAmount,
							toTokenAmount,
							// toTokenContractAmount,
						});
						const price = calc`${fromTokenAmount} / ${toTokenAmount}`.toString();
						pairs[fromTokenSymbol] = {
							[toTokenSymbol]: {
								price,
							},
							...(pairs[fromTokenSymbol] || {}),
						};

						console.log('loading trade pair');

						await Database.TradePair.set({
							id: pairSymbol,
							fromTokenSymbol,
							toTokenSymbol,
							priceInFromToken: price,
							fromTokenAddress: fromToken.address,
							toTokenAddress: toToken.address,
						});

						// const balance = await loadTokenBalance(
						// 	toTokenSymbol,
						// 	toToken.address,
						// 	TX_ADDRESS,
						// 	provider
						// );
						// console.log(`Balance of ${balance} ${toToken.symbol}`);
						// if (!balance.isZero()) {
						// 	Database.Job.set({
						// 		id: JobTypeNames.BuyOneUnitOfToken + '/' + toToken.address,
						// 		name: JobTypeNames.BuyOneUnitOfToken,
						// 		status: 'DORMANT',
						// 		tokenAddress: toToken.address,
						// 		tokenSymbol: toToken.symbol,
						// 	});
						// }
					} catch (e) {
						console.error('error', e.error || e);
					}
				})().catch(console.error);
				promises.push(promise);
			}
			await Promise.all(promises);
		}
	console.log('DONE!');
	global.WebSocket = require('ws');
};

main();
