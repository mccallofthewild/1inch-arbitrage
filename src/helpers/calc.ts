import { create, all } from 'mathjs';
import BigNumber from 'bignumber.js';
import { createTemplateFunction } from './createTemplateFunction';
import { ethers } from 'ethers';
const mathjs = create(all, {
	number: 'BigNumber',
	precision: 20,
});

// example use:
// math`0.23900923902348092834092830948 + 0.0000000000000000000005`
const calcFunc = createTemplateFunction((equation) => {
	const result = mathjs.format(mathjs.evaluate(equation), {
		notation: 'fixed',
	});
	return result;
});
const calcBFunc = createTemplateFunction(
	(numStr) =>
		new BigNumber(mathjs.format(mathjs.evaluate(numStr), { notation: 'fixed' }))
);

const calcBNFunc = createTemplateFunction((numStr) =>
	ethers.BigNumber.from(
		mathjs.format(mathjs.evaluate(numStr), { notation: 'fixed' })
	)
);

export const calc = calcFunc as typeof calcFunc & {
	B: typeof calcBFunc;
	BN: typeof calcBNFunc;
	math: typeof mathjs;
};

calc.B = calcBFunc;
calc.BN = calcBNFunc;
calc.math = mathjs;

// console.log(math`200 > 300`);
