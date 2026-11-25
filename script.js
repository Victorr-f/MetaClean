import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
let intervaloSimulacao = null;

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
                    nomeDispositivo: "BIODIGESTOR #002",
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
    pararSimulacao();
    signOut(autenticacao).then(() => {
        location.reload();
    });
}

onAuthStateChanged(autenticacao, (utilizador) => {
    if (utilizador) {
        document.getElementById('sobreposicao-login').classList.add('hidden');
        document.getElementById('nome-exibicao-usuario').innerText = utilizador.email;
        inicializarGraficos();
        iniciarSimulacao();
    } else {
        pararSimulacao();
        document.getElementById('sobreposicao-login').classList.remove('hidden');
    }
});

function gerarLeituraSimulada() {
    const tempBase = 32.4 + (Math.random() * 2.8 - 1.4);
    const umidBase = 71.0 + (Math.random() * 6.0 - 3.0);
    const nivelBase = 58 + Math.floor(Math.random() * 9 - 4);
    const gasBase = 12.6 + (Math.random() * 2.4 - 1.2);

    return {
        nomeDispositivo: "BIODIGESTOR #002",
        temperatura: tempBase.toFixed(1),
        umidade: umidBase.toFixed(1),
        nivel: Math.max(0, Math.min(100, nivelBase)),
        gas: Math.max(0, gasBase).toFixed(2)
    };
}

function aplicarDadosNaInterface(dados) {
    const elementoStatus = document.getElementById('status-conexao');
    if (elementoStatus) {
        elementoStatus.innerText = "ESP32 / Banco de Dados — Conectado";
        elementoStatus.style.color = "#52b788";
    }

    document.getElementById('id-biodigestor').innerText = dados.nomeDispositivo || "BIODIGESTOR #002";
    document.getElementById('val-temp').innerText = dados.temperatura;
    document.getElementById('val-umid').innerText = dados.umidade;
    document.getElementById('val-nivel').innerText = dados.nivel;
    document.getElementById('val-gas').innerText = dados.gas;

    document.getElementById('mon-temp').innerText = dados.temperatura;
    document.getElementById('mon-gas').innerText = dados.gas;
    document.getElementById('ultima-atualizacao').innerText = new Date().toLocaleTimeString();

    atualizarGraficosDinamicos(dados);
}

function iniciarSimulacao() {
    pararSimulacao();
    const atualizar = () => {
        aplicarDadosNaInterface(gerarLeituraSimulada());
    };
    atualizar();
    intervaloSimulacao = setInterval(atualizar, 3000);
}

function pararSimulacao() {
    if (intervaloSimulacao) {
        clearInterval(intervaloSimulacao);
        intervaloSimulacao = null;
    }
}

function navegar(idSecao, elemento) {
    document.querySelectorAll('.secao-pagina').forEach(secao => {
        secao.classList.remove('active');
    });
    document.getElementById(idSecao).classList.add('active');

    if (elemento) {
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

function criarConfiguracaoGrafico(rotulo, dadosIniciais, corLinha, corFundo) {
    return {
        type: 'line',
        data: {
            labels: historicoEtiquetas,
            datasets: [{
                label: rotulo,
                data: dadosIniciais,
                borderColor: corLinha,
                backgroundColor: corFundo,
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: {
                    ticks: { color: '#a0b0a8' },
                    grid: { color: '#183b2c' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#a0b0a8' },
                    grid: { color: '#183b2c' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            }
        }
    };
}

function inicializarGraficos() {
    if (instanciaGraficoTempoReal) instanciaGraficoTempoReal.destroy();
    if (instanciaGraficoTemp) instanciaGraficoTemp.destroy();
    if (instanciaGraficoGas) instanciaGraficoGas.destroy();

    const canvasTempoReal = document.getElementById('grafico-tempo-real');
    const canvasTemp = document.getElementById('grafico-temp');
    const canvasGas = document.getElementById('grafico-gas');

    if (canvasTempoReal) {
        instanciaGraficoTempoReal = new Chart(
            canvasTempoReal.getContext('2d'),
            criarConfiguracaoGrafico('Temperatura °C', historicoTemp, '#52b788', 'rgba(82, 183, 136, 0.12)')
        );
    }
    if (canvasTemp) {
        instanciaGraficoTemp = new Chart(
            canvasTemp.getContext('2d'),
            criarConfiguracaoGrafico('Temperatura (°C)', historicoTemp, '#2a6f4e', 'rgba(42, 111, 78, 0.15)')
        );
    }
    if (canvasGas) {
        instanciaGraficoGas = new Chart(
            canvasGas.getContext('2d'),
            criarConfiguracaoGrafico('Biogás (m³)', historicoGas, '#52b788', 'rgba(82, 183, 136, 0.12)')
        );
    }
}

function atualizarGraficosDinamicos(dados) {
    if (!instanciaGraficoTempoReal || !instanciaGraficoTemp || !instanciaGraficoGas) {
        inicializarGraficos();
    }

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

    instanciaGraficoTempoReal.data.labels = historicoEtiquetas;
    instanciaGraficoTempoReal.data.datasets[0].data = historicoTemp;
    instanciaGraficoTempoReal.update();

    instanciaGraficoTemp.data.labels = historicoEtiquetas;
    instanciaGraficoTemp.data.datasets[0].data = historicoTemp;
    instanciaGraficoTemp.update();

    instanciaGraficoGas.data.labels = historicoEtiquetas;
    instanciaGraficoGas.data.datasets[0].data = historicoGas;
    instanciaGraficoGas.update();
}

window.realizarLogin = realizarLogin;
window.realizarLogout = realizarLogout;
window.alternarModoLogin = alternarModoLogin;
window.navegar = navegar;
window.alternarMenu = alternarMenu;