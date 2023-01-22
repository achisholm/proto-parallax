export async function get({ params, request
}) {
    return {
        body: JSON.stringify({
            "status": "invalid",
            "record": {
                "add_product_code": {
                    "valid": false,
                    "message": "",
                    "value": "A"
                }
            },
            "message": {

            },
            "action": {

            },
            "data": ""
        }),
    };
}
