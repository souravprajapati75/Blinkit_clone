let products = []; 
let cart = []; 

// --- 1. LOGIN CHECK & INITIAL LOAD ---
window.onload = function() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('isLoggedIn');
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (savedUser === 'true' && userData) {
        // Agar login hai toh UI badlo
        const authSection = document.getElementById('authSection');
        const storeSection = document.getElementById('storeSection');
        
        if(authSection) authSection.style.display = 'none';
        if(storeSection) storeSection.style.display = 'block';
        
        // Purana data fill karo
        const addrDisp = document.getElementById('userAddressDisplay');
        const mobDisp = document.getElementById('displayMobile');
        if(addrDisp) addrDisp.innerText = userData.address;
        if(mobDisp) mobDisp.innerText = userData.mobile;
    }
    
    // Products hamesha load karo
    loadProducts();
};

// --- 2. DATABASE SE PRODUCTS LOAD KARNA ---
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json(); 
        console.log("✅ Products loaded from DB:", products.length);
        renderProducts(products); 
    } catch (err) {
        console.error("❌ Products fetch error:", err);
    }
}

// --- 3. CART LOGIC (+ / - Buttons) ---
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartUI(); 
    renderProducts(products); 
}

function updateQuantity(productId, change) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity += change;
        if (cartItem.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId); 
        }
    }
    updateCartUI();
    renderProducts(products);
}

// [IMPORTANT] Sabse zaruri function jo Total dikhata hai
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Header Cart Button Update
    const headerCartBtn = document.querySelector('.cart-btn');
    if(headerCartBtn) {
        headerCartBtn.innerHTML = `<i class="fa fa-shopping-cart"></i> ${totalItems > 0 ? totalItems + ' Items' : 'My Cart'}`;
        headerCartBtn.style.background = totalItems > 0 ? '#0c831f' : '#fff';
        headerCartBtn.style.color = totalItems > 0 ? '#fff' : '#0c831f';
    }

    // Bottom Floating Bar Update (Blinkit Style)
    const cartBar = document.getElementById('cartBar');
    if(cartBar) {
        if (totalItems > 0) {
            cartBar.style.display = 'flex';
            cartBar.innerHTML = `
                <div style="background:#0c831f; color:white; width:100%; display:flex; justify-content:space-between; align-items:center; padding:15px 25px; border-radius:12px; font-weight:bold; box-shadow: 0 4px 15px rgba(0,0,0,0.2); cursor:pointer;" onclick="viewCart()">
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-size:12px; opacity:0.9;">${totalItems} ITEMS</span>
                        <span style="font-size:16px;">₹${totalPrice}</span>
                    </div>
                    <div style="display:flex; align-items:center;">
                        View Cart <i class="fa fa-chevron-right" style="margin-left:8px; font-size:12px;"></i>
                    </div>
                </div>
            `;
        } else {
            cartBar.style.display = 'none';
        }
    }
}

function viewCart() {
    alert("your total bill is ₹" + cart.reduce((sum, i) => sum + (i.price * i.quantity), 0) + "");
}

// --- 4. REGISTRATION LOGIC ---
const regForm = document.getElementById('registrationForm');
if(regForm) {
    regForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.innerText = "Processing...";
        btn.disabled = true;

        const userData = {
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            mobile: document.getElementById('regMobile').value,
            address: document.getElementById('regAddress').value,
            password: document.getElementById('regPass').value
        };

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const result = await response.json();

            if (response.ok && result.success) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userData', JSON.stringify(userData));
                
                // Show store immediately
                document.getElementById('authSection').style.display = 'none';
                document.getElementById('storeSection').style.display = 'block';
                document.getElementById('userAddressDisplay').innerText = userData.address;
                document.getElementById('displayMobile').innerText = userData.mobile;
                
                loadProducts();
            } else {
                alert("Error: " + (result.error || "Kuch gadbad hai"));
                btn.innerText = "Start Shopping";
                btn.disabled = false;
            }
        } catch (err) {
            alert("Bhai, server connect nahi ho raha!");
            btn.innerText = "Start Shopping";
            btn.disabled = false;
        }
    });
}

// --- 5. LOGOUT ---
function logout() {
    if(confirm("Bhai, sach mein logout karna hai?")) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        location.reload(); 
    }
}

// --- 6. RENDER FUNCTION (Main UI) ---
function renderProducts(list) {
    const grid = document.getElementById('productGrid');
    if(!grid) return;
    
    if(list.length === 0) {
        grid.innerHTML = "<p style='padding:20px;'>Sorry! stocj is over</p>";
        return;
    }

    grid.innerHTML = list.map(p => {
        const inCart = cart.find(item => item.id === p.id);
        const imgPath = p.image || p.img || 'https://via.placeholder.com/150?text=No+Image';

        return `
            <div class="product-card" style="border:1px solid #eee; padding:15px; border-radius:12px; text-align:left; position:relative; background:#fff; transition:0.3s;">
                <div style="width:100%; height:120px; display:flex; justify-content:center; align-items:center;">
                    <img src="${imgPath}" alt="${p.name}" style="max-width:100%; max-height:100%; object-fit:contain;">
                </div>
                <h4 style="margin:10px 0 5px; font-size:14px; height:40px; overflow:hidden;">${p.name}</h4>
                <p style="color:#666; font-size:12px; margin-bottom:10px;">${p.unit || '1 unit'}</p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <b style="font-size:16px;">₹${p.price}</b>
                    ${inCart ? `
                        <div style="display:flex; align-items:center; background:#0c831f; color:white; border-radius:6px; font-weight:bold;">
                            <button onclick="updateQuantity(${p.id}, -1)" style="background:none; border:none; color:white; padding:5px 12px; cursor:pointer; font-size:16px;">-</button>
                            <span>${inCart.quantity}</span>
                            <button onclick="updateQuantity(${p.id}, 1)" style="background:none; border:none; color:white; padding:5px 12px; cursor:pointer; font-size:16px;">+</button>
                        </div>
                    ` : `
                        <button class="add-btn" onclick="addToCart(${p.id})" style="background:white; color:#0c831f; border:1px solid #0c831f; padding:6px 18px; border-radius:6px; cursor:pointer; font-weight:bold;">ADD</button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// --- 7. SEARCH LOGIC ---
const searchInput = document.getElementById('mainSearch');
if(searchInput) {
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(query));
        renderProducts(filtered);
    });
}

// --- 8. DROPDOWN LOGIC ---
const accountBtn = document.getElementById('accountBtn');
if(accountBtn) {
    accountBtn.onclick = (e) => {
        e.stopPropagation();
        document.getElementById('myDropdown').classList.toggle('show');
    };
}

// Window click par dropdown band ho jaye
window.onclick = function() {
    const dropdown = document.getElementById('myDropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
};

// --- 9. CATEGORY FILTER ---
function filterCategory(catName) {
    console.log("Filtering for:", catName);
    const items = document.querySelectorAll('.cat-item');
    items.forEach(item => {
        const span = item.querySelector('span');
        if (span && span.innerText === catName) {
            item.style.opacity = '1';
            span.style.fontWeight = 'bold';
            item.style.borderBottom = "2px solid #0c831f"; 
        } else if(span) {
            item.style.opacity = '0.6';
            span.style.fontWeight = 'normal';
            item.style.borderBottom = "none";
        }
    });

    if (catName === 'All') {
        renderProducts(products); 
    } else {
        const filtered = products.filter(p => p.category.toLowerCase() === catName.toLowerCase());
        renderProducts(filtered); 
    }
}


// for serching the button 
 
// --- 10. LOCATION TRACKING WITH PERMISSION ---
function getLocation() {
    const locationBtn = document.getElementById('locationBtn');
    const addressDisplay = document.getElementById('userAddressDisplay');
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
        alert("Bhai, aapka browser location support nahi karta!");
        return;
    }
    
    // Show loading state
    locationBtn.classList.add('loading');
    locationBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
    addressDisplay.innerText = "Getting your location...";
    
    // Request location permission
    navigator.geolocation.getCurrentPosition(
        // Success callback
        async function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log("Location obtained:", lat, lng);
            
            try {
                // Use Nominatim API for reverse geocoding (free, no API key needed)
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const data = await response.json();
                
                let address = "";
                if (data.address) {
                    // Build a readable address
                    const parts = [];
                    if (data.address.road) parts.push(data.address.road);
                    if (data.address.suburb) parts.push(data.address.suburb);
                    if (data.address.city || data.address.town || data.address.village) {
                        parts.push(data.address.city || data.address.town || data.address.village);
                    }
                    if (data.address.state) parts.push(data.address.state);
                    address = parts.join(", ");
                }
                
                if (!address) {
                    address = data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : "Location found";
                }
                
                // Update the display
                addressDisplay.innerText = address;
                
                // Save to localStorage for persistence
                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                userData.address = address;
                userData.lat = lat;
                userData.lng = lng;
                localStorage.setItem('userData', JSON.stringify(userData));
                
                // Reset button
                locationBtn.classList.remove('loading');
                locationBtn.innerHTML = '<i class="fa fa-map-marker-alt"></i>';
                
                console.log("Address resolved:", address);
                
            } catch (err) {
                console.error("Geocoding error:", err);
                addressDisplay.innerText = lat.toFixed(4) + ", " + lng.toFixed(4);
                locationBtn.classList.remove('loading');
                locationBtn.innerHTML = '<i class="fa fa-map-marker-alt"></i>';
            }
        },
        // Error callback
        function(error) {
            let errorMessage = "";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Location permission denied! Please allow location access.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "Location information unavailable.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "Location request timed out.";
                    break;
                default:
                    errorMessage = "Unknown error occurred.";
            }
            
            alert("Location Error: " + errorMessage);
            addressDisplay.innerText = "Enter address manually";
            locationBtn.classList.remove('loading');
            locationBtn.innerHTML = '<i class="fa fa-map-marker-alt"></i>';
        },
        // Options
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}
 
 

