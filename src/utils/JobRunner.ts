import { Database, Models, ModelName } from './Database';

type JobHandler = (job: Models.Job | null) => any;

export class JobRunner {
	private static handlers: JobHandler[] = [];
	static registerHandler(cb: JobHandler) {
		this.handlers.push(cb);
		return this;
	}
	static start() {
		Database.Job.all().then((docs) => {
			docs.forEach((doc) => this.handlers.forEach((h) => h(doc)));
		});
		Database.Job.on('set', (val) => {
			this.handlers.forEach((h) => {
				try {
					if (val) {
						h(val);
					}
				} catch (e) {
					console.error(e);
				}
			});
			// received a change
		});

		return this;
	}
}
