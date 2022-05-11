const { response } = require('express');
const { request } = require('express');
const stripe = require('stripe')(process.env.PRIVATE);

const receivePayment = async (req = request, res = response) => {
  const { payment } = req.body;

  try {
    if (payment < 10_000) {
      return res
        .status(400)
        .json({ ok: false, msg: `La cantidad ${payment} no es suficiente` });
    }

    return res.status(200).json({ ok: true, payment });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: error });
  }
};

const collectDetails = async (req = request, res = response) => {
  const { payment_method_id, payment } = req.body;
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
    return res.status(500).send({ error: err.message });
  }
};

module.exports = { collectDetails, confirmPayment, receivePayment };
