/**
 * ==========================================
 * ACTIVIDAD 2: SISTEMA DE OBJETOS AVANZADOS
 * ==========================================
 * Definición de la estructura de datos mediante Programación Orientada a Objetos.
 */

class Producto {
    constructor(id, nombre, categoria, precio, stock, descripcion) {
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.stock = stock;
        this.descripcion = descripcion;
        this.disponibilidad = this.stock > 0;
    }

    // Método para verificar si hay unidades disponibles
    verificarDisponibilidad() {
        return this.stock > 0 ? 'En Stock' : 'Agotado';
    }

    // Método para calcular un precio con descuento aplicado
    aplicarDescuento(porcentaje) {
        return this.precio - (this.precio * (porcentaje / 100));
    }

    // Método que genera la estructura HTML (tarjeta) para el DOM
    mostrarDetalle() {
        const botonDeshabilitado = !this.disponibilidad ? 'disabled' : '';
        const textoBoton = this.disponibilidad ? 'Agregar al Carrito' : 'Agotado';
        
        return `
            <h3>${this.nombre}</h3>
            <p class="categoria">${this.categoria}</p>
            <p class="descripcion">${this.descripcion}</p>
            <p class="precio">$${this.precio.toLocaleString('es-CL')}</p>
            <p class="stock">Estado: <strong>${this.verificarDisponibilidad()}</strong> (${this.stock} u.)</p>
            <button class="btn-agregar" onclick="agregarAlCarrito(${this.id})" ${botonDeshabilitado}>
                ${textoBoton}
            </button>
        `;
    }
}

// Instanciación del catálogo de productos (Base de datos simulada)
const catalogoProductos = [
    new Producto(1, 'Notebook Pro 15"', 'Tecnología', 850000, 5, 'Potente equipo para desarrollo de software.'),
    new Producto(2, 'Teclado Mecánico RGB', 'Accesorios', 45000, 12, 'Switches red, ideal para escritura rápida.'),
    new Producto(3, 'Monitor 27" 4K IPS', 'Tecnología', 220000, 0, 'Resolución ultra HD con colores precisos.'), // Sin stock para pruebas
    new Producto(4, 'Mouse Ergonómico Inalámbrico', 'Accesorios', 35000, 8, 'Reduce la tensión muscular en jornadas largas.'),
    new Producto(5, 'Audífonos con Cancelación de Ruido', 'Audio', 120000, 15, 'Ideal para alta concentración en el trabajo.')
];

// Estado global de la aplicación (Carrito de compras)
let carrito = [];


/**
 * ==========================================
 * ACTIVIDAD 1: BUSQUEDA Y FILTRADO DINÁMICO
 * ==========================================
 * Funciones encargadas de alterar el DOM para reflejar las búsquedas.
 */

// Función principal para renderizar las tarjetas de productos en el contenedor HTML
function renderizarProductos(productosARenderizar) {
    const contenedor = document.getElementById('results-container');
    contenedor.innerHTML = ''; // Limpiar el contenedor antes de dibujar

    if (productosARenderizar.length === 0) {
        contenedor.innerHTML = '<p class="no-results">No se encontraron productos que coincidan con la búsqueda.</p>';
        return;
    }

    // Recorrer la lista filtrada y crear los nodos correspondientes
    productosARenderizar.forEach(producto => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'product-card';
        tarjeta.innerHTML = producto.mostrarDetalle();
        contenedor.appendChild(tarjeta);
    });
}

// Función manejadora del filtrado por coincidencia de texto
function filtrarProductos(event) {
    const terminoBusqueda = event.target.value.toLowerCase();
    
    // Filtra objetos basados en si el nombre o la categoría incluyen el texto ingresado
    const productosFiltrados = catalogoProductos.filter(producto => 
        producto.nombre.toLowerCase().includes(terminoBusqueda) || 
        producto.categoria.toLowerCase().includes(terminoBusqueda)
    );
    
    renderizarProductos(productosFiltrados);
}


/**
 * ==========================================
 * ACTIVIDAD 3: EVENTOS Y NOTIFICACIONES
 * ==========================================
 * Gestión de flujos reactivos, avisos instantáneos y control del estado del carrito.
 */

// Función para instanciar notificaciones flotantes temporales (Toast notifications)
function mostrarNotificacion(mensaje, tipo = 'info') {
    const areaNotificaciones = document.getElementById('notification-area');
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.innerText = mensaje;
    
    areaNotificaciones.appendChild(notificacion);

    // Remover automáticamente del DOM tras 3 segundos
    setTimeout(() => {
           notificacion.remove();
    }, 3000);
}

// Lógica de negocio al presionar el botón de compra
function agregarAlCarrito(idProducto) {
    const productoSeleccionado = catalogoProductos.find(p => p.id === idProducto);
    
    if (productoSeleccionado && productoSeleccionado.stock > 0) {
        // Mutación del estado del objeto y del carrito
        carrito.push(productoSeleccionado);
        productoSeleccionado.stock--; // Descontar stock disponible de forma lógica
        
        actualizarVistaCarrito();
        mostrarNotificacion(`¡${productoSeleccionado.nombre} añadido correctamente!`, 'success');
        
        // Simulación de evento fortuito: Notificación de promoción aleatoria
        if (Math.random() > 0.6) {
            setTimeout(() => {
                mostrarNotificacion('🎁 ¡Ahorra un 10% adicional usando el código PROMO3!', 'promo');
            }, 800);
        }
    } else {
        mostrarNotificacion('Error: El producto seleccionado ya no cuenta con existencias.', 'error');
    }
}

// Refresca los indicadores del carrito en el encabezado y actualiza el catálogo visible
function actualizarVistaCarrito() {
    const totalItems = carrito.length;
    const montoTotal = carrito.reduce((acumulador, producto) => acumulador + producto.precio, 0);
    
    // Actualización de elementos específicos del DOM
    document.getElementById('cart-count').innerText = totalItems;
    document.getElementById('cart-total').innerText = montoTotal.toLocaleString('es-CL');
    
    // Forzar el re-renderizado para actualizar visualmente las unidades del stock modificado
    const valorBusquedaActual = document.getElementById('product-search').value.toLowerCase();
    const productosFiltrados = catalogoProductos.filter(p => 
        p.nombre.toLowerCase().includes(valorBusquedaActual) || p.categoria.toLowerCase().includes(valorBusquedaActual)
    );
    renderizarProductos(productosFiltrados);
}

/**
 * INICIALIZACIÓN DE ESCUCHADORES DE EVENTOS
 * Garantiza que el árbol DOM esté completamente disponible antes de ejecutar manipulaciones.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Imprimir el catálogo en la consola para evidencia de objetos
console.log("Catálogo de Productos:", catalogoProductos);
    // 1. Carga inicial del catálogo completo en pantalla
    renderizarProductos(catalogoProductos);
    
    // 2. Evento 'input' para capturar la escritura en el buscador en tiempo real
    const inputBuscador = document.getElementById('product-search');
    inputBuscador.addEventListener('input', filtrarProductos);
    
    // 3. Notificación de evento promocional pasivo de bienvenida
    setTimeout(() => {
        mostrarNotificacion('🔥 Descuentos de temporada: Tecnología con hasta 15% OFF.', 'promo');
    }, 1500);
});