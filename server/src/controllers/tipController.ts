import { type Request, type Response, type NextFunction } from "express";
import stripe from "../config/stripe";
import Tip from "../models/Tip";
import User from "../models/User";
import Video from "../models/Video";

export const createTipSession = async (req: Request, res: Response, _next: NextFunction) => {
  if (!stripe) {
    return res.status(500).json({ message: "Stripe not configured" });
  }

  const { videoId, amount, creatorId } = req.body;
  const senderId = (req as any).user?.id;

  if (!senderId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!amount || amount < 1) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  const recipient = await User.findById(creatorId || video.owner);
  if (!recipient) {
    return res.status(404).json({ message: "Creator not found" });
  }

  let customerId = (recipient as any).stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { userId: recipient._id.toString() },
    });
    customerId = customer.id;
    recipient.stripeCustomerId = customerId;
    await recipient.save();
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Tip for ${video.title}`,
            description: `Tip to @${recipient.username}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/video/${videoId}?tip=success`,
    cancel_url: `${process.env.CLIENT_URL}/video/${videoId}?tip=cancelled`,
    metadata: {
      videoId: videoId.toString(),
      senderId,
      recipientId: recipient._id.toString(),
      amount: amount.toString(),
    },
  });

  const tip = await Tip.create({
    sender: senderId,
    recipient: recipient._id,
    videoId,
    amount,
    stripeSessionId: session.id,
  });

  res.status(200).json({
    data: {
      tip,
      sessionId: session.id,
      url: session.url,
    },
  });
};

export const handleStripeWebhook = async (req: Request, res: Response, _next: NextFunction) => {
  if (!stripe) {
    return res.status(500).json({ message: "Stripe not configured" });
  }

  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    return res.status(500).json({ message: "Webhook secret not configured" });
  }

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { recipientId } = session.metadata || {};

    if (recipientId) {
      await Tip.findOneAndUpdate(
        { stripeSessionId: session.id },
        { status: "completed" }
      );
    }
  }

  res.json({ received: true });
};