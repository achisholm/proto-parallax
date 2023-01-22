export async function get({params, request
}) {
  return {
      body: JSON.stringify({
          "productCount": 0,
          "total": "&pound;&nbsp;0.00",
          "signedIn": false,
          "customerName": "",
          "oneClickCheckout": false,
          "orders": {
              "inProgress": 0,
              "open": 0
          }
      }),
    };
}