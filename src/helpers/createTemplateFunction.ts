export const createTemplateFunction = <T extends (arg?: string) => any>(
	cb: T
) => {
	return (...templateLiteral: Parameters<typeof String.raw>): ReturnType<T> => {
		const str = String.raw(...templateLiteral);
		return cb(str);
	};
};
