import {
  useApi,
  reactExtension,
  Checkbox,
  useCartLineTarget,
  useApplyCartLinesChange,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

export default reactExtension(
  "purchase.checkout.cart-line-item.render-after",
  () => <Extension />
);

function Extension() {
  const { query } = useApi();
  const target = useCartLineTarget();
  const changeLineItems = useApplyCartLinesChange()
  const productId = target?.merchandise?.product.id;

  const [giftWrapProduct, setGiftWrapProduct] = useState(null);

  useEffect(() => {
    (async () => {
      const giftWrap = await getGiftWrap(productId);
      console.log({ productId, giftWrap });
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
    console.log("Add gift wrap");
    changeLineItems({
      type: "addCartLine",
      quantity: target.quantity,
      merchandiseId: giftWrapProduct
    })
  }

  if (giftWrapProduct) {
    return <Checkbox onChange={() => addGiftWrap()}>Add gift wrap</Checkbox>;
  }

  return null;
}
