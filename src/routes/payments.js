const { Router } = require('express');
const { check } = require('express-validator');
const {
  collectDetails,
  confirmPayment,
  receivePayment,
  get,
} = require('../controllers/payments');
const { validateFields } = require('../middlewares/validateFields');

const router = Router();

router.get('/get', get);

router.post(
  '/receive_payment',
  [
    check('payment', 'El pago debe ser mínimo de 10,000 MXN').isFloat({
      min: 10_000,
    }),
    check('payment', 'El pago no puede exceder los 999,999.99 MXN').isFloat({
      max: 999_999.99,
    }),
    check('payment', 'La cantidad es obligatoria').not().isEmpty(),
    check('tipoPago', 'El tipo de pago es obligatorio').not().isEmpty(),
    check('description', 'La dirección del terreno es obligatoria')
      .not()
      .isEmpty(),
    validateFields,
  ],
  receivePayment
);

router.post(
  '/collect_details',
  [
    check('payment', 'El pago debe ser mínimo de 10,000 MXN').isFloat({
      min: 10_000,
    }),
    check('payment', 'La cantidad es obligatoria').not().isEmpty(),
    validateFields,
  ],
  collectDetails
);

router.post(
  '/confirm_payment',
  [
    check('payment', 'El pago debe ser mínimo de 10,000 MXN').isFloat({
      min: 10_000,
    }),
    check('payment', 'La cantidad es obligatoria').not().isEmpty(),
    validateFields,
  ],
  confirmPayment
);

module.exports = router;
