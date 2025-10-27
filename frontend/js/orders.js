// Módulo de Pedidos
const Orders = {
    // Armazena pedidos
    orders: [],

    /**
     * Inicializa pedidos
     */
    async init() {
        await this.loadOrders();
        this.bindEvents();
    },

    /**
     * Vincula eventos
     */
    bindEvents() {
        // Botão de atualizar
        const refreshBtn = document.getElementById('refreshOrders');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadOrders();
            });
        }
    },

    /**
     * Carrega pedidos
     */
    async loadOrders() {
        const ordersList = document.getElementById('ordersList');
        
        if (!ordersList) return;

        Utils.showLoading(ordersList);

        try {
            const response = await API.getOrders();
            this.orders = response.data || [];
            this.renderOrders();
        } catch (error) {
            // Se for 404, significa que não há pedidos cadastrados
            if (error.status === 404) {
                this.orders = [];
                this.renderOrders();
            } else {
                Utils.showEmptyState(ordersList, 'Erro ao conectar com o servidor', 'fa-exclamation-triangle');
            }
        }
    },

    /**
     * Renderiza lista de pedidos
     */
    renderOrders() {
        const ordersList = document.getElementById('ordersList');
        
        if (!ordersList) return;

        if (this.orders.length === 0) {
            Utils.showEmptyState(ordersList, 'Você ainda não fez nenhum pedido', 'fa-receipt');
            return;
        }

        ordersList.innerHTML = this.orders.map(order => `
            <div class="order-card" onclick="Orders.showOrderDetails(${order.id})">
                <div class="order-header">
                    <div>
                        <div class="order-id">Pedido #${order.id}</div>
                    </div>
                    <span class="order-status status-${order.status}">
                        <i class="fas ${STATUS_ICONS[order.status]}"></i>
                        ${STATUS_LABELS[order.status]}
                    </span>
                </div>
                <div class="order-info">
                    <div class="order-total">${Utils.formatCurrency(order.preco_total)}</div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Exibe detalhes do pedido
     */
    async showOrderDetails(pedidoId) {
        const modal = document.getElementById('orderModal');
        const modalBody = document.getElementById('orderModalBody');

        if (!modal || !modalBody) return;

        Utils.showLoading(modalBody);
        Utils.openModal('orderModal');

        try {
            const response = await API.getOrderDetails(pedidoId);
            const order = response.data;

            // Prepara lista de itens
            const itemsList = order.itens.map((item, index) => `
                <tr>
                    <td>${Utils.sanitizeHTML(item)}</td>
                    <td style="text-align: center;">${order.quantidade[index]}</td>
                    <td style="text-align: right;">${Utils.formatCurrency(order.precos_unitario[index])}</td>
                    <td style="text-align: right; font-weight: bold;">
                        ${Utils.formatCurrency(order.precos_unitario[index] * order.quantidade[index])}
                    </td>
                </tr>
            `).join('');

            modalBody.innerHTML = `
                <div class="order-details">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h2>Pedido #${order.id}</h2>
                        <span class="order-status status-${this.orders.find(o => o.id === order.id)?.status || 'PENDENTE'}">
                            <i class="fas ${STATUS_ICONS[this.orders.find(o => o.id === order.id)?.status || 'PENDENTE']}"></i>
                            ${STATUS_LABELS[this.orders.find(o => o.id === order.id)?.status || 'PENDENTE']}
                        </span>
                    </div>

                    <h3 style="margin-bottom: 1rem;">Itens do Pedido</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">
                        <thead>
                            <tr style="background: var(--light-color);">
                                <th style="padding: 0.75rem; text-align: left;">Item</th>
                                <th style="padding: 0.75rem; text-align: center;">Qtd</th>
                                <th style="padding: 0.75rem; text-align: right;">Preço Unit.</th>
                                <th style="padding: 0.75rem; text-align: right;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsList}
                        </tbody>
                        <tfoot>
                            <tr style="border-top: 2px solid var(--border-color); font-weight: bold;">
                                <td colspan="3" style="padding: 1rem; text-align: right;">Total:</td>
                                <td style="padding: 1rem; text-align: right; color: var(--success-color); font-size: 1.25rem;">
                                    ${Utils.formatCurrency(order.preco_total)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;
        } catch (error) {
            modalBody.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar detalhes do pedido</p>
                </div>
            `;
        }
    }
};

// Exportar Orders
window.Orders = Orders;
