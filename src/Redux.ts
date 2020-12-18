// https://github.com/mccallofthewild/ecmascript-lab/blob/master/MinimalRedux.ts

class Redux<Action, State> {
	readonly reducer: (state?: State, action?: Action) => State;
	private listeners: Array<(state: State, action: Action) => any> = [];
	private state: State;

	public get currentState(): State {
		return Object.freeze(this.state);
	}
	constructor(reducer: (state?: State, action?: Action) => State) {
		this.reducer = reducer;
		this.state = reducer();
	}
	addListener(listenerFn: (state: State, action: Action) => any) {
		this.listeners.push(listenerFn);
	}
	removeListener(listenerFn: (state: State, action: Action) => any) {
		this.listeners = this.listeners.filter((fn) => fn != listenerFn);
	}
	dispatch(action: Action) {
		this.state = this.reducer(this.state, action);
		this.listeners.forEach((listenerFn) =>
			setTimeout(() => listenerFn(this.state, action), 0)
		);
	}
}
