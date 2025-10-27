// Módulo de Menu/Cardápio
const Menu = {
    // Armazena itens do cardápio
    items: [],
    categories: [],
    selectedCategories: [],

    /**
     * Inicializa o menu
     */
    async init() {
        await this.loadCategories();
        await this.loadItems();
        this.bindEvents();
    },

    /**
     * Vincula eventos
     */
    bindEvents() {
        // Toggle do filtro de categoria
        const filterToggle = document.getElementById('categoryFilterToggle');
        const filterDropdown = document.getElementById('categoryFilterDropdown');
        
        if (filterToggle && filterDropdown) {
            filterToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                filterDropdown.classList.toggle('active');
            });

            // Fechar ao clicar fora
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.category-filter-container')) {
                    filterDropdown.classList.remove('active');
                }
            });
        }

        // Botão limpar filtros
        const clearFilters = document.getElementById('clearFilters');
        if (clearFilters) {
            clearFilters.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectedCategories = [];
                this.renderCategoryFilter(); // Re-renderiza para desmarcar os checkboxes
                this.loadItems();
            });
        }

        // Botão de atualizar
        const refreshBtn = document.getElementById('refreshMenu');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadItems();
            });
        }
    },

    /**
     * Carrega categorias
     */
    async loadCategories() {
        try {
            const response = await API.getCategories();
            
            // A resposta pode vir em diferentes formatos
            if (Array.isArray(response)) {
                this.categories = response;
            } else if (response.data && Array.isArray(response.data)) {
                this.categories = response.data;
            } else if (response.categorias && Array.isArray(response.categorias)) {
                this.categories = response.categorias;
            } else {
                this.categories = [];
            }
            
            this.renderCategoryFilter();
        } catch (error) {
            // Se for 404, não há problema, significa que não há categorias ainda
            if (error.status === 404) {
                this.categories = [];
            } else {
                this.categories = [];
            }
            this.renderCategoryFilter();
        }
    },

    /**
     * Renderiza filtro de categorias
     */
    renderCategoryFilter() {
        const filterOptions = document.getElementById('categoryFilterOptions');
        const itemCategoria = document.getElementById('itemCategoria');
        
        // Renderizar opções do filtro com checkboxes
        if (filterOptions) {
            if (this.categories.length === 0) {
                filterOptions.innerHTML = `
                    <div style="padding: 1rem; text-align: center; color: var(--gray-color);">
                        <i class="fas fa-info-circle"></i>
                        <p style="margin-top: 0.5rem;">Nenhuma categoria disponível</p>
                    </div>
                `;
            } else {
                filterOptions.innerHTML = this.categories.map(cat => `
                    <label class="filter-option">
                        <input type="checkbox" 
                               value="${Utils.sanitizeHTML(cat)}" 
                               ${this.selectedCategories.includes(cat) ? 'checked' : ''}
                               onchange="Menu.toggleCategory('${Utils.sanitizeHTML(cat)}')">
                        <span class="checkbox-custom"></span>
                        <span class="category-label">${Utils.sanitizeHTML(cat)}</span>
                    </label>
                `).join('');
            }
        }

        // Também atualiza o select do formulário de item (admin)
        if (itemCategoria) {
            const formOptions = [
                '<option value="">Selecione...</option>',
                ...this.categories.map(cat => 
                    `<option value="${Utils.sanitizeHTML(cat)}">${Utils.sanitizeHTML(cat)}</option>`
                )
            ].join('');
            itemCategoria.innerHTML = formOptions;
        }
        
        this.updateFilterUI();
    },

    /**
     * Alterna seleção de categoria
     */
    toggleCategory(category) {
        const index = this.selectedCategories.indexOf(category);
        if (index > -1) {
            this.selectedCategories.splice(index, 1);
        } else {
            this.selectedCategories.push(category);
        }
        this.updateFilterUI();
        this.loadItems();
    },

    /**
     * Atualiza UI do filtro
     */
    updateFilterUI() {
        const filterText = document.getElementById('filterText');
        if (filterText) {
            if (this.selectedCategories.length === 0) {
                filterText.textContent = 'Todas as Categorias';
            } else if (this.selectedCategories.length === 1) {
                filterText.textContent = this.selectedCategories[0];
            } else {
                filterText.textContent = `${this.selectedCategories.length} categorias selecionadas`;
            }
        }
    },

    /**
     * Carrega itens do cardápio
     */
    async loadItems() {
        const menuGrid = document.getElementById('menuGrid');
        
        if (!menuGrid) return;

        Utils.showLoading(menuGrid);

        try {
            // Se houver categorias selecionadas, buscar itens filtrados
            let allItems = [];
            
            if (this.selectedCategories.length === 0) {
                // Buscar todos os itens
                const response = await API.getMenu(null);
                allItems = response.data || [];
            } else {
                // Buscar itens de cada categoria selecionada
                const promises = this.selectedCategories.map(cat => API.getMenu(cat));
                const responses = await Promise.all(promises);
                
                // Combinar todos os itens e remover duplicatas
                const itemsMap = new Map();
                responses.forEach(response => {
                    const items = response.data || [];
                    items.forEach(item => {
                        itemsMap.set(item.id, item);
                    });
                });
                allItems = Array.from(itemsMap.values());
            }
            
            this.items = allItems;
            this.renderItems();
        } catch (error) {
            // Se for 404, significa que não há itens cadastrados
            if (error.status === 404) {
                this.items = [];
                this.renderItems();
            } else {
                Utils.showEmptyState(menuGrid, 'Erro ao conectar com o servidor. Verifique se o backend está rodando.', 'fa-exclamation-triangle');
            }
        }
    },

    /**
     * Renderiza itens do cardápio
     */
    renderItems() {
        const menuGrid = document.getElementById('menuGrid');
        
        if (!menuGrid) return;

        if (this.items.length === 0) {
            Utils.showEmptyState(menuGrid, 'Nenhum item encontrado', 'fa-utensils');
            return;
        }

        menuGrid.innerHTML = this.items.map(item => `
            <div class="menu-item" onclick="Menu.showItemDetails(${item.id})">
                <img src="${Utils.getImageUrl(item.url_imagem)}" 
                     alt="${Utils.sanitizeHTML(item.nome)}"
                     class="menu-item-image"
                     onerror="this.src='https://via.placeholder.com/300x200?text=Sem+Imagem'">
                
                <div class="menu-item-content">
                    <span class="menu-item-category">${Utils.sanitizeHTML(item.categoria)}</span>
                    <h3 class="menu-item-name">${Utils.sanitizeHTML(item.nome)}</h3>
                    <div class="menu-item-description">${Utils.sanitizeHTML(item.descricao)}</div>
                    
                    <div class="menu-item-footer">
                        <span class="menu-item-price">${Utils.formatCurrency(item.preco)}</span>
                        <button class="btn btn-primary btn-sm" 
                                onclick="event.stopPropagation(); Cart.addItem(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                            <i class="fas fa-cart-plus"></i>
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Exibe detalhes do item
     */
    async showItemDetails(itemId) {
        const modal = document.getElementById('itemModal');
        const modalBody = document.getElementById('itemModalBody');

        if (!modal || !modalBody) return;

        Utils.showLoading(modalBody);
        Utils.openModal('itemModal');

        try {
            const response = await API.getItem(itemId);
            const item = response.data;

            modalBody.innerHTML = `
                <div class="item-details">
                    <img src="${Utils.getImageUrl(item.url_imagem)}" 
                         alt="${Utils.sanitizeHTML(item.nome)}"
                         style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1.5rem;"
                         onerror="this.src='https://via.placeholder.com/600x300?text=Sem+Imagem'">
                    
                    <span class="menu-item-category">${Utils.sanitizeHTML(item.categoria)}</span>
                    <h2 style="margin: 1rem 0;">${Utils.sanitizeHTML(item.nome)}</h2>
                    <p style="color: var(--gray-color); margin-bottom: 1.5rem; line-height: 1.6;">
                        ${Utils.sanitizeHTML(item.descricao)}
                    </p>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2rem;">
                        <span style="font-size: 2rem; font-weight: bold; color: var(--success-color);">
                            ${Utils.formatCurrency(item.preco)}
                        </span>
                        <button class="btn btn-primary" onclick="Cart.addItem(${JSON.stringify(item).replace(/"/g, '&quot;')}); Utils.closeModal('itemModal');">
                            <i class="fas fa-cart-plus"></i>
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            modalBody.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar detalhes do item</p>
                </div>
            `;
        }
    }
};

// Exportar Menu
window.Menu = Menu;
