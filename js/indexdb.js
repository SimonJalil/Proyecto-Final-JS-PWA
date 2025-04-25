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
    store.createIndex("nombre", "nombre", { unique: true }); // 👈 esto es clave
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

  let totalProductos = 0;
  let totalPrecio = 0;


  store.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const item = cursor.value;

      const cantidad = item.cantidad || 1;
      const precioUnitario = item.precio || 0;

      totalProductos += cantidad;
      totalPrecio += cantidad * precioUnitario;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="mdl-data-table__cell--non-numeric">
          <span contenteditable="false" class="editable-nombre">${item.nombre}</span>
        </td>
        <td>
          <button class="btn-restar" data-id="${item.id}">-</button>
          <span class="cantidad">${cantidad}</span>
          <button class="btn-sumar" data-id="${item.id}">+</button>
        </td>
        <td>
          $<span contenteditable="false" class="editable-precio">${precioUnitario.toFixed(2)}</span>
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
    else {
      const totalRow = document.createElement("tr");
      totalRow.innerHTML = `
        <td class="mdl-data-table__cell--non-numeric"><strong>Total</strong></td>
        <td><strong>${totalProductos}</strong></td>
        <td colspan="2"><strong>$${totalPrecio.toFixed(2)}</strong></td>
      `;
      totalRow.style.backgroundColor = "#f5f5f5";
      totalRow.style.fontWeight = "bold";
      tbody.appendChild(totalRow);
    }
  };
}


