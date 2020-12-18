import { Arbitrage } from '../Arbitrage';
import { Api } from '../generated/SwaggerTypes';
import RateLimitProtector from '../RateLimitProtector';

export const addRateLimiterFor1inchREST = (api: Api) => {
	return new RateLimitProtector({ padding: 250 }).shieldAll(api.v20, api);
};
