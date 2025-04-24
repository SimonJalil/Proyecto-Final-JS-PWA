document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.mdl-navigation__link');
    const mainContent = document.getElementById('main-content');
    const layout = document.querySelector('.mdl-layout');
    const fab = document.getElementById('fabAgregar');
    const dialog = document.getElementById('dialogo-formulario');
    const btnAgregar = document.getElementById('btnAgregarItem');
    const btnCancelar = dialog.querySelector('.close');
    const form = document.getElementById('formulario-item');
    const btnActualizar = document.getElementById("btnActualizarItem");


    let edicionActual = null;


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
            Toast.fire({
                icon: 'warning',
                title: 'Este producto ya existe'
            });
        };
    }

    function modificarCantidad(id, delta) {
        const tx = db.transaction(["items"], "readwrite");
        const store = tx.objectStore("items");
        const request = store.get(id);
        request.onsuccess = () => {
            const item = request.result;
            item.cantidad = Math.max(1, (item.cantidad || 1) + delta);
            store.put(item).onsuccess = () => {
                cargarItems();
            };
        };
    }

    function eliminarItem(id) {
        Swal.fire({
            title: "¿Deseás eliminar este producto?",
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "Eliminar",
            denyButtonText: `Cancelar`
        }).then((result) => {
            if (result.isConfirmed) {
                const tx = db.transaction(["items"], "readwrite");
                const store = tx.objectStore("items");
                store.delete(id).onsuccess = () => {
                    cargarItems();
                    Toast.fire({
                        icon: 'info',
                        title: 'Producto eliminado'
                    });
                };
            }
        });
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
        form.reset(); // Limpiar el formulario al abrir el diálogo
        dialog.showModal();
    });

    btnCancelar.addEventListener('click', () => {
        form.reset(); // Limpiar el formulario al cerrar el diálogo
        dialog.close();

        edicionActual = null;
        btnActualizar.style.display = "none";
        btnAgregar.style.display = "inline-block";

    });

    // Cierra el diálogo al hacer clic fuera del mismo
    dialog.addEventListener('click', (e) => {
        const dialogRect = dialog.getBoundingClientRect();
        const clickedInside =
            e.clientX >= dialogRect.left &&
            e.clientX <= dialogRect.right &&
            e.clientY >= dialogRect.top &&
            e.clientY <= dialogRect.bottom;

        if (!clickedInside) {
            form.reset();
            dialog.close();

            edicionActual = null;
            btnActualizar.style.display = "none";
            btnAgregar.style.display = "inline-block";
        }
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

    btnActualizar.addEventListener("click", () => {
        const nombre = document.getElementById("nombre-item").value.trim().toUpperCase();
        const precio = parseFloat(document.getElementById("precio-item").value);

        if (!nombre || isNaN(precio)) {
            Toast.fire({
                icon: "error",
                title: "Datos inválidos"
            });
            return;
        }

        const tx = db.transaction(["items"], "readwrite");
        const store = tx.objectStore("items");

        const request = store.get(edicionActual.id);
        request.onsuccess = () => {
            const item = request.result;
            item.nombre = nombre;
            item.precio = precio;

            store.put(item).onsuccess = () => {
                cargarItems();
                dialog.close();
                form.reset();
                edicionActual = null;

                btnActualizar.style.display = "none";
                btnAgregar.style.display = "inline-block";

                Toast.fire({
                    icon: "success",
                    title: "Producto actualizado"
                });
            };
        };
    });

    document.body.addEventListener("click", (e) => {
        const id = parseInt(e.target.dataset.id);
        if (!id) return;

        if (e.target.classList.contains("btn-sumar")) {
            modificarCantidad(id, 1);
        }

        if (e.target.classList.contains("btn-restar")) {
            modificarCantidad(id, -1);
        }

        if (e.target.classList.contains("btn-eliminar")) {
            eliminarItem(id);
        }

        if (e.target.classList.contains("btn-editar")) {
            const fila = e.target.closest("tr");
            const nombre = fila.querySelector(".editable-nombre").textContent.trim();
            const precio = parseFloat(fila.querySelector(".editable-precio").textContent);

            edicionActual = { id };

            document.getElementById("nombre-item").value = nombre;
            document.getElementById("precio-item").value = precio;

            btnAgregar.style.display = "none";
            btnActualizar.style.display = "inline-block";
            dialog.showModal();
        }
    });

});


