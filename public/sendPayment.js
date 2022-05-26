const getPayment = document.querySelector('#payment');
const getValueForm = document.querySelector('#form');
const getDescription = document.querySelector('#description');
const getTipoPago = document.querySelector('#tipoPago');

getValueForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const res = await fetch('/api/payments/receive_payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payment: getPayment.value,
      description: getDescription.value,
      tipoPago: getTipoPago.value,
    }),
  });
  const data = await res.json();

  if (!data.ok) {
    data.errors.map((error) => alert(error.msg));
  }

  if (data.ok) {
    sessionStorage.setItem('payment', data.payment);
    sessionStorage.setItem('description', data.description);
    sessionStorage.setItem('tipoPago', data.tipoPago);
    window.location.href = '/checkout.html';
  }
});
