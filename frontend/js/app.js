// Aplicação Principal
(function() {
    'use strict';

    /**
     * Inicializa a aplicação
     */
    async function init() {
        // Inicializa módulos
        Cart.init();
        await Menu.init();
        await Orders.init();
        await Admin.init();

        // Configura navegação
        setupNavigation();

        // Configura modais
        setupModals();

        // Exibe seção inicial
        showSection('menu');
    }

    /**
     * Configura navegação entre seções
     */
    function setupNavigation() {
        const navBtns = document.querySelectorAll('.nav-btn');
        
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                showSection(section);
            });
        });
    }

    /**
     * Exibe seção específica
     */
    window.showSection = function(sectionId) {
        // Remove active de todos os botões e seções
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Adiciona active no botão e seção correspondentes
        document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');
        document.getElementById(sectionId)?.classList.add('active');

        // Scroll para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Recarrega dados se necessário
        if (sectionId === 'orders') {
            Orders.loadOrders();
        } else if (sectionId === 'admin') {
            Admin.loadItems();
            Admin.loadOrders();
        }
    };

    /**
     * Configura comportamento dos modais
     */
    function setupModals() {
        // Fecha modal ao clicar no X
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    Utils.closeModal(modal.id);
                }
            });
        });

        // Fecha modal ao clicar fora do conteúdo
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    Utils.closeModal(this.id);
                }
            });
        });

        // Fecha modal com tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    Utils.closeModal(modal.id);
                });
            }
        });
    }

    /**
     * Tratamento de erros globais
     */
    window.addEventListener('error', (event) => {
        Utils.showToast('Ocorreu um erro inesperado', 'error');
    });

    /**
     * Tratamento de promessas rejeitadas
     */
    window.addEventListener('unhandledrejection', (event) => {
        Utils.showToast('Erro ao processar requisição', 'error');
    });

    /**
     * Detecta quando a página está pronta
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
