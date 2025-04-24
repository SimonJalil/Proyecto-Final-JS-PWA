const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

// Abrimos o creamos la base de datos
let db;
const request = indexedDB.open("lista_super", 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;

    if (!db.objectStoreNames.contains("items")) {
        const store = db.createObjectStore("items", { keyPath: "id", autoIncrement: true });
        store.createIndex("nombre", "nombre", { unique: false });
        store.createIndex("precio", "precio", { unique: false });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
};


request.onerror = (event) => {
    console.error("Error al abrir la base de datos:", event.target.error);
};

function cargarItems() {
    if (!db) return;

    const contenedor = document.getElementById("lista-items");
    if (!contenedor) return;

    contenedor.innerHTML = `
      <table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp" style="width: 100%;">
        <thead>
          <tr>
            <th class="mdl-data-table__cell--non-numeric">Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="tabla-body"></tbody>
      </table>
    `;

    const tbody = document.getElementById("tabla-body");

    const tx = db.transaction(["items"], "readonly");
    const store = tx.objectStore("items");

    store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const item = cursor.value;
            const row = document.createElement("tr");

            row.innerHTML = `
          <td class="mdl-data-table__cell--non-numeric">
            <span contenteditable="false" class="editable-nombre">${item.nombre}</span>
          </td>
          <td>
            <button class="btn-restar" data-id="${item.id}">-</button>
            <span class="cantidad">${item.cantidad || 1}</span>
            <button class="btn-sumar" data-id="${item.id}">+</button>
          </td>
          <td>
            $<span contenteditable="false" class="editable-precio">${item.precio.toFixed(2)}</span>
          </td>
          <td>
            <button class="btn-editar" data-id="${item.id}">✏️</button>
            <button class="btn-guardar" data-id="${item.id}" style="display:none;">💾</button>
            <button class="btn-eliminar" data-id="${item.id}">🗑️</button>
          </td>
        `;

            tbody.appendChild(row);
            cursor.continue();
        }
    };
}

document.addEventListener("DOMContentLoaded", () => {
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
    });
});

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
