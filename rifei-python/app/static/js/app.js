/**
 * Rifei - JavaScript Principal
 */

// Utilitários
const Rifei = {
    // Formatar moeda
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    // Formatar data
    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date(date));
    },

    // Formatar data relativa (ex: "há 2 horas")
    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `há ${days} dia${days > 1 ? 's' : ''}`;
        if (hours > 0) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return 'agora mesmo';
    },

    // Toast notifications
    toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        toast.className = `${colors[type]} text-white px-6 py-3 rounded-xl shadow-lg fade-in flex items-center gap-2`;
        toast.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="ml-2 hover:opacity-70">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        `;

        container.appendChild(toast);
        lucide.createIcons();

        setTimeout(() => toast.remove(), 5000);
    },

    // Copiar para clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.toast('Copiado para a área de transferência!', 'success');
        } catch (err) {
            this.toast('Erro ao copiar', 'error');
        }
    },

    // Compartilhar
    async share(data) {
        if (navigator.share) {
            try {
                await navigator.share(data);
            } catch (err) {
                console.log('Compartilhamento cancelado');
            }
        } else {
            this.copyToClipboard(data.url || window.location.href);
        }
    },

    // Confirmar ação
    confirm(message) {
        return new Promise((resolve) => {
            // TODO: Implementar modal de confirmação customizado
            resolve(window.confirm(message));
        });
    },

    // Countdown timer
    createCountdown(targetDate, elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const update = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const diff = target - now;

            if (diff <= 0) {
                element.innerHTML = 'Encerrado';
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            element.innerHTML = `
                <span class="font-bold">${days}</span>d 
                <span class="font-bold">${hours}</span>h 
                <span class="font-bold">${minutes}</span>m 
                <span class="font-bold">${seconds}</span>s
            `;
        };

        update();
        setInterval(update, 1000);
    },

    // Seletor de números de rifa
    initNumberSelector(config) {
        const { 
            containerId, 
            totalNumbers, 
            soldNumbers = [], 
            pricePerNumber,
            onSelectionChange 
        } = config;

        const container = document.getElementById(containerId);
        if (!container) return;

        let selectedNumbers = [];

        const render = () => {
            container.innerHTML = '';
            
            for (let i = 1; i <= totalNumbers; i++) {
                const button = document.createElement('button');
                const isSold = soldNumbers.includes(i);
                const isSelected = selectedNumbers.includes(i);

                button.className = `
                    rifa-number aspect-square rounded-lg text-sm font-bold transition-all
                    ${isSold 
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50' 
                        : isSelected 
                            ? 'bg-gradient-to-br from-emerald-500 to-violet-500 text-white scale-110 shadow-lg selected'
                            : 'bg-gray-100 dark:bg-gray-800/50 hover:bg-emerald-500/20'
                    }
                `;
                button.textContent = i;
                button.disabled = isSold;

                if (!isSold) {
                    button.addEventListener('click', () => {
                        if (isSelected) {
                            selectedNumbers = selectedNumbers.filter(n => n !== i);
                        } else {
                            selectedNumbers.push(i);
                        }
                        render();
                        if (onSelectionChange) {
                            onSelectionChange(selectedNumbers, selectedNumbers.length * pricePerNumber);
                        }
                    });
                }

                container.appendChild(button);
            }
        };

        render();

        return {
            getSelected: () => selectedNumbers,
            clearSelection: () => {
                selectedNumbers = [];
                render();
            }
        };
    }
};

// Inicialização quando DOM carrega
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Reinicializar após HTMX swaps
document.body.addEventListener('htmx:afterSwap', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Exportar para uso global
window.Rifei = Rifei;
