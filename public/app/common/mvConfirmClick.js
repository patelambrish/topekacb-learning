angular.module('app').
  directive('confirmClick', function($timeout, $parse, $document) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var originalText = element.html(),
            timer, tpl, stopPropagation;
        
        scope.clicked = false;
        scope.delayed = false;
        
        function reset() {
          $timeout.cancel(timer);

          element.
            removeClass(attrs.confirmClass).
            html(originalText).
            find('i').
            removeClass(attrs.confirmIconClass);

          scope.clicked = false;
          scope.delayed = false;
        }

        /**
         * Credits:
         * This function borrows heavily, if not fully, from this Angular.js Directive Tutorial by Joe Wegner.
         * http://wegnerdesign.com/blog/angular-js-directive-tutorial-on-attribute-bootstrap-confirm-button/
        */
        function popoutHandlers() {
          var pop = $document.find('#' + attrs.buttonId);

          pop.closest(".popover").on('click', function(e) {
            if(stopPropagation) {
              e.stopPropagation();
            }
          });

          var goClass = 'btn-danger';
          if (attrs.confirmGoClass){
            goClass = attrs.confirmGoClass;
          }

          pop.find('.' + goClass).on('click', function() {
            stopPropagation = false;
            $parse(attrs.confirmClick)(scope);
          });
          

          pop.find('.btn-default').on('click', function() {
            stopPropagation = false;
            if (!attrs.confirmDefaultClick){
              $document.off('click.' + attrs.buttonId);
              element.popover('hide');
            }
            else{
              $parse(attrs.confirmDefaultClick)(scope);
            }
          });
          
          $document.on('click.' + attrs.buttonId, ":not(.popover, .popover *)", function() {
            $document.off('click.' + attrs.buttonId);
            element.popover('hide');
          });
        }

        if(attrs.resetTrigger === 'mouseout') {
          element.on('mouseout', function() {
            if(scope.delayed && !timer) {
              timer = $timeout(reset, 1500);
            }
          });
          
          element.on('mouseover', function() {
            if(timer) {
              $timeout.cancel(timer);
              timer = null;
            }
          });
        }
        var cancelText = 'Cancel';
        if (attrs.confirmCancelText){
          cancelText = attrs.confirmCancelText;
        }
        var goClass = 'btn-danger';
        if (attrs.confirmGoClass){
          goClass = attrs.confirmGoClass;
        }
        
        if(attrs.confirmPopout) {
          attrs.buttonId = 'btn' + ~~(Math.random() * 1000000);
          tpl =
            '<div class="text-center" id="' + attrs.buttonId + '">' +
              '<div class="btn-group btn-group-sm">' +
                '<button class="btn ' + goClass + '"><i class="glyphicon glyphicon-ok"></i> Yes</button>' +
                '<button class="btn btn-default">' + cancelText + '</button>' +
              '</div>' +
            '</div>';

          element.popover({
            content: tpl,
            html: true,
            placement: attrs.confirmPopout,
            trigger: 'manual'
          }).on('shown.bs.popover', function () {
            $document.find('.popover button:first-of-type').focus();
          });

          $document.on('keydown keypress', function(e) {
            if (e.which == 27) { // 27 == escape
              element.popover('hide');
            }
          });
        }

        element.on('click', function(e) {
          stopPropagation = true;
          e.stopPropagation();

          if(attrs.confirmPopout) {
            angular.element('body').animate({scrollTop: element.offset().top}, 'fast', function () {
              element.popover('show');
              popoutHandlers();
            });
            return;
          }
          
          if(scope.clicked && scope.delayed) {
            $parse(attrs.confirmClick)(scope);
            reset();
          } else if(scope.clicked) {
              e.stopImmediatePropagation();
              e.preventDefault();

              return false;
          } else {
            scope.$apply(function() {
              scope.clicked = true;

              element.
                attr('disabled', 'disabled').
                addClass('disabled').
                addClass(attrs.confirmClass).
                html(attrs.confirmText).
                find('i').
                addClass(attrs.confirmIconClass);
            });
  
            $timeout(function () {
              scope.delayed = true;

              element.
                removeAttr('disabled').
                removeClass('disabled');
            }, 300);
            
            if(attrs.resetTrigger === 'timeout') {
              timer = $timeout(reset, 1500);
            }
          }
        });
      }
    };
  });