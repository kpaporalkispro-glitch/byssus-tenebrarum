// ======================================================
// BYSSUS TENEBRARUM
// APP.JS GLOBAL
// ======================================================
//
// Ce fichier centralise les fonctions communes du site :
//
// - panier
// - favoris
// - compteur panier
// - notifications
// - navigation mobile
// - newsletter
// - produits récemment consultés
// - stockage local
// - utilitaires
//
// IMPORTANT :
// products.js doit être chargé AVANT app.js
//
// Exemple :
//
// <script src="assets/js/products.js"></script>
// <script src="assets/js/app.js"></script>
//
// ======================================================



// ======================================================
// CONFIGURATION GLOBALE
// ======================================================

const BYSSUS_CONFIG = {

  storageKeys: {

    cart:
      "byssus-cart",

    wishlist:
      "byssus-wishlist",

    customer:
      "byssus-customer",

    cartOptions:
      "byssus-cart-options",

    checkout:
      "byssus-checkout",

    lastOrder:
      "byssus-last-order",

    orders:
      "byssus-orders",

    promo:
      "byssus-promo",

    newsletter:
      "byssus-newsletter",

    recentlyViewed:
      "byssus-recently-viewed"

  },


  currency:
    "EUR",


  locale:
    "fr-FR",


  cartPage:
    "cart.html",


  shopPage:
    "shop.html",


  productPage:
    "product.html",


  checkoutPage:
    "checkout.html",


  maxRecentlyViewed:
    8

};


// ======================================================
// INITIALISATION
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeByssusApp();

  }
);



function initializeByssusApp() {

  updateGlobalCartBadge();

  restoreWishlistButtons();

  initializeMobileNavigation();

  initializeNewsletterForms();

  initializeExternalProductLinks();

}



// ======================================================
// STORAGE
// ======================================================

function readStorageArray(key) {

  try {

    const value =
      JSON.parse(
        localStorage.getItem(key)
        ||
        "[]"
      );


    return Array.isArray(value)
      ? value
      : [];

  }
  catch (error) {

    console.warn(
      `Impossible de lire ${key}`,
      error
    );


    return [];

  }

}



function readStorageObject(key) {

  try {

    const value =
      JSON.parse(
        localStorage.getItem(key)
        ||
        "{}"
      );


    return (
      value
      &&
      typeof value === "object"
      &&
      !Array.isArray(value)
    )
      ? value
      : {};

  }
  catch (error) {

    console.warn(
      `Impossible de lire ${key}`,
      error
    );


    return {};

  }

}



function writeStorage(
  key,
  value
) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );


    return true;

  }
  catch (error) {

    console.warn(
      `Impossible d'enregistrer ${key}`,
      error
    );


    return false;

  }

}



function removeStorage(key) {

  try {

    localStorage.removeItem(
      key
    );

  }
  catch (error) {

    console.warn(
      `Impossible de supprimer ${key}`,
      error
    );

  }

}



// ======================================================
// PANIER
// ======================================================

function getCart() {

  return readStorageArray(
    BYSSUS_CONFIG.storageKeys.cart
  );

}



function saveCart(cart) {

  writeStorage(
    BYSSUS_CONFIG.storageKeys.cart,
    cart
  );


  updateGlobalCartBadge();


  document.dispatchEvent(
    new CustomEvent(
      "byssus:cart-updated",
      {
        detail: {
          cart
        }
      }
    )
  );

}



function getCartCount() {

  return getCart()
    .reduce(
      (total, item) => {

        return (
          total
          +
          Number(
            item.quantity || 0
          )
        );

      },
      0
    );

}



function getCartSubtotal() {

  const cart =
    getCart();


  if (
    typeof window.getProductById
    !==
    "function"
  ) {

    return 0;

  }


  return cart.reduce(
    (
      total,
      item
    ) => {

      const product =
        window.getProductById(
          item.id
        );


      if (!product) {

        return total;

      }


      return (
        total
        +
        Number(
          product.price || 0
        )
        *
        Number(
          item.quantity || 1
        )
      );

    },
    0
  );

}



// ======================================================
// AJOUT AU PANIER
// ======================================================

function addToCart(
  productId,
  quantity = 1,
  options = {}
) {

  if (!productId) {

    return false;

  }


  const product =
    typeof window.getProductById
    ===
    "function"
      ? window.getProductById(
          productId
        )
      : null;


  if (!product) {

    showToast(
      "Création introuvable.",
      "error"
    );


    return false;

  }


  let qty =
    Number(quantity);


  if (
    !Number.isFinite(qty)
    ||
    qty < 1
  ) {

    qty = 1;

  }


  const cart =
    getCart();


  const existing =
    cart.find(
      item =>
        item.id ===
        productId
    );


  if (existing) {

    existing.quantity =
      Number(
        existing.quantity || 1
      )
      +
      qty;


    // Limiter au stock
    // uniquement pour les produits
    // non fabriqués sur commande.

    if (
      !product.madeToOrder
      &&
      Number(product.stock) > 0
      &&
      existing.quantity
      >
      Number(product.stock)
    ) {

      existing.quantity =
        Number(product.stock);

    }

  }
  else {

    let initialQuantity =
      qty;


    if (
      !product.madeToOrder
      &&
      Number(product.stock) > 0
      &&
      initialQuantity
      >
      Number(product.stock)
    ) {

      initialQuantity =
        Number(product.stock);

    }


    cart.push({

      id:
        productId,

      quantity:
        initialQuantity,

      options:
        options || {}

    });

  }


  saveCart(cart);


  showToast(
    `${product.name} a été ajouté au panier.`,
    "success",
    {
      actionLabel:
        "Voir le panier",

      actionUrl:
        BYSSUS_CONFIG.cartPage
    }
  );


  return true;

}



// ======================================================
// SUPPRESSION PANIER
// ======================================================

function removeFromCart(
  productId,
  showMessage = true
) {

  let cart =
    getCart();


  const product =
    typeof window.getProductById
    ===
    "function"
      ? window.getProductById(
          productId
        )
      : null;


  cart =
    cart.filter(
      item =>
        item.id !==
        productId
    );


  saveCart(cart);


  if (showMessage) {

    showToast(
      product
        ? `${product.name} a été retiré du panier.`
        : "Produit retiré du panier.",
      "info"
    );

  }


  return cart;

}



// ======================================================
// QUANTITÉ PANIER
// ======================================================

function setCartQuantity(
  productId,
  quantity
) {

  const cart =
    getCart();


  const item =
    cart.find(
      item =>
        item.id ===
        productId
    );


  if (!item) {

    return false;

  }


  let qty =
    Number(quantity);


  if (
    !Number.isFinite(qty)
  ) {

    return false;

  }


  if (qty <= 0) {

    removeFromCart(
      productId
    );


    return true;

  }


  const product =
    typeof window.getProductById
    ===
    "function"
      ? window.getProductById(
          productId
        )
      : null;


  if (
    product
    &&
    !product.madeToOrder
    &&
    Number(product.stock) > 0
    &&
    qty >
    Number(product.stock)
  ) {

    qty =
      Number(product.stock);


    showToast(
      `Stock maximum atteint : ${qty}.`,
      "info"
    );

  }


  item.quantity =
    qty;


  saveCart(cart);


  return true;

}



function incrementCartItem(
  productId,
  amount = 1
) {

  const cart =
    getCart();


  const item =
    cart.find(
      item =>
        item.id ===
        productId
    );


  if (!item) {

    return false;

  }


  return setCartQuantity(
    productId,
    Number(
      item.quantity || 1
    )
    +
    Number(amount)
  );

}



// ======================================================
// VIDER PANIER
// ======================================================

function clearCart(
  showMessage = true
) {

  removeStorage(
    BYSSUS_CONFIG.storageKeys.cart
  );


  removeStorage(
    BYSSUS_CONFIG.storageKeys.cartOptions
  );


  updateGlobalCartBadge();


  document.dispatchEvent(
    new CustomEvent(
      "byssus:cart-updated",
      {
        detail: {
          cart: []
        }
      }
    )
  );


  if (showMessage) {

    showToast(
      "Votre panier a été vidé.",
      "info"
    );

  }

}



// ======================================================
// BADGE PANIER GLOBAL
// ======================================================

function updateGlobalCartBadge() {

  const count =
    getCartCount();


  document
    .querySelectorAll(
      "[data-cart-count]"
    )
    .forEach(
      badge => {

        badge.textContent =
          count;


        badge.setAttribute(
          "aria-label",
          `${count} article${
            count > 1
              ? "s"
              : ""
          } dans le panier`
        );


        badge.classList.toggle(
          "has-items",
          count > 0
        );

      }
    );

}



// ======================================================
// FAVORIS
// ======================================================

function getWishlist() {

  return readStorageArray(
    BYSSUS_CONFIG.storageKeys.wishlist
  );

}



function saveWishlist(
  wishlist
) {

  writeStorage(
    BYSSUS_CONFIG.storageKeys.wishlist,
    wishlist
  );


  restoreWishlistButtons();


  document.dispatchEvent(
    new CustomEvent(
      "byssus:wishlist-updated",
      {
        detail: {
          wishlist
        }
      }
    )
  );

}



function isInWishlist(
  productId
) {

  return getWishlist()
    .includes(
      productId
    );

}



function addToWishlist(
  productId
) {

  const product =
    typeof window.getProductById
    ===
    "function"
      ? window.getProductById(
          productId
        )
      : null;


  let wishlist =
    getWishlist();


  if (
    !wishlist.includes(
      productId
    )
  ) {

    wishlist.push(
      productId
    );


    saveWishlist(
      wishlist
    );


    showToast(
      product
        ? `${product.name} a été ajouté à vos favoris.`
        : "Ajouté à vos favoris.",
      "success"
    );

  }


  return wishlist;

}



function removeFromWishlist(
  productId
) {

  const product =
    typeof window.getProductById
    ===
    "function"
      ? window.getProductById(
          productId
        )
      : null;


  let wishlist =
    getWishlist();


  wishlist =
    wishlist.filter(
      id =>
        id !==
        productId
    );


  saveWishlist(
    wishlist
  );


  showToast(
    product
      ? `${product.name} a été retiré de vos favoris.`
      : "Retiré de vos favoris.",
    "info"
  );


  return wishlist;

}



function toggleWishlist(
  productId,
  button = null
) {

  let added;


  if (
    isInWishlist(
      productId
    )
  ) {

    removeFromWishlist(
      productId
    );


    added = false;

  }
  else {

    addToWishlist(
      productId
    );


    added = true;

  }


  if (button) {

    updateWishlistButton(
      button,
      added
    );

  }


  return added;

}



// ======================================================
// SYNCHRO BOUTONS FAVORIS
// ======================================================

function restoreWishlistButtons() {

  const wishlist =
    getWishlist();


  document
    .querySelectorAll(
      "[data-wishlist-id]"
    )
    .forEach(
      button => {

        const productId =
          button.dataset.wishlistId;


        const active =
          wishlist.includes(
            productId
          );


        updateWishlistButton(
          button,
          active
        );

      }
    );

}



function updateWishlistButton(
  button,
  active
) {

  if (!button) {

    return;

  }


  button.classList.toggle(
    "active",
    active
  );


  button.setAttribute(
    "aria-pressed",
    active
      ? "true"
      : "false"
  );


  if (
    button.dataset.wishlistText
    ===
    "true"
  ) {

    button.textContent =
      active
        ? "♥ Dans mes favoris"
        : "♡ Ajouter aux favoris";

  }
  else {

    button.textContent =
      active
        ? "♥"
        : "♡";

  }

}



// ======================================================
// PRODUITS RÉCEMMENT CONSULTÉS
// ======================================================

function addRecentlyViewed(
  productId
) {

  if (!productId) {

    return;

  }


  let recent =
    readStorageArray(
      BYSSUS_CONFIG.storageKeys.recentlyViewed
    );


  recent =
    recent.filter(
      id =>
        id !==
        productId
    );


  recent.unshift(
    productId
  );


  recent =
    recent.slice(
      0,
      BYSSUS_CONFIG.maxRecentlyViewed
    );


  writeStorage(
    BYSSUS_CONFIG.storageKeys.recentlyViewed,
    recent
  );

}



function getRecentlyViewedProducts() {

  const ids =
    readStorageArray(
      BYSSUS_CONFIG.storageKeys.recentlyViewed
    );


  if (
    typeof window.getProductById
    !==
    "function"
  ) {

    return [];

  }


  return ids
    .map(
      id =>
        window.getProductById(id)
    )
    .filter(Boolean);

}



// ======================================================
// INITIALISATION LIENS PRODUIT
// ======================================================

function initializeExternalProductLinks() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const currentId =
    params.get("id");


  if (
    currentId
    &&
    window.location.pathname
      .toLowerCase()
      .includes(
        "product.html"
      )
  ) {

    addRecentlyViewed(
      currentId
    );

  }

}



// ======================================================
// NEWSLETTER
// ======================================================

function initializeNewsletterForms() {

  document
    .querySelectorAll(
      "[data-newsletter-form]"
    )
    .forEach(
      form => {

        form.addEventListener(
          "submit",
          handleNewsletterSubmit
        );

      }
    );

}



function handleNewsletterSubmit(
  event
) {

  event.preventDefault();


  const form =
    event.currentTarget;


  const input =
    form.querySelector(
      'input[type="email"]'
    );


  if (!input) {

    return;

  }


  const email =
    input.value
      .trim()
      .toLowerCase();


  if (
    !isValidEmail(
      email
    )
  ) {

    showToast(
      "Veuillez saisir une adresse e-mail valide.",
      "error"
    );


    input.focus();


    return;

  }


  let emails =
    readStorageArray(
      BYSSUS_CONFIG.storageKeys.newsletter
    );


  if (
    !emails.includes(email)
  ) {

    emails.push(
      email
    );


    writeStorage(
      BYSSUS_CONFIG.storageKeys.newsletter,
      emails
    );

  }


  input.value =
    "";


  showToast(
    "Bienvenue dans l’univers Byssus Tenebrarum.",
    "success"
  );

}



// ======================================================
// MOBILE NAVIGATION
// ======================================================

function initializeMobileNavigation() {

  const header =
    document.querySelector(
      ".site-header"
    );


  if (!header) {

    return;

  }


  const nav =
    header.querySelector(
      ".navlinks"
    );


  if (!nav) {

    return;

  }


  let toggle =
    header.querySelector(
      "[data-mobile-nav-toggle]"
    );


  if (!toggle) {

    toggle =
      document.createElement(
        "button"
      );


    toggle.type =
      "button";


    toggle.className =
      "mobile-nav-toggle";


    toggle.dataset.mobileNavToggle =
      "true";


    toggle.setAttribute(
      "aria-label",
      "Ouvrir le menu"
    );


    toggle.setAttribute(
      "aria-expanded",
      "false"
    );


    toggle.innerHTML =
      "☰";


    const navContainer =
      header.querySelector(
        ".nav"
      );


    if (navContainer) {

      navContainer.appendChild(
        toggle
      );

    }

  }


  toggle.addEventListener(
    "click",
    () => {

      const open =
        nav.classList.toggle(
          "mobile-open"
        );


      toggle.setAttribute(
        "aria-expanded",
        open
          ? "true"
          : "false"
      );


      toggle.innerHTML =
        open
          ? "×"
          : "☰";

    }
  );


  nav
    .querySelectorAll(
      "a"
    )
    .forEach(
      link => {

        link.addEventListener(
          "click",
          () => {

            nav.classList.remove(
              "mobile-open"
            );


            toggle.setAttribute(
              "aria-expanded",
              "false"
            );


            toggle.innerHTML =
              "☰";

          }
        );

      }
    );

}



// ======================================================
// TOAST / NOTIFICATIONS
// ======================================================

function showToast(
  message,
  type = "info",
  options = {}
) {

  let container =
    document.getElementById(
      "byssus-toast-container"
    );


  if (!container) {

    container =
      document.createElement(
        "div"
      );


    container.id =
      "byssus-toast-container";


    Object.assign(
      container.style,
      {

        position:
          "fixed",

        right:
          "20px",

        bottom:
          "20px",

        zIndex:
          "99999",

        display:
          "grid",

        gap:
          "10px",

        maxWidth:
          "360px"

      }
    );


    document.body.appendChild(
      container
    );

  }


  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    `byssus-toast byssus-toast-${type}`;


  Object.assign(
    toast.style,
    {

      padding:
        "14px 16px",

      borderRadius:
        "12px",

      border:
        "1px solid rgba(255,255,255,.14)",

      background:
        type === "error"
          ? "rgba(92,35,47,.96)"
          : type === "success"
            ? "rgba(37,70,49,.96)"
            : "rgba(24,18,29,.96)",

      color:
        "#fff",

      boxShadow:
        "0 12px 35px rgba(0,0,0,.32)",

      backdropFilter:
        "blur(12px)",

      fontSize:
        "13px",

      lineHeight:
        "1.5",

      opacity:
        "0",

      transform:
        "translateY(8px)",

      transition:
        "all .2s ease"

    }
  );


  const content =
    document.createElement(
      "div"
    );


  content.textContent =
    message;


  toast.appendChild(
    content
  );


  if (
    options.actionLabel
    &&
    options.actionUrl
  ) {

    const action =
      document.createElement(
        "a"
      );


    action.href =
      options.actionUrl;


    action.textContent =
      options.actionLabel;


    Object.assign(
      action.style,
      {

        display:
          "inline-block",

        marginTop:
          "8px",

        color:
          "#e1b8ef",

        textDecoration:
          "underline"

      }
    );


    toast.appendChild(
      action
    );

  }


  container.appendChild(
    toast
  );


  requestAnimationFrame(
    () => {

      toast.style.opacity =
        "1";


      toast.style.transform =
        "translateY(0)";

    }
  );


  const duration =
    Number(
      options.duration
      ||
      3500
    );


  setTimeout(
    () => {

      toast.style.opacity =
        "0";


      toast.style.transform =
        "translateY(8px)";


      setTimeout(
        () => {

          toast.remove();

        },
        220
      );

    },
    duration
  );

}



// ======================================================
// URL PRODUIT
// ======================================================

function getProductUrl(
  productId
) {

  return (
    `${BYSSUS_CONFIG.productPage}?id=`
    +
    encodeURIComponent(
      productId
    )
  );

}



// ======================================================
// NAVIGUER VERS PRODUIT
// ======================================================

function goToProduct(
  productId
) {

  window.location.href =
    getProductUrl(
      productId
    );

}



// ======================================================
// ACHAT IMMÉDIAT
// ======================================================

function buyNow(
  productId,
  quantity = 1
) {

  const added =
    addToCart(
      productId,
      quantity
    );


  if (added) {

    window.location.href =
      BYSSUS_CONFIG.cartPage;

  }

}



// ======================================================
// CLIENT
// ======================================================

function getCustomer() {

  return readStorageObject(
    BYSSUS_CONFIG.storageKeys.customer
  );

}



function saveCustomer(
  customer
) {

  writeStorage(
    BYSSUS_CONFIG.storageKeys.customer,
    customer || {}
  );

}



// ======================================================
// COMMANDES
// ======================================================

function getOrders() {

  return readStorageArray(
    BYSSUS_CONFIG.storageKeys.orders
  );

}



function getLastOrder() {

  return readStorageObject(
    BYSSUS_CONFIG.storageKeys.lastOrder
  );

}



function archiveOrder(
  order
) {

  if (
    !order
    ||
    !order.orderId
  ) {

    return false;

  }


  let orders =
    getOrders();


  if (
    !orders.some(
      item =>
        item.orderId
        ===
        order.orderId
    )
  ) {

    orders.unshift(
      order
    );


    writeStorage(
      BYSSUS_CONFIG.storageKeys.orders,
      orders
    );

  }


  writeStorage(
    BYSSUS_CONFIG.storageKeys.lastOrder,
    order
  );


  return true;

}



// ======================================================
// FORMAT PRIX
// ======================================================

function byssusFormatPrice(
  value
) {

  if (
    typeof window.formatPrice
    ===
    "function"
    &&
    window.formatPrice
    !==
    byssusFormatPrice
  ) {

    return window.formatPrice(
      Number(value || 0)
    );

  }


  return new Intl.NumberFormat(
    BYSSUS_CONFIG.locale,
    {

      style:
        "currency",

      currency:
        BYSSUS_CONFIG.currency

    }
  )
    .format(
      Number(
        value || 0
      )
    );

}



// ======================================================
// EMAIL
// ======================================================

function isValidEmail(
  email
) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(
      String(
        email || ""
      )
      .trim()
    );

}



// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtmlGlobal(
  value
) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}



// ======================================================
// CAPITALIZE
// ======================================================

function capitalizeFirstLetterGlobal(
  value
) {

  const text =
    String(
      value || ""
    );


  if (!text) {

    return "";

  }


  return (
    text
      .charAt(0)
      .toUpperCase()
    +
    text
      .slice(1)
  );

}



// ======================================================
// SCROLL TO TOP
// ======================================================

function scrollToTop(
  smooth = true
) {

  window.scrollTo({

    top:
      0,

    behavior:
      smooth
        ? "smooth"
        : "auto"

  });

}



// ======================================================
// CONFIRMATION SIMPLE
// ======================================================

function confirmAction(
  message
) {

  return window.confirm(
    message
  );

}



// ======================================================
// QUERY PARAM
// ======================================================

function getQueryParam(
  name
) {

  const params =
    new URLSearchParams(
      window.location.search
    );


  return params.get(
    name
  );

}



// ======================================================
// CLIPBOARD
// ======================================================

async function copyToClipboard(
  value
) {

  try {

    await navigator
      .clipboard
      .writeText(
        value
      );


    showToast(
      "Copié.",
      "success"
    );


    return true;

  }
  catch {

    showToast(
      "Impossible de copier.",
      "error"
    );


    return false;

  }

}



// ======================================================
// GLOBAL EXPORTS
// ======================================================
//
// Ces exports permettent aux pages HTML
// d'appeler directement les fonctions.
//
// Exemple :
//
// onclick="addToCart('collier-elise')"
//
// ======================================================

window.BYSSUS_CONFIG =
  BYSSUS_CONFIG;


window.getCart =
  getCart;


window.saveCart =
  saveCart;


window.getCartCount =
  getCartCount;


window.getCartSubtotal =
  getCartSubtotal;


window.addToCart =
  addToCart;


window.removeFromCart =
  removeFromCart;


window.setCartQuantity =
  setCartQuantity;


window.incrementCartItem =
  incrementCartItem;


window.clearCart =
  clearCart;


window.updateGlobalCartBadge =
  updateGlobalCartBadge;


window.getWishlist =
  getWishlist;


window.isInWishlist =
  isInWishlist;


window.addToWishlist =
  addToWishlist;


window.removeFromWishlist =
  removeFromWishlist;


window.toggleWishlist =
  toggleWishlist;


window.restoreWishlistButtons =
  restoreWishlistButtons;


window.addRecentlyViewed =
  addRecentlyViewed;


window.getRecentlyViewedProducts =
  getRecentlyViewedProducts;


window.showToast =
  showToast;


window.getProductUrl =
  getProductUrl;


window.goToProduct =
  goToProduct;


window.buyNow =
  buyNow;


window.getCustomer =
  getCustomer;


window.saveCustomer =
  saveCustomer;


window.getOrders =
  getOrders;


window.getLastOrder =
  getLastOrder;


window.archiveOrder =
  archiveOrder;


window.byssusFormatPrice =
  byssusFormatPrice;


window.isValidEmail =
  isValidEmail;


window.escapeHtmlGlobal =
  escapeHtmlGlobal;


window.capitalizeFirstLetterGlobal =
  capitalizeFirstLetterGlobal;


window.scrollToTop =
  scrollToTop;


window.confirmAction =
  confirmAction;


window.getQueryParam =
  getQueryParam;


window.copyToClipboard =
  copyToClipboard;
