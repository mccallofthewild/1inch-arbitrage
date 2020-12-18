import { Database, JobTypeNames } from '../utils/Database';

export const scheduleMinimalTokenPurchase = async (
	fromTokenAddress: string,
	fromTokenSymbol: string
) => {
	const id = `${JobTypeNames.BuyOneUnitOfToken}/${fromTokenAddress}`;
	const existing = await Database.Job.get(id);
	if (!existing)
		await Database.Job.set({
			id: id,
			name: JobTypeNames.BuyOneUnitOfToken,
			status: 'DORMANT',
			tokenAddress: fromTokenAddress,
			tokenSymbol: fromTokenSymbol,
		}).catch((e) => {
			console.error(e);
			throw 'Failed to schedule minimal token purchase';
		});
};
