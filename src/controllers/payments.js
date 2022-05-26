const { response } = require('express');
const { request } = require('express');
const stripe = require('stripe')(process.env.PRIVATE);

const receivePayment = async (req = request, res = response) => {
  const { payment, tipoPago, description } = req.body;

  try {
    if (payment < 10_000) {
      return res
        .status(400)
        .json({ ok: false, msg: `La cantidad ${payment} no es suficiente` });
    }

    return res.status(200).json({ ok: true, payment, tipoPago, description });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: error });
  }
};

const collectDetails = async (req = request, res = response) => {
  const { payment_method_id, payment, description, tipoPago } = req.body;
  const amount = Number(payment) * 100;

  try {
    const intent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'mxn',
      payment_method: payment_method_id,
      payment_method_options: {
        card: {
          installments: {
            enabled: true,
          },
        },
      },
      description,
      metadata: { tipoPago },
    });

    return res.send({
      ok: true,
      intent_id: intent.id,
      available_plans:
        intent.payment_method_options.card.installments.available_plans,
    });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};

const confirmPayment = async (req = request, res = response) => {
  const { selected_plan, payment_intent_id, payment } = req.body;

  try {
    let confirmData = {};
    if (selected_plan !== undefined) {
      confirmData = {
        payment_method_options: {
          card: {
            installments: {
              plan: selected_plan,
            },
          },
        },
      };
    }

    const intent = await stripe.paymentIntents.confirm(
      payment_intent_id,
      confirmData
    );

    return res.send({ success: true, status: intent.status, payment });
  } catch (err) {
    if (err.decline_code) {
      switch (err.decline_code) {
        case 'generic_decline':
          return res.status(400).send({
            success: false,
            msg: 'Hubo un error al momento de realizar su pago. Inténtelo más tarde.',
          });

        case 'insufficient_funds':
          return res.status(400).send({
            success: false,
            msg: 'Fondos insuficientes. Inténtelo con otra tarjeta.',
          });

        case 'lost_card':
          return res.status(400).send({
            success: false,
            msg: 'Esta tarjeta ha sido reportada como extraviada. Póngase en contacto con su banco.',
          });

        case 'stolen_card':
          return res.status(400).send({
            success: false,
            msg: 'Esta tarjeta ha sido reportada como robada. Póngase en contacto con su banco.',
          });
      }
    } else {
      switch (err.code) {
        case 'expired_card':
          return res.status(400).send({
            success: false,
            msg: 'Tarjeta expirada. Inténtelo con otra tarjeta.',
          });

        case 'incorrect_cvc':
          return res.status(400).send({
            success: false,
            msg: 'Código de seguridad incorrecto. Inténtelo nuevamente',
          });

        case 'processing_error':
          return res.status(400).send({
            success: false,
            msg: 'Error el momento de procesar el pago. Inténtelo nuevamente más tarde.',
          });

        case 'incorrect_number	':
          return res.status(400).send({
            success: false,
            msg: 'Número de tarjeta incorrecto. Inténtelo nuevamente.',
          });

        default:
          return res.status(500).json({
            success: false,
            msg: 'Hubo un error no relacionado con la forma de pago. Póngase el contacto con el administrador de la página',
          });
      }
    }
  }
};

module.exports = { collectDetails, confirmPayment, receivePayment };
