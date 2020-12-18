/* tslint:disable */
/* eslint-disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * Approve CallData response
 */
export interface ApproveCallData {
	/** Address of the token to approve */
	to: string;

	/** ETH value in wei (for approve is 0) */
	value: string;

	/** Network fast gas price */
	gasPrice: string;

	/** CallData to sign */
	data: string;
}

/**
 * Spender address
 */
export interface SpenderAddress {
	/** We need to approve your token to this address */
	address: string;
}

/**
 * Supported Protocols
 */
export interface Protocols {
	/** Supported protocols to pass to protocols */
	protocols: string[];
}

/**
 * Supported tokens (you can also use not supported)
 */
export interface Tokens {
	/** Supported tokens */
	tokens: Token;
}

/**
 * Token
 */
export interface Token {
	symbol: string;
	name: string;
	address: string;
	decimals: string | number;
	logoURI: string;
}

/**
 * Quote Response
 */
export interface Quote {
	/** From token info */
	fromToken: Token;

	/** To token info */
	toToken: Token;

	/** To token amount */
	toTokenAmount: string;

	/** From token amount */
	fromTokenAmount: string;

	/** From token amount */
	protocols: SelectedProtocol[];

	/** Estimated Gas */
	estimatedGas: string | number;
}

/**
 * Swap Response
 */
export interface Swap {
	/** From token info */
	fromToken: Token;

	/** To token info */
	toToken: Token;

	/** To token amount */
	toTokenAmount: string;

	/** From token amount */
	fromTokenAmount: string;

	/** From token amount */
	protocols: SelectedProtocol[];

	/** Ethereum transaction */
	tx: Tx;
}

/**
 * Ethereum transaction
 */
export interface Tx {
	from: string;
	to: string;
	data: string;
	value: string;
	gasPrice: string;
	gas: string | number;
}

/**
 * Selected Protocol Info
 */
export interface SelectedProtocol {
	name: string;
	part: string | number;
	fromTokenAddress: string;
	toTokenAddress: string;
}

export type RequestParams = Omit<RequestInit, 'body' | 'method'> & {
	secure?: boolean;
};

export type RequestQueryParamsType = Record<string | string | number, any>;

interface ApiConfig<SecurityDataType> {
	baseUrl?: string;
	baseApiParams?: RequestParams;
	securityWorker?: (securityData: SecurityDataType) => RequestParams;
}

interface HttpResponse<D extends unknown, E extends unknown = unknown>
	extends Response {
	data: D | null;
	error: E | null;
}

enum BodyType {
	Json,
}

class HttpClient<SecurityDataType> {
	public baseUrl: string = 'https://api.1inch.exchange';
	private securityData: SecurityDataType = null as any;
	private securityWorker:
		| null
		| ApiConfig<SecurityDataType>['securityWorker'] = null;

	private baseApiParams: RequestParams = {
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json',
		},
		redirect: 'follow',
		referrerPolicy: 'no-referrer',
	};

	constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
		Object.assign(this, apiConfig);
	}

	public setSecurityData = (data: SecurityDataType) => {
		this.securityData = data;
	};

	private addQueryParam(query: RequestQueryParamsType, key: string) {
		return (
			encodeURIComponent(key) +
			'=' +
			encodeURIComponent(
				Array.isArray(query[key]) ? query[key].join(',') : query[key]
			)
		);
	}

	protected addQueryParams(rawQuery?: RequestQueryParamsType): string {
		const query = rawQuery || {};
		const keys = Object.keys(query).filter(
			(key) => 'undefined' !== typeof query[key]
		);
		return keys.length
			? `?${keys
					.map((key) =>
						typeof query[key] === 'object' && !Array.isArray(query[key])
							? this.addQueryParams(query[key] as object).substring(1)
							: this.addQueryParam(query, key)
					)
					.join('&')}`
			: '';
	}

	private bodyFormatters: Record<BodyType, (input: any) => any> = {
		[BodyType.Json]: JSON.stringify,
	};

	private mergeRequestOptions(
		params: RequestParams,
		securityParams?: RequestParams
	): RequestParams {
		return {
			...this.baseApiParams,
			...params,
			...(securityParams || {}),
			headers: {
				...(this.baseApiParams.headers || {}),
				...(params.headers || {}),
				...((securityParams && securityParams.headers) || {}),
			},
		};
	}

	private safeParseResponse = <T = any, E = any>(
		response: Response
	): Promise<HttpResponse<T, E>> => {
		const r = response as HttpResponse<T, E>;
		r.data = null;
		r.error = null;

		return response
			.json()
			.then((data) => {
				if (r.ok) {
					r.data = data;
				} else {
					r.error = data;
				}
				return r;
			})
			.catch((e) => {
				r.error = e;
				return r;
			});
	};

	public request = <T = any, E = any>(
		path: string,
		method: string,
		{ secure, ...params }: RequestParams = {},
		body?: any,
		bodyType?: BodyType,
		secureByDefault?: boolean
	): Promise<HttpResponse<T>> => {
		const requestUrl = `${this.baseUrl}${path}`;
		const secureOptions =
			(secureByDefault || secure) && this.securityWorker
				? this.securityWorker(this.securityData)
				: {};
		const requestOptions = {
			...this.mergeRequestOptions(params, secureOptions),
			method,
			body: body ? this.bodyFormatters[bodyType || BodyType.Json](body) : null,
		};

		return fetch(requestUrl, requestOptions).then(async (response) => {
			const data = await this.safeParseResponse<T, E>(response);
			if (!response.ok) throw data;
			return data;
		});
	};
}

/**
 * @title 1inch API
 * @version 2.0
 * @baseUrl https://api.1inch.exchange/
 */
export class Api<SecurityDataType = any> extends HttpClient<SecurityDataType> {
	v20 = {
		/**
		 * @tags Approve
		 * @name getCallData
		 * @request GET:/v2.0/approve/calldata
		 * @description Generated approve calldata
		 */
		getCallData: (
			query: {
				amount?: string | number;
				infinity?: boolean;
				tokenAddress: string;
			},
			params?: RequestParams
		) =>
			this.request<ApproveCallData, any>(
				`/v2.0/approve/calldata${this.addQueryParams(query)}`,
				'GET',
				params
			),

		/**
		 * @tags Approve
		 * @name getSpenderAddress
		 * @request GET:/v2.0/approve/spender
		 * @description Address of spender
		 */
		getSpenderAddress: (params?: RequestParams) =>
			this.request<SpenderAddress, any>(`/v2.0/approve/spender`, 'GET', params),

		/**
		 * @tags Healthcheck
		 * @name isLife
		 * @request GET:/v2.0/healthcheck
		 */
		isLife: (params?: RequestParams) =>
			this.request<any, any>(`/v2.0/healthcheck`, 'GET', params),

		/**
		 * @tags Quote/Swap
		 * @name getQuote
		 * @request GET:/v2.0/quote
		 * @description Quote
		 */
		getQuote: (
			query: {
				fromTokenAddress: string;
				toTokenAddress: string;
				amount: string | number;
				fee?: string | number;
				protocols?: string;
				gasPrice?: string;
				complexityLevel?: string;
				connectorTokens?: string;
				gasLimit?: string | number;
				parts?: string | number;
				virtualParts?: string | number;
				mainRouteParts?: string | number;
			},
			params?: RequestParams
		) =>
			this.request<Quote, any>(
				`/v2.0/quote${this.addQueryParams(query)}`,
				'GET',
				params
			),

		/**
		 * @tags Quote/Swap
		 * @name swap
		 * @request GET:/v2.0/swap
		 * @description Swap
		 */
		swap: (
			query: {
				fromTokenAddress: string;
				toTokenAddress: string;
				amount: string | number;
				fromAddress: string;
				slippage: string | number;
				protocols?: string;
				destReceiver?: string;
				referrerAddress?: string;
				fee?: string | number;
				gasPrice?: string;
				burnChi?: boolean;
				complexityLevel?: string;
				connectorTokens?: string;
				allowPartialFill?: boolean;
				disableEstimate?: boolean;
				gasLimit?: string | number;
				parts?: string | number;
				virtualParts?: string | number;
				mainRouteParts?: string | number;
			},
			params?: RequestParams
		) =>
			this.request<Swap, any>(
				`/v2.0/swap${this.addQueryParams(query)}`,
				'GET',
				params
			),

		/**
		 * @tags Protocols
		 * @name getProtocols
		 * @request GET:/v2.0/protocols
		 * @description All supported protocols
		 */
		getProtocols: (params?: RequestParams) =>
			this.request<Protocols, any>(`/v2.0/protocols`, 'GET', params),

		/**
		 * @tags Tokens
		 * @name getTokens
		 * @request GET:/v2.0/tokens
		 * @description All supported tokens (can also use your own)
		 */
		getTokens: (params?: RequestParams) =>
			this.request<Tokens, any>(`/v2.0/tokens`, 'GET', params),
	};
}
