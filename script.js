// DOM Elements
const cartToggle = document.getElementById('cart-toggle');
const cartPanel = document.getElementById('cart-panel');
const cartItemsPanel = document.getElementById('cart-items-panel');
const cartTotalPanel = document.getElementById('cart-total-panel');
const cartCount = document.getElementById('cart-count');
const modifierModal = document.getElementById('modifier-modal');
const modalDrinkName = document.getElementById('modal-drink-name');
const modifierForm = document.getElementById('modifier-form');

// Load cart from localStorage
let panelItems = JSON.parse(localStorage.getItem('cartItems')) || [];
let selectedDrink = null;
let selectedPrice = 0;

// Toggle cart panel
cartToggle.addEventListener('click', () => {
  cartPanel.classList.toggle('show');
});

// Handle "Add to Cart" button click
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', () => {
    selectedDrink = button.getAttribute('data-name');
    selectedPrice = parseFloat(button.getAttribute('data-price'));

    if (!selectedDrink || isNaN(selectedPrice)) {
      console.error('Invalid drink or price');
      return;
    }

    modalDrinkName.textContent = `Customize: ${selectedDrink}`;
    modifierModal.classList.remove('hidden');
  });
});

// Handle modifier form submission
modifierForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(modifierForm);
  const size = formData.get('size') || 'Regular';
  const milk = formData.get('milk') || 'Whole';
  const sweetness = formData.get('sweetness') || '100%';
  const notes = formData.get('notes');
  const noteText = notes ? ` | Note: ${notes}` : '';

  const toppingEntries = [];
  formData.forEach((value, key) => {
    if (key.startsWith('topping[')) {
      const toppingName = key.match(/topping\[(.*)\]/)[1];
      const quantity = parseInt(value, 10);
      if (quantity > 0) {
        toppingEntries.push({ name: toppingName, quantity });
      }
    }
  });

  // Generate topping description and cost
  const toppingText = toppingEntries.length
    ? ' + ' + toppingEntries.map(t => `${t.name} x${t.quantity}`).join(', ')
    : '';

  const extraCost = toppingEntries.reduce((sum, t) => sum + t.quantity * 0.5, 0);
  const finalPrice = selectedPrice + extraCost;

  const customName = `${selectedDrink} (${size}, ${milk}, ${sweetness})${toppingText}${noteText}`;

  panelItems.push({ name: customName, price: finalPrice });

  saveCart();
  updateCartPanel();
  closeModal();
});

// Close modal
function closeModal() {
  modifierModal.classList.add('hidden');
  modifierForm.reset();
}

// Update cart panel
function updateCartPanel() {
  cartItemsPanel.innerHTML = '';
  let total = 0;

  panelItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.name} - $${item.price.toFixed(2)}
      <button data-index="${index}" class="remove-btn">❌</button>
    `;
    cartItemsPanel.appendChild(li);
    total += item.price;
  });

  cartTotalPanel.textContent = total.toFixed(2);
  cartCount.textContent = panelItems.length;
}

// Handle remove buttons using event delegation
cartItemsPanel.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-btn')) {
    const index = parseInt(e.target.getAttribute('data-index'), 10);
    if (!isNaN(index)) {
      panelItems.splice(index, 1);
      saveCart();
      updateCartPanel();
    }
  }
});

// Save to localStorage
function saveCart() {
  localStorage.setItem('cartItems', JSON.stringify(panelItems));
}

// Close cart panel
function closeCart() {
  cartPanel.classList.remove('show');
}

// Initial render
updateCartPanel();

// Category filter
const buttons = document.querySelectorAll('.category-btn');
const items = document.querySelectorAll('.menu-item');

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;

    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    items.forEach(item => {
      if (category === 'all' || item.dataset.category === category) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });
});
