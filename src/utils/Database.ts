import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import path from 'path';
import { ValueOf } from 'type-fest';
import EventEmitter from 'eventemitter3';
PouchDB.plugin(PouchDBFind);

type Schema = Required<{
	jobs: {
		[id: string]: Models.Job;
	};
	tradePairs: {
		[id: string]: Models.TradePair;
	};
}>;

const adapter = new FileSync<Schema>('db.json');
export const LowDB = low(adapter);

// LowDB.defaults<Schema>({ jobs: {}, tradePairs: {} }).write();

class DataHandler<
	TModel extends {
		id: string;
	}
> extends EventEmitter<'set', TModel> {
	name: ModelName;
	constructor(name: ModelName) {
		super();
		this.name = name;
	}

	async set(v: Required<TModel>): Promise<TModel> {
		await LowDB;
		await LowDB.set(this.name + '.' + v.id, v).write();
		this.emit('set', v);
		return v;
	}

	async get(id): Promise<TModel> {
		await LowDB;
		const v = await LowDB.get(this.name + '.' + id).value();
		return v;
	}

	async all(): Promise<TModel[]> {
		const val = await LowDB.get(this.name).value();
		return [...Object.values<TModel>(val)] || [];
	}
}

// now this will be correctly typed with all valid methods, foos will have type Foo[]

export enum ModelName {
	Job = 'Job',
	TradePair = 'TradePair',
}

type JobTemplate<NameT, PayloadT> = {
	// - id = `JobTypeName/tokenAddress
	id: string;
	name: NameT;
	status: 'DORMANT' | 'PENDING' | 'SUCCESS' | 'FAILED';
} & PayloadT;

export enum JobTypeNames {
	BuyOneUnitOfToken = 'BUY_ONE_UNIT_OF_TOKEN',
}

export namespace Models {
	export type Job = JobTemplate<
		JobTypeNames.BuyOneUnitOfToken,
		{
			tokenAddress: string;
			tokenSymbol: string;
		}
	>;
	export type TradePair = {
		// id = FROM-TO
		id: string;
		fromTokenSymbol: string;
		toTokenSymbol: string;
		priceInFromToken: string;
		fromTokenAddress: string;
		toTokenAddress: string;
	};
}

export class Database {
	static Job = new DataHandler<Models.Job>(ModelName.Job);
	static TradePair = new DataHandler<Models.TradePair>(ModelName.TradePair);
}
