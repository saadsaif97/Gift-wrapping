import {
  useApi,
  reactExtension,
  Checkbox,
  useCartLineTarget,
  useApplyCartLinesChange,
  useCartLines,
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

  console.log({target})
  
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

  function addGiftWrap() {
    if (productIsWrappedAlready()) {
      console.log("remove gift wrap");
      changeLineItems({
        type: "removeCartLine",
        id: getLineItemIdByVariantId(giftWrapProduct),
        quantity: target.quantity,
      });
    } else {
      console.log("add gift wrap");
      changeLineItems({
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

  function productIsWrappedAlready() {
    return cartLines.some((item) => {
      return item.attributes.some((attr) => {
        return attr.key === "_wrap_for" && attr.value === variantId;
      });
    }) || target.lineComponents.length;
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
