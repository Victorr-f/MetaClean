import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const configuracaoFirebase = {
    apiKey: "AIzaSyBad2CfhwiNf7DFXw_XGdBecnw0R0PcSew",
    authDomain: "metaclean-site.firebaseapp.com",
    databaseURL: "https://metaclean-site-default-rtdb.firebaseio.com",
    projectId: "metaclean-site",
    storageBucket: "metaclean-site.firebasestorage.app",
    messagingSenderId: "363120526555",
    appId: "1:363120526555:web:08cc0f27f3aca6d99938fe"
};

const app = initializeApp(configuracaoFirebase);
const autenticacao = getAuth(app);
const baseDados = getDatabase(app);

let modoCadastro = false;

function alternarModoLogin(evento) {
    evento.preventDefault();
    modoCadastro = !modoCadastro;
    const titulo = document.getElementById('titulo-login');
    const botao = document.getElementById('botao-enviar-login');
    const textoAlternancia = document.getElementById('texto-alternancia');
    const linkAlternancia = document.getElementById('link-alternancia');
    const mensagemErro = document.getElementById('erro-login');
    mensagemErro.style.display = 'none';

    if (modoCadastro) {
        titulo.innerText = "MetaClean - Cadastro";
        botao.innerText = "Criar Conta";
        textoAlternancia.innerText = "Já tem uma conta?";
        linkAlternancia.innerText = "Faça login";
    } else {
        titulo.innerText = "MetaClean - Entrar";
        botao.innerText = "Acessar Painel";
        textoAlternancia.innerText = "Não tem uma conta?";
        linkAlternancia.innerText = "Cadastre-se";
    }
}

function realizarLogin(evento) {
    evento.preventDefault();
    const email = document.getElementById('campo-usuario').value.trim();
    const senha = document.getElementById('campo-senha').value.trim();
    const mensagemErro = document.getElementById('erro-login');

    if (modoCadastro) {
        createUserWithEmailAndPassword(autenticacao, email, senha)
            .then((credencialUtilizador) => {
                const utilizador = credencialUtilizador.user;
                const dadosIniciais = {
                    nomeDispositivo: "BIODIGESTOR #001",
                    temperatura: 0,
                    umidade: 0,
                    nivel: 0,
                    gas: 0
                };
                set(ref(baseDados, 'dispositivos/' + utilizador.uid), dadosIniciais);
                mensagemErro.style.display = 'none';
            })
            .catch((erro) => {
                mensagemErro.style.display = 'block';
                mensagemErro.innerText = "Erro ao cadastrar: " + erro.message;
            });
    } else {
        signInWithEmailAndPassword(autenticacao, email, senha)
            .then(() => {
                mensagemErro.style.display = 'none';
            })
            .catch(() => {
                mensagemErro.style.display = 'block';
                mensagemErro.innerText = "Usuário ou senha inválidos.";
            });
    }
}

function realizarLogout() {
    signOut(autenticacao).then(() => {
        location.reload();
    });
}

onAuthStateChanged(autenticacao, (utilizador) => {
    if (utilizador) {
        document.getElementById('sobreposicao-login').classList.add('hidden');
        document.getElementById('nome-exibicao-usuario').innerText = utilizador.email;
        escutarDadosDoBanco(utilizador.uid);
    } else {
        document.getElementById('sobreposicao-login').classList.remove('hidden');
    }
});

let cancelarEscutaBanco = null;
let ultimaLeituraTimestamp = Date.now();

function escutarDadosDoBanco(idUtilizador) {
    if (cancelarEscutaBanco) {
        cancelarEscutaBanco();
    }
    const referenciaSensor = ref(baseDados, 'dispositivos/' + idUtilizador);
    
    cancelarEscutaBanco = onValue(referenciaSensor, (snapshot) => {
        const dados = snapshot.val();
        if (dados) {
            ultimaLeituraTimestamp = Date.now();
            
            const elementoStatus = document.getElementById('status-conexao');
            if (elementoStatus) {
                elementoStatus.innerText = "ESP32 / Banco de Dados — Conectado";
                elementoStatus.style.color = "#52b788";
            }

            document.getElementById('id-biodigestor').innerText = dados.nomeDispositivo || "BIODIGESTOR";
            document.getElementById('val-temp').innerText = dados.temperatura || "--";
            document.getElementById('val-umid').innerText = dados.umidade || "--";
            document.getElementById('val-nivel').innerText = dados.nivel || "--";
            document.getElementById('val-gas').innerText = dados.gas || "--";

            document.getElementById('mon-temp').innerText = dados.temperatura || "--";
            document.getElementById('mon-gas').innerText = dados.gas || "--";
            document.getElementById('ultima-atualizacao').innerText = new Date().toLocaleTimeString();

            atualizarGraficosDinamicos(dados);
        }
    });
}

setInterval(() => {
    const agora = Date.now();
    const elementoStatus = document.getElementById('status-conexao');
    if (elementoStatus && autenticacao.currentUser) {
        if (agora - ultimaLeituraTimestamp > 70000) {
            elementoStatus.innerText = "ESP32 — Desconectado";
            elementoStatus.style.color = "#e63946";
        }
    }
}, 5000);

function navegar(idSecao, elemento) {
    document.querySelectorAll('.secao-pagina').forEach(secao => {
        secao.classList.remove('active');
    });
    document.getElementById(idSecao).classList.add('active');

    if(elemento) {
        document.querySelectorAll('.menu a').forEach(link => link.classList.remove('active'));
        elemento.classList.add('active');
    }

    if (window.innerWidth <= 900) {
        document.getElementById('barra-lateral').classList.remove('open');
    }
}

function alternarMenu() {
    document.getElementById('barra-lateral').classList.toggle('open');
}

const maxPontos = 15; 
let historicoEtiquetas = [];
let historicoTemp = [];
let historicoGas = [];

let instanciaGraficoTempoReal = null;
let instanciaGraficoTemp = null;
let instanciaGraficoGas = null;

function atualizarGraficosDinamicos(dados) {
    const horaAtual = new Date().toLocaleTimeString();
    const tempAtual = parseFloat(dados.temperatura) || 0;
    const gasAtual = parseFloat(dados.gas) || 0;

    historicoEtiquetas.push(horaAtual);
    historicoTemp.push(tempAtual);
    historicoGas.push(gasAtual);

    if (historicoEtiquetas.length > maxPontos) {
        historicoEtiquetas.shift();
        historicoTemp.shift();
        historicoGas.shift();
    }

    if(instanciaGraficoTempoReal) instanciaGraficoTempoReal.destroy();
    if(instanciaGraficoTemp) instanciaGraficoTemp.destroy();
    if(instanciaGraficoGas) instanciaGraficoGas.destroy();

    const contextoTempoReal = document.getElementById('grafico-tempo-real').getContext('2d');
    instanciaGraficoTempoReal = new Chart(contextoTempoReal, {
        type: 'line',
        data: {
            labels: historicoEtiquetas,
            datasets: [{
                label: 'Temperatura °C',
                data: historicoTemp,
                borderColor: '#52b788',
                backgroundColor: 'rgba(82, 183, 136, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: true,
            scales: {
                x: { ticks: { color: '#a0b0a8' }, grid: { color: '#183b2c' } },
                y: { beginAtZero: true, ticks: { color: '#a0b0a8' }, grid: { color: '#183b2c' } }
            },
            plugins: { legend: { labels: { color: '#ffffff' } } }
        }
    });

    const contextoTemp = document.getElementById('grafico-temp').getContext('2d');
    instanciaGraficoTemp = new Chart(contextoTemp, {
        type: 'line',
        data: {
            labels: historicoEtiquetas,
            datasets: [{
                label: 'Temperatura (°C)',
                data: historicoTemp,
                borderColor: '#2a6f4e',
                backgroundColor: 'rgba(42, 111, 78, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: true,
            scales: {
                x: { ticks: { color: '#a0b0a8' }, grid: { color: '#183b2c' } },
                y: { beginAtZero: true, ticks: { color: '#a0b0a8' }, grid: { color: '#183b2c' } }
            },
            plugins: { legend: { labels: { color: '#ffffff' } } }
        }
    });

    const contextoGas = document.getElementById('grafico-gas').getContext('2d');
    instanciaGraficoGas = new Chart(contextoGas, {
        type: 'line',
        data: {
            labels: historicoEtiquetas,
            datasets: [{
                label: 'Biogás (m³)',
                data: historicoGas,
                borderColor: '#52b788',
                backgroundColor: 'rgba(82, 183, 136, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: true,
            scales: {
                x: { ticks: { color: '#a0b0a8' }, grid: { color: '#183b2c' } },
                y: { beginAtZero: true, ticks: { color: '#a0b0a8' }, grid: { color: '#183b2c' } }
            },
            plugins: { legend: { labels: { color: '#ffffff' } } }
        }
    });
}

window.realizarLogin = realizarLogin;
window.realizarLogout = realizarLogout;
window.alternarModoLogin = alternarModoLogin;
window.navegar = navegar;
window.alternarMenu = alternarMenu;
