// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const operations = [];

  const giftWraps = input.cart.lines.filter(
    (line) => line.wrap_for?.value !== null
  );
  giftWraps.forEach((giftWrap) => {
    const mergeOperation = {
      merge: {
        parentVariantId: giftWrap.wrap_for?.value,
        cartLines: [
          {
            cartLineId: giftWrap.id,
            quantity: giftWrap.quantity,
          },
        ],
      },
    };

    operations.push(mergeOperation);
  });

  if (operations.length) {
    return { operations };
  }

  return NO_CHANGES;
}
