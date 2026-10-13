import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
} from "react";
import { AlertCircle, ArrowRight, Check, X } from "lucide-react";
import type { Customer } from "../api";
import { money } from "../formatMoney";
import type { CartLine } from "./Cart";

function validateCustomer(
  customer: Customer,
): Record<keyof Customer, string | null> {
  const nameLength = customer.name.trim().length;
  const addressLength = customer.address.trim().length;
  const phone = customer.phone.trim();

  return {
    name:
      nameLength < 2 || nameLength > 100
        ? "Enter a name between 2 and 100 characters."
        : null,
    phone: /^\d{10}$/.test(phone)
      ? null
      : "Enter exactly 10 digits (0–9) for your phone number.",
    address:
      addressLength < 5 || addressLength > 300
        ? "Enter a delivery address between 5 and 300 characters."
        : null,
  };
}

export function CheckoutDialog({
  lines,
  total,
  submitting,
  submitError,
  onClose,
  onSubmit,
}: {
  lines: CartLine[];
  total: number;
  submitting: boolean;
  submitError: string | null;
  onClose: () => void;
  onSubmit: (customer: Customer) => void;
}) {
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    address: "",
    phone: "",
  });
  const [touched, setTouched] = useState<Record<keyof Customer, boolean>>({
    name: false,
    phone: false,
    address: false,
  });
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [phoneInputError, setPhoneInputError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const errors = validateCustomer(customer);
  const visibleErrors = {
    name: touched.name || attemptedSubmit ? errors.name : null,
    phone:
      touched.phone || attemptedSubmit || phoneInputError
        ? phoneInputError || errors.phone
        : null,
    address: touched.address || attemptedSubmit ? errors.address : null,
  };

  function markTouched(field: keyof Customer) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function updatePhone(value: string) {
    if (!/^\d{0,10}$/.test(value)) {
      setPhoneInputError(
        "Use digits only, up to 10. Invalid text was not added.",
      );
      markTouched("phone");
      return;
    }
    setPhoneInputError(null);
    setCustomer((current) => ({ ...current, phone: value }));
  }

  function handlePhonePaste(event: ClipboardEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pasted = event.clipboardData.getData("text");
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    const nextValue =
      input.value.slice(0, start) + pasted + input.value.slice(end);
    if (!/^\d{0,10}$/.test(nextValue)) {
      event.preventDefault();
      setPhoneInputError(
        "Use digits only, up to 10. Invalid pasted text was not added.",
      );
      markTouched("phone");
    }
  }

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    nameRef.current?.focus();
    return () => {
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      if (
        !dialog.contains(active) ||
        (event.shiftKey && active === first) ||
        (!event.shiftKey && active === last)
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, submitting]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = {
      name: customer.name.trim(),
      address: customer.address.trim(),
      phone: customer.phone.trim(),
    };
    const nextErrors = validateCustomer(cleaned);
    setAttemptedSubmit(true);
    const firstInvalid = (["name", "phone", "address"] as const).find(
      (field) => nextErrors[field] || (field === "phone" && phoneInputError),
    );
    if (firstInvalid === "name") nameRef.current?.focus();
    if (firstInvalid === "phone") phoneRef.current?.focus();
    if (firstInvalid === "address") addressRef.current?.focus();
    if (!firstInvalid) onSubmit(cleaned);
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="checkout-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        <div className="checkout-dialog__header">
          <div>
            <span className="eyebrow eyebrow--green">Almost there</span>
            <h2 id="checkout-title">Delivery details</h2>
            <p>Tell us where to bring your food.</p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close checkout"
          >
            <X size={22} />
          </button>
        </div>
        <div className="checkout-dialog__body">
          <form id="checkout-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="customer-name">Full name</label>
            <input
              ref={nameRef}
              id="customer-name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              maxLength={100}
              value={customer.name}
              onChange={(event) =>
                setCustomer({ ...customer, name: event.target.value })
              }
              onBlur={() => markTouched("name")}
              aria-invalid={Boolean(visibleErrors.name)}
              aria-describedby={
                visibleErrors.name ? "customer-name-error" : undefined
              }
              required
            />
            {visibleErrors.name && (
              <div
                className="inline-error"
                id="customer-name-error"
                role="alert"
              >
                <AlertCircle size={17} aria-hidden="true" />
                {visibleErrors.name}
              </div>
            )}
            <label htmlFor="customer-phone">Phone number</label>
            <input
              ref={phoneRef}
              id="customer-phone"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              placeholder="10-digit phone number"
              maxLength={10}
              value={customer.phone}
              onChange={(event) => updatePhone(event.target.value)}
              onPaste={handlePhonePaste}
              onBlur={() => markTouched("phone")}
              aria-invalid={Boolean(visibleErrors.phone)}
              aria-describedby={
                visibleErrors.phone ? "customer-phone-error" : undefined
              }
              required
            />
            {visibleErrors.phone && (
              <div
                className="inline-error"
                id="customer-phone-error"
                role="alert"
              >
                <AlertCircle size={17} aria-hidden="true" />
                {visibleErrors.phone}
              </div>
            )}
            <label htmlFor="customer-address">Delivery address</label>
            <textarea
              ref={addressRef}
              id="customer-address"
              autoComplete="street-address"
              rows={3}
              placeholder="House or flat number, street, area, city"
              maxLength={300}
              value={customer.address}
              onChange={(event) =>
                setCustomer({ ...customer, address: event.target.value })
              }
              onBlur={() => markTouched("address")}
              aria-invalid={Boolean(visibleErrors.address)}
              aria-describedby={
                visibleErrors.address ? "customer-address-error" : undefined
              }
              required
            />
            {visibleErrors.address && (
              <div
                className="inline-error"
                id="customer-address-error"
                role="alert"
              >
                <AlertCircle size={17} aria-hidden="true" />
                {visibleErrors.address}
              </div>
            )}
            {submitError && (
              <div className="inline-error" role="alert">
                <AlertCircle size={17} aria-hidden="true" />
                {submitError}
              </div>
            )}
          </form>
          <div className="checkout-recap">
            <h3>Your order</h3>
            {lines.map(({ item, quantity }) => (
              <div key={item.id}>
                <span>
                  {quantity} × {item.name}
                </span>
                <strong>{money(item.price * quantity)}</strong>
              </div>
            ))}
            <div className="checkout-recap__total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
          </div>
        </div>
        <div className="checkout-dialog__footer">
          <p>
            <Check size={15} aria-hidden="true" /> Prepared fresh after you
            order
          </p>
          <button
            className="button button--primary button--full"
            form="checkout-form"
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" aria-hidden="true" /> Placing your
                order…
              </>
            ) : (
              <>
                Place order · {money(total)}{" "}
                <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
