export async function post({ params, request }) {
    return {
        body: JSON.stringify({
            "status": "valid",
            "record": {
                "order_number": {
                    "valid": true,
                    "message": "",
                    "value": "12440282"
                },
                "add_product_code": {
                    "valid": true,
                    "message": "",
                    "value": "ap119"
                },
                "add_quantity": {
                    "valid": true,
                    "message": "",
                    "value": "7"
                }
            },
            "message": {},
            "action": {},
            "data": {
                "order_number": 12440282,
                "price_extended": "&pound;1,040.31",
                "vat_extended": "&pound;173.39",
                "subtotal_extended": "&pound;866.92",
                "promo_code": "",
                "basket_total": "&pound;891.18",
                "basket_total_inc_vat": "&pound;1,069.41",
                "include_catalogue": false,
                "discount_description": "October Extra Discount",
                "discount_extended": "&pound;24.26",
                "delivery_price": "FREE",
                "delivery_method": "deliver",
                "preferences": {
                    "include_vat": false
                },
                "products": [
                    {
                        "product_url": "https://www.tlc-direct.co.uk/Products/AP119.html",
                        "image_url": "https://www.tlc-direct.co.uk/Images/Products/size_1/AP119.JPG",
                        "product_code": "AP119",
                        "description": "1 Gang Architrave Flush Box - 30mm Deep",
                        "qty": 7,
                        "line_price": "&pound;5.08",
                        "selling_multiple": 1,
                        "price_description": "&pound;0.73 each"
                    },
                    {
                        "product_url": "https://www.tlc-direct.co.uk/Products/CM2356.html",
                        "image_url": "https://www.tlc-direct.co.uk/Images/Products/size_1/CM2356.JPG",
                        "product_code": "CM2356",
                        "description": "13 Amp 2 Gang Double Switched Socket - White",
                        "qty": 1,
                        "line_price": "&pound;2.10",
                        "selling_multiple": 1,
                        "price_description": "&pound;2.10 each"
                    },
                    {
                        "product_url": "https://www.tlc-direct.co.uk/Products/FXPP.html",
                        "image_url": "https://www.tlc-direct.co.uk/Images/Products/size_1/FXPP.JPG",
                        "product_code": "FXPP",
                        "description": "Wall Pin Plug for Cable Clips (use with 5.5mm Drill Bit)",
                        "qty": 200,
                        "line_price": "&pound;5.00",
                        "selling_multiple": 100,
                        "price_description": "&pound;2.50 per 100"
                    },
                    {
                        "product_url": "https://www.tlc-direct.co.uk/Products/QUD11W.html",
                        "image_url": "https://www.tlc-direct.co.uk/Images/Products/size_1/QUE11W.JPG",
                        "product_code": "QUD11W",
                        "description": "Quinetic 1 Gang Wireless Switch - White",
                        "qty": 10,
                        "line_price": "&pound;145.00",
                        "selling_multiple": 1,
                        "price_description": "&pound;14.50 each"
                    },
                    {
                        "product_url": "https://www.tlc-direct.co.uk/Products/ETSTOCKHOLMART220GAL.html",
                        "image_url": "https://www.tlc-direct.co.uk/Images/Products/size_1/ETSTOCKHOLMART220GAL.JPG",
                        "product_code": "ETSTOCKHOLMART220GAL",
                        "description": "Stockholm Wall Light - Galvanised with Clear Glass",
                        "qty": 1,
                        "line_price": "&pound;149.05",
                        "selling_multiple": 1,
                        "message_id": 1,
                        "price_description": "&pound;149.05 each"
                    },
                    {
                        "product_url": "https://www.tlc-direct.co.uk/Products/TMSMARTPAT.html",
                        "image_url": "https://www.tlc-direct.co.uk/Images/Products/size_1/TMSMARTPAT.JPG",
                        "product_code": "TMSMARTPAT",
                        "description": "PAT Tester c/w Auto Sequences & 230/110V Run Test",
                        "qty": 1,
                        "line_price": "&pound;584.95",
                        "selling_multiple": 1,
                        "price_description": "&pound;584.95 each"
                    }
                ],
                "direct_delivery_charges": [],
                "carriage_options": [
                    {
                        "name": "Carrier Delivery",
                        "value": "DPD,Zone1,NextDay",
                        "selected": true
                    }
                ],
                "messages": [
                    {
                        "message_id": 1,
                        "type": "special_delivery",
                        "title": "Delivery date to be advised for&nbsp;<strong>ETSTOCKHOLMART220GAL</strong>."
                    },
                    {
                        "type": "saving_message",
                        "value": "You save <strong>&pound;616.50 (40%)</strong> on Normal Trade Prices!"
                    },
                    {
                        "type": "collection",
                        "title": "<strong>FREE Click & Collect <span class=\"text-nowrap\">available for all orders.</span></strong>",
                        "value": "Order online and collect at your <span class=\"text-nowrap\">local branch.</span>"
                    },
                    {
                        "type": "free_delivery_qualified",
                        "title": "Your order qualifies for <span class=\"text-nowrap\"><strong>FREE standard UK Delivery</strong></span>",
                        "value": "Standard UK delivery is free for orders over <span class=\"text-nowrap\"><strong>£150 (excluding VAT)</strong>.</span>"
                    }
                ]
            }
        }),
    };
}

