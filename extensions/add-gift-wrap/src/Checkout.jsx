import {
  useApi,
  reactExtension,
  Checkbox,
  useCartLineTarget,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

export default reactExtension(
  "purchase.checkout.cart-line-item.render-after",
  () => <Extension />
);

function Extension() {
  const { query } = useApi();
  const target = useCartLineTarget();
  const productId = target?.merchandise?.product.id;

  const [giftProduct, setGiftProduct] = useState(null);

  useEffect(() => {
    (async () => {
      const giftWrap = await getGiftWrap(productId);
      console.log({ productId, giftWrap });
      if (giftWrap) {
        setGiftProduct(giftWrap);
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
  }

  if (giftProduct) {
    return <Checkbox onChange={() => addGiftWrap()}>Add gift wrap</Checkbox>;
  }

  return null;
}
