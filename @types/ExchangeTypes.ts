export namespace ExchangeTypes {
	export interface Quote {
		fromToken: Token;
		toToken: Token;
		toTokenAmount: string;
		fromTokenAmount: string;
		protocols: Protocol[];
		estimatedGas: number;
	}

	export interface Token {
		symbol: string;
		name: string;
		address: string;
		decimals: number;
		logoURI: string;
	}

	export interface Protocol {
		name: string;
		part: number;
		fromTokenAddress: string;
		toTokenAddress: string;
	}
}
