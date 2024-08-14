document.addEventListener("DOMContentLoaded", () => {
    let temporizadorDisplay = document.getElementById("temporizador");
    let contadorDisplay = document.getElementById("contador");
    let reinicioTemporizadorDisplay = document.getElementById("reinicio-temporizador");
    let iniciarButton = document.getElementById("iniciar");
    let pausarButton = document.getElementById("pausar");
    let resetearButton = document.getElementById("resetear");
    let ajustesButton = document.getElementById("ajustes");
    let guardarAjustesButton = document.getElementById("guardar-ajustes");
    let configuracionDiv = document.getElementById("configuracion");
    let tiempoInicioInput = document.getElementById("tiempo-inicio");
    let tiempoAlertaInput = document.getElementById("tiempo-alerta");
    let sonidoAlertaInput = document.getElementById("sonido-alerta");
    let sonidoFinInput = document.getElementById("sonido-fin");

    let intervalo;
    let reinicioIntervalo;
    let tiempoRestante;
    let tiempoAlerta;
    let ciclos = 0;
    let sonidoAlerta = new Audio('30segundos.wav');
    let sonidoFin = new Audio('cambio.wav');
    let estaPausado = false;

    const backgroundImages = [
        'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg',
        'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg',
        'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg',
        'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg',
        'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg'
    ];
    let currentImageIndex = 0;

    const changeBackgroundImage = () => {
        const img = new Image();
        img.onload = function() {
            document.body.style.backgroundImage = `url('${this.src}')`;
        };
        img.onerror = function() {
            console.error('Error loading image:', backgroundImages[currentImageIndex]);
            currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
            changeBackgroundImage(); // Try the next image
        };
        img.src = backgroundImages[currentImageIndex];
        currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
    };

    // Change background image every 30 seconds
    setInterval(changeBackgroundImage, 30000);

    // Initial background image load
    changeBackgroundImage();

    const actualizarDisplay = () => {
        let minutos = Math.floor(tiempoRestante / 60);
        let segundos = tiempoRestante % 60;
        temporizadorDisplay.textContent = `${minutos < 10 ? '0' : ''}${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
        
        // Update clock face
        const rotation = (tiempoRestante / (parseInt(tiempoInicioInput.value) || 90)) * 360;
        document.documentElement.style.setProperty('--rotation', `${rotation}deg`);
    };

    const reproducirSonido = (audio) => {
        if (audio.readyState === 4) { // HAVE_ENOUGH_DATA
            audio.play().catch(e => console.error("Error playing audio:", e));
        } else {
            console.error("Audio not ready to play");
        }
    };

    const guardarConfiguracion = () => {
        const configuracion = {
            tiempoInicio: tiempoInicioInput.value,
            tiempoAlerta: tiempoAlertaInput.value,
        };
        localStorage.setItem('configuracionTemporizador', JSON.stringify(configuracion));
    };

    const cargarConfiguracion = () => {
        const configuracion = JSON.parse(localStorage.getItem('configuracionTemporizador'));
        if (configuracion) {
            tiempoInicioInput.value = configuracion.tiempoInicio;
            tiempoAlertaInput.value = configuracion.tiempoAlerta;
        }
    };

    const iniciarTemporizador = () => {
        if (estaPausado) {
            estaPausado = false;
            intervalo = setInterval(tick, 1000);
            return;
        }

        clearInterval(intervalo);
        tiempoRestante = parseInt(tiempoInicioInput.value) || 90;
        tiempoAlerta = parseInt(tiempoAlertaInput.value) || 30;

        actualizarDisplay();
        guardarConfiguracion();
        intervalo = setInterval(tick, 1000);
    };

    const tick = () => {
        if (tiempoRestante > 0) {
            tiempoRestante--;
            actualizarDisplay();
            if (tiempoRestante === tiempoAlerta) {
                reproducirSonido(sonidoAlerta);
            }
            if (tiempoRestante === 0) {
                reproducirSonido(sonidoFin);
                ciclos++;
                contadorDisplay.textContent = `Ciclos: ${ciclos}`;
                clearInterval(intervalo);
                reiniciarCuentaAtras(5);
            }
        }
    };

    const reiniciarCuentaAtras = (segundos) => {
        let tiempoReinicioRestante = segundos;
        reinicioTemporizadorDisplay.textContent = `Cambio... ${tiempoReinicioRestante}`;
        reinicioIntervalo = setInterval(() => {
            tiempoReinicioRestante--;
            reinicioTemporizadorDisplay.textContent = `Cambio... ${tiempoReinicioRestante}`;
            if (tiempoReinicioRestante <= 0) {
                clearInterval(reinicioIntervalo);
                reinicioTemporizadorDisplay.textContent = '';
                iniciarTemporizador();
            }
        }, 1000);
    };

    const pausarTemporizador = () => {
        if (estaPausado) {
            iniciarTemporizador();
        } else {
            estaPausado = true;
            clearInterval(intervalo);
        }
    };

    const resetearTemporizador = () => {
        clearInterval(intervalo);
        clearInterval(reinicioIntervalo);
        tiempoRestante = parseInt(tiempoInicioInput.value) || 90;
        ciclos = 0;
        estaPausado = false;
        contadorDisplay.textContent = `Ciclos: ${ciclos}`;
        reinicioTemporizadorDisplay.textContent = '';
        actualizarDisplay();
    };

    const cargarSonido = (input, audioElement) => {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                audioElement.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    ajustesButton.addEventListener('click', () => {
        configuracionDiv.style.display = configuracionDiv.style.display === 'none' ? 'block' : 'none';
    });

    guardarAjustesButton.addEventListener('click', () => {
        guardarConfiguracion();
        cargarSonido(sonidoAlertaInput, sonidoAlerta);
        cargarSonido(sonidoFinInput, sonidoFin);
        configuracionDiv.style.display = 'none';
    });

    cargarConfiguracion();

    iniciarButton.addEventListener("click", iniciarTemporizador);
    pausarButton.addEventListener("click", pausarTemporizador);
    resetearButton.addEventListener("click", resetearTemporizador);
});