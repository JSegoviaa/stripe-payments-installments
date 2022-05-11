const paymentAmount = document.querySelector('#payment-amount');

const formatPrice = (price) => {
  const payment = new Intl.NumberFormat('es-MX', {
    currency: 'MXN',
  }).format(price);

  const format = '$' + payment;

  return format;
};

paymentAmount.innerHTML = `<h1>Cantidad a pagar ${formatPrice(
  payment
)} MXN</h1>`;
