const { response } = require('express');
const { request } = require('express');
const stripe = require('stripe')(process.env.PRIVATE);

const get = async (req = request, res = response) => {
  const date = Date.now();
  res.json({ ok: true, date });
};

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
            msg: 'Hubo un error al momento de realizar su pago. Int??ntelo m??s tarde.',
          });

        case 'insufficient_funds':
          return res.status(400).send({
            success: false,
            msg: 'Fondos insuficientes. Int??ntelo con otra tarjeta.',
          });

        case 'lost_card':
          return res.status(400).send({
            success: false,
            msg: 'Esta tarjeta ha sido reportada como extraviada. P??ngase en contacto con su banco.',
          });

        case 'stolen_card':
          return res.status(400).send({
            success: false,
            msg: 'Esta tarjeta ha sido reportada como robada. P??ngase en contacto con su banco.',
          });
      }
    } else {
      switch (err.code) {
        case 'expired_card':
          return res.status(400).send({
            success: false,
            msg: 'Tarjeta expirada. Int??ntelo con otra tarjeta.',
          });

        case 'incorrect_cvc':
          return res.status(400).send({
            success: false,
            msg: 'C??digo de seguridad incorrecto. Int??ntelo nuevamente',
          });

        case 'processing_error':
          return res.status(400).send({
            success: false,
            msg: 'Error el momento de procesar el pago. Int??ntelo nuevamente m??s tarde.',
          });

        case 'incorrect_number	':
          return res.status(400).send({
            success: false,
            msg: 'N??mero de tarjeta incorrecto. Int??ntelo nuevamente.',
          });

        default:
          return res.status(500).json({
            success: false,
            msg: 'Hubo un error no relacionado con la forma de pago. P??ngase el contacto con el administrador de la p??gina',
          });
      }
    }
  }
};

module.exports = { collectDetails, confirmPayment, receivePayment, get };
