const firebaseConfig = {
    apiKey: "AIzaSyCGCvFuZCkaY73ohd_rhOW_jzAbHXiQqKY",
    authDomain: "viaje-novia.firebaseapp.com",
    projectId: "viaje-novia",
    storageBucket: "viaje-novia.firebasestorage.app",
    messagingSenderId: "759903397661",
    appId: "1:759903397661:web:e018d3c2559e264b6be3f4"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- 2. REFERENCIAS A ELEMENTOS DEL HTML ---
const currentAmountEl = document.getElementById('current-amount');
const progressBarEl = document.getElementById('progress-bar');
const amountInputEl = document.getElementById('amount-input');
const addButtonEl = document.getElementById('add-button');
const historyListEl = document.getElementById('history-list');

const META_AHORRO = 200;

// Referencia al documento en la base de datos donde guardaremos el ahorro
const ahorroRef = db.collection('ahorros').doc('viajeBanos');

// --- 3. LÓGICA DE LA APLICACIÓN ---

// Escuchador en tiempo real: Se ejecuta cada vez que el dato cambia en la nube
ahorroRef.onSnapshot(doc => {
    if (doc.exists && doc.data().aportes) {
        const aportes = doc.data().aportes;
        
        // 1. Calcular el total sumando todos los aportes
        const totalAhorrado = aportes.reduce((sum, aporte) => sum + aporte.monto, 0);
        
        // 2. Actualizar la UI (barra, mensajes, etc.)
        actualizarUI(totalAhorrado, aportes);
    } else {
        // Si no existe, lo creamos con una lista vacía
        ahorroRef.set({ aportes: [] });
        actualizarUI(0, []); // Actualizamos la UI con 0
    }
});

function actualizarUI(monto, aportes = []) {
    // La parte de la barra y el monto total sigue igual
    currentAmountEl.textContent = `$${monto.toFixed(2)}`;
    const porcentaje = (monto / META_AHORRO) * 100;
    progressBarEl.style.width = `${Math.min(porcentaje, 100)}%`;

    // --- Lógica de los mensajes por montos ---
    // ¡Los mensajes están en orden descendente para que funcionen correctamente!
    const milestoneMessageEl = document.getElementById('milestone-message');

    if (monto >= 200) {
        milestoneMessageEl.textContent = "¡MISIÓN CUMPLIDA, MI AMOR! 💖 ¡Lo hicimos! ¡Baños nos espera! Gracias por ser la mejor. ¡Te amo hasta el infinito!";
        // Podríamos incluso añadir más confeti aquí si quisiéramos celebrar en grande
        confetti({ particleCount: 400, spread: 180 });
    } else if (monto >= 180) {
        milestoneMessageEl.textContent = "¡A un pasito de lograrlo! Estoy increíblemente orgulloso de nosotros. ✨ ¡El último esfuerzo, vida mía!";
    } else if (monto >= 160) {
        milestoneMessageEl.textContent = "¡Prepara la maleta! ✈️ Esto ya es una realidad. ¡Qué ganas de vivir esta aventura a tu lado!";
    } else if (monto >= 140) {
        milestoneMessageEl.textContent = "Cada día estoy más seguro de que no hay mejor compañera de equipo que tú. ¡Ya casi, mi amor! 🥰";
    } else if (monto >= 120) {
        milestoneMessageEl.textContent = "La recta final se empieza a ver. ¿Ya te imaginas probando todos los dulces de Baños? 🍬";
    } else if (monto >= 100) {
        milestoneMessageEl.textContent = "¡MITAD DEL CAMINO! 🎉 ¡Vamos súper bien! Estoy muy feliz de compartir este sueño contigo.";
    } else if (monto >= 80) {
        milestoneMessageEl.textContent = "¡Mira qué rápido avanzamos! Pronto estaremos en ese columpio con vistas increíbles. 😉";
    } else if (monto >= 60) {
        milestoneMessageEl.textContent = "Ya podemos empezar a soñar con el sonido de las cascadas. 🏞️ ¡Gracias por hacer esto conmigo, te amo!";
    } else if (monto >= 40) {
        milestoneMessageEl.textContent = "¡Mira lo bien que lo hacemos en equipo! 💑 Cada dólar es un recuerdo que construiremos.";
    } else if (monto >= 20) {
        milestoneMessageEl.textContent = "¡Nuestro primer gran paso juntos! ❤️ Así empiezan las mejores aventuras. ¡Vamos por más!";
    } else if (monto > 0) {
        milestoneMessageEl.textContent = "¡El viaje ha comenzado! El primer ahorro siempre es el más importante.";
    } else {
        milestoneMessageEl.textContent = "¡Empecemos nuestra aventura!";
    }
    // --- ¡NUEVO! Lógica para renderizar el historial ---
    historyListEl.innerHTML = ''; // Limpiamos la lista para no duplicar
    
    // Creamos la lista desde el más reciente al más antiguo
    aportes.slice().reverse().forEach(aporte => {
        const li = document.createElement('li');
        const fecha = new Date(aporte.fecha.seconds * 1000).toLocaleDateString("es-ES");
        
        li.innerHTML = `
            <span>${aporte.persona} añadió</span>
            <span class="amount">$${aporte.monto.toFixed(2)}</span>
            <span>${fecha}</span>
        `;
        historyListEl.appendChild(li);
    });
}

addButtonEl.addEventListener('click', () => {
    const nuevoAhorro = parseFloat(amountInputEl.value);
    const personaSeleccionada = document.querySelector('input[name="person"]:checked').value;

    if (isNaN(nuevoAhorro) || nuevoAhorro <= 0) {
        alert("Por favor, ingresa un número válido y positivo.");
        return;
    }

    // Creamos un objeto con toda la información del aporte
    const nuevoAporte = {
        monto: nuevoAhorro,
        persona: personaSeleccionada,
        fecha: new Date() // Firebase guardará la fecha actual
    };

    // Usamos 'arrayUnion' para añadir el nuevo objeto a la lista 'aportes'
    ahorroRef.update({
        aportes: firebase.firestore.FieldValue.arrayUnion(nuevoAporte)
    });

    // ¡El confeti sigue funcionando!
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    
    amountInputEl.value = '';
});

