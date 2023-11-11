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

  const giftWraps = input.cart.lines.filter(line => line.wrap_for !== null);
  
  giftWraps.forEach((giftWrap) => {
    
    const variantId = giftWrap.wrap_for?.value
    const variantLineId = getLineIDFromVariantId(variantId, input.cart.lines)
    const variantTitle = getTitleFromVariantId(variantId, input.cart.lines)
    
    console.log(JSON.stringify(variantId, variantLineId, variantTitle))
    
    const mergeOperation = {
      merge: {
        parentVariantId: variantId,
        cartLines: [
          {
            cartLineId: variantLineId,
            quantity: giftWrap.quantity,
          },
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

function getLineIDFromVariantId(variantId, lineItems) {
  return lineItems.find(item => item.merchandise.id == variantId).id;
}

function getTitleFromVariantId(variantId, lineItems) {
  return lineItems.find(item => item.merchandise.id == variantId).merchandise.title;
}
