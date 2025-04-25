document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.mdl-navigation__link');
    const mainContent = document.getElementById('main-content');
    const layout = document.querySelector('.mdl-layout');
    const fab = document.getElementById('fabAgregar');
    const btnDescargarPdf = document.getElementById('btnDescargarPdf');
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
                btnDescargarPdf.style.display = 'block';

                cargarItems(); // ✅ solo cuando ya existe #lista-items
                break;

            case 'config':
                mainContent.innerHTML = `
                    <div class="mdl-grid">
                        <h5>Estadísticas</h5>

                        <div class="grafico-container">
                        <canvas id="grafico-cantidad"></canvas>
                        </div>
                        <div class="grafico-container">
                        <canvas id="grafico-precio-alto"></canvas>
                        </div>
                        <div class="grafico-container">
                        <canvas id="grafico-precio-bajo"></canvas>
                        </div>
                    </div>
                    `;

                fab.style.display = 'none';
                btnDescargarPdf.style.display = 'none';

                // ✅ Llamar después de inyectar el HTML
                setTimeout(() => generarGraficos(), 0);
                break;


            case 'acerca':
                mainContent.innerHTML = `
                      <div class="mdl-grid" style="justify-content: center; text-align: center; margin-top: 2rem;">
                        <div class="mdl-cell mdl-cell--12-col" style="max-width: 400px; margin: auto;">
                          <img src="assets/images/foto-perfil.jpeg" alt="Simón Jalil" style="
                            width: 160px;
                            height: 160px;
                            border-radius: 50%;
                            object-fit: cover;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                            margin-bottom: 1rem;
                          " />
                          <h4 style="margin: 0 0 0.5rem 0;">Simón Jalil</h4>
                          <p style="color: #666; font-size: 0.95rem; margin-bottom: 1rem;">
                            Desarrollador de esta PWA de Lista de Supermercado 💡
                          </p>
                          <p style="font-size: 0.85rem; color: #888;">
                            HTML · CSS · JavaScript · IndexedDB · Chart.js · SweetAlert2 · MDL
                          </p>
                        </div>
                      </div>
                    `;
                fab.style.display = 'none';
                btnDescargarPdf.style.display = 'none';
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
            Toast.fire({
                icon: "error",
                title: "Faltan datos"
            });

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

            const nombreInput = document.getElementById("nombre-item");
            const precioInput = document.getElementById("precio-item");

            nombreInput.value = nombre;
            precioInput.value = precio;

            nombreInput.parentElement.classList.add("is-dirty");
            precioInput.parentElement.classList.add("is-dirty");

            btnAgregar.style.display = "none";
            btnActualizar.style.display = "inline-block";
            dialog.showModal();
        }
    });

    function generarGraficos() {
        const contenedor = document.getElementById("main-content");
        contenedor.innerHTML = `
            <div class="mdl-grid">
                <div class="mdl-cell mdl-cell--12-col">
                <h5>Estadísticas</h5>

                <div class="grafico-container">
                    <h6 style="margin-bottom: 0.5rem;">Top 5 productos por cantidad</h6>
                    <canvas id="grafico-cantidad"></canvas>
                </div>

                <div class="grafico-container">
                    <h6 style="margin-bottom: 0.5rem;">Productos con precio más alto</h6>
                    <canvas id="grafico-precio-mayor"></canvas>
                </div>

                <div class="grafico-container">
                    <h6 style="margin-bottom: 0.5rem;">Productos con precio más bajo</h6>
                    <canvas id="grafico-precio-menor"></canvas>
                </div>
                </div>
            </div>
            `;



        const tx = db.transaction(["items"], "readonly");
        const store = tx.objectStore("items");

        let cantidades = [];
        let precios = [];

        store.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const item = cursor.value;
                cantidades.push({ nombre: item.nombre, cantidad: item.cantidad || 1 });
                precios.push({ nombre: item.nombre, precio: item.precio || 0 });
                cursor.continue();
            } else {
                // === GRÁFICO DE TORTA - Top 5 por cantidad ===
                cantidades.sort((a, b) => b.cantidad - a.cantidad);
                const top5 = cantidades.slice(0, 5);

                new Chart(document.getElementById("grafico-cantidad"), {
                    type: "doughnut",
                    data: {
                        labels: top5.map(i => i.nombre),
                        datasets: [{
                            data: top5.map(i => i.cantidad),
                            backgroundColor: ["#4dc9f6", "#f67019", "#f53794", "#537bc4", "#acc236"],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        plugins: {
                            legend: { position: "top" }
                        }
                    }
                });

                // === GRÁFICO DE BARRAS - Precio más alto ===
                precios.sort((a, b) => b.precio - a.precio);
                const mayor = precios.slice(0, 5);

                new Chart(document.getElementById("grafico-precio-mayor"), {
                    type: "bar",
                    data: {
                        labels: mayor.map(i => i.nombre),
                        datasets: [{
                            label: "Precio más alto",
                            data: mayor.map(i => i.precio),
                            backgroundColor: "rgba(255, 99, 132, 0.4)"
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: "top" }
                        }
                    }
                });

                // === GRÁFICO DE BARRAS - Precio más bajo ===
                precios.sort((a, b) => a.precio - b.precio);
                const menor = precios.slice(0, 5);

                new Chart(document.getElementById("grafico-precio-menor"), {
                    type: "bar",
                    data: {
                        labels: menor.map(i => i.nombre),
                        datasets: [{
                            label: "Precio más bajo",
                            data: menor.map(i => i.precio),
                            backgroundColor: "rgba(75, 192, 192, 0.4)"
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: "top" }
                        }
                    }
                });
            }
        };
    }

    btnDescargarPdf.addEventListener('click', async () => {
        const doc = new jsPDF();

        const tx = db.transaction(["items"], "readonly");
        const store = tx.objectStore("items");

        const items = [];

        store.openCursor().onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                const item = cursor.value;
                items.push([
                    item.nombre,
                    item.cantidad || 1,
                    `$${item.precio.toFixed(2)}`
                ]);
                cursor.continue();
            } else {
                // 🎯 Aca antes de generar el PDF, validamos:
                if (items.length === 0) {
                    Toast.fire({
                        icon: "info",
                        title: "No hay productos para descargar"
                    });
                    return;
                }

                // ✅ Continuar generando el PDF normalmente
                doc.text("Lista de Supermercado", 14, 20);
                doc.autoTable({
                    startY: 30,
                    head: [["Producto", "Cantidad", "Precio"]],
                    body: items,
                });

                const totalCantidad = items.reduce((acc, item) => acc + parseInt(item[1]), 0);
                const totalPrecio = items.reduce((acc, item) => acc + parseFloat(item[2].replace('$', '')), 0);

                doc.text(`Total de productos: ${totalCantidad}`, 14, doc.lastAutoTable.finalY + 10);
                doc.text(`Total general: $${totalPrecio.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 20);

                doc.save("lista-supermercado.pdf");
            }
        };
    });


});


