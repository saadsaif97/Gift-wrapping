import {
  useApi,
  reactExtension,
  Checkbox,
  useCartLineTarget,
  useApplyCartLinesChange,
  useCartLines,
  useApplyAttributeChange,
  useAttributeValues,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

export default reactExtension(
  "purchase.checkout.cart-line-item.render-after",
  () => <Extension />
);

function Extension() {
  const { query } = useApi();
  const target = useCartLineTarget();
  const cartLines = useCartLines();
  const changeLineItems = useApplyCartLinesChange();
  const productId = target?.merchandise?.product.id;
  const variantId = target.merchandise.id;
  const [wrappingId, setWrappingId] = useState(null);
  const [merge] = useAttributeValues(["_merge"]);
  const attributeChange = useApplyAttributeChange();

  useEffect(() => {
    (async () => {
      const giftWrap = await getGiftWrap(productId);
      if (giftWrap) {
        setWrappingId(giftWrap);
      }
    })();
  }, []);

  useEffect(() => {
    if (wrappingId) {
      removeUnmergedGiftWrap();
    }
  }, [merge, wrappingId]);

  function removeUnmergedGiftWrap() {
    if (!merge) {
      removeGiftWrap(wrappingId);
    } else {
      const mergedVariants = merge?.split(",");
      if (!mergedVariants?.includes(target.merchandise.id)) {
        removeGiftWrap(wrappingId);
      }
    }
  }

  function removeGiftWrap(giftWrap) {
    changeLineItems({
      type: "removeCartLine",
      quantity: target.quantity,
      id: getLineItemIdByVariantId(giftWrap),
    });
  }

  async function getGiftWrap(productId) {
    try {
      const { data } = await query(`
      query product {
        product(id: "${productId}") {
          metafield(namespace: "gift", key: "wrap") {
            value
          }
        }
      }`);

      return data?.product?.metafield?.value;
    } catch (error) {
      console.error(error);
    }
  }

  async function addGiftWrap() {
    try {
      if (productIsWrappedAlready()) {
        await attributeChange({
          key: "_merge",
          value: removeMerge(variantId),
          type: "updateAttribute",
        });
      } else {
        await attributeChange({
          key: "_merge",
          value: addMerge(variantId),
          type: "updateAttribute",
        });
        await changeLineItems({
          type: "addCartLine",
          quantity: target.quantity,
          merchandiseId: wrappingId,
          attributes: [
            {
              key: "_wrap_for",
              value: variantId,
            },
          ],
        });
      }
    } catch (error) {
      console.log({ error });
    }
  }

  function addMerge(variantId) {
    if (!merge) {
      return `${variantId}`;
    } else {
      const mergedVariants = merge?.split(",");
      mergedVariants.push(`${variantId}`);
      return mergedVariants.join(",");
    }
  }

  function removeMerge(variantId) {
    if (merge) {
      const mergedVariants = merge?.split(",");
      return mergedVariants.filter((id) => id != `${variantId}`).join(",");
    } else {
      return "";
    }
  }

  function productIsWrappedAlready() {
    return (
      cartLines.some((item) => {
        return item.attributes.some((attr) => {
          return attr.key === "_wrap_for" && attr.value === variantId;
        });
      }) || target.lineComponents.length
    );
  }

  function getLineItemIdByVariantId(variantId) {
    return cartLines.find((item) => item.merchandise.id == variantId)?.id;
  }

  if (wrappingId) {
    return (
      <Checkbox
        checked={productIsWrappedAlready()}
        onChange={() => addGiftWrap()}
      >
        Gift wrapping
      </Checkbox>
    );
  }

  return null;
}
