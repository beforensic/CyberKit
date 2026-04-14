import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.4.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeWebhookSecret
    );

    console.log("Received event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const companyId = session.metadata?.company_id;

        if (!companyId) {
          console.error("Missing company_id in metadata");
          break;
        }

        const { error } = await supabase
          .from("companies")
          .update({
            status: "paid",
            max_members: 9999,
          })
          .eq("id", companyId);

        if (error) {
          console.error("Error updating company:", error);
        } else {
          console.log(`Company ${companyId} upgraded to Premium`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const companyId = subscription.metadata?.company_id;

        if (!companyId) {
          console.error("Missing company_id in metadata");
          break;
        }

        const { error } = await supabase
          .from("companies")
          .update({
            status: "free",
            max_members: 5,
          })
          .eq("id", companyId);

        if (error) {
          console.error("Error downgrading company:", error);
        } else {
          console.log(`Company ${companyId} downgraded to Free`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerEmail = invoice.customer_email;

        if (customerEmail) {
          const resendApiKey = Deno.env.get("RESEND_API_KEY");

          if (resendApiKey) {
            const resendResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "SecuriCoach <noreply@securicoach.fr>",
                to: [customerEmail],
                subject: "Échec du paiement SecuriCoach Premium",
                html: `
                  <h2>Échec du paiement</h2>
                  <p>Bonjour,</p>
                  <p>Votre paiement SecuriCoach Premium a échoué. Veuillez mettre à jour vos informations de paiement pour continuer à profiter de toutes les fonctionnalités Premium.</p>
                  <p>Cordialement,<br>L'équipe SecuriCoach</p>
                `,
              }),
            });

            if (resendResponse.ok) {
              console.log(`Payment failed email sent to ${customerEmail}`);
            } else {
              console.error("Error sending payment failed email:", await resendResponse.text());
            }
          } else {
            console.log("RESEND_API_KEY not configured, skipping email");
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: any) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
