import { TimeoutError } from 'rxjs';

import { waitForAssertion } from './wait-for-assertion';

describe('waitForAssertion', () => {
  let mockWitness: jest.Mock;

  beforeEach(() => {
    mockWitness = jest.fn().mockReturnValue(false);
  });

  describe('Waits both synchronous and asynchronous callbacks', () => {
    let intervalsCount: number;
    let intervalDelay: number;
    let delayBeforeSuccessTrigger: number;
    let timeoutDelay: number;

    beforeEach(() => {
      intervalsCount = 3;
      intervalDelay = 100;
      delayBeforeSuccessTrigger = (intervalsCount + 1) * intervalDelay;
      // safety margin: use more than the expected execution time as timeout delay
      timeoutDelay = 3 * intervalsCount * intervalDelay;
    });

    it('waits for an asynchronous assertion to succeed', async () => {
      setTimeout(() => mockWitness.mockReturnValue(true), delayBeforeSuccessTrigger);

      await waitForAssertion(() => expect(mockWitness()).toBe(true), timeoutDelay, intervalDelay);
      // "success" is triggered after `intervalsCount` + 1 cycles, so expect at least `intervalCount` calls
      expect(mockWitness.mock.calls.length).toBeGreaterThanOrEqual(intervalsCount);
    });

    it('also works with async closures', async () => {
      setTimeout(() => mockWitness.mockResolvedValue(true), delayBeforeSuccessTrigger);

      await waitForAssertion(() => expect(mockWitness()).resolves.toEqual(true), timeoutDelay, intervalDelay);
      expect(mockWitness.mock.calls.length).toBeGreaterThanOrEqual(intervalsCount);
    });
  });

  it('throws a TimeoutError if the assertion did not succeed', async () => {
    const expectedCyclesCount = 4;
    const intervalDelay = 100;
    const timeoutDelay = (expectedCyclesCount + 1) * intervalDelay;

    expect.assertions(expectedCyclesCount + 1);

    try {
      await waitForAssertion(() => expect(mockWitness()).toBe(true), timeoutDelay, intervalDelay);
    } catch (e) {
      expect(e).toBeInstanceOf(TimeoutError);
    }
  });

  it('throws forward instances of TypeError', async () => {
    try {
      await waitForAssertion(() => {
        const failedInjectionService: any = {};
        failedInjectionService.foo();
      });
    } catch (e) {
      expect(e).toBeInstanceOf(TypeError);
    }
  });

  it('throws forward instances of ReferenceError', async () => {
    try {
      await waitForAssertion(() => {
        // @ts-ignore
        b.foo();
      });
    } catch (e) {
      expect(e).toBeInstanceOf(ReferenceError);
    }
  });
});
