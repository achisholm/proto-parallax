// =============================================================================
// AddressFinder jQuery Plugin.
//
// Plugin to help user populate address fields. User can either enter a postcode
// and get a dropdown of matching delivery addresses which they can select or
// enter manually.
//
// Used on:
// - My Account > Add a New Address
// =============================================================================

(function($) {

    $.widget('qcode.addressFinder', {
        _create: function() {
            var addressFinder = this;
            var $addressFinder = addressFinder.element;
            addressFinder.$form = $addressFinder.closest('form');
            addressFinder.$postcode = $(".js-postcode-input input", $addressFinder).eq(0);
            addressFinder.URL = $addressFinder.data('address-finder-url');

            //==============================================================================
            // Reset .js-address-select dropdown - resolves back button issue where browser
            // tries to preserve previous dropdown selections that no longer exist.
            //==============================================================================
            $('.js-address-select select', $addressFinder).val('');

            // ============================================================================
            // fetchValid event handler.
            // ============================================================================
            $addressFinder.on("fetchValid.addressFinder", function(event) {
                // Populate and show dropdown.
                var $dropdown = $(".js-address-select", $addressFinder);
                addressFinder.populateDropdown($(".field__input", $dropdown), event.response.data.addresses);
                $dropdown
                    .removeClass("is-hidden")
                    .removeClass("is-collapsed", 400);

                if ( ! $(".js-address-finder", $addressFinder).hasClass("is-collapsed") ) {
                    // Update address finder state.
                    addressFinder.addressFinderState("address_selection");
                }
            });

            // ============================================================================
            // fetchComplete event handler.
            // ============================================================================
            $addressFinder.on("fetchComplete.addressFinder", function() {
                // Replace loading spinner with button's original content.
                var $button = $(".js-find-address-button button", this);

                $button.html($button.data('init-html'));
            });

            // ============================================================================
            // click event for 'Find Address' button.
            // ============================================================================
            $(".js-find-address-button button", $addressFinder).on("click", function(event) {
                var $button = $(this);

                // Fetch addresses on button click.
                addressFinder.hideValidationMessages();

                // Add loading spinner inside button and save original content.
                if ( $button.data('init-html') === undefined) {
                    $button.data('init-html', $button.html());
                }
                $button.html("<span class='ajax-spinner'>");

                // Perform PAF AJAX.
                if ( typeof(addressFinder.pafAJAX) != "undefined" ) {
                    // cancel existing ajax call
                    addressFinder.pafAJAX.abort();
                }
                addressFinder.pafAJAX = addressFinder.fetchAddresses();
            });

            // ============================================================================
            // keydown event for 'Postcode' input.
            // ============================================================================
            $(".js-postcode-input input", $addressFinder).on("keydown", function(event) {
                if (event.which == 13) {
                    // Prevent default behaviour and trigger click event on "Find Address"
                    // button.
                    event.preventDefault();
                    $(".js-find-address-button button", $addressFinder).trigger("click");
                    
                    // hack to fix bug where autocomplete popup can become detached from input when page layout changes
                    $(this).blur();
                }
            });

            //==============================================================================
            // change event for 'Select an address' dropdown.
            //==============================================================================
            $(".js-address-select .field__input", $addressFinder).on("change", function() {
                var selectedOption = $("option:selected", this);

                // Trigger addressSelected event.
                $addressFinder.trigger("addressSelected.addressFinder");
            });

            //==============================================================================
            // change event for 'Country' dropdown.
            //==============================================================================
            $(".js-country-select .field__input", $addressFinder).on("change", function() {
                var $form = addressFinder.$form;
                var countryCode = $(this).val();

                // For non-UK countries, show international field labels.
                addressFinder.setI18nFieldLabels(countryCode);
                // Show or hide EU VAT Number field.
                addressFinder.showHideEuVatField(countryCode);
                // Hide validation message for EU VAT Number field
                $form.validation("hideValidationMessage", $(".eu-vat-number input", $addressFinder));
                $(".eu-vat-number", $addressFinder).removeClass("field--error");
            });

            //==============================================================================
            // click event for 'Enter address manually' hyperlink control.
            //==============================================================================
            $(".js-manual-entry-link", $addressFinder).on("click", function(event) {
                event.preventDefault();
                addressFinder.showManualFields();
                addressFinder.hideValidationMessages();
            });

            //==============================================================================
            // click event for 'I want to use the UK address finder' hyperlink control.
            //==============================================================================
            $(".js-cancel-manual-entry-link", $addressFinder).on("click", function(event) {
                // Show address finder and hide manual entry fields.
                event.preventDefault();
                addressFinder.showAddressFinder();
                addressFinder.hideValidationMessages();
            });

        },
        populateDropdown: function($dropdown, addresses) {
            // Populate dropdown with addresses.

            // Empty the dropdown.
            $dropdown.empty();

            // Show the number of addresses found as first option.
            var $option = $("<option>");
            $option.text(addresses.length + " addresses found");
            $option.attr("selected", true);
            $option.val("");
            $option.appendTo($dropdown);

            // Create an option for each address.
            $.each(addresses, function(index, address) {
                var $option = $("<option>");
                $option.val(address.address_id);
                $option.text(address.description);
                $option.appendTo($dropdown);
            });
        },
        fetchAddresses: function(postcode) {
            // AJAX request to fetch list of addresses matching postcode.
            var addressFinder = this;
            var $addressFinder = addressFinder.element;
            var $form = addressFinder.$form;
            var $postcode = addressFinder.$postcode;
            var url = addressFinder.URL;

            var data = {};
            data[$postcode.attr('name')] = $postcode.val();
            
            return $.ajax({
                url: url,
                data: data,
                method: "GET",
                dataType: "json",
                cache: false,
                success: function(response, success, request) {
                    if ( response.status === "invalid" ) {
                        // Validation error - use validation plugin to parse response.
                        $form.validation("parseResponse", response);
                    } else if ( response.status === "valid" ) {
                        // Request successful - trigger fetchValid event.
                        $addressFinder.trigger({
                            type: "fetchValid.addressFinder",
                            response: response
                        });
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    // HTTP errors/timeouts.
                    if ( errorThrown != "abort" ) {
                        // Show user generic error message.
                        var errorMessage = "Sorry, we could not find your address. Please enter address manually.";
                        $form.validation("showValidationMessage", addressFinder.$postcode, errorMessage);
                    }
                },
                complete: function() {
                    // Trigger fetchComplete event
                    $addressFinder.trigger("fetchComplete.addressFinder");
                }
            });
        },
        hideValidationMessages: function() {
            // Hide validation messages and remove error state on form fields.
            var addressFinder = this;
            var $form = addressFinder.$form;

            $form.validation("hideValidationMessage");
            $form.validation("hideMessage", "error");
            $(".field--error", $form).removeClass("field--error");
            $("[name].invalid", $form).removeClass("invalid");
        },
        reset: function() {
            // Switch to address finder.
            var addressFinder = this;
            var $addressFinder = addressFinder.element;

            // Hide validation messages.
            addressFinder.hideValidationMessages();

            // Hide address selection dropdown.
            $(".js-address-select", $addressFinder)
                .addClass("is-collapsed is-hidden");

            // Show address finder.
            addressFinder.showAddressFinder({transitionDuration:0});
        },
        showManualFields: function(options) {
            // Switch to manual entry fields.
            var addressFinder = this;
            var $addressFinder = addressFinder.element;
            var $form = addressFinder.$form;

            var options = $.extend({
                transitionDuration: 400,
                transitionEndCallback: function() {
                    $form.validation('reposition');
                }
            }, options);

            // Hide the address-finder.
            $(".js-address-finder, .js-address-select", $addressFinder)
                .addClass("is-collapsed", options.transitionDuration, function() {
                    $(this).addClass("is-hidden");
                    options.transitionEndCallback();
                });
            
            // Show manual entry fields.
            $(".js-manual-entry", $addressFinder)
                .removeClass("is-hidden")
                .removeClass("is-collapsed", options.transitionDuration, options.transitionEndCallback);

            // Update address finder state.
            addressFinder.addressFinderState("manual_entry");

            // Trigger manualFieldsVisible event.
            $addressFinder.trigger("manualFieldsVisible.addressFinder");
        },
        showAddressFinder: function(options) {
            // Switch to address finder.
            var addressFinder = this;
            var $addressFinder = addressFinder.element;
            var $form = addressFinder.$form;

            var options = $.extend({
                transitionDuration: 400,
                transitionEndCallback: function() {
                    $form.validation('reposition');
                }
            }, options);

            // Hide manual entry fields.
            $(".js-manual-entry", $addressFinder)
                .addClass("is-collapsed", options.transitionDuration, function() {
                    $(this).addClass("is-hidden");
                    options.transitionEndCallback();
                });

            // Show the address finder.
            $(".js-address-finder", $addressFinder)
                .removeClass("is-hidden")
                .removeClass("is-collapsed", options.transitionDuration, options.transitionEndCallback);

            // Update address finder state.
            if (  $(".js-address-select", $addressFinder).hasClass("is-collapsed") ) {
                addressFinder.addressFinderState("postcode_lookup");
            } else {
                addressFinder.addressFinderState("address_selection");
            }

            // Trigger addressFinderVisible event.
            $addressFinder.trigger("addressFinderVisible.addressFinder");
        },
        setI18nFieldLabels: function(countryCode) {
            // Set international field labels.
            var addressFinder = this;
            var $addressFinder = addressFinder.element;

            if ( countryCode == "GB" ) {
                // Show UK field labels.
                $(".field__input[data-label-gb]", $addressFinder).each(function() {
                    $(this).attr("placeholder", $(this).data("label-gb"));
                    $(this)
                        .parent()
                        .find(".field__label")
                        .text($(this).data("label-gb"));
                });
            } else {
                // Show international field labels.
                $(".field__input[data-label-international]", $addressFinder).each(function() {
                    $(this).attr("placeholder", $(this).data("label-international"));
                    $(this)
                        .parent()
                        .find(".field__label")
                        .text($(this).data("label-international"));
                });
            }
        },
        showHideEuVatField: function(countryCode) {
            // Show or hide the EU VAT field.
            var addressFinder = this;
            var $addressFinder = addressFinder.element;
            var $form = addressFinder.$form;
            var euCountryCodes = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SI","SK","ES","SE","GB"];

            var transitionEndCallback = function() {
                $form.validation('reposition');
            };
            
            if( $.inArray(countryCode, euCountryCodes) > -1 && countryCode != "GB" ) {
                $(".eu-vat-number", $addressFinder)
                    .removeClass("is-hidden")
                    .removeClass("is-collapsed", 600, transitionEndCallback);
            } else {
                $(".eu-vat-number", $addressFinder).addClass("is-collapsed", 600, function() {
                    $(this).addClass("is-hidden");
                    transitionEndCallback();
                });
            }
        },
        addressFinderState: function(state) {
            // Get/Set address finder's visual state using the hidden form variable.
            var addressFinder = this;
            var $addressFinder = addressFinder.element;

            if ( state === undefined ) {
                // Return address finder's visual state.
                return $(".js-address-finder-state", $addressFinder).val();
            } else {
                // Update address finder's visual state.
                $(".js-address-finder-state", $addressFinder).val(state);
            }
        }
    });
}(jQuery));
