// =============================================================================
// Modal Dialog jQuery Plugin.
//
// Plugin for showing content inside a popup modal dialog window.
//
// Common usage:
//   <script>
//   $("button").on("click", function() { 
//     $(".js-modal").modal("open");
//   });
//   </script>
//
//   <button>Show</button>
//   
//   <div class="modal is-hidden is-collapsed js-modal" tabindex="-1" role="dialog" aria-labelledby="dialogHeader" aria-describedby="dialogDescription">
//     <form class="modal-dialog" method="PUT" action="/tcl/">
//       <div class="modal-dialog__body">
//         <h1 id="dialogHeader" class="modal-dialog__title">Title</h1>
//         <p id="dialogDescription" class="modal-dialog__text">
//           Intro text.
//         </p>
//       </div>
//       <div class="modal-dialog__footer">
//         <button type="button" class="modal-dialog__footer-button modal-dialog__footer-button--cancel button button--small button--muted js-close-modal">
//           Cancel
//         </button>
//         <button type="submit" class="modal-dialog__footer-button modal-dialog__footer-button--continue button button--small button--positive">
//           Continue
//         </button>
//       </div>
//     </form>
//   </div>
// =============================================================================

(function($) {
    $.widget("qcode.modal", {
        _create: function() {
            var modal = this;
            var $modal = modal.element;
            modal.lastFocus = {};
            modal.iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            //==============================================================================
            // click event for modal dialog window.
            //==============================================================================
            $(".modal-dialog", $modal).on("click.modal", function(event) {
                // Prevent event bubbling when clicking/dragging inside modal window.
                event.stopPropagation();
            });

            //==============================================================================
            // click event for modal wrapper element.
            //==============================================================================
            $modal.on("click.modal", function() {
                // Closes modal when clicking on semi-transparent area.
                $(this).modal("close");
            });
            
            //==============================================================================
            // click event for "Cancel" buttons.
            //==============================================================================
            $(".js-close-modal", $modal).on("click.modal", function() {
                $modal.modal("close");
            });

            // Trap focus inside the open modal dialog.
            $modal.on("keydown.modal", function (event) {
                if (event.which == 9) {
                    if ( event.target == this && event.shiftKey ) {
                        event.preventDefault();
                        $(":tabbable:last", $modal).focus();
                    } else if ( event.target == $(":tabbable:first", $modal).get(0) && event.shiftKey ) {
                        event.preventDefault();
                        $(":tabbable:last", $modal).focus();
                    } else if ( event.target == $(":tabbable:last", $modal).get(0) && !event.shiftKey ) {
                        event.preventDefault();
                        $(":tabbable:first", $modal).focus();
                    }
                }
            });

            if ( modal.iOS ) {
                // Fallback scroll-locking for iOS devices, since `overflow:hidden` on body doesn't work.
                $modal.on("touchstart.modal", function(event) {
                    if ( event.originalEvent.targetTouches.length === 1 ) {
                        // record initial clientY of touchstart
                        modal.initialClientY = event.originalEvent.targetTouches[0].clientY;
                    }
                });

                $modal.on("touchmove.modal", function(event) {
                    modalDialog = $('.modal-dialog').get(0);
                    modalDialogBody = $('.modal-dialog__body').get(0);

                    if (
                        event.cancelable
                            && event.originalEvent.targetTouches.length === 1
                            && modal.initialClientY !== undefined
                    ) {
                        clientY = event.originalEvent.targetTouches[0].clientY - modal.initialClientY;

                        if ( clientY !== 0 && $(event.target).closest('.modal-dialog').length == 0) {
                            // touchmove (up or down) outside of .modal-dialog - disable scroll
                            return event.preventDefault();
                        } else if (  clientY > 0
                                     && modalDialog.scrollTop === 0
                                     && modalDialogBody.scrollTop === 0 ) {
                            // touchmove (up) when .modal-dialog && modal-dialog__body
                            // already scrolled to top - disable scroll
                            return event.preventDefault();
                        } else if (  clientY < 0
                                     && modalDialog.scrollHeight - modalDialog.scrollTop === modalDialog.clientHeight
                                     && modalDialogBody.scrollHeight - modalDialogBody.scrollTop === modalDialogBody.clientHeight ) {
                            // touchmove (down) when .modal-dialog && modal-dialog__body
                            // already scrolled to bottom - disable scroll
                            return event.preventDefault();
                        }
                    }
                    return true;
                });
            }
        },
        open: function() {
            // Open the modal.
            var modal = this;
            modal.lastFocus = document.activeElement;
            var $modal = modal.element;
            $modal
            .removeClass("is-hidden")
            .removeClass("is-collapsed", 200)
            .focus();

            // 'esc' keyup event handler.
            $(document).on("keyup.modal", function(event) {
                if (event.which == 27)  {
                    $modal.modal("close");
                }
            });

            // Stop scrolling on rest of page.
            $("body").addClass("prevent-scroll");

            // Trigger open event.
            $modal.trigger("open.modal");
        },
        close: function() {
            // Close the modal.
            var modal = this;
            var $modal = modal.element;
            $modal.addClass("is-collapsed", 150, function() {
                $(this).addClass("is-hidden");
            });
            
            // Remove 'esc' keyup event handler.
            $(document).off("keyup.modal");
            
            // Resume scrolling on rest of page.
            $("body").removeClass("prevent-scroll");

            // Return focus to the last focussed element prior to opening.
            modal.lastFocus.focus();

            // Trigger close event.
            $modal.trigger("close.modal");
        }
    });
}(jQuery));
