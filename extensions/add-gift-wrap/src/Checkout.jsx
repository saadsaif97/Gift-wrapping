import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  Checkbox,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.checkout.cart-line-item.render-after',
  () => <Extension />,
);

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();
  
  function addGiftWrap() {
    console.log("Add gift wrap")
  }

  return (
    <Checkbox onChange={() => addGiftWrap()}>
      Add gift wrap
    </Checkbox>
  );
}