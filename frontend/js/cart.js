// Módulo de Carrinho de Compras
const Cart = {
    // Armazena itens do carrinho
    items: [],

    /**
     * Inicializa o carrinho
     */
    init() {
        this.loadFromStorage();
        this.updateUI();
        this.bindEvents();
    },

    /**
     * Vincula eventos
     */
    bindEvents() {
        // Botão de finalizar pedido
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }

        // Botão de limpar carrinho
        const clearCartBtn = document.getElementById('clearCartBtn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clear());
        }
    },

    /**
     * Adiciona item ao carrinho
     */
    addItem(item) {
        const existingItem = this.items.find(i => i.id === item.id);

        if (existingItem) {
            existingItem.quantidade++;
        } else {
            this.items.push({
                id: item.id,
                nome: item.nome,
                preco: item.preco,
                url_imagem: item.url_imagem,
                quantidade: 1
            });
        }

        this.saveToStorage();
        this.updateUI();
        Utils.showToast(`${item.nome} adicionado ao carrinho!`, 'success');
    },

    /**
     * Remove item do carrinho
     */
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveToStorage();
        this.updateUI();
        Utils.showToast('Item removido do carrinho', 'info');
    },

    /**
     * Atualiza quantidade do item
     */
    updateQuantity(itemId, quantidade) {
        const item = this.items.find(i => i.id === itemId);
        
        if (item) {
            quantidade = parseInt(quantidade);
            
            if (quantidade <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantidade = quantidade;
                this.saveToStorage();
                this.updateUI();
            }
        }
    },

    /**
     * Limpa carrinho
     */
    async clear() {
        if (await Utils.confirm(
            'Todos os itens serão removidos do carrinho.',
            'Limpar Carrinho?',
            'warning'
        )) {
            this.items = [];
            this.saveToStorage();
            this.updateUI();
            Utils.showToast('Carrinho limpo', 'info');
        }
    },

    /**
     * Calcula total do carrinho
     */
    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.preco * item.quantidade);
        }, 0);
    },

    /**
     * Obtém quantidade total de itens
     */
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantidade, 0);
    },

    /**
     * Finaliza pedido
     */
    async checkout() {
        if (this.items.length === 0) {
            Utils.showToast('Carrinho vazio!', 'warning');
            return;
        }

        const checkoutBtn = document.getElementById('checkoutBtn');
        const originalText = checkoutBtn.innerHTML;
        
        try {
            // Desabilita botão e mostra loading
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

            // Cria array com IDs repetidos de acordo com a quantidade
            // Exemplo: [{id: 1, quantidade: 2}, {id: 3, quantidade: 1}] 
            // vira [1, 1, 3]
            const itensIds = [];
            this.items.forEach(item => {
                for (let i = 0; i < item.quantidade; i++) {
                    itensIds.push(item.id);
                }
            });

            // Envia pedido para API
            const response = await API.placeOrder(itensIds, ORDER_STATUS.PENDENTE);

            // Limpa carrinho
            this.items = [];
            this.saveToStorage();
            this.updateUI();

            Utils.showToast('Pedido realizado com sucesso!', 'success');
            
            // Navega para a seção de pedidos após 1 segundo
            setTimeout(() => {
                showSection('orders');
                Orders.loadOrders();
            }, 1000);

        } catch (error) {
            Utils.showToast('Erro ao processar pedido. Tente novamente.', 'error');
        } finally {
            // Restaura botão
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = originalText;
        }
    },

    /**
     * Atualiza interface do carrinho
     */
    updateUI() {
        this.updateBadge();
        this.renderCart();
        this.updateSummary();
    },

    /**
     * Atualiza badge do carrinho
     */
    updateBadge() {
        const badge = document.getElementById('cartBadge');
        const totalItems = this.getTotalItems();
        
        if (badge) {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'block' : 'none';
        }
    },

    /**
     * Renderiza itens do carrinho
     */
    renderCart() {
        const cartItems = document.getElementById('cartItems');
        
        if (!cartItems) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Seu carrinho está vazio</p>
                    <button class="btn btn-primary" onclick="showSection('menu')">
                        Ver Cardápio
                    </button>
                </div>
            `;
            return;
        }

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <img src="${Utils.getImageUrl(item.url_imagem)}" 
                     alt="${Utils.sanitizeHTML(item.nome)}"
                     class="cart-item-image"
                     onerror="this.src='https://via.placeholder.com/80x80?text=Sem+Imagem'">
                
                <div class="cart-item-details">
                    <div class="cart-item-name">${Utils.sanitizeHTML(item.nome)}</div>
                    <div class="cart-item-price">${Utils.formatCurrency(item.preco)}</div>
                </div>

                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="Cart.updateQuantity(${item.id}, ${item.quantidade - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" 
                               class="quantity-input" 
                               value="${item.quantidade}"
                               min="1"
                               onchange="Cart.updateQuantity(${item.id}, this.value)">
                        <button class="quantity-btn" onclick="Cart.updateQuantity(${item.id}, ${item.quantidade + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="btn btn-danger btn-icon" 
                            onclick="Cart.removeItem(${item.id})"
                            title="Remover">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    /**
     * Atualiza resumo do carrinho
     */
    updateSummary() {
        const cartSummary = document.getElementById('cartSummary');
        const subtotal = document.getElementById('subtotal');
        const total = document.getElementById('total');

        if (this.items.length === 0) {
            if (cartSummary) cartSummary.style.display = 'none';
            return;
        }

        const totalValue = this.getTotal();

        if (cartSummary) cartSummary.style.display = 'block';
        if (subtotal) subtotal.textContent = Utils.formatCurrency(totalValue);
        if (total) total.textContent = Utils.formatCurrency(totalValue);
    },

    /**
     * Salva carrinho no localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.items));
        } catch (error) {
            // Silently fail
        }
    },

    /**
     * Carrega carrinho do localStorage
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('cart');
            this.items = saved ? JSON.parse(saved) : [];
        } catch (error) {
            this.items = [];
        }
    }
};

// Exportar Cart
window.Cart = Cart;
