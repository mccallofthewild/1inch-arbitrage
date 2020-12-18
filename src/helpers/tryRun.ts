export async function tryRun({ fn, iterations, waitFor = 3000 }) {
	if (!iterations) throw new Error('iterations param required for tryRun');
	let count = 0;
	let resolved = false;
	let rtn;
	const shouldRun = () => count < iterations && !resolved;
	while (shouldRun()) {
		count++;
		try {
			rtn = await fn();
			resolved = true;
			break;
		} catch (e) {
			if (!shouldRun()) {
				throw e;
			}
			await new Promise((resolve) => setTimeout(resolve, waitFor));
		}
	}
	return rtn;
}
