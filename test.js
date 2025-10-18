import test from 'ava';
import NonError from './index.js';

test('wrapping value: number', t => {
	const error = new NonError(5);
	t.is(error.name, 'NonError');
	t.is(error.message, 'Non-error value: 5');
	t.is(error.value, 5);
	t.is(error.isNonError, true);
	t.regex(error.stack, / at /);
	t.true(error instanceof Error);
	t.true(error instanceof NonError);
});

test('wrapping value: string', t => {
	const error = new NonError('🌈');
	t.is(error.name, 'NonError');
	t.is(error.message, 'Non-error value: 🌈');
	t.is(error.value, '🌈');
	t.is(error.isNonError, true);
	t.regex(error.stack, / at /);
});

test('wrapping value: object', t => {
	const error = new NonError({foo: true});
	t.is(error.name, 'NonError');
	t.is(error.message, 'Non-error value: {"foo":true}');
	t.regex(error.stack, / at /);
});

test('wrapping value: undefined', t => {
	const error = new NonError(undefined);
	t.is(error.name, 'NonError');
	t.is(error.message, 'Non-error value: undefined');
	t.regex(error.stack, / at /);
});

test('wrapping value: null', t => {
	const error = new NonError(null);
	t.is(error.name, 'NonError');
	t.is(error.message, 'Non-error value: null');
	t.regex(error.stack, / at /);
});

test('wrapping value: boolean', t => {
	const error = new NonError(true);
	t.is(error.name, 'NonError');
	t.is(error.message, 'Non-error value: true');
	t.regex(error.stack, / at /);
});

test('wrapping value: symbol', t => {
	const symbol = Symbol('test');
	const error = new NonError(symbol);
	t.is(error.name, 'NonError');
	t.true(error.message.includes('Non-error value: Symbol'));
	t.regex(error.stack, / at /);
});

test('wrapping value: named function', t => {
	function namedFunction() {}

	const error = new NonError(namedFunction);
	t.is(error.name, 'NonError');
	t.is(error.message, 'Non-error value: [Function namedFunction]');
	t.regex(error.stack, / at /);
});

test('wrapping value: anonymous function', t => {
	const error = new NonError(() => {});
	t.is(error.name, 'NonError');
	t.is(error.message, 'Non-error value: [Function (anonymous)]');
	t.regex(error.stack, / at /);
});

test('wrapping value: bigint', t => {
	const error = new NonError(123n);
	t.is(error.name, 'NonError');
	t.is(error.message, 'Non-error value: 123n');
	t.regex(error.stack, / at /);
});

test('wrapping value: array', t => {
	const error = new NonError([1, 2, 3]);
	t.is(error.name, 'NonError');
	t.is(error.message, 'Non-error value: [1,2,3]');
	t.regex(error.stack, / at /);
});

test('wrapping value: empty string', t => {
	const error = new NonError('');
	t.is(error.name, 'NonError');
	t.is(error.message, 'Non-error value: ');
	t.is(error.value, '');
	t.regex(error.stack, / at /);
});

test('wrapping value: unserializable', t => {
	const circular = {};
	circular.self = circular;
	const error = new NonError(circular);
	t.is(error.name, 'NonError');
	t.true(error.message.includes('Non-error value: [object Object]'));
	t.regex(error.stack, / at /);
});

test('isNonError - positive', t => {
	const error = new NonError('test');
	t.true(NonError.isNonError(error));
});

test('isNonError - negative with Error', t => {
	const error = new Error('test');
	t.false(NonError.isNonError(error));
});

test('isNonError - negative with TypeError', t => {
	const error = new TypeError('test');
	t.false(NonError.isNonError(error));
});

test('isNonError - negative with string', t => {
	t.false(NonError.isNonError('test'));
});

test('isNonError - negative with number', t => {
	t.false(NonError.isNonError(42));
});

test('isNonError - negative with object', t => {
	t.false(NonError.isNonError({name: 'NonError'}));
});

test('isNonError - negative with null', t => {
	t.false(NonError.isNonError(null));
});

test('isNonError - negative with undefined', t => {
	t.false(NonError.isNonError(undefined));
});

test('static isNonError method works correctly', t => {
	const error = new NonError('test');
	t.true(NonError.isNonError(error));

	const regularError = new Error('test');
	t.false(NonError.isNonError(regularError));

	const errorWithSuperclass = new NonError('test', {superclass: TypeError});
	t.true(NonError.isNonError(errorWithSuperclass));
});

test('superclass option with TypeError', t => {
	class CustomError extends TypeError {
		constructor(message) {
			super(message);
			this.name = 'CustomError';
		}
	}

	const error = new NonError('test', {superclass: CustomError});
	t.is(error.name, 'NonError');
	t.is(error.message, 'Non-error value: test');
	t.true(error instanceof Error);
	t.true(error instanceof TypeError);
	t.true(error instanceof CustomError);
	// With Symbol.hasInstance, instanceof NonError works even with superclass!
	t.true(error instanceof NonError);
	t.is(error.isNonError, true);
	t.true(NonError.isNonError(error));
	t.regex(error.stack, / at /);
});

test('superclass option with RangeError', t => {
	const error = new NonError(100, {superclass: RangeError});
	t.is(error.name, 'NonError');
	t.is(error.message, 'Non-error value: 100');
	t.true(error instanceof Error);
	t.true(error instanceof RangeError);
	// With Symbol.hasInstance, instanceof NonError works!
	t.true(error instanceof NonError);
	t.is(error.isNonError, true);
	t.regex(error.stack, / at /);
});

test('default superclass is Error', t => {
	const error = new NonError('test');
	t.true(error instanceof Error);
	t.true(error instanceof NonError);
	t.false(error instanceof TypeError);
	t.false(error instanceof RangeError);
});

test('passing an Error instance throws TypeError', t => {
	const originalError = new Error('original');
	t.throws(() => new NonError(originalError), {
		instanceOf: TypeError,
		message: 'Do not pass Error instances to NonError. Throw the error directly instead.',
	});
});

test('custom properties are preserved', t => {
	const error = new NonError('test');
	error.code = 'ERR_CUSTOM';
	error.statusCode = 404;
	t.is(error.code, 'ERR_CUSTOM');
	t.is(error.statusCode, 404);
});

test('can be subclassed', t => {
	class CustomNonError extends NonError {
		constructor(message) {
			super(message);
			this.custom = true;
		}
	}

	const error = new CustomNonError('test');
	t.is(error.name, 'NonError');
	t.is(error.message, 'Non-error value: test');
	t.true(error.custom);
	t.true(error instanceof CustomNonError);
	t.true(error instanceof NonError);
	t.true(error instanceof Error);
});

test('isNonError works with subclasses', t => {
	class CustomNonError extends NonError {}
	const error = new CustomNonError('test');
	t.true(NonError.isNonError(error));
	t.true(CustomNonError.isNonError(error));
});

test('isNonError instance property is true', t => {
	const error = new NonError('test');
	t.is(error.isNonError, true);
	t.true(error.isNonError);
});

test('isNonError instance property on regular Error is undefined', t => {
	const error = new Error('test');
	t.is(error.isNonError, undefined);
});

test('isNonError instance property on subclass', t => {
	class CustomNonError extends NonError {}
	const error = new CustomNonError('test');
	t.is(error.isNonError, true);
});

test('value property stores original value - string', t => {
	const originalValue = 'hello world';
	const error = new NonError(originalValue);
	t.is(error.value, originalValue);
});

test('value property stores original value - number', t => {
	const originalValue = 42;
	const error = new NonError(originalValue);
	t.is(error.value, originalValue);
});

test('value property stores original value - object', t => {
	const originalValue = {foo: 'bar', baz: 123};
	const error = new NonError(originalValue);
	t.deepEqual(error.value, originalValue);
	t.is(error.value, originalValue); // Same reference
});

test('value property stores original value - undefined', t => {
	const error = new NonError(undefined);
	t.is(error.value, undefined);
});

test('value property stores original value - null', t => {
	const error = new NonError(null);
	t.is(error.value, null);
});

test('value property stores original value - function', t => {
	const originalValue = () => 'test';
	const error = new NonError(originalValue);
	t.is(error.value, originalValue);
});

test('value property with superclass option', t => {
	const originalValue = 'test value';
	const error = new NonError(originalValue, {superclass: TypeError});
	t.is(error.value, originalValue);
});

test('name property is read-only', t => {
	const error = new NonError('test');
	t.is(error.name, 'NonError');
	t.throws(() => {
		error.name = 'ChangedName';
	}, {
		instanceOf: TypeError,
	});
	t.is(error.name, 'NonError');
});

test('isNonError property is read-only', t => {
	const error = new NonError('test');
	t.is(error.isNonError, true);
	t.throws(() => {
		error.isNonError = false;
	}, {
		instanceOf: TypeError,
	});
	t.is(error.isNonError, true);
});

test('value property is read-only', t => {
	const error = new NonError('original');
	t.is(error.value, 'original');
	t.throws(() => {
		error.value = 'changed';
	}, {
		instanceOf: TypeError,
	});
	t.is(error.value, 'original');
});

test('isNonError property cannot be deleted', t => {
	const error = new NonError('test');
	t.is(error.isNonError, true);
	t.throws(() => {
		delete error.isNonError;
	}, {
		instanceOf: TypeError,
	});
	t.is(error.isNonError, true);
});

test('value property cannot be deleted', t => {
	const error = new NonError('test');
	t.is(error.value, 'test');
	t.throws(() => {
		delete error.value;
	}, {
		instanceOf: TypeError,
	});
	t.is(error.value, 'test');
});

test('name property cannot be deleted', t => {
	const error = new NonError('test');
	t.is(error.name, 'NonError');
	t.throws(() => {
		delete error.name;
	}, {
		instanceOf: TypeError,
	});
	t.is(error.name, 'NonError');
});

test('instanceof works via Symbol.hasInstance', t => {
	const error = new NonError('test');
	t.true(error instanceof NonError);

	// Even with superclass, instanceof NonError works
	const errorWithSuperclass = new NonError('test', {superclass: TypeError});
	t.true(errorWithSuperclass instanceof NonError);
	t.true(errorWithSuperclass instanceof TypeError);

	// Regular errors are not NonError
	const regularError = new Error('test');
	t.false(regularError instanceof NonError);

	// Objects with isNonError property but not actually NonError won't work
	const fakeError = {isNonError: false};
	t.false(fakeError instanceof NonError);
});

test('isNonError - negative with fake object having isNonError: true', t => {
	const fakeError = {isNonError: true};
	t.false(NonError.isNonError(fakeError));
	t.false(fakeError instanceof NonError);
});

test('try() - sync function returning a value', t => {
	const result = NonError.try(() => 42);
	t.is(result, 42);
});

test('try() - sync function throwing a non-error string', t => {
	const error = t.throws(() => {
		NonError.try(() => {
			throw 'string error'; // eslint-disable-line no-throw-literal
		});
	});
	t.true(error instanceof NonError);
	t.is(error.message, 'Non-error value: string error');
	t.is(error.value, 'string error');
});

test('try() - sync function throwing a non-error number', t => {
	const error = t.throws(() => {
		NonError.try(() => {
			throw 404; // eslint-disable-line no-throw-literal
		});
	});
	t.true(error instanceof NonError);
	t.is(error.message, 'Non-error value: 404');
	t.is(error.value, 404);
});

test('try() - sync function throwing a non-error object', t => {
	const thrownObject = {code: 'ERR_TEST'};
	const error = t.throws(() => {
		NonError.try(() => {
			throw thrownObject;
		});
	});
	t.true(error instanceof NonError);
	t.true(error.message.includes('Non-error value:'));
	t.is(error.value, thrownObject);
});

test('try() - sync function throwing an Error passes through', t => {
	const originalError = new Error('real error');
	const error = t.throws(() => {
		NonError.try(() => {
			throw originalError;
		});
	});
	t.is(error, originalError);
	t.false(error instanceof NonError);
	t.true(error instanceof Error);
});

test('try() - sync function throwing a TypeError passes through', t => {
	const originalError = new TypeError('type error');
	const error = t.throws(() => {
		NonError.try(() => {
			throw originalError;
		});
	});
	t.is(error, originalError);
	t.false(error instanceof NonError);
	t.true(error instanceof TypeError);
});

test('try() - async function resolving to a value', async t => {
	const result = await NonError.try(async () => 42);
	t.is(result, 42);
});

test('try() - async function rejecting with a non-error string', async t => {
	const error = await t.throwsAsync(async () => {
		await NonError.try(async () => {
			throw 'async string error'; // eslint-disable-line no-throw-literal
		});
	});
	t.true(error instanceof NonError);
	t.is(error.message, 'Non-error value: async string error');
	t.is(error.value, 'async string error');
});

test('try() - async function rejecting with a non-error number', async t => {
	const error = await t.throwsAsync(async () => {
		await NonError.try(async () => {
			throw 500; // eslint-disable-line no-throw-literal
		});
	});
	t.true(error instanceof NonError);
	t.is(error.message, 'Non-error value: 500');
	t.is(error.value, 500);
});

test('try() - async function rejecting with a non-error object', async t => {
	const thrownObject = {status: 'error'};
	const error = await t.throwsAsync(async () => {
		await NonError.try(async () => {
			throw thrownObject;
		});
	});
	t.true(error instanceof NonError);
	t.true(error.message.includes('Non-error value:'));
	t.is(error.value, thrownObject);
});

test('try() - async function rejecting with an Error passes through', async t => {
	const originalError = new Error('async real error');
	const error = await t.throwsAsync(async () => {
		await NonError.try(async () => {
			throw originalError;
		});
	});
	t.is(error, originalError);
	t.false(error instanceof NonError);
	t.true(error instanceof Error);
});

test('try() - async function rejecting with a RangeError passes through', async t => {
	const originalError = new RangeError('range error');
	const error = await t.throwsAsync(async () => {
		await NonError.try(async () => {
			throw originalError;
		});
	});
	t.is(error, originalError);
	t.false(error instanceof NonError);
	t.true(error instanceof RangeError);
});

test('try() - Promise.reject with non-error', async t => {
	const error = await t.throwsAsync(async () => {
		// eslint-disable-next-line prefer-promise-reject-errors
		await NonError.try(() => Promise.reject('rejected'));
	});
	t.true(error instanceof NonError);
	t.is(error.message, 'Non-error value: rejected');
	t.is(error.value, 'rejected');
});

test('try() - Promise.reject with Error passes through', async t => {
	const originalError = new Error('rejected error');
	const error = await t.throwsAsync(async () => {
		await NonError.try(() => Promise.reject(originalError));
	});
	t.is(error, originalError);
	t.false(error instanceof NonError);
});

test('try() - verifies async function returns a Promise', t => {
	const result = NonError.try(async () => 42);
	t.true(result instanceof Promise);
	t.true(typeof result.then === 'function');
});

test('try() - verifies sync function does not return a Promise', t => {
	const result = NonError.try(() => 42);
	t.false(result instanceof Promise);
	t.is(result, 42);
});

test('try() - sync function returning a thenable gets wrapped in Promise', async t => {
	const thenable = {
		// eslint-disable-next-line unicorn/no-thenable
		then(resolve) {
			resolve(42);
		},
	};
	const result = NonError.try(() => thenable);
	t.true(typeof result.then === 'function');
	const value = await result;
	t.is(value, 42);
});

test('try() - sync function returning thenable that rejects with non-error', async t => {
	const thenable = {
		// eslint-disable-next-line unicorn/no-thenable
		then(resolve, reject) {
			reject('string error');
		},
	};
	const error = await t.throwsAsync(async () => {
		await NonError.try(() => thenable);
	});
	t.true(error instanceof NonError);
	t.is(error.value, 'string error');
});

test('try() - sync function returning thenable that rejects with Error', async t => {
	const originalError = new Error('thenable error');
	const thenable = {
		// eslint-disable-next-line unicorn/no-thenable
		then(resolve, reject) {
			reject(originalError);
		},
	};
	const error = await t.throwsAsync(async () => {
		await NonError.try(() => thenable);
	});
	t.is(error, originalError);
	t.false(error instanceof NonError);
});

test('try() - sync function returning null', t => {
	const result = NonError.try(() => null);
	t.is(result, null);
});

test('try() - sync function returning undefined', t => {
	const result = NonError.try(() => undefined);
	t.is(result, undefined);
});

test('try() - sync function returning false', t => {
	const result = NonError.try(() => false);
	t.is(result, false);
});

test('wrapping value: NonError instance returns same instance', t => {
	const innerError = new NonError('inner');
	const outerError = new NonError(innerError);
	t.is(outerError, innerError);
});

test('wrap() - returns a function', t => {
	const wrapped = NonError.wrap(() => 42);
	t.is(typeof wrapped, 'function');
});

test('wrap() - wrapped function executes and returns value', t => {
	const wrapped = NonError.wrap(() => 42);
	const result = wrapped();
	t.is(result, 42);
});

test('wrap() - wrapped function passes arguments through', t => {
	const wrapped = NonError.wrap((a, b, c) => a + b + c);
	const result = wrapped(1, 2, 3);
	t.is(result, 6);
});

test('wrap() - wrapped sync function throwing non-error string', t => {
	const wrapped = NonError.wrap(() => {
		throw 'wrapped error'; // eslint-disable-line no-throw-literal
	});
	const error = t.throws(() => wrapped());
	t.true(error instanceof NonError);
	t.is(error.value, 'wrapped error');
});

test('wrap() - wrapped sync function throwing Error passes through', t => {
	const originalError = new TypeError('type error');
	const wrapped = NonError.wrap(() => {
		throw originalError;
	});
	const error = t.throws(() => wrapped());
	t.is(error, originalError);
	t.false(error instanceof NonError);
});

test('wrap() - wrapped async function returns Promise', t => {
	const wrapped = NonError.wrap(async () => 42);
	const result = wrapped();
	t.true(result instanceof Promise);
});

test('wrap() - wrapped async function resolves to value', async t => {
	const wrapped = NonError.wrap(async () => 42);
	const result = await wrapped();
	t.is(result, 42);
});

test('wrap() - wrapped async function rejecting with non-error', async t => {
	const wrapped = NonError.wrap(async () => {
		throw 404; // eslint-disable-line no-throw-literal
	});
	const error = await t.throwsAsync(async () => wrapped());
	t.true(error instanceof NonError);
	t.is(error.value, 404);
});

test('wrap() - wrapped async function rejecting with Error passes through', async t => {
	const originalError = new Error('async error');
	const wrapped = NonError.wrap(async () => {
		throw originalError;
	});
	const error = await t.throwsAsync(async () => wrapped());
	t.is(error, originalError);
	t.false(error instanceof NonError);
});

test('wrap() - wrapped function with multiple arguments', t => {
	const wrapped = NonError.wrap((name, age) => `${name} is ${age}`);
	const result = wrapped('Alice', 30);
	t.is(result, 'Alice is 30');
});

test('wrap() - wrapped function can be called multiple times', t => {
	const wrapped = NonError.wrap(x => x * 2);
	t.is(wrapped(5), 10);
	t.is(wrapped(10), 20);
	t.is(wrapped(3), 6);
});
