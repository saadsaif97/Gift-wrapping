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
  const [giftWrapProduct, setGiftWrapProduct] = useState(null);
  const [merge] = useAttributeValues(["_merge"]);
  const attributeChange = useApplyAttributeChange();

  console.log({ target, merge });

  useEffect(() => {
    (async () => {
      const giftWrap = await getGiftWrap(productId);
      if (giftWrap) {
        setGiftWrapProduct(giftWrap);
      }
    })();
  }, []);

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
    if (productIsWrappedAlready()) {
      console.log("remove gift wrap", { variantId });
      
      await attributeChange({
        key: "_merge",
        value: removeMerge(variantId),
        type: "updateAttribute",
      });
    } else {
      console.log("add gift wrap");
      await attributeChange({
        key: "_merge",
        value: addMerge(variantId),
        type: "updateAttribute",
      });
      await changeLineItems({
        type: "addCartLine",
        quantity: target.quantity,
        merchandiseId: giftWrapProduct,
        attributes: [
          {
            key: "_wrap_for",
            value: variantId,
          },
        ],
      });
    }
  }

  function addMerge(variantId) {
    if (!merge) {
      return `${variantId}`;
    } else {
      const mergedVariants = merge.split(",");
      mergedVariants.push(`${variantId}`);
      return mergedVariants.join(",");
    }
  }

  function removeMerge(variantId) {
    const mergedVariants = merge.split(",");
    return mergedVariants.filter((id) => id != `${variantId}`).join(",");
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
    return cartLines.find((item) => item.merchandise.id == variantId).id;
  }

  if (giftWrapProduct) {
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
