import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBad2CfhwiNf7DFXw_XGdBecnw0R0PcSew",
    authDomain: "metaclean-site.firebaseapp.com",
    databaseURL: "https://metaclean-site-default-rtdb.firebaseio.com",
    projectId: "metaclean-site",
    storageBucket: "metaclean-site.firebasestorage.app",
    messagingSenderId: "363120526555",
    appId: "1:363120526555:web:08cc0f27f3aca6d99938fe"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

function realizarLogin(event) {
    event.preventDefault();
    const email = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const erroMsg = document.getElementById('login-erro');

    signInWithEmailAndPassword(auth, email, senha)
        .then(() => {
            erroMsg.style.display = 'none';
        })
        .catch((error) => {
            erroMsg.style.display = 'block';
            console.error("Erro no login:", error.code);
        });
}

function realizarLogout() {
    signOut(auth).then(() => {
        location.reload();
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('user-display-name').innerText = user.email;
        escutarDadosDoBanco(user.uid);
    } else {
        document.getElementById('login-overlay').classList.remove('hidden');
    }
});

let unsubscribeDB = null;

function escutarDadosDoBanco(userId) {
    if (unsubscribeDB) {
        unsubscribeDB();
    }
    const sensorRef = ref(db, 'dispositivos/' + userId);
    
    unsubscribeDB = onValue(sensorRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('biodigestor-id').innerText = data.nomeDispositivo || "BIODIGESTOR";
            document.getElementById('val-temp').innerText = data.temperatura || "--";
            document.getElementById('val-umid').innerText = data.umidade || "--";
            document.getElementById('val-nivel').innerText = data.nivel || "--";
            document.getElementById('val-gas').innerText = data.gas || "--";

            document.getElementById('mon-temp').innerText = data.temperatura || "--";
            document.getElementById('mon-gas').innerText = data.gas || "--";
            document.getElementById('last-update').innerText = new Date().toLocaleTimeString();

            atualizarGraficosDinamicos(data);
        }
    });
}

function navigate(sectionId, element) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    if(element) {
        document.querySelectorAll('.menu a').forEach(link => link.classList.remove('active'));
        element.classList.add('active');
    }

    if (window.innerWidth <= 900) {
        document.getElementById('sidebar').classList.remove('open');
    }
}

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('open');
}

const maxPontos = 15; 
let historicoLabels = [];
let historicoTemp = [];
let historicoGas = [];

let realtimeChartInst = null;
let tempChartInst = null;
let gasChartInst = null;

function atualizarGraficosDinamicos(data) {
    const horaAtual = new Date().toLocaleTimeString();
    const tempAtual = parseFloat(data.temperatura) || 0;
    const gasAtual = parseFloat(data.gas) || 0;

    historicoLabels.push(horaAtual);
    historicoTemp.push(tempAtual);
    historicoGas.push(gasAtual);

    if (historicoLabels.length > maxPontos) {
        historicoLabels.shift();
        historicoTemp.shift();
        historicoGas.shift();
    }

    if(realtimeChartInst) realtimeChartInst.destroy();
    if(tempChartInst) tempChartInst.destroy();
    if(gasChartInst) gasChartInst.destroy();

    const ctxRealtime = document.getElementById('realtimeChart').getContext('2d');
    realtimeChartInst = new Chart(ctxRealtime, {
        type: 'line',
        data: {
            labels: historicoLabels,
            datasets: [{
                label: 'Temperatura °C',
                data: historicoTemp,
                borderColor: '#2D6A4F',
                backgroundColor: 'rgba(45, 106, 79, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const ctxTemp = document.getElementById('tempChart').getContext('2d');
    tempChartInst = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: historicoLabels,
            datasets: [{
                label: 'Temperatura (°C)',
                data: historicoTemp,
                borderColor: '#1B4332',
                backgroundColor: 'rgba(27, 67, 50, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const ctxGas = document.getElementById('gasChart').getContext('2d');
    gasChartInst = new Chart(ctxGas, {
        type: 'line',
        data: {
            labels: historicoLabels,
            datasets: [{
                label: 'Biogás (m³)',
                data: historicoGas,
                borderColor: '#52B788',
                backgroundColor: 'rgba(82, 183, 136, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

    const ctxTemp = document.getElementById('tempChart').getContext('2d');
    tempChartInst = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: historicoLabels,
            datasets: [{
                label: 'Temperatura (°C)',
                data: historicoTemp,
                borderColor: '#1B4332',
                backgroundColor: 'rgba(27, 67, 50, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const ctxGas = document.getElementById('gasChart').getContext('2d');
    gasChartInst = new Chart(ctxGas, {
        type: 'line',
        data: {
            labels: historicoLabels,
            datasets: [{
                label: 'Biogás (m³)',
                data: historicoGas,
                borderColor: '#52B788',
                backgroundColor: 'rgba(82, 183, 136, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

window.realizarLogin = realizarLogin;
window.realizarLogout = realizarLogout;
window.navigate = navigate;
window.toggleMenu = toggleMenu;
