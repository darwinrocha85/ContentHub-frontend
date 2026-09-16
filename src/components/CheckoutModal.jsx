import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { api } from "../api";

function formatPrice(cents, currency) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

/** Formulario real de Stripe: se monta dentro de <Elements> una vez tenemos
 * client_secret + publishable_key, es decir, cuando el backend está
 * configurado con claves de Stripe de verdad (ver deps.get_payment_gateway).
 * Usa el test card 4242 4242 4242 4242 / cualquier fecha futura / cualquier CVC. */
function StripePayForm({ purchaseId, buyerId, onDone, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (error) {
        onError(error.message || "El pago no se pudo procesar");
        return;
      }
      if (paymentIntent && paymentIntent.status === "succeeded") {
        const confirmed = await api.confirmPurchase(purchaseId, buyerId);
        onDone(confirmed);
      } else {
        onError("El pago quedó en un estado inesperado, inténtalo de nuevo.");
      }
    } catch (err) {
      onError(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handlePay}>
      <PaymentElement />
      <button className="primary" style={{ marginTop: 14 }} disabled={paying || !stripe}>
        {paying ? "Procesando pago…" : "Pagar"}
      </button>
    </form>
  );
}

export default function CheckoutModal({ item, buyerId, onClose, onPurchased }) {
  const [checkoutData, setCheckoutData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .checkout(buyerId, item.id)
      .then((data) => {
        if (!cancelled) setCheckoutData(data);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [buyerId, item.id]);

  // El gateway simulado devuelve un client_secret con este sufijo y ninguna
  // publishable_key real; en ese caso no hay nada que montar con Stripe.js.
  const isMockFlow = !checkoutData?.publishable_key;

  const stripePromise = useMemo(() => {
    if (!checkoutData?.publishable_key) return null;
    return loadStripe(checkoutData.publishable_key);
  }, [checkoutData?.publishable_key]);

  const handleMockConfirm = async () => {
    setConfirming(true);
    setError(null);
    try {
      const result = await api.confirmPurchase(checkoutData.purchase_id, buyerId);
      setDone(true);
      onPurchased(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Comprar: {item.title}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {loading && <p className="empty">Preparando el pago…</p>}
        {error && <div className="error-banner">{error}</div>}

        {done && (
          <div className="card" style={{ borderColor: "var(--ok)" }}>
            <p>✅ Compra confirmada. Ya tienes acceso a este contenido.</p>
          </div>
        )}

        {!loading && checkoutData && !done && (
          <>
            <p className="desc">
              Total: <strong>{formatPrice(checkoutData.amount_cents, checkoutData.currency)}</strong>
            </p>

            {isMockFlow ? (
              <>
                <p className="flagged-note" style={{ color: "var(--text-dim)" }}>
                  No hay claves de Stripe configuradas en el backend, así que
                  esto usa un pago simulado (mismo flujo, sin cobro real). Con
                  STRIPE_SECRET_KEY / STRIPE_PUBLISHABLE_KEY definidas, aquí
                  aparecería el formulario real de Stripe.
                </p>
                <button className="primary" onClick={handleMockConfirm} disabled={confirming}>
                  {confirming ? "Confirmando…" : "Confirmar compra (simulada)"}
                </button>
              </>
            ) : (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret: checkoutData.client_secret }}
              >
                <StripePayForm
                  purchaseId={checkoutData.purchase_id}
                  buyerId={buyerId}
                  onDone={(result) => {
                    setDone(true);
                    onPurchased(result);
                  }}
                  onError={setError}
                />
              </Elements>
            )}
          </>
        )}
      </div>
    </div>
  );
}
