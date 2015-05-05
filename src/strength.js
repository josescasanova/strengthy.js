/*!
 * strength.js
 * Original author: @aaronlumsden
 * Further changes, comments: @aaronlumsden, @nyon
 * Licensed under the MIT license
 */
;(function($, window, document) {
    var defaults = {
        strengthClass: 'strength',
        strengthMeterClass: 'strength_meter',
        strengthButtonClass: 'button_strength',
        strengthButtonText: 'Show Password',
        strengthButtonTextToggle: 'Hide Password',
        confirms: false
    };


    function Plugin( element, options ) {
        this.element = element;
        this.$elem = $(this.element);
        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this.init();
    }

    Plugin.prototype = {
        init: function() {
            function check_strength(thisval,thisid) {
                // calculate bit count that is needed to store this password
                var bit_strength = Math.log2(Math.max(1, $.unique(thisval.split('')).length));
                
                var missing_from_password = ['Capital Letter Missing, ', 'Lowercase Letter Missing, ', 'Number Missing, ', 'Symbol Missing, '];
                var length = 0;

                // Now check for different password guidelines and amplify bit strength
                if (thisval.match(/[A-Z]/)) {
                    delete missing_from_password[0];
                    length = missing_from_password.length;
                    bit_strength *= 1.5;   
                }
                if (thisval.match(/[a-z]/)) {
                    delete missing_from_password[1];
                    length = missing_from_password.length;
                    bit_strength *= 1.2;
                 }
                if (thisval.match(/[0-9]/)) {
                    delete missing_from_password[2];
                    length = missing_from_password.length;
                    bit_strength *= 1.2;
                }
                if (thisval.match(/[!%&@#$^*?_~,]/)) {
                    delete missing_from_password[3];
                    length = missing_from_password.length;
                    bit_strength *= 1.5;
                }

                // Amplify by password length
                bit_strength *= Math.log2(Math.max(1, thisval.length));

                var thismeter = $('div[data-meter="'+thisid+'"]');
                thismeter.removeClass();
                if(bit_strength >= 40.0) thismeter.addClass('strong').html('<div class="password__messages">Strong <br /></div>');
                else if(bit_strength >= 20.0) thismeter.addClass('medium').html('<div class="password__messages">Medium <br />'+missing_from_password.join("").slice(0,-2)+'</div>');
                else if(bit_strength >= 15.0) thismeter.addClass('weak').html('<div class="password__messages">Weak <br />'+missing_from_password.join("").slice(0,-2)+'</div>');
                else if(bit_strength > 0.0) thismeter.addClass('veryweak').html('<div class="password__messages">Very Weak <br />'+missing_from_password.join("").slice(0,-2)+'</div>');
                else thismeter.removeClass().html('<div class="password__messages">Password Strength</div>');
            }

            function check_confirm(thisval,thisid,otherid) {
                var thismeter = $('div[data-meter="'+thisid+'"]');
                thismeter.removeClass();
                if($('#'+thisid).val() == $('#'+otherid).val()) thismeter.addClass('success').html('success');
                else thismeter.addClass('alert').html('fail');
            }



            var isShown = false;
            var strengthButtonText = this.options.strengthButtonText;
            var strengthButtonTextToggle = this.options.strengthButtonTextToggle;


            thisid = this.$elem.attr('id');
            var self = this;

            this.$elem.addClass(this.options.strengthClass).attr('data-password',thisid).after('<input style="display:none" class="'+this.options.strengthClass+'" data-password="'+thisid+'" type="text" name="" value=""><a data-password-button="'+thisid+'" href="" class="'+this.options.strengthButtonClass+'">'+this.options.strengthButtonText+'</a><div class="'+this.options.strengthMeterClass+'"><div data-meter="'+thisid+'" class="password__messages">Password Strength</div></div>');

            this.$elem.on('keyup', function(e) {
                thisid = $(e.target).attr('id');
                thisval = $('#'+thisid).val();
                $('input[type="text"][data-password="'+thisid+'"]').val(thisval);
                if(!self.options.confirms) check_strength(thisval,thisid);
                else check_confirm(thisval, thisid, self.options.confirms);

            });

            $('input[type="text"][data-password="'+thisid+'"]').on('keyup', function(e) {
                thisval = $(e.target).val();
                $('input[type="password"][data-password="'+$(e.target).data('password')+'"]').val(thisval);
                if(!self.options.confirms) check_strength(thisval,thisid);
                else check_confirm(thisval, thisid, self.options.confirms);
            });

            $(document.body).on('click', '.'+this.options.strengthButtonClass, function(e) {
                thisid = $(e.target).data('password-button');
                e.preventDefault();
                thisclass = 'hide_'+$(this).attr('class');

                if (isShown) {
                    $('input[type="text"][data-password="'+thisid+'"]').hide();
                    $('input[type="password"][data-password="'+thisid+'"]').show().focus();
                    $('a[data-password-button="'+thisid+'"]').removeClass(thisclass).html(strengthButtonText);
                    isShown = false;

                } else {
                    $('input[type="text"][data-password="'+thisid+'"]').show().focus();
                    $('input[type="password"][data-password="'+thisid+'"]').hide();
                    $('a[data-password-button="'+thisid+'"]').addClass(thisclass).html(strengthButtonTextToggle);
                    isShown = true;
                }
            });
        }
    };

    $.fn.strength = function ( options ) {
        return this.each(function () {
            $(this).data("strength", new Plugin( this, options ));
        });
    };

})(jQuery, window, document);


