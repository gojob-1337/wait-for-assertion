import { from, interval, throwError } from 'rxjs';
import { catchError, first, switchMap, timeout } from 'rxjs/operators';

/**
 * Wait for any assertion or group of assertions to succeed, or timeout.
 *
 * Run (through a promise) the given function `assertion` every `intervalDelay` milliseconds
 * until it stops throwing or until `timeoutDelay` is passed (timeout).
 *
 * @param assertion Closure containing all assertions to be made (calls of `expect()`).
 * @param timeoutDelay How long should the assertion be repeated until it passes (or times out).
 * @param intervalDelay How often should the assertion be repeated during `timeoutDelay`.
 *
 * @return Resolve on success, or reject with a `TimeoutError`.
 *
 * @example
 * // in a test, where we need to ensure a value is asynchronously updated in elasticsearch
 * await waitForAssertion(async () => {
 *   const { document } = await elasticsearchService.get(UserIndex, userId);
 *   return expect(document.firstName).toBe(updatedUser.firstName);
 * });
 */
export function waitForAssertion(assertion: () => any, timeoutDelay: number = 1000, intervalDelay: number = 100) {
  return interval(intervalDelay)
    .pipe(
      switchMap(() => from(Promise.resolve(assertion()))),
      catchError((err, o) => (err instanceof ReferenceError || err instanceof TypeError ? throwError(err) : o)),
      first(),
      timeout(timeoutDelay),
    )
    .toPromise();
}
