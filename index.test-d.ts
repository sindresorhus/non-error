import {expectAssignable, expectType} from 'tsd';
import NonError from './index.js';

const error1 = new NonError('test');
expectAssignable<Error>(error1);
expectAssignable<NonError>(error1);
expectType<'NonError'>(error1.name);
expectType<string>(error1.message);
expectType<string>(error1.stack);
expectType<true>(error1.isNonError);
expectType<unknown>(error1.value);

const error2 = new NonError(42);
expectAssignable<NonError>(error2);
expectType<unknown>(error2.value);
expectType<true>(error2.isNonError);

const error3 = new NonError({foo: 'bar'});
expectAssignable<NonError>(error3);
expectType<unknown>(error3.value);

const error4 = new NonError(undefined);
expectAssignable<NonError>(error4);
expectType<unknown>(error4.value);

// With superclass option
const error5 = new NonError('test', {superclass: TypeError});
expectAssignable<Error>(error5);
expectAssignable<NonError>(error5);
expectType<unknown>(error5.value);
expectType<true>(error5.isNonError);

// IsNonError static method.
expectType<(value: unknown) => value is NonError>(NonError.isNonError);
expectType<boolean>(NonError.isNonError(error1));
expectType<boolean>(NonError.isNonError(new Error('test')));
expectType<boolean>(NonError.isNonError('string'));

// Type guard behavior.
const maybeError: unknown = 'test';
if (NonError.isNonError(maybeError)) {
	expectType<NonError>(maybeError);
	expectType<true>(maybeError.isNonError);
	expectType<unknown>(maybeError.value);
}

// Value property maintains type unknown.
const error6 = new NonError(42);
if (typeof error6.value === 'number') {
	expectType<number>(error6.value);
}
