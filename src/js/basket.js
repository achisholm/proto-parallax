/*
  # Basket Page JS

  Takes JSON order data from the server and updates the page with the new data
*/

(function(){
    function setUpValidation(element, method, submit) {
        // Set up validation plugin on form.
        $(element).validation({
            method: method,
            submit: submit,
            qtip: {
                position: {
                    my: 'bottom center',
                    at: 'top center',
                    viewport: $(window),
                    effect: false
                },
                style: {
                    tip: {
                        corner: true
                    }
                }
            },
            messages: {
                alert: {
                    before: ".js-validation-message-marker"
                },
                error: {
                    before: ".js-validation-message-marker"
                },
                notify: {
                    before: ".js-validation-message-marker"
                }
            }
        });
    }

    function product_code2web_code(product_code) {
        // Convert product code to web code.
        return product_code
            .replace(/DOT/g,  '_DOT_')
            .replace(/SLASH/g,'_SLASH_')
            .replace(/DASH/g, '_DASH_')
            .replace(/PLUS/g, '_PLUS_')
            .replace(/\./g,'dot')
            .replace(/\//g,'slash')
            .replace(/\-/g,'dash')
            .replace(/\+/g,'plus');
    }

    // ============================================================
    // order_json2html -
    // Update the page with json response object from the server.

    // Use "templated" to record all js-generated DOM elements,
    // so they can be removed next time the page is updated.
    var templated = $([]);
    function order_json2html(data) {
        templated
            .find('.js__qty_update, .js__remove_product')
            .validation('destroy');
        templated.remove();
        templated = $([]);

        // Include-VAT preference.
        if (data.preferences.include_vat) {
            $('.js__include_vat').html("(<span class='vat-preference-text__value'>inc VAT</span>)");
        } else {
            $('.js__include_vat').html("(<span class='vat-preference-text__value'>ex VAT</span>)");
            $('.js__vat').each(function (i, template) {
                templated = templated.add(
                    $(template).clone().removeClass('template').insertAfter(template)
                );
            });
        }

        // ======================================================================
        // Basket Product rows
        // ======================================================================
        if ( data.products && data.products.length > 0 ) {
            $('.js__products_wrapper').removeClass('is-empty');
            $('.js__product').each(function(i,template) {
                template = $(template);
                var insertAfter = template;
                $.each(data.products || [], function(index, product) {
                    var clone = template.clone().removeClass('template');
                    var webcode = product_code2web_code(product.product_code);

                    // Straight variable-to-node-text substitution.
                    $.each([
                        'product_code',
                        'description',
                        'price_description',
                        'line_price'
                    ], function(j,varname) {
                        clone
                            .find('.js__'+varname)
                            .html(product[varname]);
                    });

                    // Product link href.
                    clone
                        .find('.js__product_link')
                        .attr('href',product.product_url);

                    // Image src and alt.
                    clone
                        .find('.js__product_image')
                        .attr('src',product.image_url)
                        .attr('alt',product.product_code);

                    // Product qty input and labels.
                    // Substitute webcode into name and id (eg. quantity_x -> quantity_ap119)
                    var qty = clone.find('.js__qty');
                    qty
                        .val(product.qty)
                        .attr('name',qty.attr('name') + '_' + webcode)
                        .attr('id',qty.attr('id') + '_' + webcode)
                        .attr('data-previous-value', product.qty)
                        .attr('data-selling_multiple', product.selling_multiple)
                        .prop('disabled', false);
                    var label = clone.find('.js__label');
                    label
                        .attr('for',label.attr('for') + '_' + webcode);

                    var removeButton = clone.find('.js__remove_product')
                    removeButton
                        .attr('name', removeButton.attr('name') + '_' + webcode)

                    // Product class where a special delivery message applies (to add asterisk).
                    if ( typeof product.message_id !== "undefined" ) {
                        clone
                            .find('.js__special-delivery-label')
                            .addClass('special-delivery-label')
                            .addClass('special-delivery-label--' + product.message_id);
                    }

                    // Insert new product element.
                    templated = templated.add(
                        clone.insertAfter(insertAfter)
                    );
                    insertAfter = clone;
                });
            });
        } else {
            $('.js__products_wrapper').addClass('is-empty');
            $('.js__order_empty').each(function(i,template){
                templated = templated.add(
                    $(template).clone().removeClass('template').insertAfter(template)
                );
            });
        }
        // ======================================================================
        // Catalogue checkbox.
        // ======================================================================

        $('.js-catalogue-checkbox').prop("checked", data.include_catalogue);

        // ======================================================================
        // Alert Messages.
        // ======================================================================
        $.each(data.messages || [],function(i,message_data) {
            switch (message_data.type) {
            case 'free_delivery':
            case 'free_delivery_qualified':
            case 'collection':
            case 'collection_in_stock':
            case 'special_delivery':

                var message = $('<div class="basket-alert">');

                if ( message_data.type === 'free_delivery' ) {
                    message.addClass('basket-alert--delivery');
                } else if ( message_data.type === 'free_delivery_qualified' ) {
                    message.addClass('basket-alert--positive basket-alert--delivery');
                } else if ( message_data.type === 'special_delivery') {
                    message.addClass('basket-alert--negative basket-alert--full-width');
                } else if ( message_data.type === 'collection' ) {
                    message.addClass('basket-alert--positive basket-alert--collection');
                } else if ( message_data.type === 'collection_in_stock' ) {
                    message.addClass('basket-alert--positive basket-alert--collection-in-stock');
                }

                if ( typeof message_data.message_id !== "undefined" ) {
                    message.addClass(
                        'basket-alert--' + message_data.message_id
                    );
                }

                var messageText = $('<div class="basket-alert__text">');

                messageText.append(
                    $('<h1 class="basket-alert__title">')
                        .html(message_data.title));
                if ( typeof message_data.value !== "undefined" ) {
                    messageText.append(
                        $('<p class="basket-alert__description">')
                            .html(message_data.value));
                }

                if ( message_data.type !== 'special_delivery' ) {
                    message.append( $('<span class="basket-alert__icon">') );
                }

                message.append( messageText );

                templated = templated.add(
                    message.appendTo('.js-messages')
                );
                break;

            case 'free_delivery_message':

                var message = $('<div class="free-delivery-message">');
                message.append( $('<span class="free-delivery-message__icon icon icon--export">') );
                message.append( message_data.value );

                templated = templated.add(
                    message.appendTo('.js-free-delivery-message')
                );
                break;
            case 'promo_code_valid':
            case 'promo_code_invalid':
                if ( message_data.type === 'promo_code_valid' ) {
                    var message_class = 'notify';
                } else {
                    var message_class = 'alert';
                }

                var message = $('<div class="message-area promo-code-alert js__promo_code_alert">')
                    .addClass(message_class)
                    .append(
                        $('<div class="message-content">')
                            .append(
                                $('<p class="message-area__text">')
                                    .append(message_data.value)
                            )
                    );

                templated = templated.add(
                    message.insertBefore($('.basket').eq(0))
                );
                break;
            }
        });

        // ======================================================================
        // Carriage options (select/options dropdown).
        // ======================================================================
        var $carriageOptionsHTML = {};
        // If zero carriage options, don't show a row for carriage options (do nothing).

        if (data.carriage_options.length === 1) {
            // Single carriage option, show a non-editable standard text row.
            $carriageOptionsHTML = $(".js-carriage-options-single")
                .clone()
                .removeClass("template");
            $carriageOptionsHTML
                .find(".js-carriage-options")
                .prop("disabled", false)
                .val(data.carriage_options[0].value)
            $carriageOptionsHTML
                .find(".js-carriage-options-name")
                .text(data.carriage_options[0].name);
            templated = templated.add(
                $carriageOptionsHTML.insertAfter(".template.js-carriage-options-single")
            );
        } else if (data.carriage_options.length > 1) {
            // Multiple carriage options – show a row with a select dropdown & 
            // populate it's options.
            $carriageOptionsHTML = $(".js-carriage-options-multiple")
                .clone()
                .removeClass("template");
           
            // Add options to dropdown.
            var $dropdown = $carriageOptionsHTML.find(".js-carriage-options");
            // Remove disabled property.
            $dropdown.prop('disabled', false);
            $.each(data.carriage_options, function (index, element) {
                var $option = $('<option>')
                    .html(element.name)
                    .val(element.value);
                if (element.selected === true) {
                    $option.attr('selected', true);
                }
                $dropdown.add($option);
                $option.appendTo($dropdown);
            });
            
            templated = templated.add(
                $carriageOptionsHTML.insertAfter(".template.js-carriage-options-multiple")
            );
        }

        // ======================================================================
        // Delivery charge rows.
        // ======================================================================
        $('.js__direct_delivery_charges').each(function(i, template) {
            template = $(template);
            var insertAfter = template;
            $.each(data.direct_delivery_charges || [], function(i, charge) {
                var clone = template.clone().removeClass('template');
                $.each([
                    'description',
                    'amount'
                ], function(j, varname) {
                    clone
                        .find('.js__charge_'+varname)
                        .html(charge[varname]);
                });
                if ( typeof charge.message_id !== "undefined" ) {
                    clone
                        .find('.js__charge_description')
                        .addClass('special-delivery-label')
                        .addClass('special-delivery-label--' + charge.message_id);
                }
                templated = templated.add(
                    clone.insertAfter(insertAfter)
                );
                insertAfter = clone;
            });
        });

        // ======================================================================
        // Discount rows.
        // ======================================================================
        if ( typeof data.discount_description !== "undefined"
             && typeof data.discount_extended !== "undefined"
             && parseInt(
                 ("" + data.discount_extended).replace(/^[\s£0]/, '')
             ) !== 0
           ) {
            $('.js__discount').each(function(i, template) {
                templated = templated.add(
                    $(template).clone().removeClass('template').insertAfter(template)
                );
            });
        }


        // ======================================================================
        // Additional simple variable substitutions.
        // ======================================================================
        if (data.preferences.include_vat) {
            // Show basket total including VAT.
            $('.js__basket_total').html(data.basket_total_inc_vat);
        } else {
            // Show basket total excluding VAT.
            $('.js__basket_total').html(data.basket_total);
        }

        $.each([
            'basket_total_inc_vat',
            'discount_description',
            'discount_extended',
            'delivery_price',
            'vat_extended',
            'price_extended',
        ], function(i, varname) {
            $('.js__'+varname)
                .html(data[varname]);
        });
        
        // Update promo code form.
        if ( data.promo_code ) {
            $('#promo_code').val(data.promo_code).trigger("change");
            if ( data.promo_code !== '' ) {
                $('.js__promo-code-form').removeClass('is-hidden');
            }
        }

        // Update basket info.
        $('body').trigger('basket-update');
    }
    
    // pluginsReady event handler.
    $('body').on('pluginsReady', function() {
        // Enable proceed-to-checkout buttons that have been temporarily 
        // disabled until the pluginsReady event is fired.
        $('.js-checkout-button')
            .prop('disabled', false)
            .removeClass('button--disabled');
        
        $(".js-share-basket-button").prop('disabled', false);
    });
    
    // Submit handler for checkout buttons, basket form, carriage options 
    // form & promo code form.
    var $checkoutForms = $('.js__checkout')
        .add('.js__products')
        .add('.js-form-quick-entry')
        .add('.js-form-catalogue-preference')
        .add('.js-form-carriage-options')
        .add('.js__promo-code-form');

    $checkoutForms.on('submit', function() {
        var $form = $(this);

        // Hide validation messages when forms are submitted.
        $checkoutForms.validation('hideMessage', 'error');

        // For all forms, apart from the checkout buttons.
        if ( ! $form.is('.js__checkout') ) {
            // Abort current validation request.
            if ( $form.validation('state') === 'validating' ) {
                $form.validation('abort');
            }

            // Replace order totals with spinners.
            $('.js__charge_amount')
            .add('.js__discount_extended')
            .add('.js__delivery_price')
            .add('.js__vat_extended')
            .add('.js__price_extended')
            .html('<div class="ajax-spinner"></div>');
        }
    });
    
    // Set up validation plugin on forms.
    $checkoutForms.each(function (i, element) {
        var $form = $(element);

        if ($form.is(".js-form-quick-entry")) {
            // Set up validation plugin on Quick Entry form.
            setUpValidation($form, "POST", false);
        }
        else if ($form.is(".js-form-express-checkout")) {
            // Set up validation plugin on Express Checkout button.
            setUpValidation($form, "PUT", false);
        }
        else if ($form.is(".js__checkout")) {
            // Set up validation plugin on Checkout buttons.
            setUpValidation($form, "POST", true);
        }
        else {
            // Set up validation plugin on all the other forms:
            // ('.js__products', '.js-form-catalogue-preference', 
            // '.js-form-carriage-options' & '.js__promo-code-form').
            setUpValidation($form, "PUT", false);
        }
    });

    // Load initial page data.
    // Use a dummy form to make use of validation plugin for AJAX.
    var $dummyForm = $('<form>')
    .addClass('js__dummy_form')
    .attr('method', 'GET')
    .attr('action', "/tcl/orders/" + encodeURIComponent($(".js__products").data("order-number")) + '/json')
    .on('validationComplete', function(event) {
        if ( event.response.status === "valid" ) {
            $(".js__products_wrapper").removeClass("is-loading");
            $(".js__products_wrapper .order-loading").remove();
            
            $('.js__loading').remove();
            $('.js__loaded').each(function(i,template){
                $(template).clone().removeClass('template').insertAfter(template);
            });
            order_json2html(event.response.data);
        }
    });
    setUpValidation($dummyForm.get(0), "GET", false);
    $dummyForm.submit();

    // Change/keyup handler for quantity spinners.
    $('.js__products').on('change keyup', '.js__qty', function(event) {
        // Submit form after 650ms idle since last user interaction.
        var $form = $(event.delegateTarget);
        var $input = $(this);

        // If input value has not changed, do nothing.
        if ( $input.val() == $input.data('previous-value') ) {
            return;
        } else {
            $input.attr('data-previous-value', $input.val());
        }

        // Cancel scheduled form submission.
        var timeout = $form.data('keyup-submit-timeout');
        window.clearTimeout(timeout);

        // Abort any in-progress validation requests.
        if ( $form.validation('state') === 'validating' ) {
            $form.validation('abort');
        }

        // Apply CSS classes for updating state.
        $input
            .closest('.js__product')
            .removeClass('is-invalid is-removing is-removed')
            .addClass('is-updating')
            .find('.field')
            .removeClass('field--error');

        // Schedule form to be submitted in 650ms.
        timeout = window.setTimeout(function() {
            $form.submit();
        }, 650);
        $form.data('keyup-submit-timeout', timeout);
    });

    // Click handler for remove product buttons.
    $('.js__products').on('click', '.js__remove_product', function(event) {
        var $form = $(event.delegateTarget);

        // Cancel scheduled form submission.
        var timeout = $form.data('keyup-submit-timeout');
        window.clearTimeout(timeout);

        // Abort any in-progress validation requests.
        if ( $form.validation('state') === 'validating' ) {
            $form.validation('abort');
        }

        var $button = $(this);
        var name = $(this).attr('name');
        var value = $(this).attr('value');

        // Add hidden input elements with the button's name and value because jQuery form.serialize() function does not
        // include submit button data since it has no way of knowing which button was used to submit the form.
        if ( $('input[type="hidden"][name="' + name + '"]', $form).length === 0) {
            $button.before('<input type="hidden" name="' + name  + '" value="' + value  + '">');
        }
        
        // Apply CSS classes for deleting a product.
        $button
        .closest('.js__product')
        .removeClass('is-invalid is-updating is-updated')
        .addClass('is-removing')
        .find('.field')
        .removeClass('field--error');
        setInterval(function () {
            $button.addClass('is-removed')
        }, 0);

        // Submit form.
        $form.submit()
    });
    

    //==========================================================================
    // Quick Entry form.
    //==========================================================================

    var $quickEntryForm = $(".js-form-quick-entry");
    var $quickEntryProductCodeField = $(".js-quick-entry-product-code-field");
    var $quickEntryProductCodeInput = $("#add_product_code");
    var $quickEntryQuantityInput = $("#add_quantity");
    var $quickEntryProductDetails = $(".js-qe-product-details");
    var $priceBreakQtyRow = $(".js-qe-product-qty-tr");
    var $priceBreakPriceRow = $(".js-qe-product-price-tr");

    function fetchProductInfo(productCode) {
        // Quick Entry form – Make AJAX request to fetch product information.

        return $.ajax({
            url: "/tcl/product",
            data: {
                add_product_code: productCode
            },
            method: "GET",
            dataType: "json",
            success: function(response) {
                $quickEntryProductCodeField.removeClass("is-loading");
                
                if ( response.status === "valid" ) {
                    // Recognised product code - display product details.
                    $quickEntryProductCodeField.addClass("is-valid");
                    
                    // Product image.
                    $(".js-qe-product-image").attr({
                        "src": response.data.image_url,
                        "alt": response.data.description
                    });
                    
                    // Product code & description.
                    $(".js-qe-product-code").html(response.data.product_code);
                    $(".js-qe-product-description").html(response.data.description);

                    // Product price breaks.
                    $priceBreakQtyRow.empty();
                    $priceBreakPriceRow.empty();
                    $.each(response.data.price_breaks, function (index, price_break) {
                        // Add label table heading cells.
                        var $priceBreakQtyTh = $(".template.js-qe-product-qty-th").clone().removeClass("template");
                        $priceBreakQtyTh.html('<p>' + price_break.label + '</p>');
                        $priceBreakQtyRow.append($priceBreakQtyTh)

                        // Add price table cells.
                        var $priceBreakPriceTd = $(".template.js-qe-product-price-td").clone().removeClass("template");
                        $priceBreakPriceTd.html("<p>" + price_break.price + "</p>");
                        $priceBreakPriceRow.append($priceBreakPriceTd);
                    });
                    
                    // Set the VAT preference in the 'Price' label.
                    if (response.data.preferences.include_vat) {
                        $(".js-qe-vat-indicator").html("inc VAT");
                    } else {
                        $(".js-qe-vat-indicator").html("ex VAT");
                    }

                    // Show product details.
                    $quickEntryProductDetails
                        .removeClass("is-hidden")
                        .addClass("is-loaded");
                    
                    // Change the selling multiple for the Qty input field.
                    $quickEntryQuantityInput
                        .attr("data-selling_multiple", response.data.selling_multiple)
                        .val(response.data.selling_multiple);
                } else {
                    // Unrecognised product code - reset product details / show placeholder.
                    $quickEntryProductCodeField.removeClass("is-valid");
                    $quickEntryProductDetails.removeClass("is-loaded");
                    // Reset the Qty input.
                    $quickEntryQuantityInput
                        .attr("data-selling_multiple", 1)
                        .val(1);
                }
            }
        });
    }

    //--------------------------------------------------------------------------
    // Quick entry Product Code field input event listener.
    //
    // For every keystroke, make an AJAX request to validate entry and display 
    // product details & prices for valid product codes.
    //-----

    $quickEntryProductCodeInput.on('input autosuggest-result-selected', function (event) {
        // Make an AJAX request to validate product code.
        var query = $quickEntryProductCodeInput.val();
        if (query.length > 0) {
            // Display a loading spinner.
            $quickEntryProductCodeField
            .addClass("is-loading")
            .removeClass("is-valid");
            fetchProductInfo(query);
        }
        
        // Store the input value so it can be re-inserted later.
        $quickEntryProductCodeInput.data("query", $quickEntryProductCodeInput.val());
    });


    //--------------------------------------------------------------------------
    // Quick Entry Autosuggest.
    //-----

    var $autoSuggest = $(".js-qe-autosuggest");
    var $autoSuggestResults = $(".js-qe-autosuggest-results");
    var isAutoSuggest = false;
        
    $quickEntryProductCodeInput
        .on("blur", function (event) {
            // Hide the autosuggest results.
            autoSuggestClose();
        })
        .on("focus", function (event) {
        // Show the autosuggest results, if there are any.
            if ($autoSuggestResults.children().length > 0) { 
                autoSuggestOpen();
            }
        })
        .on("input", function (event) {
            isAutoSuggest = false;
            var query = $(this).val();
            if (query.length > 0) {
                // Show the auto-suggest results.
                autosuggestFetch(query);
            } else {
                // Hide the auto-suggest results.
                autoSuggestClose();
            }
        });

    function autosuggestFetch(query) {
        // Quick Entry form – Make AJAX request to fetch auto-suggest results.
        return $.ajax({
            url: "/tcl/product-autosuggest",
            dataType: "json",
            data: {
                query: query
            },
            success: function (response) {
                $autoSuggestResults.empty();

                if (response.data.products && response.data.products.length > 0) {
                    // Add auto-suggest results to the page.
                    $.each(response.data.products, function (index, product) {
                        var productCode = product.product_code;
                        var productCodeHTML = product.product_code_html;
                        var productDescription = product.description;
                        var productImage = product.product_image_url
                        var manufacturerImage = product.manufacturer_image_url;
                        
                        if ($quickEntryProductCodeInput.is(":focus")
                            && (
                                response.data.products.length > 1
                                || response.data.is_exact_match == false
                            )
                        ) {
                            var $result = $(".template.js-qe-autosuggest-result").clone();
                            $result.removeClass("template");
                            $result.data("value", productCode);
                            $result.find(".js-qe-autosuggest-result-code").html(productCodeHTML);
                            $result.find(".js-qe-autosuggest-result-description").html(productDescription);
                            $result.find(".js-qe-autosuggest-result-image").attr("src", productImage);
                            $result.find(".js-qe-autosuggest-result-manufacturer-image").attr("src", manufacturerImage);
                            $result.appendTo($autoSuggestResults);
                            autoSuggestOpen();
                        } else {
                            autoSuggestClose();
                        }
                    });
                } else {
                    autoSuggestClose();
                }
            }
        });
    }

    function autoSuggestOpen() {
      // Open the autosuggest results.
      $autoSuggest.addClass("is-active");
    }

    function autoSuggestClose() {
      // Close the autosuggest results.
        $autoSuggest.removeClass("is-active");
    }

    $autoSuggestResults.on("mousedown", function (event) {
        // Prevent blur when results are clicked on.
        event.preventDefault();
    });

    $autoSuggestResults.on("click", ".js-qe-autosuggest-result", function(event) {
        // Delegated click handler for selecting an autosuggest result.
        event.preventDefault();
        isAutoSuggest = true;
        var value = $(this).data("value");
        // Populate the product code field & trigger fetch of the product details.
        $quickEntryProductCodeInput
            .val(value)
            .trigger("autosuggest-result-selected");
        // Move focus to the quantity input.
        $("#add_quantity").focus();
    })

    $quickEntryProductCodeField.on("keydown", function (event) {
        // Register keydown event on the result.
        var index = $autoSuggestResults.children(".is-active").index();
        var productCount = $autoSuggestResults.children().length;
        
        switch (event.keyCode) {
            case 27:
                // Escape key pressed – close autosuggest results.
                autoSuggestClose();
                break
            case 9:
            case 13:
                // Tab or Enter key pressed - select the result.
                if ( $(".js-qe-autosuggest-result.is-active").length == 1 ) {
                    // There is an active result, so select it.
                    $(".js-qe-autosuggest-result.is-active").trigger("click");
                    event.preventDefault();
                    return false;
                }
                break;
            case 40:
                // ↓ key pressed.
                if (productCount > 0) {
                    // There are autosuggest results.
                    if ($quickEntryProductCodeInput[0].selectionStart == $quickEntryProductCodeInput.val().length) {
                        // Caret position is at the end of the input field.
                        event.preventDefault();
                        if (index + 1 != productCount) {
                            // There is a next result, so select it.
                            $autoSuggestResults.children().removeClass("is-active");
                            var $nextResult = $autoSuggestResults.children().eq(index + 1);
                            $quickEntryProductCodeInput.val($nextResult.data("value"));
                            $nextResult.addClass("is-active");
                        }
                    }
                }
                break;
            case 38:
                // ↑ key pressed.
                if (productCount > 0) { 
                    // There are autosuggest results.
                    if ( $quickEntryProductCodeInput[0].selectionStart == $quickEntryProductCodeInput.val().length ) {
                        // Caret position is at the end of the input field.
                        $autoSuggestResults.children().removeClass("is-active");
                        
                        if (index == 0) { 
                            // There is no previous result, reset input field to the original query value.
                            event.preventDefault();
                            $quickEntryProductCodeInput.val($quickEntryProductCodeInput.data("query"));
                        } else if (index > 0) {
                            // There is a previous result, so select it.
                            event.preventDefault();
                            var $prevResult = $autoSuggestResults.children().eq(index - 1);
                            if ($prevResult.length > 0) {
                                $quickEntryProductCodeInput.val($prevResult.data("value"));
                                $prevResult.addClass("is-active");
                            }
                        }
                    }
                }
                break;
        }
    });

    //--------------------------------------------------------------------------
    // Click handler for quick entry 'ADD +' button.
    //-----
    $quickEntryForm.on('click', '.js-quick-entry-add-button', function (event) {
        var $form = $(event.delegateTarget);

        // Cancel scheduled form submission.
        var timeout = $form.data('keyup-submit-timeout');
        window.clearTimeout(timeout);

        // Abort any in-progress validation requests.
        if ($form.validation('state') === 'validating') {
            $form.validation('abort');
        }

        // Change quick order entry add button's content to be a spinner.
        if ( $(this).data('init-html') === undefined ) {
            // Save initial html content of the button.
            $(this).data('init-html', $(this).html());
        }
        $(this).html('<div class="ajax-spinner">');
        
        // Submit form.
        $form.submit()
    });


    //--------------------------------------------------------------------------
    // Keyup handler for quick entry Qty inputs.
    //-----
    $quickEntryForm.on('keydown', $quickEntryQuantityInput, function (event) {
        // When user presses enter, click the quick order entry add button.
        
        if (event.which == 13) {
            var $form = $(event.delegateTarget);

            // Click quick order entry add button.
            $('.js-quick-entry-add-button', $form).click();

            // Prevent default submit behaviour of the enter key.
            return false;
        }
    });


    //--------------------------------------------------------------------------
    // Validation valid handler for Quick Entry form.
    //-----
    $quickEntryForm.on("valid.validation", function(event) {
        var $form = $(this);
        var $basketForm = $(".js__products");
        var data = event.response.data;
        
        // Restore initial content of 'Add' button.
        var $addButton = $(".js-quick-entry-add-button", $form);
        var $addButtonInitHTML = $addButton.data('init-html')
        if ($addButtonInitHTML) $addButton.html($addButtonInitHTML);
        
        // Reset product code input field to "" and give focus.
        $quickEntryProductCodeInput
            .val('')
            .focus()
            .trigger("change");
        
        // Reset quantity input to 1.
        $('.js-quick-entry-quantity-input', $form).val('1');
        
        // Reset product details, show placeholder.
        $quickEntryProductCodeField.removeClass("is-valid");
        $quickEntryProductDetails.removeClass("is-loaded");
        
        // Reset the autosuggest results container.
        $autoSuggestResults.empty();

        // Identify the added product by comparing products in JSON response 
        // with the existing basket items in DOM.
        var namePrefix = 'quantity_';
        var addedProduct = [];
        $.each(data.products || [], function (i, product) {
            var webCode = product_code2web_code(product.product_code);
            var $input = $basketForm.find('.js__qty[name="' + namePrefix + webCode + '"]')

            if ($input.length === 0) {
                // Product has been added, since it's not found in existing basket items.
                addedProduct.push(webCode);
            }
        });

        // Update page.
        order_json2html(data);

        // Apply 'updating' state CSS classes to the added product's row.
        $.each(addedProduct, function (i, webCode) {
            $basketForm.find('.js__qty[name="' + namePrefix + webCode + '"]')
                .closest('.js__product')
                .addClass('is-updating is-updated');
        });

        // Schedule CSS classes to be removed from added product's row after 500ms delay.
        window.setTimeout(function () {
            $.each(addedProduct, function (i, webCode) {
                $basketForm.find('.js__qty[name="' + namePrefix + webCode + '"]')
                    .closest('.js__product')
                    .removeClass('is-updating is-updated');
            });
        }, 500);
    })
    .on("invalid.validation error.validation", function (event) {
        // Restore initial content of 'Add' button.
        var $form = $(this);
        var $addButton = $(".js-quick-entry-add-button", $form);
        var $addButtonInitHTML = $addButton.data('init-html')
        if ($addButtonInitHTML) $addButton.html($addButtonInitHTML);
    });
    
    //--------------------------------------------------------------------------
    // Send a custom event to record Quick Entry form usage in Google Analytics.
    //-----
    $quickEntryForm.on("submit", function () {
        window.tagManagerDataLayer = window.tagManagerDataLayer || [];
        tagManagerDataLayer.push({
            "event": "quick_entry",
            "event_data": {
                "value": $quickEntryProductCodeInput.val(),
                "autosuggest": isAutoSuggest
            }
        });
    });

    //==========================================================================
    // Catalogue checkbox.
    //==========================================================================

    // Change handler for catalogue checkbox.
    $('.js-form-catalogue-preference').on('change', '.js-catalogue-checkbox', function(event) {
        var $form = $(event.delegateTarget);

        // Cancel scheduled form submission.
        var timeout = $form.data('keyup-submit-timeout');
        window.clearTimeout(timeout);

        // Submit form.
        $form.submit();
    });
    
    
    //==========================================================================
    // Change handler for carrier options dropdown.
    //==========================================================================

    $('.js-form-carriage-options').on('change', '.js-carriage-options', function(event) {
        var $form = $(event.delegateTarget);

        // Cancel scheduled form submission.
        var timeout = $form.data('keyup-submit-timeout');
        window.clearTimeout(timeout);

        // Submit form.
        $form.submit();
    });
    
    //==========================================================================
    // Click handler for show VAT Preferences controls.
    //==========================================================================
    $(".basket").on("click", ".js-show-vat-modal", function (event) {
        $(".js-vat-modal").modal("open")
    });
    
    //==========================================================================
    // Validation valid handler for order update.
    //==========================================================================
    $('.js__products').on('valid.validation', function (event) {
        var $form = $(this);
        var data = event.response.data;
        
        // Record element that currently has focus.
        var $focussed = $(document.activeElement)
        // Record caret position of focussed text input.
        var textRange;
        if ($focussed.is(':text')) {
            textRange = $focussed.textrange('get');
        }
        
        // Identify updated products.
        var namePrefix = 'quantity_';
        var addedProducts = [];
        var updatedProducts = [];
        $.each(data.products || [], function (i, product) {
            var web_code = product_code2web_code(product.product_code);
            var $input = $form.find('input.js__qty[name="' + namePrefix + web_code + '"]')
            
            if ($input.length === 0) {
                // Added product.
                addedProducts.push(web_code);
            } else if ($input.closest('.is-updating').length > 0) {
                // Updated product.
                updatedProducts.push(web_code);
            } else {
                $form
                .find('input.js__qty[name="' + namePrefix + web_code + '"]')
                .closest('.js__product')
                .each(function () {
                    var old_price_description = $(this).find('.js__price_description').html();
                    var new_price_description = $('<span>').html(product.price_description).html();
                    
                    if (old_price_description !== new_price_description) {
                        updatedProducts.push(web_code);
                        return false;
                    }
                });
            }
        });
        
        // Update page.
        order_json2html(data);
        
        // Apply CSS classes to added and updated products and remove after 500ms delay.
        $.each(addedProducts.concat(updatedProducts), function (i, web_code) {
            $form.find('input.js__qty[name="' + namePrefix + web_code + '"]')
            .closest('.js__product')
            .addClass('is-updating is-updated');
        });
        
        // Schedule CSS classes to be removed from added & updated products after 500ms delay.
        window.setTimeout(function () {
            $.each(addedProducts.concat(updatedProducts), function (i, web_code) {
                $form.find('input.js__qty[name="' + namePrefix + web_code + '"]')
                .closest('.js__product')
                .removeClass('is-updating is-updated');
            });
        }, 500);
        
        if (typeof textRange !== "undefined") {
            // Restore original focus & caret position.
            $focussed.focus();
            $focussed.textrange('set',
            textRange.selectionStart,
            textRange.selectionEnd);
        }
    })
    .on('invalid.validation error.validation', function (event) {
        var $form = $(this);
        
        // Add invalid class to any products being updated/removed.
        $('.is-updating, .is-updated, .is-removing, .is-removed', $form)
        .removeClass('is-updating is-updated is-removing is-removed')
        .addClass('is-invalid');
        
        // Add invalid and error classes based on validation response.
        if ( event.response ) {
            $.each(event.response.record, function(id, object) {
                $('#' + id + ', [name="' + id + '"]', $form)
                .closest('.field')
                .addClass('field--error')
                .closest('.js__product')
                .removeClass('is-updating is-updated is-removing is-removed')
                .addClass('is-invalid');
            });
        }
    });
    
    //==========================================================================
    // Validation valid handler for Catalogue Checkbox & Carriage Options forms.
    //==========================================================================
    $(".js-form-catalogue-preference, .js-form-carriage-options")
        .on("valid.validation", function (event) {
            // Update page.
            order_json2html(event.response.data);
        });
    
    // If viewport width changes, reposition qtips.
    $(window).on("viewportWidthResize", function() {
        $('.js__products').validation('reposition');
    });

    // Rebuild the order page when promo code form is submitted.
    $(".js__promo-code-form").on("valid.validation", function(event) {
        var $product_forms = $(".js__products");
        var data = event.response.data;

        // identify products where the price has changed
        var namePrefix = 'quantity_';
        var updatedProducts = [];
        $.each(data.products || [], function(i,product) {
            var web_code = product_code2web_code(product.product_code);

            $product_forms
                .find('input.js__qty[name="' + namePrefix + web_code + '"]')
                .closest('.js__product')
                .each(function() {
                    var old_price_description = $(this).find('.js__price_description').html();
                    var new_price_description = $('<span>').html(product.price_description).html();

                    if ( old_price_description !== new_price_description ) {
                        updatedProducts.push(web_code);
                        return false;
                    }
                });
        });

        // update page
        order_json2html(data);

        // Scroll to promo code alert
        var $promo_code_alert = $('.js__promo_code_alert');
        if ( $promo_code_alert.length > 0 ) {
            scrollToElement($promo_code_alert);
        }
        
        // apply CSS classes to updated products and remove after 500ms delay
        $.each(updatedProducts, function(i, web_code) {
            $product_forms.find('input.js__qty[name="' + namePrefix + web_code + '"]')
                .closest('.js__product')
                .addClass('is-updating is-updated');
        });

        // schedule CSS classes to be removed from added & updated products after 500ms delay
        window.setTimeout(function(){
            $.each(updatedProducts, function(i, web_code) {
                $product_forms.find('input.js__qty[name="' + namePrefix + web_code + '"]')
                    .closest('.js__product')
                    .removeClass('is-updating is-updated');
            });
        }, 500);
    });

    // Click event to toggle visibility of the promo code form.
    $(".js-promo-code-toggle").on("click", function(event) {
        if ( $(".js__promo-code-form").hasClass("is-hidden") ) {
            $(".js__promo-code-form").removeClass("is-hidden", 500);
        } else {
            $(".js__promo-code-form").addClass("is-hidden", 500);
        }
    });
})();

(function(){
    // ======================================================================
    // Collection Modal Dialog.
    // ======================================================================
    
    function collectionModalOpen() {
        // Opens the "Collect from a TLC branch" modal dialog.
        var $collectionModal = $(".js-collection");
        $collectionModal.modal("open");
        
        if($("#select_a_branch", $collectionModal).val() !== "") {
            $(".modal-dialog__footer-button--continue", $collectionModal)
            .removeClass("is-hidden")
            .removeClass("is-collapsed", 200);
        }
        
        // Reset branch selector.
        $(".js-branch-item", $collectionModal).not(".template").remove();
        $(".js-content-wrapper", $collectionModal).removeClass("is-hidden");

        // Hide any validation plugin alert messages.
        $(".message-area", $collectionModal).remove();
    }

    function deliveryModalOpen() {
        // Opens the "Deliver My Order" modal dialog.
        var $deliveryModal = $(".js-delivery");
        
        // Update Continue button.
        deliveryModalShowHideContinueButton();

        // Hide any validation plugin alert messages.
        $(".message-area", $deliveryModal).remove();

        $deliveryModal.modal("open");
    }
    
    function deliveryModalShowHideContinueButton() {
        // Show/Hide continue button in delivery modal.
        var $addressFinder = $(".address-finder", ".js-delivery");

        if ( $addressFinder.length ) {
            // Guest delivery modal with address finder
            var addressFinderState = $addressFinder.addressFinder('addressFinderState');
            var $selectedOption = $(".js-address-select option:selected", $addressFinder);
            if ( addressFinderState === 'manual_entry' ) {
                // Manual address entry - show submit button.
                $(".modal-dialog__footer-button--continue", ".js-delivery")
                    .removeClass("is-hidden")
                    .removeClass("is-collapsed", 200);
            } else if ( addressFinderState === 'address_selection'  && $selectedOption.length && $selectedOption.val() != '') {
                // Address selection with address selected - show submit button.
                $(".modal-dialog__footer-button--continue", ".js-delivery")
                    .removeClass("is-hidden")
                    .removeClass("is-collapsed", 200);
            } else {
                // Hide submit button.
                $(".modal-dialog__footer-button--continue", ".js-delivery")
                    .addClass("is-collapsed", 200, function(event) {
                        $(this).addClass("is-hidden");
                    });
            }
        } else {
            // Signed-In delivery modal with address book

            if( $(".address-book-selector__option-input",".js-delivery").is(":checked") ) {
                // Address from address book has been selected -Show continue button.
                $(".modal-dialog__footer-button--continue", ".js-delivery")
                    .removeClass("is-hidden")
                    .removeClass("is-collapsed", 200);
            } else {
                // No address selection has been made - Hide continue button.
                $(".modal-dialog__footer-button--continue", ".js-delivery")
                    .addClass("is-collapsed", 200, function(event) {
                        $(this).addClass("is-hidden");
                    });
            }
        }
    }

    // Delivery Method selector control to open modal dialog.
    $(".js-delivery-method-selector").on("click", function() {
        if( $(this).data("delivery-method") === "collection" ) {
            // User clicked on Collection option.
            collectionModalOpen();
        } else if ( $(this).data("delivery-method") === "delivery") {
            // User clicked on Delivery option.
            deliveryModalOpen();
        }
    });

    // When branch selection changes show/hide the Continue button
    $("#select_a_branch", ".js-collection").on("change", function() {
        if ( $(this).val() !== "" ) {
            $(this)
                .closest(".modal-dialog")
                .find(".modal-dialog__footer-button--continue")
                .removeClass("is-hidden")
                .removeClass("is-collapsed", 200);
        } else {
            $(this)
                .closest(".modal-dialog")
                .find(".modal-dialog__footer-button--continue")
                .addClass("is-collapsed", 200, function (event) {
                    $(this).addClass("is-hidden");
                });
        }
    });
   
    // ======================================================================
    // Delivery modal dialog (for Signed In user).
    //
    // ======================================================================

    $(".address-book-selector__option-input").on("change", function() {
        deliveryModalShowHideContinueButton();
    });


    // ======================================================================
    // Delivery modal dialog (for Guest user).
    //
    // ======================================================================
    
    $(".js-delivery").on("close.modal", function (event) {
        // Reset address finder to initial layout on modal closing "Deliver 
        // My Order" modal dialog.
        $(".address-finder", $(this)).addressFinder("reset");
    });

    $(".address-finder")
        .addressFinder()
        .on("manualFieldsVisible.addressFinder addressFinderVisible.addressFinder addressSelected.addressFinder", function() {
            // Show/hide continue button.
            deliveryModalShowHideContinueButton();
        });

    // ======================================================================
    // "Use My Current Location" button.
    //
    // Find Your Nearest TLC Branch using browser-based geolocation accessed
    // from the "Collect From a TLC Branch" modal dialog.
    // ======================================================================

    function haversine(lat1, lng1, lat2, lng2) {
        // Determines the great-circle distance in miles between two points on a sphere given their longitudes and latitudes.
        // https://en.wikipedia.org/wiki/Haversine_formula
        var R = 3959; // Earth radius in miles
        var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
        var dLng = lng2 * Math.PI / 180 - lng1 * Math.PI / 180;
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    }

    function getNearestBranches(latitude, longitude) {
        // Determine's three nearest branches to given lat & long.
        // Returns branch index and it's distance.
        var branchDistances = [];
        var firstBranch = [0,9999], secondBranch = [0,9999], thirdBranch = [0,9999]; // [ index of branchDistances[x] , distance ]

        $("#select_a_branch option[data-branch-name]").each(function() {
            branchDistances[$(this).val()] = haversine( latitude, longitude, $(this).data("lat"), $(this).data("lng") );
        });

        for (var x in branchDistances) {
            // Get index of the nearest 3 distances in branchDistances.

            if ( branchDistances[x] < firstBranch[1] ) {
                // If current element is smaller than first.
                thirdBranch = secondBranch;
                secondBranch = firstBranch;
                firstBranch = [ x, branchDistances[x] ];
            } else if ( branchDistances[x] < secondBranch[1] ) {
                // If branchDistances[x] is in between firstBranch and secondBranch then update secondBranch.
                thirdBranch = secondBranch;
                secondBranch = [ x, branchDistances[x] ];
            } else if ( branchDistances[x] < thirdBranch[1] ) {
                thirdBranch = [ x, branchDistances[x] ];
            }
        }
        return [firstBranch, secondBranch, thirdBranch];
    }

    function addBranchToList(branchName, distance, branchCode) {
        // Adds a selectable branch option to form showing branch name, distance, link to branch page and 'select' submit button.
        var $clone = $(".template.js-branch-item").clone().removeClass("template");
        $clone.attr("data-branch-code", branchCode);
        $clone.find(".js-branch-title").html(branchName);
        $clone.find(".js-branch-info-link").attr("href", "/Information/branches/" + branchCode + ".html");
        if (distance == 1 ) {
            $clone.find(".js-branch-distance").text("(1 mile away)");
        } else {
            $clone.find(".js-branch-distance").text("(" + distance + " miles away)");
        }
        $clone
            .find(".js-branch-select-button")
            .attr("value", branchCode)
            .attr("name", branchCode);
        $clone.appendTo(".js-branch-list");
    }

    $(".js-geolocate-button", ".js-collection").on("click", function() {
        // "Use My Current Location" button click event.
        if (!navigator.geolocation) {
            $(".js-branch-list", ".js-collection").addClass("is-loading");
            $(".js-branch-list-status-message", ".js-collection").text("Geolocation is not supported by your browser.");
        } else {
            $(".js-branch-list", ".js-collection").addClass("is-loading");
            $(".js-branch-list-status-message", ".js-collection").text("Locating ...");
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    // On success, determine nearest branches to position and build a list of options in HTML.
                    var nearestBranches = getNearestBranches(position.coords.latitude, position.coords.longitude);
                    showNearestBranches (nearestBranches);
                },
                function() {
                    // Error handler.
                    $(".js-branch-list", ".js-collection").addClass("is-loading");
                    $(".js-branch-list-status-message", ".js-collection").text("Failed to get your location.");
                },
                {
                    timeout: 10000
                }
            );
        }
    });

    $(".js-branch-list", ".js-collection")
    .on("click", ".js-branch-icon, .js-branch-text, .js-branch-select-button", function (event) {
        // Clicking on the icon, text label or 'select' button makes branch selection in dropdown and submits the form .
        var branchCode = $(this).closest(".js-branch-item").data("branch-code");
        $("#select_a_branch").val(branchCode);
        $("#select_a_branch").closest('form').submit();
    });

    // ======================================================================
    // "Enter a town or postcode" input field & button.
    //
    // Find Your Nearest TLC Branches using geocoding service to convert
    // text input to Lat & Lng.
    //
    // ======================================================================

    var geocodeAPI = "/tcl/geocode";

    // Button click event.
    $(".js-geocoding-button", ".js-collection").on("click", function() {
        var $input = $(".js-geocoding-input", ".js-collection");
       
        if ( $input.val() != "" ) {
            $.getJSON(geocodeAPI, {
                address: $input.val(),
                components: "country:GB",
                result_type: "street_address"
            }).always(function(data) {
                var address_found = false;

                // Reset results.
                $(".js-branch-item", ".js-branch-list").not(".template").remove();
                $(".js-branch-list", ".js-collection").removeClass("is-loading");

                if ( data.status && data.status === 'OK' ) {
                    $.each(data.results, function() {
                        address_found = true;
                        var nearestBranches = getNearestBranches(this.geometry.location.lat,this.geometry.location.lng);
                        showNearestBranches(nearestBranches);
                        $input.blur();
                        return false;
                    });
                }

                if ( !address_found ) {
                    // Show no results message.
                    $(".js-branch-list", ".js-collection").addClass("is-loading");
                    $(".js-branch-list-status-message", ".js-collection").text("Couldn't find this location. Please try again.");
                }
            });
        }
    });

    // "Enter" keypress event.
    $(".js-geocoding-input", ".js-collection").on("keypress", function(event) {
        var $input = $(".js-geocoding-input", ".js-collection");

        if( (event.keyCode == 13) ) {
            // "Enter" key pressed.
            event.preventDefault();

            if ( $input.val() != "" ) {
                $.getJSON(geocodeAPI, {
                    address: $input.val(),
                    components: "country:GB",
                    result_type: "street_address"
                }).always(function(data) {
                    var address_found = false;

                    // Reset results.
                    $(".js-branch-item", ".js-branch-list").not(".template").remove();
                    $(".js-branch-list", ".js-collection").removeClass("is-loading");

                    if ( data.status && data.status === 'OK' ) {
                        $.each(data.results, function() {
                            address_found = true;
                            var nearestBranches = getNearestBranches(this.geometry.location.lat,this.geometry.location.lng);
                            showNearestBranches(nearestBranches);
                            $input.blur();
                            return false;
                        });
                    }

                    if ( !address_found ) {
                        // Show no results message.
                        $(".js-branch-list", ".js-collection").addClass("is-loading");
                        $(".js-branch-list-status-message", ".js-collection").text("Couldn't find this location. Please try again.");
                    }
                });
            }

            return false;
        }
    });

    function showNearestBranches(nearestBranches) {
        // Builds and reveals the list of nearest branches.

        // Reset nearest branch list
        $(".js-branch-item", ".js-branch-list").not(".template").remove();

        $.each(nearestBranches, function() {
            var branchName = $("#select_a_branch option[value='" + $(this)[0] + "']").data("branch-name");
            var branchDistance = parseFloat($(this)[1].toFixed(1));
            var branchCode = $(this)[0];
            addBranchToList(branchName, branchDistance , branchCode);
        } );

        $(".js-content-wrapper", ".js-collection").addClass("is-hidden", 500);
        $(".js-branch-list", ".js-collection").removeClass("is-loading");
        $(".modal-dialog__footer-button--continue", ".js-collection")
        .addClass("is-collapsed", 200, function (event) {
            $(this).addClass("is-hidden");
        });
        
    }

    // Add/remove classes for delivery_selector error state.
    $('.js__checkout').on('invalid.validation', function (event) {
        var response = event.response;
        
        if ( response.data && response.data.delivery_info_unknown ) {
            $('.delivery-selector').addClass('is-error');
        } else {
            $('.delivery-selector').removeClass('is-error');
        }
    });


    // ======================================================================
    // 'Order Name'/ Reference modal dialog.
    // ======================================================================

    var $orderNameModal = $(".js-order-name-modal");
    var $orderNameForm = $(".js-order-name-form", $orderNameModal);

    $(".js-order-name-control").on("click", function (event) {
        // Click event handler for the breadcrumb control.
        event.preventDefault();
        $orderNameModal.modal("open");
    });

    // Register validation handlers for the "Order Name" modal form.
    $orderNameForm.validation({
        qtip: {
            position: {
                my: "right center",
                at: "right center",
                viewport: $("modal-dialog__body", $orderNameForm),
                container: $(".modal-dialog__body", $orderNameForm),
                adjust: {
                    method: "shift",
                    x: -10
                },
                effect: false
            },
            style: {
                tip: {
                    corner: false
                }
            }
        },
        messages: {
            alert: {
                after: $(".modal-dialog__title", $orderNameForm)
            },
            error: {
                after: $(".modal-dialog__title", $orderNameForm)
            },
            notify: {
                after: $(".modal-dialog__title", $orderNameForm)
            }
        }
    });

    // Register Delivery Method forms for validation service.

    $(".js-collection-selector").validation({
        qtip: {
            position: {
                my: "right center",
                at: "right center",
                viewport: $(".js-collection-selector .modal-dialog__body"),
                container: $(".js-collection-selector .modal-dialog__body"),
                adjust: {
                    method: "shift",
                    x: -10
                },
                effect: false
            },
            style: {
                tip: {
                    corner: false
                }
            }
        },
        messages: {
            alert: {
                after: ".js-collection-selector .modal-dialog__title"
            },
            error: {
                after: ".js-collection-selector .modal-dialog__title"
            },
            notify: {
                after: ".js-collection-selector .modal-dialog__title"
            }
        }
    });

    $(".js-delivery-selector").validation({
        qtip: {
            position: {
                my: "right center",
                at: "right center",
                viewport: $(".js-delivery-selector .modal-dialog__body"),
                container: $(".js-delivery-selector .modal-dialog__body"),
                adjust: {
                    method: "shift",
                    x: -10
                },
                effect: false
            },
            style: {
                tip: {
                    corner: false
                }
            }
        },
        messages: {
            alert: {
                after: ".js-delivery-selector .modal-dialog__title"
            },
            error: {
                after: ".js-delivery-selector .modal-dialog__title"
            },
            notify: {
                after: ".js-delivery-selector .modal-dialog__title"
            }
        }
    });

    $(".js-vat-preference-form").validation({
        method: "PUT",
        qtip: {
            position: {
                my: "right center",
                at: "right center",
                viewport: $(".js-vat-modal .modal-dialog__body"),
                container: $(".js-vat-modal .modal-dialog__body"),
                adjust: {
                    method: "shift",
                    x: -10
                },
                effect: false
            },
            style: {
                tip: {
                    corner: false
                }
            }
        },
        messages: {
            alert: {
                after: ".js-vat-modal .modal-dialog__title"
            },
            error: {
                after: ".js-vat-modal .modal-dialog__title"
            },
            notify: {
                after: ".js-vat-modal .modal-dialog__title"
            }
        }
    });

    // ======================================================================
    // Express Checkout Form / Secure Acceptance Form.
    // ======================================================================

    var $secure_acceptance = $(".js-form-secure-acceptance");
    var $express_checkout = $(".js-form-express-checkout");

    $express_checkout.on("valid.validation", function (event) {
        // Perform posts and provide feedback to the user based on validation response.
        var $form = $(this);
        var data = event.response.data;

        if (data.feedback) {
            // Provide feedback to user.
            $.each(data.feedback, function (i, feedback) {
                $(feedback.selector).html(feedback.html);
            });
        }

        if (data.post_url) {
            // Perform another post request.
            var method = data.post_method || "POST";
            $form.validation("validate", method, data.post_url);
        }

        if (data.sa_data) {
            // Copy response data to the hidden secure acceptance form.
            $secure_acceptance.empty();
            $.each(data.sa_data, function (name, value) {
                $secure_acceptance.append(
                    $("<input>")
                        .attr({ type: "hidden", name: name })
                        .val(value)
                );
            });
            // Submit form.
            $secure_acceptance.submit();
        }
    });

    //------------------------------------------------------------------------------
    // "What is Express Checkout?" Tooltip.
    // -----------------------------------------------------------------------------

    $(".js-tooltip-link")
        .on("click", function (event) {
            // Prevent default click actions.
            event.preventDefault();
        })
        .on("mousedown touchstart", function (event) {
            // On mousedown/touch, toggle the tooltip bubble visibility.
            if ($(this).is(":focus")) {
                $(this).blur();
            } else {
                $(this).focus();
            }
            return false;
        })
        .on("mouseenter", function (event) {
            // On mouseenter, show the tooltip bubble.
            $(this).focus();
        })
        .on("mouseout", function (event) {
            // On mouseout, hide the tooltip bubble.
            $(this).blur();
        });
})();

(function () {

    //==========================================================================
    // Share Your Basket.
    //==========================================================================

    var $shareBasketModal = $(".js-share-modal");
    $shareBasketModal.modal();
    var $form = $(".js-share-basket");
    var $input = $(".js-share-basket-url");

    // Register validation plugin for the share basket form.
    $form.validation({
        method: "POST",
        submit: false,
        messages: {
            alert: {
                before: ".js-validation-message-marker"
            },
            error: {
                before: ".js-validation-message-marker"
            },
            notify: {
                before: ".js-validation-message-marker"
            }
        }
    });

    $form.on("valid.validation", function (event) {
        // On valid response – insert the sharing URL and open the modal dialog.
        $input.val(event.response.data.url);
        $shareBasketModal.modal("open");
    }).on("invalid.validation", function (event) {
        // On invalid response – insert the sharing URL and open the modal dialog.
        $shareBasketModal.modal("open");
    });

    var timeout;

    $(".js-share-basket-copy-btn").on("click", function () { 
        // 'Copy Link' button – on cilck, copy the sharing URL to the user's clipboard.
        var $notification = $(".js-share-basket-copy-notification");
        $input.select();
        document.execCommand("copy");
        $input.blur();
        window.getSelection().empty();
        $notification
            .addClass("is-active")
            .text("Link copied");
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            // Remove the 'Link copied' notification after a short duration.
            $notification.removeClass("is-active");
        }, 2500);
    });

    $(".js-share-basket-url").on("click", function () {
        // On click, select the entire URL.
        $(this).select();
    });

})();