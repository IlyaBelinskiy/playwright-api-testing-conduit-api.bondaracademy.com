import { test } from '@playwright/test';

export function step(target: Function, context: ClassMethodDecoratorContext) {
    return function replacementMethod(this: any, ...args: any) {
        const name = this.constructor.name + '.' + (context.name as string);
        return test.step(name, async () => {
            return await target.call(this, ...args);
        }); // , { box: true } --> As we see above, the test may fail with an error pointing inside the step. If you would like the error to highlight the "login" step instead of its internals, use the box option. An error inside a boxed step points to the step call site.
    };
}
