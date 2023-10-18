window.centOrderConfirmationUI = function (lineItems) {
  fetch(
    'https://dgsccvpb2k7qmp46c752pfn6cm0rxyar.lambda-url.us-west-2.on.aws',
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: 'POST',
      body: JSON.stringify({
        lineItems: lineItems,
        shop: { storefrontUrl: window.location.origin }
      })
    },
  ).then(function (response) {
    response.json().then(function (data) {
      window.Shopify.Checkout.OrderStatus.addContentBox(data.results.markup);
    });
  });
}