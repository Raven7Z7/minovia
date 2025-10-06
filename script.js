// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCGCvFuZCkaY73ohd_rhOW_jzAbHXiQqKY",
    authDomain: "viaje-novia.firebaseapp.com",
    projectId: "viaje-novia",
    storageBucket: "viaje-novia.firebasestorage.app",
    messagingSenderId: "759903397661",
    appId: "1:759903397661:web:e018d3c2559e264b6be3f4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// --- 2. REFERENCIAS A ELEMENTOS DEL HTML ---
const currentAmountEl = document.getElementById('current-amount');
const progressBarEl = document.getElementById('progress-bar');
const amountInputEl = document.getElementById('amount-input');
const addButtonEl = document.getElementById('add-button');

const META_AHORRO = 200;

// Referencia al documento en la base de datos donde guardaremos el ahorro
const ahorroRef = db.collection('ahorros').doc('viajeBanos');

// --- 3. LÓGICA DE LA APLICACIÓN ---

// Escuchador en tiempo real: Se ejecuta cada vez que el dato cambia en la nube
ahorroRef.onSnapshot(doc => {
    if (doc.exists) {
        const ahorroActual = doc.data().total;
        actualizarUI(ahorroActual);
    } else {
        // Si no existe, lo creamos con 0 para empezar
        ahorroRef.set({ total: 0 });
    }
});

// Función para actualizar la interfaz (la parte visual)
function actualizarUI(monto) {
    currentAmountEl.textContent = `$${monto.toFixed(2)}`;
    const porcentaje = (monto / META_AHORRO) * 100;
    progressBarEl.style.width = `${Math.min(porcentaje, 100)}%`; // Evita que pase del 100%
}

// Evento al hacer clic en el botón "Añadir Ahorro"
addButtonEl.addEventListener('click', () => {
    const nuevoAhorro = parseFloat(amountInputEl.value);

    if (isNaN(nuevoAhorro) || nuevoAhorro <= 0) {
        alert("Por favor, ingresa un número válido y positivo.");
        return;
    }

    // Usamos 'increment' para que no haya conflictos si ambos añaden a la vez
    ahorroRef.update({
        total: firebase.firestore.FieldValue.increment(nuevoAhorro)
    });
    
    // Limpiamos el campo de entrada
    amountInputEl.value = '';
});

