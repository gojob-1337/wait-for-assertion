# Wait for Assertion

A wrapper for asynchronous testing assertions.

## Getting started

```bash
yarn add @gojob/wait-for-assertion
# or
npm install @gojob/wait-for-assertion
```

## How

By "asynchronous assertions", we means Assertions that must be executed with a delay. The typical use case that we want to avoid is the following:

```typescript
await myFunctionWithAsyncSideEffects();

await new Promise(resolve => setTimeout(resolve, 1000)); // ❌ 🤢 🤮
expect(mySideEffectExists()).toBe(true);
```

`waitForAssertion` will run the given function (containing assertions) until it stops throwing exceptions (which means that it "passed"), or will throw a Timeout error.

`waitForAssertion` accepts up to three parameters:

```typescript
function waitForAssertion(
  assertion: () => any,
  timeoutDelay: number = 1000,
  intervalDelay: number = 100
);
```

- `assertion`: Closure containing asynchronous assertions to be made.
- `timeoutDelay`: _[1000ms]_ How long should the assertion be repeated until it passes (or times out).
- `intervalDelay`: _[100ms]_ How often should the assertion be repeated during `timeoutDelay`.

## Example

```typescript
import { waitForAssertion } from '@gojob/wait-for-assertion';

// [...]

it('should asynchronously update the value in Elasticsearch', async () => {
  await request(server)
    .put(endpointURL)
    .send(input)
    .expect(HttpStatus.NO_CONTENT);

  // the document is not immediatly available in Elasticsearch: wait
  await waitForAssertion(async () => {
    const { document } = await elasticsearchService.get(UserIndex, userId);
    return expect(document.firstName).toBe(updatedUser.firstName);
  });
});
```

## Credits

Developed by [VinceOPS](https://twitter.com/VinceOPS) at [Gojob](https://twitter.com/GojobT).  
Initial blog story: 🇫🇷 [article](https://vinceops.me/nest-e2e-tests-effets-de-bord/)