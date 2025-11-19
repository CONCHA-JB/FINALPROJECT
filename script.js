'use strict';

/**
 * element toggle function
 */
const elemToggleFunc = function (elem) {
  elem.classList.toggle("active");
};

/**
 * navbar toggle
 */
const navbar = document.querySelector("[data-navbar]");
const overlay = document.querySelector("[data-overlay]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");

const navElemArr = [overlay, navCloseBtn, navOpenBtn];

for (let i = 0; i < navbarLinks.length; i++) {
  navElemArr.push(navbarLinks[i]);
}

if (navOpenBtn) {
  for (let i = 0; i < navElemArr.length; i++) {
    navElemArr[i].addEventListener("click", function () {
      elemToggleFunc(navbar);
      elemToggleFunc(overlay);
    });
  }
}

/**
 * header active state
 */
const header = document.querySelector("[data-header]");
window.addEventListener("scroll", function () {
  window.scrollY >= 400 ? header.classList.add("active")
    : header.classList.remove("active");
});


/* =========================================
   DYNAMIC PRODUCT RENDERING
   (Clean Version: No Stats, No Image Icons, Full Description)
   ========================================= */

// 1. Default Data
const defaultProducts = [
    {
        name: "BUILDRITE LEAK PLUG",
        price: 2783,
        image: "images/buildrite_chemical.png",
        description: "BUILDRITE LEAK PLUG is supplied as a dry powder which only needs water addition to produce an ultra-rapid set plugging mortar."
    },
    {
        name: "BUILDRITE FLEXCRETE 18KG",
        price: 2910,
        image: "images/buildritecrate.png",
        description: "BUILDRITE FLEXICRETE is a two component, flexible cementitious waterproofing membrane."
    },
    {
        name: "BUILDRITE TOFIL 801 SKIM COAT",
        price: 471,
        image: "images/tofil.png",
        description: "BUILDRITE SKIM COAT SF is a finishing compound specially formulated for concrete surfaces and pre-casts for indoor and outdoor use."
    },
    {
        name: "BUILDRITE EPOCOAT MB PRIMER",
        price: 2385,
        image: "images/epocoat.png",
        description: "BUILDRITE EPOCOAT MB PRIMER is a two component, 100% solids epoxy specially formulated as a high strength binder."
    }
];

// 2. Load Products Function
function loadProducts() {
    const productGrid = document.getElementById('product-grid');
    if(!productGrid) return;

    // Try to get products from Admin (LocalStorage)
    let products = JSON.parse(localStorage.getItem('buildRiteProducts'));
    
    // If no products exist in storage, use defaults
    if (!products || products.length === 0) {
        products = defaultProducts;
        localStorage.setItem('buildRiteProducts', JSON.stringify(products));
    }

    // Clear the grid
    productGrid.innerHTML = '';

    // Generate HTML for each product
    products.forEach((prod) => {
        // Create List Item
        const li = document.createElement('li');
        
        // WE REMOVED: <div class="banner-actions">...</div> inside card-banner
        // WE REMOVED: <ul class="card-list">...</ul> inside card-content
        // WE REMOVED: .substring() logic for description (now shows full text)

        li.innerHTML = `
          <div class="property-card">
            
            <figure class="card-banner">
              <a href="#">
                <!-- Clean Image (No icons overlay) -->
                <img src="${prod.image}" alt="${prod.name}" class="w-100" onerror="this.src='images/buildrite_chemical.png'">
              </a>
            </figure>

            <div class="card-content">
              <div class="card-price">
                <strong>₱${prod.price.toLocaleString()}</strong>
              </div>
              
              <h3 class="h3 card-title">
                <a href="#">${prod.name}</a>
              </h3>
              
              <!-- Full Description -->
              <p class="card-text">
                ${prod.description || 'No description available.'}
              </p>
            </div>

            <div class="card-footer">
              <div class="card-author">
                <figure class="author-avatar">
                  <img src="/FINALS PROJECT/images/pfp.jpg" alt="Admin" class="w-100">
                </figure>
                <div>
                  <p class="author-name"><a href="#">Admin</a></p>
                  <p class="author-title">Seller</p>
                </div>
              </div>

              <div class="card-footer-actions">
                <button class="card-footer-actions-btn wishlist-btn" aria-label="Add to favorites">
                  <ion-icon name="heart-outline"></ion-icon>
                </button>
                
                <button class="card-footer-actions-btn add-to-cart-btn" 
                    data-name="${prod.name}" 
                    data-price="${prod.price}" 
                    data-image="${prod.image}">
                  <ion-icon name="add-circle-outline"></ion-icon>
                </button>
              </div>
            </div>

          </div>
        `;
        productGrid.appendChild(li);
    });
}

// Run the load function immediately
loadProducts();


/* =========================================
   SHOPPING CART LOGIC
   ========================================= */

let cart = [];

// DOM Elements
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartDropdown = document.getElementById('cart-dropdown');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartCountBadge = document.getElementById('cart-count-badge');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartSummary = document.getElementById('cart-summary');
const checkoutBtn = document.getElementById('checkout-btn');

// Toggle Dropdown visibility
if (cartToggleBtn) {
  cartToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    cartDropdown.classList.toggle('active');
  });
}

// Close dropdown if clicked outside
document.addEventListener('click', (e) => {
  if (cartDropdown && cartToggleBtn) {
    if (!cartDropdown.contains(e.target) && !cartToggleBtn.contains(e.target)) {
      cartDropdown.classList.remove('active');
    }
  }
});

// === EVENT DELEGATION ===
document.addEventListener('click', function(e) {
    
    // 1. HANDLE ADD TO CART CLICK
    const addBtn = e.target.closest('.add-to-cart-btn');
    if (addBtn) {
        const name = addBtn.getAttribute('data-name');
        const price = parseFloat(addBtn.getAttribute('data-price'));
        const image = addBtn.getAttribute('data-image');
        addItemToCart(name, price, image);
    }

    // 2. HANDLE WISHLIST CLICK
    const wishBtn = e.target.closest('.wishlist-btn');
    if (wishBtn) {
        wishBtn.classList.toggle('active');
        const icon = wishBtn.querySelector('ion-icon');
        if(wishBtn.classList.contains('active')) {
            icon.setAttribute('name', 'heart');
        } else {
            icon.setAttribute('name', 'heart-outline');
        }
    }

    // 3. HANDLE REMOVE ITEM FROM CART
    const removeBtn = e.target.closest('.remove-item-btn');
    if (removeBtn) {
        e.stopPropagation(); 
        const index = parseInt(removeBtn.getAttribute('data-index'));
        cart.splice(index, 1);
        updateCartUI();
    }
});

// Add Item Logic
function addItemToCart(name, price, image) {
  cart.push({ name, price, image });
  updateCartUI();
  alert(`${name} added to cart!`);
}

// Update Cart UI
function updateCartUI() {
  cartCountBadge.textContent = cart.length;
  cartItemsContainer.innerHTML = '';

  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<li style="padding:10px; text-align:center; font-size:12px;">Your cart is empty</li>';
    cartSummary.style.display = 'none';
  } else {
    cart.forEach((item, index) => {
      total += item.price;
      
      const li = document.createElement('li');
      li.classList.add('cart-item');
      li.innerHTML = `
        <img src="${item.image}" alt="${item.name}" onerror="this.src='images/buildrite_chemical.png'">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">₱${item.price.toLocaleString()}</div>
        </div>
        <div class="remove-item-btn" data-index="${index}" style="cursor:pointer;">
          <ion-icon name="trash-outline"></ion-icon>
        </div>
      `;
      cartItemsContainer.appendChild(li);
    });
    cartSummary.style.display = 'block';
  }

  const formattedTotal = '₱' + total.toLocaleString(undefined, {minimumFractionDigits: 2});
  cartTotalPrice.textContent = formattedTotal;
  
  const paymentTotalDisplay = document.getElementById('payment-total-display');
  if(paymentTotalDisplay) {
      paymentTotalDisplay.textContent = formattedTotal;
  }
}


/* =========================================
   PAYMENT MODAL LOGIC
   ========================================= */

const paymentModal = document.getElementById('payment-modal');
const closePaymentBtn = document.getElementById('close-payment-btn');
const paymentForm = document.getElementById('payment-form');

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    cartDropdown.classList.remove('active');
    paymentModal.style.display = 'flex';
  });
}

if (closePaymentBtn) {
  closePaymentBtn.addEventListener('click', () => {
    paymentModal.style.display = 'none';
  });
}

window.addEventListener('click', (e) => {
  if (e.target === paymentModal) {
    paymentModal.style.display = 'none';
  }
});

if (paymentForm) {
  paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const btn = paymentForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = "Processing...";
    btn.disabled = true;

    setTimeout(() => {
      alert('Payment Successful! Thank you for your purchase.');
      cart = [];
      updateCartUI();
      paymentForm.reset();
      paymentModal.style.display = 'none';
      btn.textContent = originalText;
      btn.disabled = false;
    }, 2000);
  });
}

/* =========================================
   AUTH LOGIC
   ========================================= */
const authModal = document.querySelector("[data-auth-modal]");
if (authModal) {
  const authOverlay = document.querySelector("[data-auth-overlay]");
  const authCloseBtn = document.querySelector("[data-auth-close-btn]");
  const authOpenBtn = document.querySelector("[data-auth-open-btn]");
  
  if(authOpenBtn) {
      const authElements = [authOverlay, authCloseBtn, authOpenBtn];
      for (let i = 0; i < authElements.length; i++) {
        authElements[i].addEventListener("click", function () {
          elemToggleFunc(authModal);
        });
      }
  }
}