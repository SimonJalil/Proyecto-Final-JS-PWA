document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.mdl-navigation__link');
    const mainContent = document.getElementById('main-content');
    const layout = document.querySelector('.mdl-layout');
    const fab = document.getElementById('fabAgregar');
    const dialog = document.getElementById('dialogo-formulario');
    const btnAgregar = document.getElementById('btnAgregarItem');
    const btnCancelar = dialog.querySelector('.close');
    const form = document.getElementById('formulario-item');

    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            mostrarSeccion(section);

            // ✅ Cerrar el drawer
            layout.MaterialLayout.toggleDrawer();
        });
    });

    function mostrarSeccion(seccion) {
        switch (seccion) {
            case 'inicio':
                mainContent.innerHTML = `
                  <div class="mdl-grid" id="lista-items">
                    <!-- Aquí van los ítems -->
                  </div>
                `;
                fab.style.display = 'block';
                cargarItems(); // ✅ solo cuando ya existe #lista-items
                break;

            case 'config':
                mainContent.innerHTML = `
              <div class="mdl-grid">
                <h5>Configuración</h5>
                <p>Opciones de configuración próximamente.</p>
              </div>`;
                fab.style.display = 'none';
                break;

            case 'acerca':
                mainContent.innerHTML = `
              <div class="mdl-grid">
                <h5>Acerca de</h5>
                <p>PWA desarrollada por Simon Jalil.</p>
              </div>`;
                fab.style.display = 'none';
                break;
        }
    }


    function agregarItem(nombre, precio) {
        const tx = db.transaction(["items"], "readwrite");
        const store = tx.objectStore("items");

        nombre = nombre.toUpperCase();
        precio = parseFloat(precio);

        const item = { nombre, precio };
        const request = store.add(item);

        request.onsuccess = () => {
            cargarItems(); // recarga la lista visual
        };

        request.onerror = () => {
            console.error("Error al guardar el producto");
        };
    }

    // Mostrar la sección de inicio por defecto
    // Esperamos a que la base esté lista antes de cargar la vista
    const esperarDB = setInterval(() => {
        if (db) {
            clearInterval(esperarDB);
            mostrarSeccion('inicio');
        }
    }, 100);


    if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog); // por si el navegador no soporta <dialog>
    }

    fab.addEventListener('click', () => {
        dialog.showModal();
    });

    btnCancelar.addEventListener('click', () => {
        dialog.close();
    });

    btnAgregar.addEventListener('click', () => {
        const nombre = document.getElementById('nombre-item').value.trim();
        const precio = parseFloat(document.getElementById('precio-item').value);

        if (!nombre || isNaN(precio)) {
            alert("Por favor completá ambos campos correctamente.");
            return;
        }

        agregarItem(nombre, precio);

        form.reset();
        dialog.close();
    });
});


