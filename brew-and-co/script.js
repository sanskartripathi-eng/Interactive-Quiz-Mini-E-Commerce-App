// 1. Product data – the page is rendered entirely from this array
const products = [
  { id: 1, name: "Espresso Beans", category: "Coffee", price: 1250, emoji: "🫘", desc: "Dark roast, bold and chocolatey." },
  { id: 2, name: "Cold Brew Kit", category: "Coffee", price: 2100, emoji: "🧊", desc: "Everything for smooth cold brew." },
  { id: 3, name: "Pour-Over Dripper", category: "Gear", price: 2800, emoji: "⏳", desc: "Ceramic dripper for clean cups." },
  { id: 4, name: "Burr Grinder", category: "Gear", price: 5200, emoji: "⚙️", desc: "Consistent grind, manual crank." },
  { id: 5, name: "Matcha Tin", category: "Tea", price: 1550, emoji: "🍵", desc: "Ceremonial-grade green matcha." },
  { id: 6, name: "Earl Grey", category: "Tea", price: 799, emoji: "🫖", desc: "Bergamot-scented black tea." },
  { id: 7, name: "Ceramic Mug", category: "Gear", price: 1050, emoji: "☕", desc: "Hand-glazed, holds 350 ml." },
  { id: 8, name: "Almond Biscotti", category: "Treats", price: 650, emoji: "🥐", desc: "Crunchy, perfect for dunking." }
];

// 2. State
let cart = [];            // [{ id, qty }]
let activeCategory = "All";
const TAX_RATE = 0.05;

// helpers
const $ = id => document.getElementById(id);
const money = n => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const find = id => products.find(p => p.id === id);

// 3. Rendering
function renderFilters() {
  const cats = ["All", ...new Set(products.map(p => p.category))];
  $("filters").innerHTML = cats.map(c =>
    `<button class="chip ${c === activeCategory ? "active" : ""}" data-cat="${c}">${c}</button>`).join("");
}

function renderProducts() {
  const list = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);
  $("grid").innerHTML = list.map(p => `
    <article class="card">
      <div class="emoji" aria-hidden="true">${p.emoji}</div>
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="row">
        <span class="price">${money(p.price)}</span>
        <button class="add" data-add="${p.id}">Add</button>
      </div>
    </article>`).join("");
}

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * find(i.id).price, 0);
  $("count").textContent = count;
  $("total").textContent = money(total);
  $("checkout").disabled = count === 0;
  $("items").innerHTML = cart.length ? cart.map(i => {
    const p = find(i.id);
    return `<div class="item">
      <span class="emoji" style="font-size:1.8rem">${p.emoji}</span>
      <div class="info"><strong>${p.name}</strong><br><small>${money(p.price)} each</small></div>
      <div class="qty">
        <button data-dec="${p.id}" aria-label="Decrease">−</button>
        <span>${i.qty}</span>
        <button data-inc="${p.id}" aria-label="Increase">+</button>
      </div>
    </div>`;
  }).join("") : `<div class="empty">Your cart is empty.</div>`;
}

// 4. Cart logic
function addToCart(id) {
  const item = cart.find(i => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  renderCart();
}
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  renderCart();
}

// 5. Drawer + modal
function toggleCart(open) {
  $("drawer").classList.toggle("open", open);
  $("scrim").classList.toggle("show", open);
}

function showCheckout() {
  const subtotal = cart.reduce((s, i) => s + i.qty * find(i.id).price, 0);
  const tax = subtotal * TAX_RATE;
  $("modalBox").innerHTML = `
    <h2>Order preview</h2>
    ${cart.map(i => {
      const p = find(i.id);
      return `<div class="line"><span>${p.emoji} ${p.name} × ${i.qty}</span><span>${money(p.price * i.qty)}</span></div>`;
    }).join("")}
    <div class="sum"><span>Subtotal</span><span>${money(subtotal)}</span></div>
    <div class="sum"><span>GST (5%)</span><span>${money(tax)}</span></div>
    <div class="sum big"><span>Total</span><span>${money(subtotal + tax)}</span></div>
    <div class="actions">
      <button class="secondary" id="backBtn">Keep shopping</button>
      <button class="primary" id="confirmBtn">Place order</button>
    </div>`;
  $("modal").classList.add("show");
}

function confirmOrder() {
  cart = [];
  renderCart();
  $("modalBox").innerHTML = `
    <div class="success">
      <div class="emoji">🎉</div>
      <h2>Thanks for your order!</h2>
      <p>This is a demo, so nothing was charged.</p>
      <button class="primary" id="doneBtn">Done</button>
    </div>`;
}

function closeModal() { $("modal").classList.remove("show"); }

// 6. Events (delegation keeps it simple)
document.addEventListener("click", e => {
  const t = e.target;
  if (t.dataset.cat) { activeCategory = t.dataset.cat; renderFilters(); renderProducts(); }
  else if (t.dataset.add) addToCart(+t.dataset.add);
  else if (t.dataset.inc) changeQty(+t.dataset.inc, 1);
  else if (t.dataset.dec) changeQty(+t.dataset.dec, -1);
  else if (t.id === "backBtn" || t.id === "doneBtn" || t === $("modal")) { closeModal(); if (t.id === "doneBtn") toggleCart(false); }
  else if (t.id === "confirmBtn") confirmOrder();
});
$("openCart").onclick = () => toggleCart(true);
$("closeCart").onclick = () => toggleCart(false);
$("scrim").onclick = () => toggleCart(false);
$("checkout").onclick = showCheckout;
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeModal(); toggleCart(false); } });

renderFilters(); renderProducts(); renderCart();
