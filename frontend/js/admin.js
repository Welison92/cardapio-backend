// Módulo de Administração
const Admin = {
    // Armazena dados
    items: [],
    orders: [],
    currentEditingItem: null,

    /**
     * Inicializa admin
     */
    async init() {
        await this.loadItems();
        await this.loadOrders();
        this.bindEvents();
    },

    /**
     * Vincula eventos
     */
    bindEvents() {
        // Abas
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Botão adicionar item
        const addItemBtn = document.getElementById('addItemBtn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                this.openItemForm();
            });
        }

        // Formulário de item
        const itemForm = document.getElementById('itemForm');
        if (itemForm) {
            itemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveItem();
            });
        }

        // Cancelar formulário
        const cancelFormBtn = document.getElementById('cancelFormBtn');
        if (cancelFormBtn) {
            cancelFormBtn.addEventListener('click', () => {
                Utils.closeModal('itemFormModal');
                this.resetItemForm();
            });
        }

        // Atualizar pedidos admin
        const refreshAdminOrders = document.getElementById('refreshAdminOrders');
        if (refreshAdminOrders) {
            refreshAdminOrders.addEventListener('click', () => {
                this.loadOrders();
            });
        }
    },

    /**
     * Troca de aba
     */
    switchTab(tabId) {
        // Remove active de todas as abas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Adiciona active na aba selecionada
        document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
        document.getElementById(tabId)?.classList.add('active');
    },

    /**
     * Carrega itens para admin
     */
    async loadItems() {
        const adminItemsList = document.getElementById('adminItemsList');
        
        if (!adminItemsList) return;

        Utils.showLoading(adminItemsList);

        try {
            const response = await API.getMenu();
            this.items = response.data || [];
            this.renderAdminItems();
        } catch (error) {
            // Se for 404, significa que não há itens cadastrados
            if (error.status === 404) {
                this.items = [];
                this.renderAdminItems();
            } else {
                const errorMsg = error.message || 'Erro ao carregar itens. Verifique se o backend está rodando.';
                Utils.showEmptyState(adminItemsList, errorMsg, 'fa-exclamation-triangle');
            }
        }
    },

    /**
     * Renderiza itens no painel admin
     */
    renderAdminItems() {
        const adminItemsList = document.getElementById('adminItemsList');
        
        if (!adminItemsList) return;

        if (this.items.length === 0) {
            Utils.showEmptyState(adminItemsList, 'Nenhum item cadastrado', 'fa-utensils');
            return;
        }

        adminItemsList.innerHTML = this.items.map(item => `
            <div class="admin-item-card">
                <img src="${Utils.getImageUrl(item.url_imagem)}" 
                     alt="${Utils.sanitizeHTML(item.nome)}"
                     class="admin-item-image"
                     onerror="this.src='https://via.placeholder.com/100x100?text=Sem+Imagem'">
                
                <div class="admin-item-info">
                    <h4>${Utils.sanitizeHTML(item.nome)}</h4>
                    <p>${Utils.sanitizeHTML(item.descricao)}</p>
                    <div class="admin-item-meta">
                        <span class="menu-item-category">${Utils.sanitizeHTML(item.categoria)}</span>
                        <span style="font-weight: bold; color: var(--success-color);">
                            ${Utils.formatCurrency(item.preco)}
                        </span>
                    </div>
                </div>

                <div class="admin-item-actions">
                    <button class="btn btn-warning btn-sm" onclick="Admin.editItem(${item.id})">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="Admin.deleteItem(${item.id})">
                        <i class="fas fa-trash"></i>
                        Excluir
                    </button>
                </div>
            </div>
        `).join('');
    },

    /**
     * Abre formulário de item (novo ou edição)
     */
    openItemForm(item = null) {
        const modal = document.getElementById('itemFormModal');
        const title = document.getElementById('itemFormTitle');
        const imagemInput = document.getElementById('itemImagem');
        const imagemLabel = imagemInput.previousElementSibling;
        
        this.currentEditingItem = item;

        // Popula as categorias existentes
        this.populateCategories();

        if (item) {
            title.textContent = 'Editar Item';
            document.getElementById('itemId').value = item.id;
            document.getElementById('itemNome').value = item.nome;
            document.getElementById('itemDescricao').value = item.descricao;
            document.getElementById('itemPreco').value = item.preco;
            document.getElementById('itemCategoria').value = item.categoria;
            
            // Remove obrigatoriedade da imagem ao editar
            imagemInput.removeAttribute('required');
            // Atualiza o label para remover o asterisco vermelho
            imagemLabel.innerHTML = 'Imagem';
        } else {
            title.textContent = 'Adicionar Item';
            this.resetItemForm();
            
            // Torna imagem obrigatória para novos itens
            imagemInput.setAttribute('required', 'required');
            // Adiciona asterisco vermelho
            imagemLabel.innerHTML = 'Imagem <span class="required">*</span>';
        }

        Utils.openModal('itemFormModal');
    },

    /**
     * Popula lista de categorias existentes
     */
    populateCategories() {
        const datalist = document.getElementById('categoriasList');
        if (!datalist) return;

        // Extrai categorias únicas dos itens existentes
        const categorias = [...new Set(this.items.map(item => item.categoria))];
        
        // Limpa e popula o datalist
        datalist.innerHTML = categorias.map(cat => 
            `<option value="${cat}">`
        ).join('');
    },

    /**
     * Edita item
     */
    async editItem(itemId) {
        try {
            const response = await API.getItem(itemId);
            this.openItemForm(response.data);
        } catch (error) {
            Utils.showToast('Erro ao carregar item', 'error');
        }
    },

    /**
     * Salva item (cria ou atualiza)
     */
    async saveItem() {
        const form = document.getElementById('itemForm');
        
        if (!Utils.validateForm(form)) {
            Utils.showToast('Preencha todos os campos obrigatórios', 'warning');
            return;
        }

        const formData = new FormData();
        const itemId = document.getElementById('itemId').value;
        const nome = document.getElementById('itemNome').value;
        const descricao = document.getElementById('itemDescricao').value;
        const preco = parseFloat(document.getElementById('itemPreco').value);
        const categoria = document.getElementById('itemCategoria').value;
        const arquivo = document.getElementById('itemImagem').files[0];
        
        // Valida o preço
        if (isNaN(preco) || preco <= 0) {
            Utils.showToast('Preço inválido', 'warning');
            return;
        }

        // Adiciona dados ao FormData
        formData.append('nome', nome);
        formData.append('descricao', descricao);
        formData.append('preco', preco.toString());
        formData.append('categoria', categoria);
        
        if (arquivo) {
            try {
                Utils.validateImageFile(arquivo);
                formData.append('arquivo', arquivo);
            } catch (error) {
                Utils.showToast(error.message, 'error');
                return;
            }
        } else if (!itemId) {
            // Arquivo é obrigatório para novo item
            Utils.showToast('Selecione uma imagem para o item', 'warning');
            return;
        }

        try {
            // Desabilita botão de submit
            const submitBtn = form.querySelector('[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

            if (itemId) {
                // Atualiza item existente
                await API.updateItem(itemId, formData);
                Utils.showToast('Item atualizado com sucesso!', 'success');
            } else {
                // Cria novo item
                await API.createItem(formData);
                Utils.showToast('Item criado com sucesso!', 'success');
            }

            Utils.closeModal('itemFormModal');
            this.resetItemForm();
            
            // Força recarregamento completo dos itens
            await this.loadItems();
            
            // Atualiza o menu também, forçando reload das imagens
            if (window.Menu) {
                await Menu.loadCategories();
                await Menu.loadItems();
            }

        } catch (error) {
            const errorMessage = error.message || 'Erro ao salvar item';
            Utils.showToast(errorMessage, 'error');
        } finally {
            // Reabilita botão
            const submitBtn = form.querySelector('[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar';
        }
    },

    /**
     * Deleta item
     */
    async deleteItem(itemId) {
        if (!await Utils.confirm(
            'Esta ação não pode ser desfeita. O item será removido permanentemente do cardápio.',
            'Excluir Item?',
            'danger'
        )) {
            return;
        }

        try {
            await API.deleteItem(itemId);
            Utils.showToast('Item excluído com sucesso!', 'success');
            await this.loadItems();
            
            // Atualiza o menu também
            if (window.Menu) {
                await Menu.loadItems();
            }
        } catch (error) {
            Utils.showToast('Erro ao excluir item', 'error');
        }
    },

    /**
     * Reseta formulário de item
     */
    resetItemForm() {
        const form = document.getElementById('itemForm');
        Utils.resetForm(form);
        document.getElementById('itemId').value = '';
        this.currentEditingItem = null;
    },

    /**
     * Carrega pedidos para admin
     */
    async loadOrders() {
        const adminOrdersList = document.getElementById('adminOrdersList');
        
        if (!adminOrdersList) return;

        Utils.showLoading(adminOrdersList);

        try {
            const response = await API.getOrders();
            
            // Garante que temos um array
            if (response && response.data) {
                this.orders = Array.isArray(response.data) ? response.data : [];
            } else if (Array.isArray(response)) {
                this.orders = response;
            } else {
                this.orders = [];
            }
            
            this.renderAdminOrders();
        } catch (error) {
            // Se for 404, significa que não há pedidos cadastrados
            if (error.status === 404) {
                this.orders = [];
                this.renderAdminOrders();
            } else {
                // Mostra mensagem de erro específica
                const errorMsg = error.message || 'Erro ao carregar pedidos. Verifique se o backend está rodando.';
                Utils.showEmptyState(adminOrdersList, errorMsg, 'fa-exclamation-triangle');
            }
        }
    },

    /**
     * Renderiza pedidos no painel admin
     */
    renderAdminOrders() {
        const adminOrdersList = document.getElementById('adminOrdersList');
        
        if (!adminOrdersList) return;

        if (this.orders.length === 0) {
            Utils.showEmptyState(adminOrdersList, 'Nenhum pedido encontrado', 'fa-receipt');
            return;
        }

        // Define ordem de prioridade dos status
        const statusOrder = {
            [ORDER_STATUS.PREPARANDO]: 1,
            [ORDER_STATUS.PENDENTE]: 2,
            [ORDER_STATUS.ENTREGUE]: 3,
            [ORDER_STATUS.CANCELADO]: 4
        };

        // Ordena pedidos pela prioridade de status
        const sortedOrders = [...this.orders].sort((a, b) => {
            return (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
        });

        adminOrdersList.innerHTML = sortedOrders.map(order => `
            <div class="admin-order-card">
                <div class="admin-order-header">
                    <div>
                        <div class="order-id">Pedido #${order.id}</div>
                        <div class="order-total">${Utils.formatCurrency(order.preco_total)}</div>
                    </div>
                    <span class="order-status status-${order.status}">
                        <i class="fas ${STATUS_ICONS[order.status]}"></i>
                        ${STATUS_LABELS[order.status]}
                    </span>
                </div>
                
                <div class="admin-order-actions">
                    ${(order.status !== ORDER_STATUS.CANCELADO && order.status !== ORDER_STATUS.ENTREGUE) ? `
                        <button class="btn btn-warning btn-sm" 
                                onclick="Admin.updateOrderStatus(${order.id}, '${ORDER_STATUS.PREPARANDO}')"
                                ${order.status === ORDER_STATUS.PREPARANDO ? 'disabled' : ''}>
                            <i class="fas fa-fire"></i>
                            Preparando
                        </button>
                        <button class="btn btn-success btn-sm" 
                                onclick="Admin.updateOrderStatus(${order.id}, '${ORDER_STATUS.ENTREGUE}')"
                                ${order.status === ORDER_STATUS.PENDENTE ? 'disabled title="O pedido deve estar em PREPARANDO antes de ser marcado como ENTREGUE"' : (order.status === ORDER_STATUS.ENTREGUE ? 'disabled' : '')}>
                            <i class="fas fa-check"></i>
                            Entregue
                        </button>
                        <button class="btn btn-danger btn-sm" 
                                onclick="Admin.updateOrderStatus(${order.id}, '${ORDER_STATUS.CANCELADO}')">
                            <i class="fas fa-times"></i>
                            Cancelar
                        </button>
                    ` : ''}
                    <button class="btn btn-info btn-sm" 
                            onclick="Orders.showOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i>
                        Ver Detalhes
                    </button>
                    ${(order.status === ORDER_STATUS.CANCELADO || order.status === ORDER_STATUS.ENTREGUE) ? `
                        <button class="btn btn-danger btn-sm" 
                                onclick="Admin.deleteOrder(${order.id})">
                            <i class="fas fa-trash"></i>
                            Excluir
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    /**
     * Atualiza status do pedido
     */
    async updateOrderStatus(pedidoId, status) {
        try {
            await API.updateOrderStatus(pedidoId, status);
            Utils.showToast('Status atualizado com sucesso!', 'success');
            await this.loadOrders();
            
            // Atualiza a lista de pedidos do cliente também
            if (window.Orders) {
                await Orders.loadOrders();
            }
        } catch (error) {
            Utils.showToast('Erro ao atualizar status do pedido', 'error');
        }
    },

    /**
     * Deleta pedido
     */
    async deleteOrder(pedidoId) {
        
        // Verifica se o pedido pode ser deletado
        const order = this.orders.find(o => o.id === pedidoId);
        if (!order) {
            Utils.showToast('Pedido não encontrado', 'error');
            return;
        }
        
        // Regra do backend: só pode deletar pedidos CANCELADOS ou ENTREGUES
        if (order.status !== ORDER_STATUS.CANCELADO && order.status !== ORDER_STATUS.ENTREGUE) {
            Utils.showToast(
                `Não é possível excluir pedidos com status "${STATUS_LABELS[order.status]}". Apenas pedidos CANCELADOS ou ENTREGUES podem ser excluídos.`,
                'warning'
            );
            return;
        }
        
        const confirmed = await Utils.confirm(
            'Esta ação não pode ser desfeita. Todos os dados do pedido serão removidos permanentemente.',
            'Excluir Pedido?',
            'danger'
        );
        
        if (!confirmed) {
            return;
        }

        try {
            const response = await API.deleteOrder(pedidoId);
            
            Utils.showToast('Pedido excluído com sucesso!', 'success');
            await this.loadOrders();
            
            // Atualiza a lista de pedidos do cliente também
            if (window.Orders) {
                await Orders.loadOrders();
            }
        } catch (error) {
            const errorMessage = error.message || error.response?.message || 'Erro ao excluir pedido';
            Utils.showToast(errorMessage, 'error');
        }
    }
};

// Exportar Admin
window.Admin = Admin;
