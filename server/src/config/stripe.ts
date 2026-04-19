import Stripe from "stripe";
import config from "./env";

export const stripe = config.stripeSecretKey
  ? new Stripe(config.stripeSecretKey, { apiVersion: "2026-03-25.dahlia" as any })
  : null;

export default stripe;