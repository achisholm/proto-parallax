export async function get({ params, request
}) {
    return {
        body: JSON.stringify({
            "status": "valid",
            "record": {
                "query": {
                    "valid": true,
                    "message": "",
                    "value": "a"
                }
            },
            "message": {

            },
            "action": {

            },
            "data": {
                "is_exact_match": false,
                "products": [{
                    "product_code": "AA113SS",
                    "product_code_html": "<b>A</b>A113SS",
                    "description": "13 Amp 1 Gang Single DP Switched Socket - White",
                    "product_image_url": "https://www.tlc-direct.co.uk/Images/Products/size_1/AA113SS.JPG",
                    "manufacturer_image_url": "https://www.tlc-direct.co.uk/Images/Products/size_2/KNIGHTSBRIDGE1.JPG"
                }, {
                    "product_code": "AA113USS",
                    "product_code_html": "<b>A</b>A113USS",
                    "description": "13 Amp 1 Gang Single Unswitched Socket - White",
                    "product_image_url": "https://www.tlc-direct.co.uk/Images/Products/size_1/AA113USS.JPG",
                    "manufacturer_image_url": "https://www.tlc-direct.co.uk/Images/Products/size_2/KNIGHTSBRIDGE1.JPG"
                }, {
                    "product_code": "AA116MB",
                    "product_code_html": "<b>A</b>A116MB",
                    "description": "1 Gang 16mm Surface Box - White",
                    "product_image_url": "https://www.tlc-direct.co.uk/Images/Products/size_1/AA116MB.JPG",
                    "manufacturer_image_url": "https://www.tlc-direct.co.uk/Images/Products/size_2/KNIGHTSBRIDGE1.JPG"
                }, {
                    "product_code": "AA11WS",
                    "product_code_html": "<b>A</b>A11WS",
                    "description": "1 Gang 1 Way Light Switch - White",
                    "product_image_url": "https://www.tlc-direct.co.uk/Images/Products/size_1/AA11WS.JPG",
                    "manufacturer_image_url": "https://www.tlc-direct.co.uk/Images/Products/size_2/KNIGHTSBRIDGE1.JPG"
                }, {
                    "product_code": "AA125MB",
                    "product_code_html": "<b>A</b>A125MB",
                    "description": "1 Gang 25mm Surface Box - White",
                    "product_image_url": "https://www.tlc-direct.co.uk/Images/Products/size_1/AA125MB.JPG",
                    "manufacturer_image_url": "https://www.tlc-direct.co.uk/Images/Products/size_2/KNIGHTSBRIDGE1.JPG"
                }]
            }
        }),
    };
}
