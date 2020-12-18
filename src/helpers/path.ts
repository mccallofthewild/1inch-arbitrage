import { createTemplateFunction } from './createTemplateFunction';
import fsPath from 'path';
export const path = createTemplateFunction((str) =>
	fsPath.join(__dirname, str)
);
