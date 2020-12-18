import { TokenDictionary } from '../generated/TokenDictionary';
import { gql } from '../helpers/gql';

export const loadValidTokens = async (validTokenPairs: Set<string>) => {
	const validTokens = new Set<string>();
	for (let tokenPair of validTokenPairs) {
		const tokenPairArr = tokenPair.split('-');
		// @ts-ignore
		validTokens.add(tokenPairArr[0]);
		// @ts-ignore
		validTokens.add(tokenPairArr[1]);
	}
	return validTokens;
};
