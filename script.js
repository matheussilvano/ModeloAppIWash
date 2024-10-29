let currentTotal = 0;

function showScreen(screenId) {
    // Esconde todas as telas
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Mostra a tela selecionada
    document.getElementById(screenId).classList.remove('hidden');

    // Atualiza a barra de progresso
    const progress = {
        'start-screen': 0,
        'client-info': 20,
        'services': 40,
        'address': 60,
        'payment': 80
    };

    if (progress[screenId] !== undefined) {
        document.getElementById('progress').style.width = progress[screenId] + '%';
        document.getElementById('progress-car').style.left = progress[screenId] + '%';
    }
}

function toggleDamageDetails() {
    const hasDamage = document.getElementById('has-damage').value === 'yes';
    const damageDetails = document.getElementById('damage-details');
    damageDetails.classList.toggle('hidden', !hasDamage);
    
    if (hasDamage) {
        document.getElementById('damage-description').setAttribute('required', '');
    } else {
        document.getElementById('damage-description').removeAttribute('required');
    }
}

function updateTotal() {
    currentTotal = 0;
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        currentTotal += parseFloat(checkbox.dataset.price);
    });
    document.getElementById('total').textContent = currentTotal.toFixed(2);
}

function validateAndProceed(nextScreen, event) {
    event.preventDefault();
    
    const form = event.target;
    if (!form.checkValidity()) {
        // Mostra mensagens de validação nativas do navegador
        return false;
    }

    // Se chegou aqui, o formulário está válido
    showScreen(nextScreen);
    return false; // Previne o submit padrão do formulário
}

function formatCPF(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    input.value = value;
}

function formatPlate(input) {
    let value = input.value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, '');
    
    if (value.length > 7) value = value.slice(0, 7);
    input.value = value;
}

// Adiciona os listeners de formatação quando o documento carrega
document.addEventListener('DOMContentLoaded', () => {
    const cpfInput = document.getElementById('cpf');
    const plateInput = document.getElementById('car-plate');
    
    cpfInput.addEventListener('input', () => formatCPF(cpfInput));
    plateInput.addEventListener('input', () => formatPlate(plateInput));

    // Verifica se há pelo menos um serviço selecionado antes de prosseguir
    document.getElementById('servicesForm').addEventListener('submit', (event) => {
        const hasServices = document.querySelectorAll('input[type="checkbox"]:checked').length > 0;
        if (!hasServices) {
            alert('Por favor, selecione pelo menos um serviço.');
            event.preventDefault();
            return false;
        }
    });
});

(function() {
    emailjs.init("nrIh2jWN0mxToFbpS");
})();

function finishAndReset() {
    // Coleta todos os dados do formulário
    const clientForm = document.getElementById('clientForm');
    const servicesForm = document.getElementById('servicesForm');
    const addressForm = document.getElementById('addressForm');

    // Coleta os serviços selecionados
    const selectedServices = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        selectedServices.push(checkbox.parentElement.textContent.trim());
    });

    // Prepara os dados para envio
    const formData = {
        // Dados do cliente
        nome: document.querySelector('#name').value,
        telefone: document.querySelector('#telefone').value,
        cpf: document.querySelector('#cpf').value,
        email: document.querySelector('#email').value,
        
        // Dados do veículo
        marca: document.querySelector('#car-brand').value,
        modelo: document.querySelector('#car-model').value,
        placa: document.querySelector('#car-plate').value,
        danos: document.querySelector('#has-damage').value === 'yes' ? 
            document.querySelector('#damage-description').value : 'Sem danos',
        
        // Serviços selecionados
        servicos: selectedServices.join(', '),
        valorTotal: currentTotal,
        
        // Endereço
        estado: document.querySelector('#state').value,
        cidade: document.querySelector('#city').value,
        bairro: document.querySelector('#neighborhood').value,
        logradouro: document.querySelector('#street').value,
        numero: document.querySelector('#number').value,
        observacoes: document.querySelector('#observations').value || 'Sem observações'
    };

    // Envia o email usando EmailJS
    emailjs.send(
        "service_gzls35p",
        "template_vnpj6do",
        {
            to_name: "IWash",
            from_name: formData.nome,
            message: `
                Novo pedido de lavagem:
                
                Dados do Cliente:
                Nome: ${formData.nome}
                Telefone: ${formData.telefone}
                CPF: ${formData.cpf}
                Email: ${formData.email}
                
                Dados do Veículo:
                Marca: ${formData.marca}
                Modelo: ${formData.modelo}
                Placa: ${formData.placa}
                Danos: ${formData.danos}
                
                Serviços Selecionados:
                ${formData.servicos}
                Valor Total: R$ ${formData.valorTotal.toFixed(2)}
                
                Endereço para Atendimento:
                Estado: ${formData.estado}
                Cidade: ${formData.cidade}
                Bairro: ${formData.bairro}
                Logradouro: ${formData.logradouro}
                Número: ${formData.numero}
                Observações: ${formData.observacoes}
            `
        }
    ).then(
        function(response) {
            console.log("Email enviado com sucesso!", response);
            alert("Pedido enviado com sucesso!");
            
            // Reset todos os formulários
            document.querySelectorAll('form').forEach(form => form.reset());
            currentTotal = 0;
            document.getElementById('total').textContent = '0,00';
            // Retorna para a tela inicial
            showScreen('start-screen');
        },
        function(error) {
            console.log("Erro ao enviar email:", error);
            alert("Erro ao enviar pedido. Por favor, tente novamente.");
        }
    );
}
