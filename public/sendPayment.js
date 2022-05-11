const getPayment = document.querySelector('#payment');
const getValueForm = document.querySelector('#form');
const getDescription = document.querySelector('#description');

getValueForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const res = await fetch('/api/payments/receive_payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payment: getPayment.value,
      description: getDescription.value,
    }),
  });
  const data = await res.json();

  if (!data.ok) {
    data.errors.map((error) => alert(error.msg));
  }

  if (data.ok) {
    sessionStorage.setItem('payment', payment.value);
    sessionStorage.setItem('description', getDescription.value);
    window.location.href = '/checkout.html';
  }
});
