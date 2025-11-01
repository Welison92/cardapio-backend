// Módulo de Utilidades
const Utils = {
    /**
     * Formata valor para moeda brasileira
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    /**
     * Formata data para exibição
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },

    /**
     * Debounce - limita a frequência de execução de uma função
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Exibe notificação toast
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastIcon = toast.querySelector('.toast-icon');
        const toastMessage = toast.querySelector('.toast-message');

        // Remove classes anteriores
        toast.classList.remove('success', 'error', 'warning', 'info');
        
        // Adiciona nova classe
        toast.classList.add(type);

        // Define ícone baseado no tipo
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-times-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toastIcon.className = `toast-icon ${icons[type] || icons.info}`;
        toastMessage.textContent = message;

        // Exibe toast
        toast.classList.add('active');

        // Remove após 3 segundos
        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    },

    /**
     * Abre modal
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Fecha modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    /**
     * Confirma ação com modal moderno
     */
    async confirm(message, title = 'Confirmar Ação', type = 'warning') {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirmModal');
            const titleElement = document.getElementById('confirmTitle');
            const messageElement = document.getElementById('confirmMessage');
            const iconElement = modal.querySelector('.confirm-icon i');

            // Define o conteúdo
            titleElement.textContent = title;
            messageElement.textContent = message;

            // Define o ícone baseado no tipo
            const icons = {
                warning: 'fas fa-exclamation-circle',
                danger: 'fas fa-exclamation-triangle',
                question: 'fas fa-question-circle',
                info: 'fas fa-info-circle'
            };
            iconElement.className = icons[type] || icons.warning;

            // Define a cor do ícone
            const colors = {
                warning: 'var(--warning-color)',
                danger: 'var(--danger-color)',
                question: 'var(--secondary-color)',
                info: 'var(--secondary-color)'
            };
            modal.querySelector('.confirm-icon').style.color = colors[type] || colors.warning;

            // Remove event listeners anteriores
            const okBtn = document.getElementById('confirmOkBtn');
            const cancelBtn = document.getElementById('confirmCancelBtn');
            const newOkBtn = okBtn.cloneNode(true);
            const newCancelBtn = cancelBtn.cloneNode(true);
            okBtn.replaceWith(newOkBtn);
            cancelBtn.replaceWith(newCancelBtn);

            // Abre o modal
            this.openModal('confirmModal');

            // Variável para controlar se já foi resolvido
            let resolved = false;

            const cleanup = (result) => {
                if (resolved) return;
                resolved = true;
                this.closeModal('confirmModal');
                resolve(result);
            };

            // Evento de confirmar
            newOkBtn.onclick = () => cleanup(true);

            // Evento de cancelar
            newCancelBtn.onclick = () => cleanup(false);

            // Fecha ao clicar fora
            const modalClickHandler = (e) => {
                if (e.target === modal) {
                    modal.removeEventListener('click', modalClickHandler);
                    cleanup(false);
                }
            };
            modal.addEventListener('click', modalClickHandler);

            // Fecha com ESC
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', escHandler);
                    cleanup(false);
                }
            };
            document.addEventListener('keydown', escHandler);
        });
    },

    /**
     * Sanitiza HTML para prevenir XSS
     */
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * Valida arquivo de imagem
     */
    validateImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            throw new Error('Formato de arquivo inválido. Use JPG, PNG ou GIF.');
        }

        if (file.size > maxSize) {
            throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.');
        }

        return true;
    },

    /**
     * Gera preview de imagem
     */
    previewImage(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target.result);
        reader.readAsDataURL(file);
    },

    /**
     * Exibe loading
     */
    showLoading(container) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Carregando...</p>
            </div>
        `;
    },

    /**
     * Exibe estado vazio
     */
    showEmptyState(container, message, icon = 'fa-inbox') {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas ${icon}"></i>
                <p>${message}</p>
            </div>
        `;
    },

    /**
     * Valida formulário
     */
    validateForm(formElement) {
        const inputs = formElement.querySelectorAll('[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = 'var(--danger-color)';
            } else {
                input.style.borderColor = '';
            }
        });

        return isValid;
    },

    /**
     * Reseta formulário
     */
    resetForm(formElement) {
        formElement.reset();
        const inputs = formElement.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.style.borderColor = '';
        });
    },

    /**
     * Retorna URL da imagem ou placeholder
     */
    getImageUrl(url) {
        if (url && url.startsWith('http')) {
            return url;
        }
        if (!url) {
            return 'https://via.placeholder.com/300x200?text=Sem+Imagem';
        }
        
        // Adiciona timestamp para evitar cache do navegador
        const baseUrl = `${API_CONFIG.BASE_URL}${url}`;
        const separator = url.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}t=${Date.now()}`;
    },

    /**
     * Trunca texto
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Scroll suave para elemento
     */
    scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    },

    /**
     * Copia texto para clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copiado para a área de transferência!', 'success');
        } catch (error) {
            this.showToast('Erro ao copiar texto', 'error');
        }
    },

    /**
     * Gera ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Exportar Utils
window.Utils = Utils;
