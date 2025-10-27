// Configurações da API
const API_CONFIG = {
    // URL base da API - altere conforme necessário
    BASE_URL: 'http://localhost:8080',
    
    // Prefixo das rotas da API
    API_PREFIX: '/v1/cardapio',
    
    // Timeout para requisições (em milissegundos)
    TIMEOUT: 30000,
    
    // Headers padrão
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Obter URL completa da API
function getApiUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;
}

// Status dos pedidos
const ORDER_STATUS = {
    PENDENTE: 'PENDENTE',
    PREPARANDO: 'PREPARANDO',
    ENTREGUE: 'ENTREGUE',
    CANCELADO: 'CANCELADO'
};

// Traduções de status
const STATUS_LABELS = {
    PENDENTE: 'Pendente',
    PREPARANDO: 'Preparando',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado'
};

// Ícones de status
const STATUS_ICONS = {
    PENDENTE: 'fa-clock',
    PREPARANDO: 'fa-fire',
    ENTREGUE: 'fa-check-circle',
    CANCELADO: 'fa-times-circle'
};

// Exportar configurações
window.API_CONFIG = API_CONFIG;
window.getApiUrl = getApiUrl;
window.ORDER_STATUS = ORDER_STATUS;
window.STATUS_LABELS = STATUS_LABELS;
window.STATUS_ICONS = STATUS_ICONS;
