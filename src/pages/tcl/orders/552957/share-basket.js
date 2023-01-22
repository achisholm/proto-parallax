export async function post({ params, request
}) {
  return {
    body: JSON.stringify({
      "status": "valid",
      "record": {
        "order_number": {
          "valid": true,
          "message": "",
          "value": "14289300"
        }
      },
      "message": {

      },
      "action": {

      },
      "data": {
        "url": "https://www.tlc-direct.co.uk/tcl/share-basket/f27c507b9e51f43ca4f04f49e17813093c7a1b3a"
      }
    }),
  };
}



