export interface IMarket {
	name: string;
	last(data, coin_prices);
	buyLimit(base_currency, quote_currency, rate, amount);

	sellLimit(base_currency, quote_currency, rate, amount);

	deposit(currency);

	getBalance(currency);

	getCoinPrice(base_currency, quote_currency);

	withdraw(address, currency, amount, payment_id);

	getAccount();

	orderStatus(order_id, base_currency, quote_currency);

	orderComplete(order_id, base_currency, quote_currency): Promise<boolean>;

	getOpenOrders(base_currency, quote_currency): string[]; // order id's

	cancel(
		order_id: string | number,
		base_currency: string,
		quote_currency: string
	);
}
