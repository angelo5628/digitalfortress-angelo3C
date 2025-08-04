let currentPage = 'home';
let isVaultUnlocked = false;
let masterPassword = 'senha123';
let passwords = [];
let lockTimer = null;

const darkModeToggle = document.getElementById('dark-mode-toggle');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const accessVaultBtn = document.getElementById('access-vault');
const unlockVaultBtn = document.getElementById('unlock-vault');
const masterPasswordInput = document.getElementById('master-password');
const passwordError = document.getElementById('password-error');
const vaultContent = document.getElementById('vault-content');
const passwordList = document.getElementById('password-list');
const searchPasswordsInput = document.getElementById('search-passwords');
const filterCategory = document.getElementById('filter-category');
const addPasswordForm = document.getElementById('add-password-form');
const showPasswordBtn = document.getElementById('show-password');
const generatePasswordBtn = document.getElementById('generate-password');
const changeMasterPasswordBtn = document.getElementById('change-master-password');
const exportPasswordsBtn = document.getElementById('export-passwords');
const importPasswordsBtn = document.getElementById('import-passwords');
const autoLockSelect = document.getElementById('auto-lock');
const confirmationModal = document.getElementById('confirmation-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalCancelBtn = document.getElementById('modal-cancel');
const modalConfirmBtn = document.getElementById('modal-confirm');

function showPage(pageId) {
    pages.forEach(page => {
        if (page.id === `${pageId}-page`) {
            page.style.display = 'block';
        } else {
            page.style.display = 'none';
        }
    });
    
    navLinks.forEach(link => {
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    currentPage = pageId;
    
    if (pageId === 'vault' && !isVaultUnlocked) {
        document.querySelector('.password-form').style.display = 'block';
        vaultContent.style.display = 'none';
    } else if (pageId === 'vault' && isVaultUnlocked) {
        document.querySelector('.password-form').style.display = 'none';
        vaultContent.style.display = 'block';
        renderPasswordList();
        resetLockTimer();
    }
}

function toggleDarkMode() {
    const isDarkMode = darkModeToggle.checked;
    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    }
}

function showModal(title, message, confirmCallback, cancelCallback) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    confirmationModal.style.display = 'flex';
    
    modalConfirmBtn.replaceWith(modalConfirmBtn.cloneNode(true));
    modalCancelBtn.replaceWith(modalCancelBtn.cloneNode(true));
    
    const newConfirmBtn = document.getElementById('modal-confirm');
    const newCancelBtn = document.getElementById('modal-cancel');
    
    newConfirmBtn.onclick = function() {
        confirmationModal.style.display = 'none';
        if (confirmCallback) confirmCallback();
    };
    
    newCancelBtn.onclick = function() {
        confirmationModal.style.display = 'none';
        if (cancelCallback) cancelCallback();
    };
}

function renderPasswordList(filter = '', category = '') {
    passwordList.innerHTML = '';
    
    const filteredPasswords = passwords.filter(pwd => {
        const matchesSearch = filter === '' || 
                            pwd.service.toLowerCase().includes(filter.toLowerCase()) || 
                            pwd.username.toLowerCase().includes(filter.toLowerCase()) ||
                            pwd.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()));
        
        const matchesCategory = category === '' || pwd.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    if (filteredPasswords.length === 0) {
        passwordList.innerHTML = '<p class="no-results">Nenhuma senha encontrada.</p>';
        return;
    }
    
    filteredPasswords.sort((a, b) => {
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;
        return a.service.localeCompare(b.service);
    });
    
    let currentCategory = null;
    
    filteredPasswords.forEach(password => {
        if (password.category !== currentCategory) {
            currentCategory = password.category;
            const categoryHeader = document.createElement('h4');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = currentCategory;
            passwordList.appendChild(categoryHeader);
        }
        
        const passwordCard = document.createElement('div');
        passwordCard.className = 'password-card';
        
        passwordCard.innerHTML = `
            <span class="password-category">${password.category}</span>
            <h3>${password.service}</h3>
            <p><strong>Usuário:</strong> ${password.username}</p>
            <p><strong>Senha:</strong> <span class="password" data-password="${password.password}">••••••••</span></p>
            ${password.tags.length > 0 ? `
                <div class="tags-container">
                    ${password.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
            ${password.notes ? `<p><strong>Observações:</strong> ${password.notes}</p>` : ''}
            <div class="password-actions">
                <button class="btn secondary" onclick="togglePasswordVisibility(${password.id}, this)">Mostrar</button>
                <button class="btn secondary" onclick="copyToClipboard('${password.username}', 'usuário')">Copiar U</button>
                <button class="btn secondary" onclick="copyToClipboard('${password.password}', 'senha')">Copiar S</button>
                <button class="btn secondary" onclick="deletePassword(${password.id})">Excluir</button>
            </div>
        `;
        
        passwordList.appendChild(passwordCard);
    });
}

function togglePasswordVisibility(id, button) {
    const passwordCard = button.closest('.password-card');
    const passwordElement = passwordCard.querySelector('.password');
    
    if (passwordElement.textContent === '••••••••') {
        passwordElement.textContent = passwordElement.getAttribute('data-password');
        button.textContent = 'Ocultar';
        
        setTimeout(() => {
            if (passwordElement.textContent !== '••••••••') {
                passwordElement.textContent = '••••••••';
                button.textContent = 'Mostrar';
            }
        }, 30000);
    } else {
        passwordElement.textContent = '••••••••';
        button.textContent = 'Mostrar';
    }
}

function copyToClipboard(text, type = '') {
    navigator.clipboard.writeText(text).then(() => {
        showAlert(`${type ? type.charAt(0).toUpperCase() + type.slice(1) + ' ' : ''}copiado para a área de transferência!`, 'success');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        showAlert('Não foi possível copiar.', 'error');
    });
}

function deletePassword(id) {
    showModal(
        'Confirmar exclusão',
        'Tem certeza que deseja excluir esta senha? Esta ação não pode ser desfeita.',
        () => {
            passwords = passwords.filter(p => p.id !== id);
            savePasswordsToLocalStorage();
            renderPasswordList(searchPasswordsInput.value, filterCategory.value);
            showAlert('Senha excluída com sucesso!', 'success');
        }
    );
}

function generatePassword() {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let password = "";
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    
    document.getElementById('new-password').value = password;
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.classList.add('fade-out');
        setTimeout(() => {
            alertDiv.remove();
        }, 500);
    }, 3000);
}

function savePasswordsToLocalStorage() {
    localStorage.setItem('digitalFortressPasswords', JSON.stringify(passwords));
}

function loadPasswordsFromLocalStorage() {
    const savedPasswords = localStorage.getItem('digitalFortressPasswords');
    if (savedPasswords) {
        passwords = JSON.parse(savedPasswords);
    }
}

function saveMasterPasswordToLocalStorage() {
    localStorage.setItem('digitalFortressMasterPassword', masterPassword);
}

function loadMasterPasswordFromLocalStorage() {
    const savedMasterPassword = localStorage.getItem('digitalFortressMasterPassword');
    if (savedMasterPassword) {
        masterPassword = savedMasterPassword;
    }
}

function exportPasswords() {
    const dataStr = JSON.stringify(passwords, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `digital-fortress-passwords-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showAlert('Senhas exportadas com sucesso!', 'success');
}

function importPasswords(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedPasswords = JSON.parse(e.target.result);
            
            showModal(
                'Confirmar importação',
                `Deseja importar ${importedPasswords.length} senhas? Isso substituirá suas senhas atuais.`,
                () => {
                    passwords = importedPasswords;
                    savePasswordsToLocalStorage();
                    if (currentPage === 'vault' && isVaultUnlocked) {
                        renderPasswordList(searchPasswordsInput.value, filterCategory.value);
                    }
                    showAlert('Senhas importadas com sucesso!', 'success');
                }
            );
        } catch (error) {
            showAlert('Erro ao importar senhas. O arquivo pode estar corrompido.', 'error');
            console.error('Erro ao importar senhas:', error);
        }
    };
    reader.readAsText(file);
}

function resetLockTimer() {
    if (lockTimer) {
        clearTimeout(lockTimer);
    }
    
    const lockMinutes = parseInt(autoLockSelect.value);
    
    if (lockMinutes > 0) {
        lockTimer = setTimeout(() => {
            isVaultUnlocked = false;
            if (currentPage === 'vault') {
                showPage('vault');
            }
            showAlert('O cofre foi bloqueado automaticamente após período de inatividade.', 'warning');
        }, lockMinutes * 60 * 1000);
    }
}

function lockVault() {
    isVaultUnlocked = false;
    if (currentPage === 'vault') {
        showPage('vault');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        darkModeToggle.checked = true;
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    loadPasswordsFromLocalStorage();
    loadMasterPasswordFromLocalStorage();
    
    showPage('home');
});

darkModeToggle.addEventListener('change', toggleDarkMode);

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        showPage(this.dataset.page);
    });
});

accessVaultBtn.addEventListener('click', function() {
    showPage('vault');
});

unlockVaultBtn.addEventListener('click', function() {
    const enteredPassword = masterPasswordInput.value;
    
    if (enteredPassword === masterPassword) {
        isVaultUnlocked = true;
        masterPasswordInput.value = '';
        passwordError.style.display = 'none';
        document.querySelector('.password-form').style.display = 'none';
        vaultContent.style.display = 'block';
        renderPasswordList();
        resetLockTimer();
        showAlert('Cofre desbloqueado com sucesso!', 'success');
    } else {
        passwordError.style.display = 'block';
        masterPasswordInput.value = '';
        showAlert('Senha incorreta. Tente novamente.', 'error');
    }
});

searchPasswordsInput.addEventListener('input', function() {
    renderPasswordList(this.value, filterCategory.value);
});

filterCategory.addEventListener('change', function() {
    renderPasswordList(searchPasswordsInput.value, this.value);
});

addPasswordForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const service = document.getElementById('service-name').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('new-password').value;
    const category = document.getElementById('password-category').value;
    const tags = document.getElementById('password-tags').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    const notes = document.getElementById('password-notes').value;
    
    const newPassword = {
        id: passwords.length > 0 ? Math.max(...passwords.map(p => p.id)) + 1 : 1,
        service,
        username,
        password,
        category,
        tags,
        notes,
        createdAt: new Date()
    };
    
    passwords.push(newPassword);
    savePasswordsToLocalStorage();
    this.reset();
    
    document.getElementById('password-category').value = 'Trabalho';
    
    showAlert('Senha adicionada com sucesso!', 'success');
    showPage('vault');
});

showPasswordBtn.addEventListener('click', function() {
    const passwordInput = document.getElementById('new-password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordInput.type = 'password';
        this.innerHTML = '<i class="fas fa-eye"></i>';
    }
});

generatePasswordBtn.addEventListener('click', generatePassword);

changeMasterPasswordBtn.addEventListener('click', function() {
    showModal(
        'Alterar senha mestre',
        'Digite a nova senha mestre (mínimo 6 caracteres):',
        () => {
            const newPassword = prompt('Nova senha mestre:');
            if (newPassword && newPassword.length >= 6) {
                masterPassword = newPassword;
                saveMasterPasswordToLocalStorage();
                showAlert('Senha mestre alterada com sucesso!', 'success');
            } else {
                showAlert('A senha deve ter pelo menos 6 caracteres.', 'error');
            }
        }
    );
});

exportPasswordsBtn.addEventListener('click', exportPasswords);

importPasswordsBtn.addEventListener('click', function() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.addEventListener('change', importPasswords);
    fileInput.click();
});

autoLockSelect.addEventListener('change', function() {
    if (isVaultUnlocked) {
        resetLockTimer();
    }
});

window.togglePasswordVisibility = togglePasswordVisibility;
window.copyToClipboard = copyToClipboard;
window.deletePassword = deletePassword;

const style = document.createElement('style');
style.textContent = `
    .alert {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 4px;
        color: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        animation: slide-in 0.3s ease-out;
    }
    
    .alert-success {
        background-color: var(--success-color);
    }
    
    .alert-error {
        background-color: var(--error-color);
    }
    
    .alert-info {
        background-color: var(--primary-color);
    }
    
    .alert-warning {
        background-color: var(--warning-color);
    }
    
    .fade-out {
        animation: fade-out 0.5s ease-out forwards;
    }
    
    @keyframes slide-in {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
