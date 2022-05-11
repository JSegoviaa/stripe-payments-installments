const stripe = Stripe(
  'pk_test_51JaTznCGqe3RvXVDQxhEnjQ1bLyso24Cy7whGP7B39Y2a8qCZEsEHEtCi1zxSfx0XbWiAUfqW10HbeCiyg4phaTy00Qu5iDasP'
);

const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

const cardholderName = document.getElementById('cardholder-name');
const form = document.getElementById('payment-form');

const selectPlanForm = document.getElementById('installment-plan-form');
let availablePlans = [];

const confirmButton = document.getElementById('confirm-button');

const payment = sessionStorage.getItem('payment');

if (!payment) window.location.href = '/';

confirmButton.addEventListener('click', async (ev) => {
  const selectedPlanIdx = selectPlanForm.installment_plan.value;
  const selectedPlan = availablePlans[selectedPlanIdx];
  const intentId = document.getElementById('payment-intent-id').value;
  const response = await fetch('/api/payments/confirm_payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payment_intent_id: intentId,
      selected_plan: selectedPlan,
      payment,
    }),
  });

  const responseJson = await response.json();

  if (!responseJson.ok) {
    json.errors.map((error) => alert(error.msg));
  }

  document.getElementById('plans').hidden = true;
  document.getElementById('result').hidden = false;

  let message;
  if (responseJson.status === 'succeeded' && selectedPlan !== undefined) {
    message = `Su pago se realizó con éxito a ${selectedPlan.count} meses sin intereses.`;
  } else if (responseJson.status === 'succeeded') {
    message = `Su pago se realizó con éxito por la cantidad de ${responseJson.payment} MXN.`;
  } else {
    message =
      'Hubo un error al momento de realizar su pago. Inténtelo nuevamente más tarde.';
  }

  document.getElementById('status-message').innerText = message;
});

const handleInstallmentPlans = async (response) => {
  if (response.error) {
    // Show error from server on payment form
  } else {
    // Store the payment intent ID.
    document.getElementById('payment-intent-id').value = response.intent_id;
    availablePlans = response.available_plans;

    // Show available installment options
    availablePlans.forEach((plan, idx) => {
      const newInput = document.getElementById('immediate-plan').cloneNode();
      newInput.setAttribute('value', idx);
      newInput.setAttribute('id', '');
      const label = document.createElement('label');
      label.appendChild(newInput);
      label.appendChild(document.createTextNode(`${plan.count} MSI`));

      selectPlanForm.appendChild(label);
    });

    document.getElementById('details').hidden = true;
    document.getElementById('plans').hidden = false;
  }
};

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const { paymentMethod, error } = await stripe.createPaymentMethod(
    'card',
    cardElement,
    { billing_details: { name: cardholderName.value } }
  );
  if (error) {
  } else {
    const response = await fetch('/api/payments/collect_details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_method_id: paymentMethod.id, payment }),
    });

    const json = await response.json();

    if (!json.ok) {
      json.errors.map((error) => alert(error.msg));
    }

    handleInstallmentPlans(json);
  }
});
