(function () {
  'use strict';

  function getCookie(name) {
    var pairs = document.cookie.split("; ");

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split("=");

      if (pair[0] == name || pair[0] == escape(name)) {
        return unescape(pair[1]);
      }
    }

    return null; // if no match return null
  }
  function deleteCookie(name) {
    // Set cookie expiry yesterday
    setCookie(name, null, -1);

    if (getCookie(name)) {
      return false;
    } else {
      return true;
    }
  }
  function setCookie(name, value, days, secure) {
    var today = new Date();
    var newCookie = new String();
    var deliminator = new String("; ");
    var expiry = new Date(today.getTime() + days * 24 * 60 * 60 * 1000); // plus days

    newCookie = escape(name) + "=" + escape(value) + deliminator + "path=/";

    if (days) {
      newCookie += deliminator + "expires=" + expiry.toGMTString();
    }

    if (secure === true) {
      newCookie += deliminator + "secure";
    }

    document.cookie = newCookie;

    if (getCookie(name) == value) {
      return true;
    } else {
      return false;
    }
  }

  function popUpLink(url, width, height) {
    winOptions = "WIDTH=" + width + ",HEIGHT=" + height + ",scrollbars,resizable";
    newWindow = window.open(url, "new_window", winOptions);
    newWindow.focus();
    return false;
  }

  function urlDataGet(data, name) {
    var a = new Array();
    var b = new Array();

    if (data != "") {
      var a = data.split("&");
    }

    for (var i = 0; i < a.length; i++) {
      b = a[i].split("=");

      if (name == decodeURIComponent(b[0].replace(/\+/g, " "))) {
        return decodeURIComponent(b[1].replace(/\+/g, " "));
      }
    }

    return null;
  }

  function urlGet(url, name) {
    var re = /([^\?\#]+)\??([^\#]*)/;
    re.exec(url);
    var queryString = RegExp.$2;
    return urlDataGet(queryString, name);
  }

  function checkReferrer() {
    var source = trackingSource();
    var media = trackingMedia();
    var campaign = trackingCampaign();
    var kw = trackingKeyword();
    var domain = referralDomain();
    var term = referralSearchTerms();

    if (source || domain) {
      var now = new Date();
      var datetime = now.getUTCFullYear() + "-" + parseInt(now.getUTCMonth() + 1) + "-" + now.getUTCDate() + " " + now.getUTCHours() + ":" + now.getUTCMinutes() + ":" + now.getUTCSeconds();

      if (getCookie("tracking_history")) {
        var tracking_history = JSON.parse(getCookie("tracking_history"));
      } else {
        var tracking_history = new Array();
      }

      var track = new Object();
      track.datetime = datetime;

      if (source) {
        track.source = source;
      }

      if (campaign) {
        track.campaign = campaign;
      }

      if (kw) {
        track.kw = kw;
      }

      if (media) {
        track.media = media;
      }

      if (domain) {
        track.domain = domain;
      }

      if (term) {
        track.term = term;
      }

      while (tracking_history.length > 10 || JSON.stringify(tracking_history).length > 1024) {
        tracking_history.shift();
      }

      tracking_history.push(track);
      setCookie("tracking_history", JSON.stringify(tracking_history), 365, true);
    }
  }
  function trackingCampaign() {
    var url = document.location.href;
    var varnames = ["utm_campaign", "campaign"];

    for (var i = 0; i < varnames.length; i++) {
      if (urlGet(url, varnames[i]) != null) {
        return urlGet(url, varnames[i]);
      }
    }

    return null;
  }
  function trackingKeyword() {
    var url = document.location.href;
    var varnames = ["kw", "utm_term", "OVRAW"];

    for (var i = 0; i < varnames.length; i++) {
      if (urlGet(url, varnames[i]) != null) {
        return urlGet(url, varnames[i]);
      }
    }

    return null;
  }
  function trackingMedia() {
    var url = document.referrer;
    var varnames = ["utm_media", "media", "utm_medium", "medium"];

    for (var i = 0; i < varnames.length; i++) {
      if (urlGet(url, varnames[i]) != null) {
        return urlGet(url, varnames[i]);
      }
    }

    return null;
  }
  function trackingSource() {
    var url = document.location.href;
    var varnames = ["utm_source", "source"];

    for (var i = 0; i < varnames.length; i++) {
      if (urlGet(url, varnames[i]) != null) {
        return urlGet(url, varnames[i]);
      }
    }

    return null;
  }
  function referralDomain() {
    var url = document.referrer;
    var re = /([^:]+):\/\/([^:\/]+)(:(\d+))?([^\?]*)([\?](.*))?/;

    if (re.exec(url)) {
      var domain = RegExp.$2;

      if (domain != document.location.hostname) {
        return domain;
      }
    }

    return null;
  }
  function referralSearchTerms() {
    var url = document.referrer;
    var varnames = ["q", "query", "qry", "qt", "ask", "search", "keyword", "word", "p"];

    for (var i = 0; i < varnames.length; i++) {
      if (urlGet(url, varnames[i]) != null) {
        return urlGet(url, varnames[i]);
      }
    }

    return null;
  }

  function getOptionValue(dropdown) {
    var myindex = dropdown.selectedIndex;
    return dropdown.options[myindex].value;
  }

  function setOptionValue(dropdown, value) {
    for (var i = 0; i < dropdown.options.length; i++) {
      if (dropdown.options[i].value == value) {
        dropdown.selectedIndex = i;
        break;
      }
    }
  }

  function getRadioValue(radio_name, form) {
    for (var i = 0; i < form.elements.length; i++) {
      var elmt = form.elements[i];

      if (elmt.name == radio_name && elmt.checked) {
        return elmt.value;
      }
    }

    return null;
  }

  function setRadioValue(radio_name, form, value) {
    for (var i = 0; i < form.elements.length; i++) {
      var elmt = form.elements[i];

      if (elmt.name == radio_name && elmt.value == value) {
        elmt.checked = true;
        return true;
      }
    }

    return false;
  }

  function urlDataSet(data, name, value) {
    var list = new Array();
    var a = new Array();
    var b = new Array();
    var c = new Array();

    if (data != "") {
      var a = data.split("&");
    }

    for (var i = 0; i < a.length; i++) {
      b = a[i].split("=");
      var n = decodeURIComponent(b[0].replace(/\+/g, " "));
      var v = decodeURIComponent(b[1].replace(/\+/g, " "));
      c[n] = v;
    }

    c[name] = value;

    for (var key in c) {
      list.push(encodeURIComponent(key) + "=" + encodeURIComponent(c[key]));
    }

    data = list.join("&");
    return data;
  }

  function urlSet$1(url, name, value) {
    var re = /([^\?\#]+)(?:\?([^\#]*))?(\#.*)?/;
    re.exec(url);
    var path = RegExp.$1;
    var queryString = RegExp.$2;
    var fragment = RegExp.$3;
    var url = path + "?" + urlDataSet(queryString, name, value) + fragment;
    return url;
  }

  function tradeDoubler() {
    var url = document.location.href;

    if (urlGet(url, "tduid") != null) {
      setCookie("TRADEDOUBLER", urlGet(url, "tduid"), 365, true);
    }
  }

  function handleViewportResize() {
    // ======================================================================
    // When viewport width changes:
    // - Update global isDesktop variable
    // - Trigger custom "viewportWidthResize" event
    // ======================================================================
    var viewportWidth = $(window).width();
    window.isDesktop = window.matchMedia("(min-width: 800px)").matches;
    $(window).on("resize", function () {
      if (viewportWidth !== $(window).width()) {
        viewportWidth = $(window).width();
        window.isDesktop = window.matchMedia("(min-width: 800px)").matches;
        $(this).trigger("viewportWidthResize");
      }
    });
  }

  function navbarSearch() {
    // ======================================================================
    // For small mobile screens, shorten the search placeholder text.
    // ======================================================================
    var $searchForm = $(".js-navbar-search");
    var $searchInput = $(".js-navbar-search-input");

    function updatePlaceholder() {
      // use short placeholder for viewports under 400px, otherwise use long placeholder
      if (window.matchMedia("(max-width: 400px)").matches) {
        $searchInput.attr("placeholder", $searchInput.data("placeholder-short"));
      } else {
        $searchInput.attr("placeholder", $searchInput.data("placeholder-long"));
      }
    }

    $(window).on("viewportWidthResize", function () {
      updatePlaceholder();
    });
    updatePlaceholder(); // ======================================================================
    // 'Populated' state.
    // ======================================================================

    $searchInput.on("input", function () {
      // On input, set the populated state.
      setIsPopulatedState();
    });

    function setIsPopulatedState() {
      // If search input field is not empty, show the form's populated state.
      if ($searchInput.val() !== "") {
        $searchForm.addClass("is-populated");
      } else {
        $searchForm.removeClass("is-populated");
      }
    }

    setIsPopulatedState();
  }

  function navbarMenus() {
    // ======================================================================
    // All Categories A-Z dropdown menu (desktop-view).
    // ======================================================================
    $(".js-category-menu-control").on("click", function (event) {
      var $menu = $(".js-category-menu");

      if ($(this).hasClass("is-active")) {
        // Close the dropdown menu.
        $(this).removeClass("is-active");
        $menu.removeClass("is-active");
      } else {
        // Open the dropdown menu.
        $(".navbar-account-menu").removeClass("is-active"); // Insert HTML for the category menu.

        if ($menu.hasClass("is-loading")) {
          generateCategoryMenu($menu, function () {
            $menu.removeClass("is-loading");
          });
        }

        $(this).addClass("is-active");
        $menu.addClass("is-active");
      }

      event.stopPropagation();
    });
    $(document).on("keyup", function (event) {
      // When Escape key is pressed, close active menus.
      if (isDesktop && event.keyCode == 27) {
        $(".navbar-account-menu, .js-category-menu-control, .js-category-menu").removeClass("is-active").blur();
      }
    });
    $("body").on("click", function () {
      // When clicking outside dropdown, close active menus.
      if (isDesktop) {
        $(".js-category-menu-control, .js-category-menu").removeClass("is-active");
      }
    });
  }
  function generateCategoryMenu($element, callback) {
    // Generate & insert HTML for the A-Z category menu into the given element.
    // Fetch data for the category menu.
    $.ajax({
      url: "/category-menu-1.0.0.json",
      cache: true,
      async: true,
      dataType: "json",
      success: function success(data) {
        var $templateCategoryMenuItem = $(".template.js-template-category-menu-item");
        var $container = $element.find(".js-category-menu-container");
        $container.empty();
        $.each(data.categories, function (index, category) {
          var $categoryMenuItem = $templateCategoryMenuItem.clone().removeClass("template");
          $categoryMenuItem.attr("href", category.url);
          $categoryMenuItem.find(".js-category-menu-item-img").attr({
            "src": category.image,
            "alt": category.title
          });
          $categoryMenuItem.find(".js-category-menu-item-title").text(category.title);
          $container.append($categoryMenuItem);
        });
        return callback();
      }
    });
  }

  function mobileNav() {
    // ======================================================================
    // Mobile navigation.
    // ======================================================================
    var $mobileMenu = $(".js-mobile-menu");
    var $mobileMenuButton = $(".js-mobile-menu-button");
    var eventType;
    var dragging = false; // Use touchend event if available instead of click.

    var isTouch = "ontouchstart" in window || navigator.msMaxTouchPoints;

    if (isTouch) {
      eventType = "touchend";
    } else {
      eventType = "click";
    }

    function showMenu() {
      // Show mobile navigation menu
      $mobileMenu.removeClass("is-hidden");
      $mobileMenu.get(0).offsetHeight;
      $mobileMenu.addClass("is-active");
      $("[data-menu-id='home']", $mobileMenu).addClass("is-active");
      $("body").addClass("no-scroll");
    }

    function hideMenu() {
      // Hide mobile navigation menu.
      $mobileMenu.removeClass("is-active");
      $(".js-mobile-sub-menu", $mobileMenu).removeClass("is-active");
      $("body").removeClass("no-scroll");
      $mobileMenu.one("transitionend webkitTransitionEnd oTransitionEnd", function () {
        $(this).addClass("is-hidden");
      });
    }

    $mobileMenuButton.on(eventType, function (event) {
      showMenu();
    });
    $(".js-mobile-menu-close-control", $mobileMenu).on(eventType, function (event) {
      hideMenu();
    }); // Sets touchmove event listeners to passive (see https://web.dev/uses-passive-event-listeners/)

    jQuery.event.special.touchmove = {
      setup: function setup(_, ns, handle) {
        this.addEventListener("touchmove", handle, {
          passive: !ns.includes("noPreventDefault")
        });
      }
    }; // Mobile menu item delegated event handlers.

    $mobileMenu.on("touchmove", ".js-mobile-menu-item", function (event) {
      dragging = true;
    }).on(eventType, ".js-mobile-menu-item", function (event) {
      if (!dragging) {
        var menuId = $(this).data("show-menu"); // Switch menus for menu items with a sub-menu/target data-attribute.
        // A-Z category menu.

        if (menuId == "all-categories") {
          // Insert HTML for the category menu.
          var $mobileCategoryMenu = $(".js-mobile-menu-categories");

          if ($mobileCategoryMenu.hasClass("is-loading")) {
            generateCategoryMenu($mobileCategoryMenu, function () {
              $mobileCategoryMenu.removeClass("is-loading");
            });
          }
        }

        $(".js-mobile-sub-menu", $mobileMenu).removeClass("is-active").filter("[data-menu-id='" + menuId + "']").addClass("is-active");
      }

      dragging = false;
    }); // When Escape key is pressed close active menu.

    $(document).on("keyup", function (event) {
      if (!isDesktop && event.keyCode == 27) {
        hideMenu();
      }
    });
  }

  function navbarSticky() {
    // ======================================================================
    // Show sticky website navbar when user scrolls up.
    // ======================================================================
    if ($(".js-sticky-navbar").length > 0) {
      var lastScrollTop = 0;
      var threshold = -2;
      window.addEventListener("scroll", function (event) {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop - lastScrollTop < threshold) {
          // Scrolled up past the threshold - show the navbar.
          $(".js-sticky-navbar").addClass("is-fixed");
        }

        if (scrollTop > lastScrollTop || scrollTop <= 0 || $(":target").hasClass("anchor-target")) {
          // Scrolled down, at the top of page, or visiting an information page anchor - hide the navbar.
          $(".js-sticky-navbar").removeClass("is-fixed");
        } // For mobile negative scrolling.


        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
      }, false);
    }
  }

  function searchAutosuggest() {
    // ========================================================================
    // Search Autosuggest.
    // ========================================================================
    var $autoSuggest = $(".js-search-autosuggest"); // Check the markup is present for the autosuggest feature, otherwise do nothing.
    // (this can be removed when autocomplete search is rolled out universally)

    var $searchInput = $(".js-navbar-search-input");
    var $autoSuggestResults = $(".js-search-autosuggest-results");
    var $searchForm = $(".js-navbar-search");
    var timeout;
    $searchInput.on('input', function (event) {
      // Make an AJAX request to get the results.
      var query = $(this).val();

      if (timeout) {
        // Clear the timeout, if it has been already set.
        clearTimeout(timeout);
      }

      timeout = setTimeout(function () {
        // Make the AJAX request after a 350ms delay to limit the number of requests.
        if (query.length > 0) {
          autoSuggestFetch(query);
        } else {
          // Hide the auto-suggest results.
          $autoSuggest.removeClass("is-active");
        } // Store the input value so it can be re-inserted later.


        $searchInput.data("query", $searchInput.val());
      }, 350);
    }).on("blur", function (event) {
      // Hide the autosuggest results.
      $autoSuggest.removeClass("is-active");
    }).on("focus", function (event) {
      // Show the autosuggest results, if there are any.
      if ($autoSuggestResults.children().length > 0) {
        $autoSuggest.addClass("is-active");
      }
    });
    $autoSuggestResults.on("mousedown", function (event) {
      // Prevent blur when results are clicked on.
      event.preventDefault();
    });
    $autoSuggestResults.on("click", ".js-autosuggest-result", function (event) {
      // Delegated click handler for selecting an autosuggest result.
      event.preventDefault();
      var value = $(this).data("value");
      $autoSuggestResults.children().removeClass("is-active");
      $(this).addClass("is-active");
      $searchInput.val(value).focus();
      $searchForm.submit();
    });
    $searchInput.on("keydown", function (event) {
      // Register keydown event on the result.
      var index = $autoSuggestResults.children(".is-active").index();
      var resultCount = $autoSuggestResults.children().length;

      switch (event.keyCode) {
        case 27:
          // Escape key pressed – close autosuggest results.
          $autoSuggest.removeClass("is-active");
          break;

        case 13:
          // Enter key pressed - select the result.
          if ($autoSuggest.hasClass("is-active")) {
            if ($(".js-autosuggest-result.is-active").length == 1) {
              // There is an active result, so select it.
              $(".js-autosuggest-result.is-active").trigger("click");
              event.preventDefault();
              return false;
            }
          }

          break;

        case 40:
          // ↓ key pressed.
          if (resultCount > 0) {
            // There are autosuggest results.
            if ($searchInput[0].selectionStart == $searchInput.val().length) {
              // Caret position is at the end of the input field.
              event.preventDefault();

              if (index + 1 != resultCount) {
                // There is a next result, so select it.
                $autoSuggestResults.children().removeClass("is-active");
                var $nextResult = $autoSuggestResults.children().eq(index + 1);
                $searchInput.val($nextResult.data("value"));
                $nextResult.addClass("is-active");
              }
            }
          }

          break;

        case 38:
          // ↑ key pressed.
          if (resultCount > 0) {
            // There are autosuggest results.
            if ($searchInput[0].selectionStart == $searchInput.val().length) {
              // Caret position is at the end of the input field.
              $autoSuggestResults.children().removeClass("is-active");

              if (index == 0) {
                // There is no previous result, reset input field to the original query value.
                event.preventDefault();
                $searchInput.val($searchInput.data("query"));
              } else if (index > 0) {
                // There is a previous result, so select it.
                event.preventDefault();
                var $prevResult = $autoSuggestResults.children().eq(index - 1);

                if ($prevResult.length > 0) {
                  $searchInput.val($prevResult.data("value"));
                  $prevResult.addClass("is-active");
                }
              }
            }
          }

          break;
      }
    });

    function autoSuggestFetch(query) {
      // Quick Entry form – Make AJAX request to fetch auto-suggest results.
      return $.ajax({
        url: "/tcl/search-autosuggest-1.1.0",
        dataType: "json",
        data: {
          query: query
        },
        success: function success(response) {
          $autoSuggestResults.empty();

          if (response.data && response.data.results && response.data.results.length > 0) {
            // Add auto-suggest results to the page.
            $.each(response.data.results, function (index, result) {
              var resultSearchTerm = result.search_term;
              var resultTitleHTML = result.title_html;
              var resultImage = result.image_url;
              var resultDescription = result.description;
              var manufacturerImage = result.manufacturer_image_url;
              var $result = $(".template.js-autosuggest-result").clone();
              $result.removeClass("template");
              $result.data("value", resultSearchTerm);
              $result.find(".js-autosuggest-result-title").html(resultTitleHTML);

              if (resultImage) {
                $result.find(".js-autosuggest-result-image").addClass("has-image");
                $result.find(".js-autosuggest-result-image img").attr("src", resultImage);
                $result.find(".js-autosuggest-result-image img").addClass("is-product-image");
              } else {
                $result.find(".js-autosuggest-result-image img").remove();
              }

              if (resultDescription) {
                $result.find(".js-autosuggest-result-description").html(resultDescription);
              } else {
                $result.find(".js-autosuggest-result-description").remove();
              }

              if (manufacturerImage) {
                $result.find(".js-autosuggest-result-aside-image img").attr("src", manufacturerImage);
              } else {
                $result.find(".js-autosuggest-result-aside").remove();
              }

              $result.appendTo($autoSuggestResults);
              $autoSuggest.addClass("is-active");
            });
          } else {
            $autoSuggest.removeClass("is-active");
          }
        }
      });
    }
  }

  function navbarBasketUpdate() {
    // ======================================================================
    // Basket Update AJAX.
    //
    // Called on page load and when the user adds or removes an item from the basket.
    // ======================================================================
    var basketUpdateAJAX;
    var $basket = $(".js-navbar-basket");
    var $basketTotal = $(".js-navbar-basket-total");
    var $basketProductCount = $(".js-navbar-basket-count");
    var $accountMenu = $(".js-navbar-account");
    var nextURL = window.location.href;
    var signInNextURL = $accountMenu.data("sign-in-next-url") || nextURL;
    var signInURL = urlSet("/tcl/user/sign-in", "next_url", signInNextURL);
    $(".js-navbar-sign-in-link").attr("href", signInURL);
    var registerNextURL = $accountMenu.data("register-next-url") || nextURL;
    var registerURL = urlSet("/tcl/user/register", "next_url", registerNextURL);
    $(".js-navbar-register-link").attr("href", registerURL);
    var signOutNextURL = $accountMenu.data("sign-out-next-url") || nextURL;
    $("body").on("basket-update", function () {
      if (typeof basketUpdateAJAX != "undefined") {
        // Cancel existing AJAX call.
        basketUpdateAJAX.abort();
      }

      basketUpdateAJAX = $.ajax({
        url: "/tcl/basket-update-1.0.0.json",
        cache: false,
        async: true,
        dataType: "json",
        success: function success(data) {
          // Update basket info shown in website header.
          $basketTotal.html(data.total);
          $basketProductCount.html(data.productCount);

          if (data.signedIn) {
            // Signed-In user.
            // Display user's first name in navbar.
            $(".js-navbar-account-name").html(data.customerName); // Display user's account menu.

            $accountMenu.addClass("is-signed-in").attr("tabindex", "0"); // Display the in-progress orders menu item, if any.

            if (parseInt(data.orders.inProgress) > 0) {
              $(".js-navbar-account-in-progress-orders").removeClass("is-hidden").find(".badge").html(data.orders.inProgress);
            } // Insert the 'Open Orders' menu count.


            $(".js-navbar-account-open-orders").find(".badge").html(data.orders.open);
            var $accountMenuSignOutForm = $(".js-navbar-sign-out-form");
            $accountMenuSignOutForm.find("input[name='next_url']").attr("value", signOutNextURL); // Register validation plugin on navbar user account menu's sign out form.

            $accountMenuSignOutForm.validation({
              qtip: {
                position: {
                  my: "right center",
                  at: "right center",
                  viewport: $(window),
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
                  classes: "navbar-account-menu__message-area message-area alert",
                  after: $(".navbar")
                },
                error: {
                  classes: "navbar-account-menu__message-area message-area error",
                  after: $(".navbar")
                },
                notify: {
                  classes: "navbar-account-menu__message-area message-area notify",
                  after: $(".navbar")
                }
              }
            }); // Set up mobile navigation menu.
            // Update signed-in welcome message.

            $(".js-mobile-menu-welcome").html("Hello <strong>" + data.customerName + "</strong>."); // Mobile navigation menu, show signed-in menu items.

            $(".js-mobile-menu-signed-in-controls").removeClass("is-hidden"); // If 1-Click enabled in response, show 1-Click Settings menu item.

            if (data.oneClickCheckout === true) {
              $(".js-mobile-menu-1-click").removeClass("is-hidden");
            }

            var $mobileMenuSignOutForm = $("<form>").attr({
              action: "/tcl/user/sign-out",
              method: "POST",
              "class": "form-action-link navbar-mobile-menu__item"
            }).append($("<input>").attr({
              "class": "form-action-link__input",
              type: "submit",
              value: "Sign Out"
            })).append($("<input>").attr({
              type: "hidden",
              name: "next_url",
              value: signOutNextURL
            })); // Call validation("destroy") on any existing sign out forms in the mobile menu.

            $(".js-mobile-menu-sign-out .form-action-link").validation("destroy");
            $(".js-mobile-menu-sign-out").html($mobileMenuSignOutForm); // Register validation plugin on mobile menu's sign out form.

            $mobileMenuSignOutForm.validation({
              qtip: {
                position: {
                  my: "right center",
                  at: "right center",
                  viewport: $(".js-mobile-menu"),
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
                  classes: "navbar-mobile-menu__message-area message-area alert",
                  after: $(".navbar-mobile-menu__header")
                },
                error: {
                  classes: "navbar-mobile-menu__message-area message-area error",
                  after: $(".navbar-mobile-menu__header")
                },
                notify: {
                  classes: "navbar-mobile-menu__message-area message-area notify",
                  after: $(".navbar-mobile-menu__header")
                }
              }
            });
          } else {
            // Signed-Out user.
            $accountMenu.removeClass("is-signed-in");
            var $signInLink = $("<a>").attr({
              "class": "navbar-account-menu__link",
              href: signInURL
            }).append("Sign In");
            var $registerLink = $("<a>").attr({
              "class": "navbar-account-menu__link",
              href: registerURL
            }).append("Register"); // Mobile navigation menu guest welcome message.

            $(".js-mobile-menu-welcome").empty().append("Hello. ").append($signInLink.clone()).append(" or ").append($registerLink.clone()).append("."); //  Not signed in, so hide My Account-related menu items.

            $(".js-mobile-menu-signed-in-controls").addClass("is-hidden");
          }

          $accountMenu.removeClass("is-loading");
          $basket.removeClass("is-loading");
        }
      });
    }); // ======================================================================
    // Trigger 'basket-update' event if the basket is shown on this page
    // ======================================================================

    if ($basketTotal.length > 0 || $basketProductCount.length > 0) {
      $("body").trigger("basket-update");
    }
  }

  function handlePluginsReady() {
    // ======================================================================
    // pluginsReady event handler
    // ======================================================================
    $("body").on("pluginsReady", function () {
      // enable field components that have been temporarily disabled until the pluginsReady event is fired.
      $(".field--enable-on-pluginsready :input[disabled]").prop("disabled", false);
      $(".field--enable-on-pluginsready").removeClass("field--disabled").removeClass("field--enable-on-pluginsready"); // Enable add-to-basket quantity controls.

      $(":input[disabled]", ".js-add-to-basket").prop("disabled", false);
      $(this).removeClass("plugins-loading");
    });
  }

  function notificationBanner() {
    // ======================================================================
    // Notification Banner.
    // ======================================================================
    // Timestamp that changes every 10 minutes.
    var cacheTimestamp = Math.round(new Date().getTime() / 1000 / 600);
    $.getJSON(urlSet("/notification-banner.json", "_", cacheTimestamp)).success(function (data) {
      var message_id = data.message_id;
      var message = data.message; // Find last dismissed message id.

      var dismissed_message_id = Cookies.get("notification_dismissed");
      var $notification_banner = $(".js-notification-banner");

      if (dismissed_message_id != message_id && message != "") {
        // Notification not dismissed
        $(".js-notification-banner-message", $notification_banner).html(message); // Set cached notification message to avoid cumulative layout shift on load

        if (window.localStorage) {
          localStorage.setItem("notification_banner_message", message);
        }

        $(".js-notification-banner-dismiss", $notification_banner).on("click", function () {
          // On click, hide the notification bar.
          $notification_banner.css("height", $notification_banner.height()).removeClass("is-active");
          $notification_banner.get(0).offsetWidth; // force browser to repaint

          $notification_banner.css("height", "0"); // Set cookie to 'true'

          Cookies.set("notification_dismissed", message_id, {
            expires: 180,
            path: "/",
            secure: true
          }); // Clear cached notification message to avoid cumulative layout shift on load

          if (window.localStorage) {
            localStorage.setItem("notification_banner_message", "");
          }
        });
        $notification_banner.addClass("is-active");
      } else {
        // Notification previously dismissed
        $notification_banner.css("height", "0"); // Clear cached notifition message to avoid cumulative layout shift on load

        if (window.localStorage) {
          localStorage.setItem("notification_banner_message", "");
        }
      }
    });
  }

  function floatingLabels() {
    // ======================================================================
    // Forms - Show/Hide Floating Labels.
    // ======================================================================
    // On focus or blur, apply or remove the field-active class.
    $("body").on("focus", ".field__input", function (event) {
      $(this).closest(".field").addClass("field--active");
    }).on("blur", ".field__input", function (event) {
      $(this).closest(".field").removeClass("field--active");
    }); // On change to an input or textarea, show or hide the floating label.

    $("body").on("keyup keydown blur change cut paste", ".field input.field__input, .field textarea.field__input", function (event) {
      if ($(this).val().length != 0) {
        $(this).closest(".field").addClass("field--show-label");
      } else {
        $(this).closest(".field").removeClass("field--show-label");
      }
    }); // On load, show floating labels for non-empty input or textarea elements.

    $("input.field__input, textarea.field__input", ".field").each(function () {
      if ($(this).val().length != 0) {
        $(this).closest(".field").addClass("field--show-label");
      }
    });
  }

  function displaySpinnerOnSubmit() {
    // ==========================================================================
    // Forms - Change submit button content to an AJAX spinner on submit.
    //         Change submit button content to redirect message and AJAX spinner on redirect.
    //         Restore original content on valid, invalid and error events.
    // ==========================================================================
    $("body").on("submit", "form", function (event) {
      // On submit - Update button content with spinner
      var $buttons = $(this).find("button[type=submit]");
      $buttons.each(function () {
        if ($(this).data("init-html") === undefined) {
          // save inital html content of the button
          $(this).data("init-html", $(this).html());
        } // change button content to a spinner


        $(this).html('<div class="ajax-spinner">');
      });
    }).on("redirect.validation", "form", function (event) {
      // On redirect - Update button content with redirecting message and spinner
      var $buttons = $(this).find("button[type=submit]");
      $buttons.each(function () {
        // change button content to a redirecting message and ajax spinner
        $(this).html('Redirecting&hellip; <div class="ajax-spinner">');
      });
    }).on("valid.validation invalid.validation error.validation", "form", function (event) {
      // On valid,invalid and error validation events - Restore initial content of buttons
      var $buttons = $(this).find("button[type=submit]"); // Restore initial content of the button

      $buttons.each(function () {
        if ($(this).data("init-html") !== undefined) {
          // save inital html content of the button
          $(this).html($(this).data("init-html"));
        }
      });
    });
  }

  function setErrorStateOnInvalidResponse() {
    // ==========================================================================
    // Forms - Remove .field--error classes on submit
    //       - Add .field--error classes on valid and invalid events for invalid fields
    // ==========================================================================
    $("body").on("submit", "form", function (event) {
      $(".field--error", this).removeClass("field--error");
    }).on("valid.validation invalid.validation", "form", function (event) {
      var $form = $(this);

      if (event.response) {
        $.each(event.response.record, function (name, object) {
          // Set .field--error state
          $("[name=" + name + "]", $form).closest(".field").toggleClass("field--error", object.valid === false);
        });
      }
    });
  }

  function productsCookie() {
    // ========================================================================
    // Products Cookie.
    // ========================================================================
    function web_code2product_code(web_code) {
      // Convert web_code to product code.
      return web_code.replace(/dot/g, ".").replace(/slash/g, "/").replace(/dash/g, "-").replace(/plus/g, "+").replace(/_DOT_/g, "DOT").replace(/_SLASH_/g, "SLASH").replace(/_DASH_/g, "DASH").replace(/_PLUS_/g, "PLUS");
    } // If this is a new order add a catalogue.


    Cookies.json = false;

    if (Cookies.get("order_key") == "") {
      productsCookieUpdate("TLCAT", 1);
    } // Update input quantities according to products cookie.


    var products = productsCookieGet();
    $.each(products, function (index, product) {
      $(".js-product-code[value='" + web_code2product_code(product.product_id) + "']", ".js-add-to-basket").closest(".js-add-to-basket").addClass("is-added").find(".js-qty").val(product.qty).data("previous-value", product.qty);
    });

    function productsCookieGet() {
      // Returns an array of product objects from cookie
      var pair;
      Cookies.json = false;
      var products = [];

      if (Cookies.get("products")) {
        $.each(Cookies.get("products").split("%"), function (index, productID_Qty) {
          pair = productID_Qty.split("~");
          products.push({
            product_id: pair[0],
            qty: pair[1]
          });
        });
      }

      return products;
    }

    function productsCookieSet(products) {
      // Takes an array of product objects and sets cookie
      var products_array = [];
      $.each(products, function (index, product) {
        var productID_Qty = product.product_id + "~" + product.qty;
        products_array.push(productID_Qty);
      });
      Cookies.set("products", products_array.join("%"), {
        expires: 30,
        path: "/",
        secure: true
      });
    }

    function productsCookieUpdate(product_id, qty) {
      // Update/Add entry to product cookie
      var products = productsCookieGet();
      var new_product = true; // Update corresponding element in products array

      $.each(products, function (index, product) {
        if (product.product_id == product_id) {
          if (qty == 0) {
            // Remove element from array
            products.splice(index, 1);
          } else {
            // Update element in products array
            products[index].qty = qty;
          } // If product was found, set a new_product flag and break the loop.


          new_product = false;
          return false;
        }
      }); // New Products

      if (new_product && qty != 0) {
        // Add new element in products array
        var new_product = {
          product_id: product_id,
          qty: qty
        };
        products.push(new_product);
      } // Write out products cookie


      productsCookieSet(products);
    }
  }

  function addToBasket() {
    // ========================================================================
    // Add to basket control.
    //
    // Forms for adding products to basket and editing order quantities.
    // Uses AJAX to update basket.
    // ========================================================================
    var focussedInput;

    jQuery.fn.addToBasketInit = function () {
      // Set up validation plugin on form.
      $(this).each(function () {
        var $form = $(this);
        var $validationMessageMarker = $form.closest(".product-table");

        if ($validationMessageMarker.length == 0) {
          $validationMessageMarker = $form.closest(".js-validation-message-marker");
        }

        $form.validation({
          submit: false,
          method: "PUT",
          qtip: {
            position: {
              my: "bottom center",
              at: "top center",
              viewport: $(window),
              container: $form,
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
              before: $validationMessageMarker,
              classes: "qty__message-area message-area error"
            },
            error: {
              before: $validationMessageMarker,
              classes: "qty__message-area message-area error"
            },
            notify: {
              before: $validationMessageMarker,
              classes: "qty__message-area message-area notify"
            }
          }
        });
      });
    }; // Initialise validation plugin for quantity input forms.


    $(".js-add-to-basket").addToBasketInit(); // Form submission event handlers.

    $("body").on("submit", ".js-add-to-basket", function (event) {
      var $form = $(this);

      if ($form.validation("state") === "validation") {
        $form.validation("abort");
      }
    }).on("valid.validation", ".js-add-to-basket", function (event) {
      // Register validation response listener.
      var $addToBasketControl = $(this);
      var $quantity = $addToBasketControl.find(".js-qty");
      var quantity = parseInt($quantity.val());
      var productCode = event.response.record.product_code.value;
      var $addToBasketControls = $('.js-product-code[value="' + productCode + '"]').closest('.js-add-to-basket');
      var isRelatedProduct = $addToBasketControl.closest(".js-related-items").length > 0;
      var $confirmation;
      var data = event.response.data;

      if (String(event.response.record.quantity.value).trim() !== $quantity.val().trim()) {
        // Input qty does not match qty saved - mark form as dirty.
        $addToBasketControls.each(function () {
          $(this).addClass("is-dirty is-added");
        });
      } else if (quantity > 0) {
        // Input quantity value is over zero - set form to populated/valid state.
        $addToBasketControls.each(function () {
          $(this).removeClass("is-dirty").addClass("is-added").find(".js-qty").val(quantity);
        });
      } else {
        // Input quantity value is 0 or empty/NaN - reset form to default state.
        var sellingMultiple = $quantity.data("selling-multiple");
        $addToBasketControls.each(function () {
          $(this).removeClass("is-added is-dirty").find(".js-qty").val(sellingMultiple);
        });
      } // Set a data attribute to record the last saved value.


      $addToBasketControls.each(function () {
        $(this).find(".js-qty").data("previous-value", event.response.record.quantity.value);
      }); // Remove loading class from increment buttons.

      $(".js-increase, .js-decrease", $addToBasketControl).removeClass("is-loading"); // Update basket info in site header.

      $(".js-navbar-basket-total").html(data.basketTotal);
      $(".js-navbar-basket-count").html(data.basketProductCount);

      if (!isRelatedProduct) {
        if ($(".js-template-atb-confirmation").length && data.confirmation.message != "") {
          // Show add-to-basket confirmation.
          $confirmation = showConfirmation($addToBasketControl, data.confirmation);
        } // Remove all other add-to-basket confirmations.


        $(".js-atb-confirmation").not($confirmation).not($(".template .js-atb-confirmation")).find(".atb-confirmation__wrapper").addClass("is-hidden", 500, function () {
          $(this).closest(".js-atb-confirmation").remove();
        });
      }
    }).on("invalid.validation", ".js-add-to-basket", function (event) {
      // Input quantity not valid.
      var $form = $(this); // Remove loading class from increment buttons.

      $(".js-increase, .js-decrease", $form).removeClass("is-loading");
    });

    function showConfirmation($form, data) {
      // Show add-to-basket confirmation.
      var $confirmation;
      var $product = $form.closest(".js-product");

      if ($form.data("viewport") === "mobile") {
        $confirmation = $(".js-template-atb-confirmation-mobile").find(".js-atb-confirmation").clone();
      } else {
        $confirmation = $(".js-template-atb-confirmation").find(".js-atb-confirmation").clone();
      }

      var $relatedItems = $confirmation.find(".js-related-items");

      if ($relatedItems.length && data.related_items != "") {
        $relatedItems.html(data.related_items);
      } else {
        $relatedItems.remove();
      }

      if ($product.next().is(".js-atb-confirmation")) {
        // Replace existing confirmation (without transition effects).
        $product.next().replaceWith($confirmation);
        $confirmation.find(".atb-confirmation__wrapper").removeClass("is-hidden");
      } else {
        // Add new confirmation.
        $product.after($confirmation);
        $confirmation.find(".atb-confirmation__wrapper").removeClass("is-hidden", 500);
      }

      $confirmation.find(".js-atb-message").html(data.message); // Register validation plugin for newly generated controls.

      $(".js-add-to-basket", $confirmation).addToBasketInit();
      return $confirmation;
    } // ========================================================================
    // Quantity Increment/Decrement buttons.
    // ========================================================================


    var interval;
    var timeout;
    var autoIncrementing = false;

    function restrictNumeric(event) {
      // Restrict Keypresses to numeric and select non-printable keys.
      var keyCode = event.which;

      if (!event.shiftKey && keyCode >= 48 && keyCode <= 57 || keyCode >= 96 && keyCode <= 105) {
        // Numeric key
        return true;
      } else if (event.controlKey || event.metaKey) {
        // allow Ctrl+? & Command+? key combinations
        return true;
      } else if ($.inArray(keyCode, [46, 8, 9, 27, 13, 110, 35, 36, 37, 38, 39, 40]) !== -1) {
        // allow select non-printable keys: backspace, delete, tab, escape, home, end, left, right, down, up
        return true;
      } else {
        return false;
      }
    }

    function autoIncrementStart($input, increment, min, max) {
      // Increase input value by specified increment (optionally resticted by min & max values)
      // After 400ms increment value every 200ms until interval is cleared.
      var oldValue = parseInt($input.val());

      if (isNaN(oldValue)) {
        oldValue = 0;
      }

      var newValue = oldValue + increment;

      if ((min === undefined || newValue >= min) && (max === undefined || newValue <= max)) {
        // Increment input value.
        $input.val(parseInt(newValue)).trigger("change"); // Auto-increment after delay.

        autoIncrementing = true;
        window.clearTimeout(timeout);
        timeout = window.setTimeout(function () {
          window.clearInterval(interval);
          interval = window.setInterval(function () {
            oldValue = parseInt($input.val());

            if (isNaN(oldValue)) {
              oldValue = 0;
            }

            newValue = oldValue + increment;

            if ((min === undefined || newValue >= min) && (max === undefined || newValue <= max)) {
              $input.val(parseInt(newValue)).trigger("change");
            } else {
              // Stop auto incrementing.
              autoIncrementStop();
            }
          }, 200);
        }, 400);
      }
    }

    function autoIncrementStop() {
      // Clear timers and select input text.
      window.clearTimeout(timeout);
      window.clearInterval(interval);
      autoIncrementing = false;
    } // On click, select all text and store focussed input.


    var isTouch = "ontouchstart" in window || navigator.msMaxTouchPoints;
    $("body").on("click", ".js-add-to-basket .js-qty", function () {
      if (!isTouch && !$(this).is(focussedInput)) {
        $(this).textrange("set", "all");
      }

      focussedInput = $(this);
    }).on("blur", ".js-add-to-basket .js-qty", function () {
      // On Blur: reset the stored focussed input.
      focussedInput = undefined;
    }).on("keydown", ".js-add-to-basket .js-qty", restrictNumeric).on("keydown", ".js-add-to-basket .js-qty", function (event) {
      var sellingMultiple = parseInt($(this).attr("data-selling-multiple") || 1);

      if (event.which === 40) {
        // Down arrow key
        var increment = -1 * sellingMultiple;
      } else if (event.which === 38) {
        // Up arrow key
        var increment = sellingMultiple;
      } else {
        // Don't auto increment
        return true;
      }

      if (!autoIncrementing) {
        autoIncrementStart($(this), increment, 0);
      }

      return false;
    }).on("keyup", ".js-add-to-basket .js-qty", function (event) {
      var $input = $(this);
      var $form = $input.closest(".js-add-to-basket");
      var value = $input.val();
      var previousValue = $input.data("previous-value");

      if (value.trim() !== String(previousValue).trim()) {
        // Quantity value has changed since previous save - show 'Update' button.
        $form.addClass("is-dirty");
      }

      if (autoIncrementing) {
        autoIncrementStop();
        return false;
      }
    }); // Use touch feature detection to set which pointer-events to use.

    var pointerEvents = {
      down: "mousedown",
      up: "mouseup"
    };

    if (isTouch) {
      pointerEvents.down = "touchstart";
      pointerEvents.up = "touchend";
    }

    $("body").on(pointerEvents.down, ".js-add-to-basket .js-increase, .js-add-to-basket .js-decrease", function (event) {
      var $target = $(this);
      var $form = $target.closest(".js-add-to-basket");
      var $input = $form.find(".js-qty");
      var sellingMultiple = $input.data("selling-multiple") || 1;
      var increment; // Cancel scheduled form submssion.

      var timeout = $form.data("submit-timeout");
      window.clearTimeout(timeout); // Abort any in-progress validation requests.

      if ($form.validation("state") === "validating") {
        $form.validation("abort");
      } // Remove button loading state.


      $(".js-add-to-basket .js-increase, .js-add-to-basket .js-decrease").removeClass("is-loading");

      if (event.type === "touchstart") {
        if ($target.is(".js-decrease")) {
          // touchstart event on the decrease qty button.
          increment = -1 * sellingMultiple;
        } else if ($target.is(".js-increase")) {
          // touchstart event on the increase qty button.
          increment = sellingMultiple;
        }
      } else {
        if (event.which === 1 && $target.is(".js-decrease")) {
          // Left mouse button event on the decrease qty button.
          increment = -1 * sellingMultiple;
        } else if (event.which === 1 && $target.is(".js-increase")) {
          // Left mouse button event on the increase qty button.
          increment = sellingMultiple;
        }
      }

      if (!autoIncrementing) {
        autoIncrementStart($input, increment, 0);
      }
    }).on(pointerEvents.up + " mouseout", ".js-add-to-basket .js-increase, .js-add-to-basket .js-decrease", function () {
      // Stop auto-incrementing quantity on button release.
      if (autoIncrementing) {
        autoIncrementStop();
      }
    }).on(pointerEvents.up, ".js-add-to-basket .js-increase, .js-add-to-basket .js-decrease", function () {
      // Abort any in-progress validation requests and resubmit form.
      var $button = $(this);
      var $form = $button.closest(".js-add-to-basket"); // Cancel scheduled form submssion.

      var timeout = $form.data("submit-timeout");
      window.clearTimeout(timeout); // Abort any in-progress validation requests.

      if ($form.validation("state") === "validating") {
        $form.validation("abort");
      } // Remove button loading state.


      $(".js-add-to-basket .js-increase, .js-add-to-basket .js-decrease").removeClass("is-loading"); // Schedule form submission.

      timeout = window.setTimeout(function () {
        // Update the pressed increment button to show loading state.
        $button.addClass("is-loading");
        $form.submit();
      }, 650);
      $form.data("submit-timeout", timeout);
    }); // ======================================================================
    // Add-to-basket confirmation.
    //
    // Shows confirmation message and related items when user adds to basket.
    // ======================================================================
    // Dismiss button - remove confirmation on click.

    $("body").on("click", ".js-atb-close", function (event) {
      $(".js-atb-confirmation").not($(".template .js-atb-confirmation")).find(".atb-confirmation__wrapper").addClass("is-hidden", 500, function () {
        $(this).closest(".js-atb-confirmation").remove();
      });
    }); // Close add-to-basket confirmation on 'esc' keydown.

    $(document).on("keydown", function (event) {
      if (event.keyCode === 27) {
        $(".js-atb-confirmation").not($(".template .js-atb-confirmation")).find(".atb-confirmation__wrapper").addClass("is-hidden", 500, function () {
          $(this).closest(".js-atb-confirmation").remove();
        });
      }
    });
  }

  function priceDrops() {
    // Price Drops
    function formatPromoTimeRemaining(secondsLeft) {
      var timeRemaining; // do some time calculations

      var days = parseInt(secondsLeft / 86400);
      secondsLeft = secondsLeft % 86400;
      var hours = parseInt(secondsLeft / 3600);
      secondsLeft = secondsLeft % 3600;
      var minutes = parseInt(secondsLeft / 60);
      var seconds = parseInt(secondsLeft % 60); // format countdown string + set tag value

      if (days > 1) {
        // show days only
        timeRemaining = days + " days";
      } else if (days == 1) {
        // show days only
        timeRemaining = days + " day";
      } else if (hours >= 10) {
        // show hours and minutes
        timeRemaining = hours + "h, " + minutes + "m";
      } else if (hours > 0) {
        // show hours, minutes and seconds
        timeRemaining = hours + "h, " + minutes + "m, " + seconds + "s";
      } else if (minutes > 0) {
        // show minutes and seconds
        timeRemaining = minutes + "m, " + seconds + "s";
      } else if (seconds > 0) {
        // show seconds
        timeRemaining = seconds + "s";
      } else {
        timeRemaining = "0s";
      }

      return timeRemaining;
    }

    if ($(".js-promo-prices").length) {
      // There are price drops scheduled
      // Initialise time remaining for price drops
      $(".js-promo-prices").each(function () {
        var $promoPrices = $(this);
        var promoStartEpoch = $promoPrices.data("promo-start-epoch");
        var promoEndEpoch = $promoPrices.data("promo-end-epoch");
        var currentEpoch = Math.floor(new Date().getTime() / 1000);

        if (promoStartEpoch != undefined && promoEndEpoch != undefined && currentEpoch >= promoStartEpoch) {
          // Promo has started
          var timeRemaining = formatPromoTimeRemaining(promoEndEpoch - currentEpoch); // update time remaining

          $(".js-time-remaining", $promoPrices).text(timeRemaining);
        }
      }); // Set interval to update time remaining for price drops every second

      setInterval(function () {
        $(".js-promo-prices").each(function () {
          var $promoPrices = $(this);
          var promoStartEpoch = $promoPrices.data("promo-start-epoch");
          var promoEndEpoch = $promoPrices.data("promo-end-epoch");
          var currentEpoch = Math.floor(new Date().getTime() / 1000);

          if (promoStartEpoch != undefined && promoEndEpoch != undefined && currentEpoch >= promoStartEpoch) {
            // Promo is active
            var timeRemaining = formatPromoTimeRemaining(promoEndEpoch - currentEpoch); // update time remaining

            $(".js-time-remaining", $promoPrices).text(timeRemaining);
          }
        });
      }, 1000); // Show promo prices instead of standard prices if promo is active

      $(".js-promo-prices").each(function () {
        var $promoPrices = $(this);
        var promoStartEpoch = $promoPrices.data("promo-start-epoch");
        var promoEndEpoch = $promoPrices.data("promo-end-epoch");
        var currentEpoch = Math.floor(new Date().getTime() / 1000);

        if (promoStartEpoch != undefined && promoEndEpoch != undefined && currentEpoch >= promoStartEpoch && currentEpoch < promoEndEpoch) {
          // Promo is active - hide standard prices and show promo prices
          $promoPrices.siblings(".js-standard-prices").hide();
          $promoPrices.show();
        }
      });
    }
  }

  function videoLightbox() {
    // ======================================================================
    // Video Lightbox
    // ======================================================================
    function autoSizeVideo(aspectRatio) {
      // Apply height / width values to video constrained to a given aspect ratio
      var videoHeight = $(".modal__video").width() / aspectRatio;
      var maxHeight = $(window).height() - 80;

      if (videoHeight < maxHeight) {
        // in most cases, set the height via calculation using width + aspect ratio...
        $(".modal__video").height(videoHeight).width("");
      } else {
        // If video height exceeds window height, set according height (with a limit) & recalculate width
        $(".modal__video").height(maxHeight).width($(window).height() * aspectRatio);
      }
    }

    if ($('.button--modal-video, .js-modal-video-control').length > 0) {
      // HTML for the video container and close button...
      var $modalVideo = $('<span class="modal">').append($('<div class="modal__video">').append($('<div class="modal__close-control">').append('Close <div class="icon icon--cross">')));
      $modalVideo.on("click touchend", function () {
        // Remove modal on click/tap
        $('iframe', $modalVideo).remove();
        $modalVideo.detach();
        $(window).off("resize.modalVideo");
        return false;
      });
      $('.button--modal-video, .js-modal-video-control').on('click', function () {
        // click event for the "Watch Video" button
        var type = $(this).data('type');

        if (type == undefined) {
          type = 'youtube';
        }

        if (type == 'youtube') {
          var aspectRatio = $(this).data('aspect-ratio');

          if (aspectRatio == undefined) {
            // Default to 16:9
            aspectRatio = 16 / 9;
          }

          var id = $(this).data('id');
          var $iframe = $('<iframe src="https://www.youtube.com/embed/' + id + '?rel=0&amp;showinfo=0" frameborder="0" allowfullscreen="">');
          $($iframe, $modalVideo).addClass("loading");
          $('.modal__video', $modalVideo).append($iframe);
          $('body').append($modalVideo);
          $('iframe', $modalVideo).one('load', function () {
            $(this).removeClass('loading').addClass('loaded');
          });
        }

        autoSizeVideo(aspectRatio);
        $(window).on("resize.modalVideo", function () {
          autoSizeVideo(aspectRatio);
        });
      });
    }
  }

  function jumpto(oSelect) {
    // Navigate to web page when dropdown value is selected
    var myindex = oSelect.selectedIndex;
    var mylink = oSelect.options[myindex].getAttribute('value');

    if (mylink != null && mylink != '') {
      window.location = mylink;
    }
  }

  (function () {
    //========================================================================
    // 'Out of Stock' Modal Dialog.
    //========================================================================
    // Clone copy of initial 'Out of Stock' modal.
    var $oosModalInit = $(".js-oos-modal").clone();
    $("body").on("click", ".js-oos-modal-link", function (event) {
      event.preventDefault(); // Reset 'Out of Stock' modal.

      $(".js-oos-modal").replaceWith($oosModalInit.clone()).remove();
      var product_code = $(this).data("product_code") || $(this).attr("product_code");
      var $oosModal = $(".js-oos-modal");
      var $oosForm = $oosModal.find(".js-oos-form"); // Generate & open modal dialog.

      $(".js-oos-product-code", $oosModal).text(product_code);
      $(".js-oos-product-code-input", $oosModal).val(product_code);
      $oosModal.modal("open");
      $oosForm.validation({
        submit: false,
        qtip: {
          position: {
            my: "right center",
            at: "right center",
            viewport: $(".js-oos-form .modal-dialog__body"),
            container: $(".js-oos-form .modal-dialog__body"),
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
            after: ".js-oos-form .js-validation-message-marker"
          },
          error: {
            after: ".js-oos-form .js-validation-message-marker"
          },
          notify: {
            after: ".js-oos-form .js-validation-message-marker"
          }
        }
      });
      $oosForm.on("valid.validation", function () {
        // Show form's submitted state.
        $oosModal.addClass("is-submitted");
      });
    });
  })(jQuery);

  (function () {
    // ======================================================================
    // Inc/Ex VAT Toggle
    // ======================================================================
    var source = urlGet(document.location.href, "source");
    var vat_preference = getCookie("vat_preference"); // "inc_vat", "ex_vat" or null.

    if (vat_preference == "inc_vat") {
      // Cookie Found - Show prices Inclusive of VAT
      showIncVatPrices();
      $(".js-vat-select", ".js-vat-modal").val("inc_vat");
    } else if (vat_preference == "ex_vat") {
      // Cookie Found - Show Prices Exlusive of VAT
      showExVatPrices();
      $(".js-vat-select", ".js-vat-modal").val("ex_vat");
    } else if (source == "froogle" || source == "adwords") {
      // Cookie Not Found & Traffic Froogle or Adwords - Default to Prices Inclusive of VAT
      showIncVatPrices();

      if (vat_preference != "inc_vat") {
        setCookie("vat_preference", "inc_vat", undefined, true); // Trigger basket-update event

        $("body").trigger("basket-update");
      }

      $(".js-vat-select", ".js-vat-modal").val("inc_vat");
    } else {
      // Cookie Not Found & Traffic not from Froogle or Adwords - Default to Prices Exclusive of VAT
      showExVatPrices();

      if (vat_preference != "ex_vat") {
        setCookie("vat_preference", "ex_vat", undefined, true); // Trigger basket-update event

        $("body").trigger("basket-update");
      }

      $(".js-vat-select", ".js-vat-modal").val("ex_vat");
    } // Show VAT Preference modal dialog on click.


    $(".js-show-vat-modal").on("click", function () {
      $(".js-vat-modal").modal("open");
    }); // Save & close modal dialog on clicking 'Save' button.

    $(".js-save-modal", ".js-vat-modal").on("click", function () {
      vat_preference = $(".js-vat-select").val();

      if (vat_preference === "inc_vat") {
        showIncVatPrices();
      } else {
        showExVatPrices();
      }

      setCookie("vat_preference", vat_preference, 3650, true);
      $("body").trigger("basket-update");
      $(".js-vat-modal").modal("close");
    });

    function showExVatPrices() {
      // Show VAT-Exclusive prices in price-breaks.
      $("body").removeClass("is-inc-vat").addClass("is-ex-vat");
    }

    function showIncVatPrices() {
      // Show VAT-Inclusive prices in price-breaks.
      $("body").removeClass("is-ex-vat").addClass("is-inc-vat");
    }
  })();

  // ======================================================================
  // Checkout (Your Order) - Quantity Spinner UI component
  // ======================================================================
  (function () {
    var interval;
    var timeout;
    var autoIncrementing = false;

    var restrictNumeric = function restrictNumeric(event) {
      // Restrict Keypresses to numeric and select non-printable keys
      var keyCode = event.which;

      if (!event.shiftKey && keyCode >= 48 && keyCode <= 57 || keyCode >= 96 && keyCode <= 105) {
        // Numeric key
        return true;
      } else if (event.controlKey || event.metaKey) {
        // allow Ctrl+? & Command+? key combinations
        return true;
      } else if ($.inArray(keyCode, [46, 8, 9, 27, 13, 110, 35, 36, 37, 38, 39, 40]) !== -1) {
        // allow select non-printable keys: backspace, delete, tab, escape, home, end, left, right, down, up
        return true;
      } else {
        return false;
      }
    };

    var autoIncrementStart = function autoIncrementStart($input, increment, min, max) {
      // Increase input value by specified increment (optionally resticted by min & max values)
      // After 400ms increment value every 200ms until interval is cleared.
      var oldValue = parseInt($input.val());

      if (isNaN(oldValue)) {
        oldValue = 0;
      }

      var newValue = oldValue + increment;

      if ((min === undefined || newValue >= min) && (max === undefined || newValue <= max)) {
        // Increment input value
        $input.val(parseInt(newValue)).trigger("change"); // Auto-increment after delay

        autoIncrementing = true;
        window.clearTimeout(timeout);
        timeout = window.setTimeout(function () {
          window.clearInterval(interval);
          interval = window.setInterval(function () {
            oldValue = parseInt($input.val());

            if (isNaN(oldValue)) {
              oldValue = 0;
            }

            newValue = oldValue + increment;

            if ((min === undefined || newValue >= min) && (max === undefined || newValue <= max)) {
              $input.val(parseInt(newValue)).trigger("change");
            } else {
              // Stop auto incremnenting
              autoIncrementStop();
            }
          }, 200);
        }, 400);
      }
    };

    var autoIncrementStop = function autoIncrementStop($input) {
      // Clear timers and select input text
      window.clearTimeout(timeout);
      window.clearInterval(interval);
      autoIncrementing = false;
    };

    var isTouch = "ontouchstart" in window || navigator.msMaxTouchPoints;
    $("body").on("click", ".field--quantity-spinner .field__input", function () {
      if (!isTouch) {
        $(this).textrange("set", "all");
      }
    }).on("keydown", ".field--quantity-spinner .field__input", restrictNumeric).on("keydown", ".field--quantity-spinner .field__input", function (event) {
      var selling_multiple = parseInt($(this).attr("data-selling_multiple") || 1);

      if (event.which === 40) {
        // Down arrow key
        var increment = -1 * selling_multiple;
      } else if (event.which === 38) {
        // Up arrow key
        var increment = selling_multiple;
      } else {
        // Don't auto increment
        return true;
      }

      if (!autoIncrementing) {
        autoIncrementStart($(this), increment, selling_multiple);
      }

      return false;
    }).on("keyup", ".field--quantity-spinner .field__input", function () {
      if (autoIncrementing) {
        autoIncrementStop($(this));
        return false;
      }
    });

    if (isTouch) {
      $("body").on("touchstart", ".field__spinner-button", function (event) {
        var $input = $(this).siblings(".field__input");
        $input.focus();
        var selling_multiple = parseInt($input.attr("data-selling_multiple") || 1);
        var $target = $(this);

        if ($target.is(".field__spinner-button--down")) {
          // Left mouse button event on the decrease qty button
          var increment = -1 * selling_multiple;
        } else if ($target.is(".field__spinner-button--up")) {
          // Left mouse button event on the increase qty button
          var increment = selling_multiple;
        } else {
          // Don't auto increment
          return true;
        }

        if (!autoIncrementing) {
          autoIncrementStart($input, increment, selling_multiple);
        }

        return false;
      }).on("touchend", ".field__spinner-button", function () {
        if (autoIncrementing) {
          autoIncrementStop($(this).siblings(".field__input"));
          return false;
        }
      });
    } else {
      $("body").on("mousedown", ".field__spinner-button", function (event) {
        var $input = $(this).siblings(".field__input");
        var selling_multiple = parseInt($input.attr("data-selling_multiple") || 1);
        $input.focus();
        var $target = $(this);

        if (event.which === 1 && $target.is(".field__spinner-button--down")) {
          // Left mouse button event on the decrease qty button
          var increment = -1 * selling_multiple;
        } else if (event.which === 1 && $target.is(".field__spinner-button--up")) {
          // Left mouse button event on the increase qty button
          var increment = selling_multiple;
        } else {
          // Don't auto increment
          return true;
        }

        if (!autoIncrementing) {
          autoIncrementStart($input, increment, selling_multiple);
        }

        return false;
      }).on("mouseout mouseup", ".field__spinner-button", function () {
        if (autoIncrementing) {
          autoIncrementStop($(this).siblings(".field__input"));
          return false;
        }
      });
    }
  })();

  // *****************************************************************************
  // Radio Group
  // *****************************************************************************
  (function () {
    // Initialise any checked radio groups.
    $(".option__input:checked").siblings(".option__content").addClass("option__content--active");
    $(".option__input:checked").closest(".radio-group__option").addClass("is-active");
    $(".option__input").on("change", function (event) {
      // Add/remove active class to radio group options.
      var transitionEndCallback = function transitionEndCallback() {
        // Trigger transitionEnd event so we know show/hide animation has finished.
        $(this).trigger("transitionEnd.radioGroup");
      }; // Add active class to the option that is selected.


      $(this).siblings(".option__content").addClass("option__content--active", 300, transitionEndCallback);
      $(this).closest(".radio-group__option").addClass("is-active"); // Remove active class from all other options.

      $(".option__input[name='" + $(this).attr("name") + "']").not($(this)).each(function () {
        $(this).siblings(".option__content").removeClass("option__content--active", 300, transitionEndCallback);
        $(this).closest(".radio-group__option").removeClass("is-active");
      });
    });
  })();

  window.getCookie = getCookie;
  window.setCookie = setCookie;
  window.deleteCookie = deleteCookie;
  window.popUpLink = popUpLink;
  window.checkReferrer = checkReferrer;
  window.getOptionValue = getOptionValue;
  window.setOptionValue = setOptionValue;
  window.getRadioValue = getRadioValue;
  window.setRadioValue = setRadioValue;
  window.urlSet = urlSet$1; // There are duplicate global urlSet & urlDataSet functions declared here and in qcode-ui.js

  window.urlDataSet = urlDataSet;
  window.urlGet = urlGet;
  window.urlDataGet = urlDataGet;
  window.trackingKeyword = trackingKeyword;
  window.trackingSource = trackingSource;
  window.trackingCampaign = trackingCampaign;
  window.trackingMedia = trackingMedia;
  window.referralSearchTerms = referralSearchTerms;
  window.referralDomain = referralDomain;
  window.tradeDoubler = tradeDoubler;

  checkReferrer();
  tradeDoubler();
  handleViewportResize();
  navbarSearch();
  mobileNav();
  navbarMenus();
  navbarSticky();
  searchAutosuggest();
  navbarBasketUpdate();
  productsCookie();
  addToBasket();
  window.jumpto = jumpto;
  videoLightbox();
  handlePluginsReady();
  priceDrops();
  notificationBanner();
  floatingLabels();
  displaySpinnerOnSubmit();
  setErrorStateOnInvalidResponse(); // Remember last shopping page for Continue Shopping Button

  var regExp = new RegExp("/(Main_Index|Products|Manufacturers|Type)/");

  if (regExp.exec(window.location.pathname)) {
    setCookie("continue_shopping_url", window.location.href, undefined, true);
  } // Check if customer_key set in url


  if (urlGet(document.location.href, "customer_key") != null) {
    var customer_key = urlGet(document.location.href, "customer_key");
    setCookie("customer_key", customer_key, 30, true);
  } // Override the default scrollIntoView() behaviour to vertically center 
  // error messages on scroll.


  $.widget("qcode.validation", $.qcode.validation, {
    options: {
      scrollToFeedback: {
        block: 'center'
      }
    }
  });

})();
//# sourceMappingURL=core.js.map
