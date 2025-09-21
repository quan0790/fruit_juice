// Year in footer
    document.getElementById('year').innerText = new Date().getFullYear();

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobileBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    }

    // Initialize Swiper
    const swiper = new Swiper('.mySwiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      breakpoints: {
        640: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }
    });

    // Modal logic
    function openModal(name) {
      document.getElementById('modalJuiceName').innerText = `Order: ${name}`;
      document.getElementById('orderForm').dataset.juice = name;
      document.getElementById('orderModal').classList.remove('hidden');
      document.getElementById('orderModal').classList.add('flex');
      document.getElementById('orderStatus').innerText = '';
    }
    function closeModal() {
      document.getElementById('orderModal').classList.add('hidden');
      document.getElementById('orderModal').classList.remove('flex');
    }
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    // Hook all order buttons
    document.querySelectorAll('.order-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const juice = btn.dataset.juice || btn.getAttribute('data-juice') || btn.innerText;
        openModal(juice);
      });
    });

    // Submit order to backend
    document.getElementById('orderForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const juice = form.dataset.juice || 'Juice';
      const payload = {
        juice,
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        quantity: Number(document.getElementById('quantity').value) || 1,
        instructions: document.getElementById('instructions').value.trim()
      };

      const statusEl = document.getElementById('orderStatus');
      statusEl.innerText = 'Placing order...';

      try {
        const res = await fetch('/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
          statusEl.innerText = `✅ Order placed! Juice: ${data.order.juice} • Qty: ${data.order.quantity} • ${data.order.name}`;
          form.reset();
          setTimeout(closeModal, 2000);
        } else {
          statusEl.innerText = data?.error || 'Failed to place order.';
        }
      } catch (err) {
        statusEl.innerText = 'Network error. Try again.';
        console.error(err);
      }
    });

    // Smooth scroll on nav links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Failed to fetch');
        const orders = await res.json();
        renderOrders(orders);
      } catch (err) {
        console.error(err);
        document.getElementById('ordersWrap').innerHTML = '<div class="p-4 bg-white rounded shadow">Failed to load orders</div>';
      }
    }

    function renderOrders(orders) {
      const wrap = document.getElementById('ordersWrap');
      wrap.innerHTML = '';
      if (!orders || orders.length === 0) {
        wrap.innerHTML = '<div class="p-6 bg-white rounded shadow">No orders yet.</div>';
        return;
      }

      orders.forEach(order => {
        const el = document.createElement('div');
        el.className = 'bg-white p-4 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4';
        el.innerHTML = `
          <div>
            <div class="text-lg font-semibold">${order.juice} <span class="text-sm text-gray-500">x${order.quantity}</span></div>
            <div class="text-sm text-gray-600">Name: ${order.name} • Phone: ${order.phone}</div>
            <div class="text-sm text-gray-600 mt-1">Notes: ${order.instructions || '-'}</div>
            <div class="text-xs text-gray-400 mt-1">${new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="markComplete('${order._id}')" class="px-3 py-2 bg-blue-600 text-white rounded">Mark Completed</button>
            <button onclick="deleteOrder('${order._id}')" class="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
          </div>
        `;
        wrap.appendChild(el);
      });
    }

    async function deleteOrder(id) {
      if (!confirm('Delete this order?')) return;
      try {
        const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
          alert(data.message || 'Deleted');
          fetchOrders();
        } else alert(data.error || 'Failed to delete');
      } catch (err) {
        console.error(err);
      }
    }

    // Mark as completed (optional functionality: here we just delete or you can extend backend to set a flag)
    async function markComplete(id) {
      // For now we'll delete to remove from pending list — you can change server to support completed flag
      if (!confirm('Mark as completed (remove from list)?')) return;
      await deleteOrder(id);
    }

    document.getElementById('refreshBtn').addEventListener('click', fetchOrders);
    window.addEventListener('load', fetchOrders);
    // optional: refresh every 10 seconds
    setInterval(fetchOrders, 10000);
 
