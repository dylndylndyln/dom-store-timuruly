class Store {
    constructor() {
        this.products = [
            { id: 1, name: "Клавиатура", price: 12000, qty: 2 },
            { id: 2, name: "Мышь", price: 6000, qty: 5 }
        ];
        this.nextId = 3;
    }

    addProduct(name, price, qty) {
        const newProduct = {
            id: this.nextId++,
            name: name.trim(),
            price: Number(price),
            qty: Number(qty)
        };
        this.products.push(newProduct);
        return newProduct;
    }

    removeProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
    }

    changeQty(id, delta) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            product.qty += delta;
            if (product.qty <= 0) {
                this.removeProduct(id);
            }
        }
    }

    getTotalSum() {
        return this.products.reduce((sum, p) => sum + p.price * p.qty, 0);
    }
}

const store = new Store();

const productListEl = document.getElementById("productList");
const grandTotalEl = document.getElementById("grandTotal");
const productForm = document.getElementById("productForm");
const emptyListMsg = document.getElementById("emptyListMsg");

const nameInput = document.getElementById("productName");
const priceInput = document.getElementById("productPrice");
const qtyInput = document.getElementById("productQty");

const nameError = document.getElementById("nameError");
const priceError = document.getElementById("priceError");
const qtyError = document.getElementById("qtyError");

function renderStore() {
    productListEl.innerHTML = "";

    if (store.products.length === 0) {
        emptyListMsg.style.display = "block";
    } else {
        emptyListMsg.style.display = "none";
    }

    store.products.forEach(product => {
        const tr = document.createElement("tr");
        tr.dataset.id = product.id;

        tr.innerHTML = `
            <td><strong>${escapeHtml(product.name)}</strong></td>
            <td>${product.price.toLocaleString()} ₸</td>
            <td>
                <div class="qty-controls">
                    <button class="btn btn-qty action-decrease" data-action="decrease">-</button>
                    <span>${product.qty}</span>
                    <button class="btn btn-qty action-increase" data-action="increase">+</button>
                </div>
            </td>
            <td>${(product.price * product.qty).toLocaleString()} ₸</td>
            <td>
                <button class="btn btn-danger action-delete" data-action="delete">Удалить</button>
            </td>
        `;

        productListEl.appendChild(tr);
    });
    grandTotalEl.textContent = `${store.getTotalSum().toLocaleString()} ₸`;
}

function validateForm() {
    let isValid = true;

    clearErrors();

    const nameValue = nameInput.value.trim();
    if (!nameValue) {
        showError(nameInput, nameError, "Название товара не может быть пустым.");
        isValid = false;
    }

    const priceValue = Number(priceInput.value);
    if (priceInput.value === "" || isNaN(priceValue) || priceValue <= 0) {
        showError(priceInput, priceError, "Цена должна быть числом больше 0.");
        isValid = false;
    }

    const qtyValue = Number(qtyInput.value);
    if (qtyInput.value === "" || isNaN(qtyValue) || !Number.isInteger(qtyValue) || qtyValue <= 0) {
        showError(qtyInput, qtyError, "Укажите целое число больше 0.");
        isValid = false;
    }

    return isValid;
}

function showError(inputEl, errorEl, message) {
    inputEl.classList.add("is-invalid");
    errorEl.textContent = message;
}

function clearErrors() {
    [nameInput, priceInput, qtyInput].forEach(input => input.classList.remove("is-invalid"));
    [nameError, priceError, qtyError].forEach(el => el.textContent = "");
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, match => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[match]));
}

productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (validateForm()) {
        store.addProduct(nameInput.value, priceInput.value, qtyInput.value);
        renderStore();

        productForm.reset();
        clearErrors();
    }
});

[nameInput, priceInput, qtyInput].forEach(input => {
    input.addEventListener("input", () => {
        if (input.classList.contains("is-invalid")) {
            clearErrors();
        }
    });
});

productListEl.addEventListener("click", (e) => {
    const target = e.target;
    const action = target.dataset.action;

    if (!action) return;

    const tr = target.closest("tr");
    if (!tr) return;

    const productId = Number(tr.dataset.id);

    if (action === "delete") {
        store.removeProduct(productId);
    } else if (action === "increase") {
        store.changeQty(productId, 1);
    } else if (action === "decrease") {
        store.changeQty(productId, -1);
    }

    renderStore();
});

renderStore();
