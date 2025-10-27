// Módulo de API - Gerencia todas as chamadas HTTP
const API = {
    /**
     * Realiza uma requisição HTTP genérica
     */
    async request(url, options = {}) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

            // Se headers for explicitamente null, não adiciona headers padrão
            // Isso é necessário para FormData que define seu próprio Content-Type
            const headers = options.headers === null 
                ? undefined 
                : {
                    ...API_CONFIG.HEADERS,
                    ...options.headers
                };

            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: headers
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                const errorMessage = error.message || error.description || `Erro ${response.status}`;
                const errorObj = new Error(errorMessage);
                errorObj.status = response.status;
                errorObj.response = error;
                throw errorObj;
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    /**
     * GET - Obter cardápio
     */
    async getMenu(categoria = null, skip = 0, limit = 100) {
        let url = getApiUrl(`/obter_cardapio?skip=${skip}&limit=${limit}`);
        if (categoria) {
            url += `&categoria=${encodeURIComponent(categoria)}`;
        }
        return await this.request(url);
    },

    /**
     * GET - Obter item por ID
     */
    async getItem(itemId) {
        const url = getApiUrl(`/obter_item/${itemId}`);
        return await this.request(url);
    },

    /**
     * GET - Obter categorias
     */
    async getCategories() {
        const url = getApiUrl('/obter_categorias');
        return await this.request(url);
    },

    /**
     * GET - Obter pedidos
     */
    async getOrders(skip = 0, limit = 100) {
        const url = getApiUrl(`/obter_pedidos?skip=${skip}&limit=${limit}`);
        return await this.request(url);
    },

    /**
     * GET - Obter detalhes do pedido
     */
    async getOrderDetails(pedidoId) {
        const url = getApiUrl(`/obter_detalhes_pedido/${pedidoId}`);
        return await this.request(url);
    },

    /**
     * POST - Fazer pedido
     */
    async placeOrder(itens, status = 'PENDENTE') {
        const url = getApiUrl(`/fazer_pedido?status=${status}`);
        return await this.request(url, {
            method: 'POST',
            body: JSON.stringify({ itens })
        });
    },

    /**
     * POST - Cadastrar item
     */
    async createItem(formData) {
        const url = getApiUrl('/cadastrar_item');
        return await this.request(url, {
            method: 'POST',
            headers: null, // Usa null para permitir que o navegador defina o Content-Type correto para FormData
            body: formData
        });
    },

    /**
     * PUT - Atualizar item
     */
    async updateItem(itemId, formData) {
        const url = getApiUrl(`/atualizar_item/${itemId}`);
        return await this.request(url, {
            method: 'PUT',
            headers: null, // Usa null para permitir que o navegador defina o Content-Type correto para FormData
            body: formData
        });
    },

    /**
     * PUT - Atualizar status do pedido
     */
    async updateOrderStatus(pedidoId, status) {
        const url = getApiUrl(`/atualizar_status_pedido/${pedidoId}?status=${status}`);
        return await this.request(url, {
            method: 'PUT'
        });
    },

    /**
     * PUT - Atualizar pedido
     */
    async updateOrder(pedidoId, itens) {
        const url = getApiUrl(`/atualizar_pedido/${pedidoId}`);
        return await this.request(url, {
            method: 'PUT',
            body: JSON.stringify({ itens })
        });
    },

    /**
     * DELETE - Deletar item
     */
    async deleteItem(itemId) {
        const url = getApiUrl(`/deletar_item/${itemId}`);
        return await this.request(url, {
            method: 'DELETE'
        });
    },

    /**
     * DELETE - Deletar pedido
     */
    async deleteOrder(pedidoId) {
        const url = getApiUrl(`/deletar_pedido/${pedidoId}`);
        return await this.request(url, {
            method: 'DELETE'
        });
    }
};

// Exportar API
window.API = API;
