Stripe.setPublishableKey('######################################');

var $form = $('#checkout-form');
// https://stripe.com/docs/custom-form check this link for information about what createToken does
$form.submit(function (event) {
    $('#charge-error').addClass('hidden'); //Remove the old errors and show only the new errors
    $form.find('button').prop('disabled', true); //To make sure that the user can't submit button multiple times while validation is going on
    Stripe.card.createToken({
        number: $('#card-number').val(),
        cvc: $('#card-cvc').val(),
        exp_month: $('#card-expiry-month').val(),
        exp_year: $('#card-expiry-year').val(),
        name: $('#card-name').val()
    }, stripeResponseHandler);
    return false; // Doesn't send a request to the server i.e credit card server
});

function stripeResponseHandler(status, response) {
    if (response.error) { // Problem!

        // Show the errors on the form
        $('#charge-error').text(response.error.message);
        $('#charge-error').removeClass('hidden');
        $form.find('button').prop('disabled', false); // Re-enable submission

    } else { // Token was created!

        // Get the token ID:
        var token = response.id;

        // Insert the token into the form so it gets submitted to the server:
        $form.append($('<input type="hidden" name="stripeToken" />').val(token));

        // Submit the form:
        $form.get(0).submit();

    }
}