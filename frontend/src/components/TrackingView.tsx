import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  ChefHat,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
} from "lucide-react";
import type { MenuItem, Order, OrderStatus } from "../api";
import { money } from "../formatMoney";

const STATUS_STEPS: OrderStatus[] = [
  "Received",
  "Preparing",
  "Out for Delivery",
];

export function TrackingView({
  order,
  orderId,
  loading,
  error,
  menu,
  onRetry,
  onMenu,
}: {
  order: Order | null;
  orderId: string | null;
  loading: boolean;
  error: string | null;
  menu: MenuItem[];
  onRetry: () => void;
  onMenu: () => void;
}) {
  if (!order) {
    return (
      <section className="tracking-page tracking-page--state">
        <button className="back-link" onClick={onMenu} type="button">
          <ArrowLeft size={17} /> Back to menu
        </button>
        <div className="state-panel">
          {loading ? (
            <>
              <span className="spinner spinner--dark" />
              <h1>Finding your order…</h1>
              <p>We’re getting its latest status.</p>
            </>
          ) : (
            <>
              <AlertCircle size={38} />
              <h1>We couldn’t load your order</h1>
              <p>{error || "Please try again in a moment."}</p>
              <button
                className="button button--primary"
                type="button"
                onClick={onRetry}
              >
                <RefreshCw size={17} /> Try again
              </button>
            </>
          )}
          {orderId && <span className="state-panel__id">Order {orderId}</span>}
        </div>
      </section>
    );
  }

  const activeStep = Math.max(0, STATUS_STEPS.indexOf(order.status));
  const currentMessage =
    order.status === "Received"
      ? "Your order is in. The kitchen will start preparing it shortly."
      : order.status === "Preparing"
        ? "Our kitchen is making your food fresh, just for you."
        : "Your food is on its way. Get ready to enjoy it!";

  return (
    <section className="tracking-page" aria-live="polite">
      <button className="back-link" onClick={onMenu} type="button">
        <ArrowLeft size={17} /> Back to menu
      </button>
      <div className="tracking-hero">
        <div className="tracking-hero__content">
          <span className="eyebrow eyebrow--light">
            <span className="live-dot" /> Live order updates
          </span>
          <h1>
            Good things are
            <br />
            <em>on their way.</em>
          </h1>
          <p>
            Thanks, {order.customer.name.split(" ")[0]}! Follow your order as it
            moves from our kitchen to your door.
          </p>
        </div>
        <div className="tracking-hero__visual" aria-hidden="true">
          <div className="tracking-hero__circle">
            <Bike size={105} strokeWidth={1.3} />
          </div>
          <span className="tracking-hero__spark">✦</span>
        </div>
      </div>

      <div className="tracking-grid">
        <div className="tracking-card tracking-card--status">
          <div className="tracking-card__top">
            <div>
              <span className="eyebrow eyebrow--green">Order status</span>
              <h2>{order.status}</h2>
            </div>
            <span className="status-pill">
              <span className="live-dot" /> Updates automatically
            </span>
          </div>
          <p className="tracking-message">{currentMessage}</p>
          <ol className="status-steps">
            {STATUS_STEPS.map((status, index) => {
              const complete = index < activeStep;
              const active = index === activeStep;
              const Icon =
                index === 0 ? PackageCheck : index === 1 ? ChefHat : Bike;
              return (
                <li
                  className={`${complete ? "is-complete" : ""} ${active ? "is-active" : ""}`}
                  key={status}
                  aria-current={active ? "step" : undefined}
                >
                  <div className="status-steps__icon">
                    {complete ? (
                      <Check size={22} strokeWidth={2.5} aria-hidden="true" />
                    ) : (
                      <Icon size={22} aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <strong>{status}</strong>
                    <span>
                      {index === 0
                        ? "Order confirmed"
                        : index === 1
                          ? "Made fresh in our kitchen"
                          : "Heading to your doorstep"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
          {error && (
            <div className="inline-error tracking-refresh-error" role="alert">
              <AlertCircle size={17} /> Status refresh paused.{" "}
              <button type="button" onClick={onRetry}>
                Retry now
              </button>
            </div>
          )}
        </div>
        <div className="tracking-card tracking-card--details">
          <h2>Order details</h2>
          <div className="order-reference">
            <span>Order number</span>
            <strong>#{order.id}</strong>
          </div>
          <div className="order-lines">
            {order.items.map((item, index) => {
              const itemName =
                item.name ||
                menu.find((menuItem) => menuItem.id === item.menuItemId)
                  ?.name ||
                "Menu item";
              return (
                <div key={`${item.menuItemId}-${index}`}>
                  <span>
                    {item.quantity} × {itemName}
                  </span>
                  {typeof item.price === "number" && (
                    <strong>{money(item.price * item.quantity)}</strong>
                  )}
                </div>
              );
            })}
          </div>
          <div className="order-total">
            <span>Total</span>
            <strong>{money(order.total)}</strong>
          </div>
          <div className="delivery-details">
            <span>
              <MapPin size={17} aria-hidden="true" /> Delivering to
            </span>
            <p>{order.customer.address}</p>
            <span>
              <Phone size={17} aria-hidden="true" /> {order.customer.phone}
            </span>
          </div>
          <button
            className="button button--outline button--full"
            type="button"
            onClick={onMenu}
          >
            Explore the menu <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}
