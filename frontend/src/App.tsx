import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bike,
  ChefHat,
  Clock3,
  Heart,
  Leaf,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import {
  ApiError,
  createOrder,
  fetchMenu,
  fetchOrder,
  type Customer,
  type MenuItem,
  type Order,
  type OrderItem,
} from "./api";
import { fallbackArt } from "./art";
import { Cart } from "./components/Cart";
import { MenuCard } from "./components/MenuCard";
import { CheckoutDialog } from "./components/CheckoutDialog";
import { TrackingView } from "./components/TrackingView";

const STORAGE_KEY = "hearth-harvest-active-order";

interface SavedOrder {
  id: string;
  accessToken: string;
}

function forgetSavedOrder(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be disabled.
  }
}

function savedOrder(): SavedOrder | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored: unknown = JSON.parse(raw);
    if (
      typeof stored === "object" &&
      stored !== null &&
      "id" in stored &&
      typeof stored.id === "string" &&
      stored.id.length > 0 &&
      "accessToken" in stored &&
      typeof stored.accessToken === "string" &&
      stored.accessToken.length > 0
    ) {
      return { id: stored.id, accessToken: stored.accessToken };
    }
  } catch {
    // Legacy IDs and malformed values cannot authenticate a tracking request.
  }
  forgetSavedOrder();
  return null;
}

function rememberOrder(order: SavedOrder): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // Orders still work if storage is disabled.
  }
}

export default function App() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [menuState, setMenuState] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [menuError, setMenuError] = useState<string | null>(null);
  const [menuRequest, setMenuRequest] = useState(0);
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [trackingCredentials, setTrackingCredentials] =
    useState<SavedOrder | null>(savedOrder);
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(
    Boolean(trackingCredentials),
  );
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [trackingRequest, setTrackingRequest] = useState(0);
  const [view, setView] = useState<"menu" | "tracking">(
    trackingCredentials ? "tracking" : "menu",
  );
  const trackedOrderId = trackingCredentials?.id ?? null;
  const cartRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    setMenuState("loading");
    fetchMenu(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) {
          setMenu(items);
          setMenuState("success");
          setMenuError(null);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setMenuState("error");
          setMenuError(
            error instanceof Error
              ? error.message
              : "We could not load the menu.",
          );
        }
      });
    return () => controller.abort();
  }, [menuRequest]);

  useEffect(() => {
    if (!trackingCredentials) return;
    const { id, accessToken } = trackingCredentials;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function refresh() {
      try {
        const updated = await fetchOrder(id, accessToken);
        if (cancelled) return;
        setOrder(updated);
        setTrackingLoading(false);
        setTrackingError(null);
        if (updated.status !== "Out for Delivery")
          timer = setTimeout(refresh, 5000);
      } catch (error) {
        if (cancelled) return;
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 404)
        ) {
          forgetSavedOrder();
          setTrackingCredentials(null);
          setOrder(null);
          setTrackingLoading(false);
          setTrackingError(null);
          setView("menu");
          return;
        }
        setTrackingLoading(false);
        setTrackingError(
          error instanceof Error
            ? error.message
            : "We could not refresh your order.",
        );
        timer = setTimeout(refresh, 5000);
      }
    }

    void refresh();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trackingCredentials, trackingRequest]);

  const cartLines = menu
    .filter((item) => (quantities[item.id] || 0) > 0)
    .map((item) => ({ item, quantity: quantities[item.id] }));
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const total =
    cartLines.reduce(
      (sum, line) => sum + Math.round(line.item.price * 100) * line.quantity,
      0,
    ) / 100;
  const visibleMenu = menu.filter((item) =>
    `${item.name} ${item.description}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  function adjustQuantity(id: string, change: number) {
    setQuantities((current) => ({
      ...current,
      [id]: Math.min(99, Math.max(0, (current[id] || 0) + change)),
    }));
  }

  function showMenu() {
    setView("menu");
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function showTracking() {
    setView("tracking");
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function scrollToMenu() {
    setView("menu");
    requestAnimationFrame(() =>
      menuRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" }),
    );
  }

  function scrollToCart() {
    setView("menu");
    requestAnimationFrame(() =>
      cartRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" }),
    );
  }

  async function placeOrder(customer: Customer) {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const items: OrderItem[] = cartLines.map(({ item, quantity }) => ({
        menuItemId: item.id,
        quantity,
      }));
      const created = await createOrder(customer, items);
      setOrder(created);
      const credentials = {
        id: String(created.id),
        accessToken: created.accessToken,
      };
      setTrackingCredentials(credentials);
      rememberOrder(credentials);
      setTrackingLoading(false);
      setTrackingError(null);
      setTrackingRequest((value) => value + 1);
      setQuantities({});
      setCheckoutOpen(false);
      setView("tracking");
      window.scrollTo?.({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not place your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container site-header__inner">
          <button
            className="brand"
            type="button"
            onClick={showMenu}
            aria-label="Hearth and Harvest home"
          >
            <span className="brand__mark">
              <Leaf size={22} fill="currentColor" strokeWidth={1.5} />
            </span>
            <span>
              hearth<span className="brand__amp">&</span>harvest
              <span className="brand__period">.</span>
            </span>
          </button>
          <nav aria-label="Main navigation">
            <button
              className={view === "menu" ? "nav-link is-active" : "nav-link"}
              type="button"
              onClick={scrollToMenu}
            >
              Menu
            </button>
            {trackedOrderId && (
              <button
                className={
                  view === "tracking" ? "nav-link is-active" : "nav-link"
                }
                type="button"
                onClick={showTracking}
              >
                Track order
              </button>
            )}
          </nav>
          <button
            className="header-bag"
            type="button"
            onClick={scrollToCart}
            aria-label={`View cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
          >
            <ShoppingBag size={19} aria-hidden="true" />
            <span>My bag</span>
            <span className="header-bag__count">{cartCount}</span>
          </button>
        </div>
      </header>

      <main id="main">
        {view === "menu" ? (
          <>
            <section className="hero container" aria-labelledby="hero-heading">
              <div className="hero__copy">
                <span className="eyebrow eyebrow--light">
                  <span className="eyebrow__line" /> Made fresh, delivered happy
                </span>
                <h1 id="hero-heading">
                  Your next <em>favorite meal</em> is just a click away.
                </h1>
                <p>
                  Comforting flavors, fresh ingredients, and food worth looking
                  forward to. Pick what you love and we’ll handle the rest.
                </p>
                <button
                  className="button button--cream"
                  type="button"
                  onClick={scrollToMenu}
                >
                  Explore the menu <ArrowRight size={19} aria-hidden="true" />
                </button>
                <div className="hero__micro">
                  <span className="hero__stars" aria-hidden="true">
                    ★★★★★
                  </span>
                  <span>Made with care, delivered with love</span>
                </div>
              </div>
              <div className="hero__visual" aria-hidden="true">
                <div className="hero__halo" />
                <div className="hero__food">
                  <img src={fallbackArt("salad")} alt="" />
                </div>
                <div className="hero__badge hero__badge--top">
                  <span>
                    <Leaf size={18} />
                  </span>
                  <div>
                    <strong>Always fresh</strong>
                    <small>Goodness in every bite</small>
                  </div>
                </div>
                <div className="hero__badge hero__badge--bottom">
                  <span>
                    <Heart size={18} fill="currentColor" />
                  </span>
                  <div>
                    <strong>Made for you</strong>
                    <small>Prepared with care</small>
                  </div>
                </div>
                <span className="hero__spark hero__spark--one">✦</span>
                <span className="hero__spark hero__spark--two">✳</span>
              </div>
            </section>

            <section className="perks container" aria-label="Why order with us">
              <div>
                <span>
                  <Leaf size={21} />
                </span>
                <div>
                  <strong>Fresh ingredients</strong>
                  <p>Good food starts here</p>
                </div>
              </div>
              <div>
                <span>
                  <ChefHat size={22} />
                </span>
                <div>
                  <strong>Made to order</strong>
                  <p>Prepared just for you</p>
                </div>
              </div>
              <div>
                <span>
                  <Bike size={23} />
                </span>
                <div>
                  <strong>Easy delivery</strong>
                  <p>From our kitchen to you</p>
                </div>
              </div>
            </section>

            <section
              className="menu-section container"
              id="menu"
              ref={menuRef}
              aria-labelledby="menu-heading"
            >
              <div className="menu-section__intro">
                <div>
                  <span className="eyebrow eyebrow--green">
                    <span className="eyebrow__line" /> Our menu
                  </span>
                  <h2 id="menu-heading">
                    Something good for <em>every craving.</em>
                  </h2>
                  <p>
                    Explore thoughtfully prepared favorites for every kind of
                    appetite.
                  </p>
                </div>
                <label className="search-field">
                  <Search size={19} aria-hidden="true" />
                  <span className="sr-only">Search menu</span>
                  <input
                    type="search"
                    placeholder="Search the menu"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
              </div>

              <div className="menu-layout">
                <div className="menu-list">
                  {menuState === "loading" && (
                    <div className="menu-grid" aria-label="Loading menu">
                      {Array.from({ length: 6 }, (_, index) => (
                        <div className="menu-skeleton" key={index}>
                          <div />
                          <span />
                          <span />
                          <span />
                        </div>
                      ))}
                    </div>
                  )}
                  {menuState === "error" && (
                    <div className="menu-feedback">
                      <AlertCircle size={38} />
                      <h3>Menu unavailable right now</h3>
                      <p>{menuError}</p>
                      <button
                        className="button button--primary"
                        type="button"
                        onClick={() => setMenuRequest((value) => value + 1)}
                      >
                        <RefreshCw size={17} /> Try again
                      </button>
                    </div>
                  )}
                  {menuState === "success" && menu.length === 0 && (
                    <div className="menu-feedback">
                      <ShoppingBag size={38} />
                      <h3>Our menu is taking a moment</h3>
                      <p>Please check back soon for something delicious.</p>
                      <button
                        className="button button--primary"
                        type="button"
                        onClick={() => setMenuRequest((value) => value + 1)}
                      >
                        <RefreshCw size={17} /> Refresh menu
                      </button>
                    </div>
                  )}
                  {menuState === "success" &&
                    menu.length > 0 &&
                    visibleMenu.length === 0 && (
                      <div className="menu-feedback">
                        <Search size={38} />
                        <h3>No dishes found</h3>
                        <p>Try another search to find your next favorite.</p>
                        <button
                          className="button button--outline"
                          type="button"
                          onClick={() => setSearch("")}
                        >
                          Clear search
                        </button>
                      </div>
                    )}
                  {menuState === "success" && visibleMenu.length > 0 && (
                    <div className="menu-grid">
                      {visibleMenu.map((item) => (
                        <MenuCard
                          key={item.id}
                          item={item}
                          quantity={quantities[item.id] || 0}
                          onIncrease={() => adjustQuantity(item.id, 1)}
                          onDecrease={() => adjustQuantity(item.id, -1)}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <aside
                  className="cart-sidebar"
                  id="cart"
                  ref={cartRef}
                  aria-label="Shopping cart"
                >
                  <Cart
                    lines={cartLines}
                    total={total}
                    onAdjust={adjustQuantity}
                    onCheckout={() => {
                      setSubmitError(null);
                      setCheckoutOpen(true);
                    }}
                  />
                  <div className="cart-note">
                    <Clock3 size={18} />
                    <p>
                      Every meal is prepared after you order, so it arrives just
                      right.
                    </p>
                  </div>
                </aside>
              </div>
            </section>

            <section className="closing-banner container">
              <div>
                <span className="eyebrow eyebrow--green">
                  <Sparkles size={15} /> A little joy, delivered
                </span>
                <h2>
                  Good food makes
                  <br />
                  <em>any day better.</em>
                </h2>
                <p>Find your new favorite in the menu above.</p>
              </div>
              <div className="closing-banner__art" aria-hidden="true">
                <img src={fallbackArt("pizza")} alt="" />
              </div>
            </section>
          </>
        ) : (
          <TrackingView
            order={order}
            orderId={trackedOrderId}
            loading={trackingLoading}
            error={trackingError}
            menu={menu}
            onRetry={() => {
              setTrackingLoading(!order);
              setTrackingRequest((value) => value + 1);
            }}
            onMenu={showMenu}
          />
        )}
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-brand">
            <span className="brand__mark">
              <Leaf size={20} fill="currentColor" strokeWidth={1.5} />
            </span>
            <strong>
              hearth<span>&</span>harvest.
            </strong>
          </div>
          <p>Fresh food. Happy moments. Made with care.</p>
          <span>© {new Date().getFullYear()} Hearth & Harvest</span>
        </div>
      </footer>

      {checkoutOpen && (
        <CheckoutDialog
          lines={cartLines}
          total={total}
          submitting={submitting}
          submitError={submitError}
          onClose={() => setCheckoutOpen(false)}
          onSubmit={placeOrder}
        />
      )}
    </div>
  );
}
