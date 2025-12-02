import { useState, useEffect } from 'react';
import './App.css';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Importar jspdf-autotable
import 'jspdf-autotable';

function App() {
  //estados para guardar lo que el usuario escribe en el formulario
  const [nombre, setNombre] = useState("");//guarda el nombre del empleado
  const [edad, setEdad] = useState(0);
  const [pais, setPais] = useState("");
  const [cargo, setCargo] = useState("");
  const [anios, setAnios] = useState(0);
  const [celular, setCelular] = useState("");//guarda el celular del empleado
  const [correo, setCorreo] = useState("");//guarda el correo del empleado
  const [documento, setDocumento] = useState("");//guarda el documento del empleado
  const [tipoDocumento, setTipoDocumento] = useState("C.C");//guarda el tipo de documento

  //estado para el modal de información
  const [modalInfo, setModalInfo] = useState({
    mostrar: false,
    empleado: null
  });

  //estado para notificaciones
  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    mensaje: '',
    tipo: 'success' // success, error, warning, info
  });

  //estados para errores de validación
  const [errores, setErrores] = useState({
    nombre: '',
    edad: '',
    pais: '',
    cargo: '',
    anios: '',
    celular: '',
    correo: '',
    documento: '',
    tipoDocumento: ''
  });

  //lista que contiene todos los empleados registrados
  const [registros, setRegistros] = useState([]);//ARREGLO CON LOS EMPLEADOS OBTENIDOS EN EL BACKEND

  //estados para búsqueda y paginación
  const [busqueda, setBusqueda] = useState("");//texto de búsqueda
  const [paginaActual, setPaginaActual] = useState(1);//página actual de la paginación
  const registrosPorPagina = 15;//cantidad de registros por página

  //estados para ordenamiento
  const [ordenamiento, setOrdenamiento] = useState({
    campo: null, // campo por el que se ordena
    direccion: 'asc' // 'asc' o 'desc'
  });

  //estado para carga de datos
  const [cargando, setCargando] = useState(true);

  //estado para confirmación de eliminación
  const [confirmarEliminar, setConfirmarEliminar] = useState({
    mostrar: false,
    empleado: null,
    indice: null
  });

  //este estado se usa para saber si estamos editando un empleado ya existente
  //si es null, o es un nuevo registro.
  // si tiene un valor, es el indice del empleado a editar
  const [editIndex, setEditIndex] = useState(null);//indice del registro que se esta editando

  //función para mostrar notificaciones
  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({
      mostrar: true,
      mensaje,
      tipo
    });
    //ocultar después de 4 segundos
    setTimeout(() => {
      setNotificacion({
        mostrar: false,
        mensaje: '',
        tipo: 'success'
      });
    }, 4000);
  };

  //cuando se carga la pagina, obtenemos los empleados desde el backend(nodejs y sql)
  useEffect(() => {
    //definimos una funcion asincrona interna para cargar los empleados
    const cargarEmpleados = async () => {
      setCargando(true);
      try {
        const response = await fetch('http://localhost:3001/empleados');//hacemos la peticion GET al backend
        const data = await response.json(); //parseamos la respuesta a formato json
        setRegistros(data);
      } catch (error) {
        mostrarNotificacion('Error al cargar los empleados', 'error');
      } finally {
        setCargando(false);
      }
    };

    cargarEmpleados();
  }, []); // arreglo de dependencias vacio: se ejecuta una sola vez al inicio

  //función para validar el formulario
  const validarFormulario = () => {
    const nuevosErrores = {
      nombre: '',
      edad: '',
      pais: '',
      cargo: '',
      anios: '',
      celular: '',
      correo: '',
      documento: ''
    };

    let esValido = true;

    // Validar nombre
    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
      esValido = false;
    } else if (nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
      esValido = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(nombre.trim())) {
      nuevosErrores.nombre = 'El nombre solo puede contener letras y espacios';
      esValido = false;
    }

    // Validar edad
    if (!edad || edad === 0) {
      nuevosErrores.edad = 'La edad es requerida';
      esValido = false;
    } else if (edad < 18) {
      nuevosErrores.edad = 'La edad mínima es 18 años';
      esValido = false;
    } else if (edad > 100) {
      nuevosErrores.edad = 'La edad máxima es 100 años';
      esValido = false;
    }

    // Validar país
    if (!pais.trim()) {
      nuevosErrores.pais = 'El país es requerido';
      esValido = false;
    } else if (pais.trim().length < 2) {
      nuevosErrores.pais = 'El país debe tener al menos 2 caracteres';
      esValido = false;
    }

    // Validar cargo
    if (!cargo.trim()) {
      nuevosErrores.cargo = 'El cargo es requerido';
      esValido = false;
    } else if (cargo.trim().length < 2) {
      nuevosErrores.cargo = 'El cargo debe tener al menos 2 caracteres';
      esValido = false;
    }

    // Validar años
    if (anios === null || anios === undefined || anios === '') {
      nuevosErrores.anios = 'Los años de experiencia son requeridos';
      esValido = false;
    } else if (anios < 0) {
      nuevosErrores.anios = 'Los años no pueden ser negativos';
      esValido = false;
    } else if (anios > 50) {
      nuevosErrores.anios = 'Los años de experiencia no pueden ser mayores a 50';
      esValido = false;
    }

    // Validar celular (obligatorio)
    if (!celular.trim()) {
      nuevosErrores.celular = 'El celular es requerido';
      esValido = false;
    } else if (!/^[\d\s\+\-\(\)]+$/.test(celular.trim())) {
      nuevosErrores.celular = 'El formato del celular no es válido';
      esValido = false;
    } else if (celular.trim().length < 10) {
      nuevosErrores.celular = 'El celular debe tener al menos 10 dígitos';
      esValido = false;
    }

    // Validar correo (obligatorio)
    if (!correo.trim()) {
      nuevosErrores.correo = 'El correo electrónico es requerido';
      esValido = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      nuevosErrores.correo = 'El formato del correo electrónico no es válido';
      esValido = false;
    }

    // Validar documento (obligatorio)
    if (!documento.trim()) {
      nuevosErrores.documento = 'El documento es requerido';
      esValido = false;
    } else if (!/^[\d\-]+$/.test(documento.trim())) {
      nuevosErrores.documento = 'El documento solo puede contener números y guiones';
      esValido = false;
    } else if (documento.trim().length < 8) {
      nuevosErrores.documento = 'El documento debe tener al menos 8 caracteres';
      esValido = false;
    } else {
      // Validar que el documento no esté duplicado (solo si no estamos editando o si cambió el documento)
      const documentoDuplicado = registros.find((reg, idx) => 
        reg.documento === documento.trim() && (editIndex === null || idx !== editIndex)
      );
      if (documentoDuplicado) {
        nuevosErrores.documento = 'Este documento ya está registrado';
        esValido = false;
      }
    }

    setErrores(nuevosErrores);
    return esValido;
  };

  //función para validar un campo individual
  const validarCampo = (campo, valor) => {
    const nuevosErrores = { ...errores };

    switch (campo) {
      case 'nombre':
        if (!valor.trim()) {
          nuevosErrores.nombre = 'El nombre es requerido';
        } else if (valor.trim().length < 2) {
          nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(valor.trim())) {
          nuevosErrores.nombre = 'El nombre solo puede contener letras y espacios';
        } else {
          nuevosErrores.nombre = '';
        }
        break;

      case 'edad':
        if (!valor || valor === 0) {
          nuevosErrores.edad = 'La edad es requerida';
        } else if (valor < 18) {
          nuevosErrores.edad = 'La edad mínima es 18 años';
        } else if (valor > 100) {
          nuevosErrores.edad = 'La edad máxima es 100 años';
        } else {
          nuevosErrores.edad = '';
        }
        break;

      case 'pais':
        if (!valor.trim()) {
          nuevosErrores.pais = 'El país es requerido';
        } else if (valor.trim().length < 2) {
          nuevosErrores.pais = 'El país debe tener al menos 2 caracteres';
        } else {
          nuevosErrores.pais = '';
        }
        break;

      case 'cargo':
        if (!valor.trim()) {
          nuevosErrores.cargo = 'El cargo es requerido';
        } else if (valor.trim().length < 2) {
          nuevosErrores.cargo = 'El cargo debe tener al menos 2 caracteres';
        } else {
          nuevosErrores.cargo = '';
        }
        break;

      case 'anios':
        if (valor === null || valor === undefined || valor === '') {
          nuevosErrores.anios = 'Los años de experiencia son requeridos';
        } else if (valor < 0) {
          nuevosErrores.anios = 'Los años no pueden ser negativos';
        } else if (valor > 50) {
          nuevosErrores.anios = 'Los años de experiencia no pueden ser mayores a 50';
        } else {
          nuevosErrores.anios = '';
        }
        break;

      case 'celular':
        if (!valor.trim()) {
          nuevosErrores.celular = 'El celular es requerido';
        } else if (!/^[\d\s\+\-\(\)]+$/.test(valor.trim())) {
          nuevosErrores.celular = 'El formato del celular no es válido';
        } else if (valor.trim().length < 10) {
          nuevosErrores.celular = 'El celular debe tener al menos 10 dígitos';
        } else {
          nuevosErrores.celular = '';
        }
        break;

      case 'correo':
        if (!valor.trim()) {
          nuevosErrores.correo = 'El correo electrónico es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())) {
          nuevosErrores.correo = 'El formato del correo electrónico no es válido';
        } else {
          nuevosErrores.correo = '';
        }
        break;

      case 'documento':
        if (!valor.trim()) {
          nuevosErrores.documento = 'El documento es requerido';
        } else if (!/^[\d\-]+$/.test(valor.trim())) {
          nuevosErrores.documento = 'El documento solo puede contener números y guiones';
        } else if (valor.trim().length < 8) {
          nuevosErrores.documento = 'El documento debe tener al menos 8 caracteres';
        } else {
          // Validar duplicado solo si no estamos editando o si cambió el documento
          const documentoDuplicado = registros.find((reg, idx) => 
            reg.documento === valor.trim() && (editIndex === null || idx !== editIndex)
          );
          if (documentoDuplicado) {
            nuevosErrores.documento = 'Este documento ya está registrado';
          } else {
            nuevosErrores.documento = '';
          }
        }
        break;

      default:
        break;
    }

    setErrores(nuevosErrores);
  };


  //esta funcion se ejecuta al presionar el boton regitsrar o actualizar
  const registrarDatos = async (e) => {
    e.preventDefault();

    // Validar formulario antes de enviar
    if (!validarFormulario()) {
      return;
    }

    if (editIndex !== null) {
      //si estamos editando un empleado existente
      try {
        const empleado = registros[editIndex]; //obtenemos un empleado actual por el index

        const response = await fetch(`http://localhost:3001/empleados/${empleado.id}`, {

          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, edad, pais, cargo, anios, celular, correo, documento, tipoDocumento })
        });

        if (response.ok) {
          const responseData = await response.json();
          // Verificar si hay error de documento duplicado
          if (responseData.error && responseData.error.includes('documento')) {
            mostrarNotificacion('Este documento ya está registrado', 'error');
            setErrores(prev => ({ ...prev, documento: 'Este documento ya está registrado' }));
            return;
          }
          //copiamos el array actual de regisstros
          const nuevosRegistros = [...registros];
          //reemplazamos el objeto en la posicion editada con los nuevos valores
          nuevosRegistros[editIndex] = { ...empleado, nombre, edad, pais, cargo, anios, celular, correo, documento, tipoDocumento };
          //actualizamos el estado con la lista midificada
          setRegistros(nuevosRegistros);
          //salimos del modo edicion
          setEditIndex(null);
          //limpiamos errores
          setErrores({
            nombre: '',
            edad: '',
            pais: '',
            cargo: '',
            anios: '',
            celular: '',
            correo: '',
    documento: '',
    tipoDocumento: ''
  });
          //limpiamos el formulario
          setNombre("");
          setEdad(0);
          setPais("");
          setCargo("");
          setAnios(0);
          setCelular("");
          setCorreo("");
          setDocumento("");
          setTipoDocumento("C.C");
          mostrarNotificacion('Empleado actualizado correctamente', 'success');
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.error || 'Error al actualizar el empleado';
          
          if (errorMessage.toLowerCase().includes('documento') || errorMessage.toLowerCase().includes('registrado')) {
            mostrarNotificacion('Este documento ya está registrado en otro empleado. El empleado ya existe en el sistema.', 'error');
            setErrores(prev => ({ ...prev, documento: 'Este documento ya está registrado' }));
          } else {
            mostrarNotificacion(errorMessage, 'error');
          }
        }
      } catch (error) {
        mostrarNotificacion('Error de conexión al actualizar', 'error');
      }
    } else {
      //si es un nuevo empleado es porque no estamos editando
      try {
        const response = await fetch('http://localhost:3001/empleados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, edad, pais, cargo, anios, celular, correo, documento, tipoDocumento })
        });

        const data = await response.json();

        if (response.ok) {
          setRegistros([...registros, data]);
          //limpiamos errores
          setErrores({
            nombre: '',
            edad: '',
            pais: '',
            cargo: '',
            anios: '',
            celular: '',
            correo: '',
    documento: '',
    tipoDocumento: ''
  });
          //limpiamos el formulario
          setNombre("");
          setEdad(0);
          setPais("");
          setCargo("");
          setAnios(0);
          setCelular("");
          setCorreo("");
          setDocumento("");
          setTipoDocumento("C.C");
          mostrarNotificacion('Empleado creado correctamente', 'success');
        } else {
          // Manejar errores del backend
          const errorMessage = data.error || 'Error al guardar el empleado';
          
          if (errorMessage.toLowerCase().includes('documento') || errorMessage.toLowerCase().includes('registrado')) {
            mostrarNotificacion('Este documento ya está registrado. El empleado ya existe en el sistema.', 'error');
            setErrores(prev => ({ ...prev, documento: 'Este documento ya está registrado' }));
          } else {
            mostrarNotificacion(errorMessage, 'error');
          }
        }

      } catch (error) {
        mostrarNotificacion('Error de conexión', 'error');
      }
    }
  };

  // Función para mostrar confirmación de eliminación
  const solicitarEliminar = (idx) => {
    const empleado = registros[idx];
    setConfirmarEliminar({
      mostrar: true,
      empleado: empleado,
      indice: idx
    });
  };

  // Función para confirmar y ejecutar eliminación
  const eliminarRegistro = async () => {
    const { empleado, indice: idx } = confirmarEliminar;
    
    try {
      const response = await fetch(`http://localhost:3001/empleados/${empleado.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        //si el backend elimino correctamente, actualizamos el estado filtranmdo el indice
        //quitar el elemento con indice
        setRegistros(registros.filter((_, i) => i !== idx));//quitamos el elemento con ese index idx
        if (editIndex === idx) {
          setEditIndex(null);
          setNombre("");
          setEdad(0);
          setPais("");
          setCargo("");
          setAnios(0);
          setCelular("");
          setCorreo("");
          setDocumento("");
          setTipoDocumento("C.C");
        }
        mostrarNotificacion('Empleado eliminado correctamente', 'success');
        setConfirmarEliminar({ mostrar: false, empleado: null, indice: null });
      } else {
        mostrarNotificacion('Error al eliminar el empleado', 'error');
        setConfirmarEliminar({ mostrar: false, empleado: null, indice: null });
      }
    } catch (error) {
      mostrarNotificacion('Error de conexión al eliminar', 'error');
      setConfirmarEliminar({ mostrar: false, empleado: null, indice: null });
    }
  };

  const editarRegistro = (idx) => {
    const reg = registros[idx];
    setNombre(reg.nombre);
    setEdad(reg.edad);
    setPais(reg.pais);
    setCargo(reg.cargo);
    setAnios(reg.anios);
    setCelular(reg.celular || "");
    setCorreo(reg.correo || "");
    setDocumento(reg.documento || "");
    setTipoDocumento(reg.tipoDocumento || "C.C");
    setEditIndex(idx);
    //limpiar errores al editar
    setErrores({
      nombre: '',
      edad: '',
      pais: '',
      cargo: '',
      anios: '',
      celular: '',
      correo: '',
      documento: '',
      tipoDocumento: ''
    });
  };

  // Función para calcular estadísticas
  const calcularEstadisticas = () => {
    if (registros.length === 0) {
      return {
        cantidadEmpleados: 0,
        promedioEdad: 0,
        promedioAnios: 0,
        cantidadCargos: 0
      };
    }

    const totalEdad = registros.reduce((sum, emp) => sum + (emp.edad || 0), 0);
    const totalAnios = registros.reduce((sum, emp) => sum + (emp.anios || 0), 0);
    const cargosUnicos = new Set(registros.map(emp => emp.cargo).filter(cargo => cargo));

    return {
      cantidadEmpleados: registros.length,
      promedioEdad: Math.round((totalEdad / registros.length) * 10) / 10,
      promedioAnios: Math.round((totalAnios / registros.length) * 10) / 10,
      cantidadCargos: cargosUnicos.size
    };
  };

  const estadisticas = calcularEstadisticas();

  // Función para filtrar empleados según la búsqueda
  const filtrarEmpleados = () => {
    let empleados = registros;
    
    // Aplicar filtro de búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase().trim();
      empleados = registros.filter(emp => {
        return (
          (emp.nombre && emp.nombre.toLowerCase().includes(busquedaLower)) ||
          (emp.documento && emp.documento.toLowerCase().includes(busquedaLower)) ||
          (emp.tipoDocumento && emp.tipoDocumento.toLowerCase().includes(busquedaLower)) ||
          (emp.pais && emp.pais.toLowerCase().includes(busquedaLower)) ||
          (emp.cargo && emp.cargo.toLowerCase().includes(busquedaLower)) ||
          (emp.celular && emp.celular.toLowerCase().includes(busquedaLower)) ||
          (emp.correo && emp.correo.toLowerCase().includes(busquedaLower)) ||
          (emp.edad && emp.edad.toString().includes(busquedaLower)) ||
          (emp.anios && emp.anios.toString().includes(busquedaLower))
        );
      });
    }

    // Aplicar ordenamiento
    if (ordenamiento.campo) {
      empleados = [...empleados].sort((a, b) => {
        let valorA = a[ordenamiento.campo];
        let valorB = b[ordenamiento.campo];

        // Manejar valores nulos o undefined
        if (valorA == null) valorA = '';
        if (valorB == null) valorB = '';

        // Convertir a string para comparación
        if (typeof valorA === 'number') {
          return ordenamiento.direccion === 'asc' ? valorA - valorB : valorB - valorA;
        }

        valorA = String(valorA).toLowerCase();
        valorB = String(valorB).toLowerCase();

        if (ordenamiento.direccion === 'asc') {
          return valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
        } else {
          return valorA > valorB ? -1 : valorA < valorB ? 1 : 0;
        }
      });
    }

    return empleados;
  };

  // Función para cambiar el ordenamiento
  const cambiarOrdenamiento = (campo) => {
    if (ordenamiento.campo === campo) {
      // Si ya está ordenado por este campo, cambiar dirección
      setOrdenamiento({
        campo: campo,
        direccion: ordenamiento.direccion === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // Si es un campo nuevo, ordenar ascendente
      setOrdenamiento({
        campo: campo,
        direccion: 'asc'
      });
    }
    setPaginaActual(1); // Resetear a primera página
  };

  // Empleados filtrados y ordenados
  const empleadosFiltrados = filtrarEmpleados();

  // Calcular paginación
  const totalPaginas = Math.ceil(empleadosFiltrados.length / registrosPorPagina);
  const indiceInicio = (paginaActual - 1) * registrosPorPagina;
  const indiceFin = indiceInicio + registrosPorPagina;
  const empleadosPaginados = empleadosFiltrados.slice(indiceInicio, indiceFin);

  // Función para cambiar de página
  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
    // Scroll hacia arriba de la tabla
    const tablaContainer = document.querySelector('.tabla-container');
    if (tablaContainer) {
      tablaContainer.scrollTop = 0;
    }
  };

  // Función para exportar a Excel
  const exportarExcel = () => {
    const datosExportar = empleadosFiltrados.map(emp => ({
      'Tipo Documento': emp.tipoDocumento || 'C.C',
      'Documento': emp.documento || '',
      'Nombre': emp.nombre || '',
      'Edad': emp.edad || 0,
      'País': emp.pais || '',
      'Cargo': emp.cargo || '',
      'Años Experiencia': emp.anios || 0,
      'Celular': emp.celular || '',
      'Correo': emp.correo || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Empleados');
    
    const nombreArchivo = `empleados_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);
    mostrarNotificacion('Archivo Excel exportado correctamente', 'success');
  };

  // Función para exportar a PDF
  const exportarPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.text('Lista de Empleados', 14, 22);
      
      // Fecha
      doc.setFontSize(10);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 30);
      
      // Datos de la tabla
      const datosTabla = empleadosFiltrados.map(emp => [
        (emp.tipoDocumento || 'C.C') + ': ' + (emp.documento || ''),
        emp.nombre || '',
        emp.edad || 0,
        emp.pais || '',
        emp.cargo || '',
        emp.anios || 0
      ]);

      doc.autoTable({
        head: [['Documento', 'Nombre', 'Edad', 'País', 'Cargo', 'Años Exp.']],
        body: datosTabla,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      const nombreArchivo = `empleados_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nombreArchivo);
      mostrarNotificacion('Archivo PDF exportado correctamente', 'success');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      mostrarNotificacion('Error al exportar el PDF', 'error');
    }
  };

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);


  return (
    <div className="App">{/* Contenedor principal de la aplicación */}
      {/* Componente de notificación */}
      {notificacion.mostrar && (
        <div className={`notificacion notificacion-${notificacion.tipo}`}>
          <div className="notificacion-icono">
            {notificacion.tipo === 'success' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
            {notificacion.tipo === 'error' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
            {notificacion.tipo === 'warning' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            )}
            {notificacion.tipo === 'info' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            )}
          </div>
          <span className="notificacion-mensaje">{notificacion.mensaje}</span>
          <button 
            className="notificacion-cerrar"
            onClick={() => setNotificacion({ mostrar: false, mensaje: '', tipo: 'success' })}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
      
      {/* Tablero de Información */}
      <div className="estadisticas-container">
        <h2 className="estadisticas-titulo">Sistema de Gestión de Empleados</h2>
        <div className="estadisticas-grid">
          <div className="estadistica-card estadistica-empleados">
            <div className="estadistica-icono">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="estadistica-contenido">
              <div className="estadistica-valor">{estadisticas.cantidadEmpleados}</div>
              <div className="estadistica-label">Total Empleados</div>
            </div>
          </div>

          <div className="estadistica-card estadistica-edad">
            <div className="estadistica-icono">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="estadistica-contenido">
              <div className="estadistica-valor">{estadisticas.promedioEdad}</div>
              <div className="estadistica-label">Promedio de Edad</div>
            </div>
          </div>

          <div className="estadistica-card estadistica-experiencia">
            <div className="estadistica-icono">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
            <div className="estadistica-contenido">
              <div className="estadistica-valor">{estadisticas.promedioAnios}</div>
              <div className="estadistica-label">Promedio Años Experiencia</div>
            </div>
          </div>

          <div className="estadistica-card estadistica-cargos">
            <div className="estadistica-icono">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <div className="estadistica-contenido">
              <div className="estadistica-valor">{estadisticas.cantidadCargos}</div>
              <div className="estadistica-label">Cargos Diferentes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="app-layout">{/* Contenedor con layout de dos columnas */}
        {/* Formulario para ingresar los datos - Lado izquierdo */}
        <div className="formulario-section">
          <h2 className="section-title">Registro de Empleados</h2>
          <div className="datos">{/* Contenedor del formulario */}
            <label> Tipo de Documento: <span className="required">*</span>{/* Etiqueta del select de tipo de documento */}
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <select
                  value={tipoDocumento} /* Valor controlado por 'tipoDocumento' */
                  onChange={(e) => setTipoDocumento(e.target.value)} /* Actualiza 'tipoDocumento' */
                  className={errores.tipoDocumento ? 'input-error' : ''}
                  required
                >
                  <option value="C.C">C.C - Cédula de Ciudadanía</option>
                  <option value="C.E">C.E - Cédula de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="NIT">NIT</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              {errores.tipoDocumento && <span className="error-message">{errores.tipoDocumento}</span>}
            </label>
            <label> Número de Documento: <span className="required">*</span>{/* Etiqueta del input de documento */}
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <input
                  type="text" /* Campo de documento */
                  value={documento} /* Valor controlado por 'documento' */
                  onChange={(e) => {
                    setDocumento(e.target.value);
                    validarCampo('documento', e.target.value);
                  }} /* Actualiza 'documento' */
                  onBlur={(e) => validarCampo('documento', e.target.value)} /* Valida al salir del campo */
                  placeholder="Ej: 123456789"
                  className={errores.documento ? 'input-error' : ''}
                  required
                />
              </div>
              {errores.documento && <span className="error-message">{errores.documento}</span>}
            </label>
            <label> Nombre: <span className="required">*</span>{/* Etiqueta del input de nombre */}
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  type="text" /* Campo de texto */
                  value={nombre} /* Valor controlado por el estado 'nombre' */
                  onChange={(e) => {
                    setNombre(e.target.value);
                    validarCampo('nombre', e.target.value);
                  }} /* Actualiza 'nombre' al escribir */
                  onBlur={(e) => validarCampo('nombre', e.target.value)} /* Valida al salir del campo */
                  placeholder="Ej: Jean Carlos"
                  className={errores.nombre ? 'input-error' : ''}
                  required
                />
              </div>
              {errores.nombre && <span className="error-message">{errores.nombre}</span>}
            </label>
            <label> Edad: <span className="required">*</span>{/* Etiqueta del input de edad */}
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="16" rx="8" ry="4"></ellipse>
                  <line x1="9" y1="12" x2="9" y2="8" strokeWidth="2"></line>
                  <line x1="12" y1="12" x2="12" y2="6" strokeWidth="2"></line>
                  <line x1="15" y1="12" x2="15" y2="8" strokeWidth="2"></line>
                  <circle cx="9" cy="6" r="0.5" fill="currentColor"></circle>
                  <circle cx="12" cy="4" r="0.5" fill="currentColor"></circle>
                  <circle cx="15" cy="6" r="0.5" fill="currentColor"></circle>
                </svg>
                <input
                  type="number" /* Campo numérico */
                  value={edad} /* Valor controlado por 'edad' */
                  onChange={(e) => {
                    setEdad(Number(e.target.value));
                    validarCampo('edad', Number(e.target.value));
                  }} /* Convierte a número y guarda */
                  onBlur={(e) => validarCampo('edad', Number(e.target.value))} /* Valida al salir del campo */
                  placeholder="Ej: 30"
                  min="18"
                  max="100"
                  className={errores.edad ? 'input-error' : ''}
                  required
                />
              </div>
              {errores.edad && <span className="error-message">{errores.edad}</span>}
            </label>
            <label> País: <span className="required">*</span>{/* Etiqueta del input de país */}
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <input
                  type="text" /* Campo de texto */
                  value={pais} /* Valor controlado por 'pais' */
                  onChange={(e) => {
                    setPais(e.target.value);
                    validarCampo('pais', e.target.value);
                  }} /* Actualiza 'pais' */
                  onBlur={(e) => validarCampo('pais', e.target.value)} /* Valida al salir del campo */
                  placeholder="Ej: Colombia"
                  className={errores.pais ? 'input-error' : ''}
                  required
                />
              </div>
              {errores.pais && <span className="error-message">{errores.pais}</span>}
            </label>
            <label> Cargo: <span className="required">*</span>{/* Etiqueta del input de cargo */}
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <input
                  type="text" /* Campo de texto */
                  value={cargo} /* Valor controlado por 'cargo' */
                  onChange={(e) => {
                    setCargo(e.target.value);
                    validarCampo('cargo', e.target.value);
                  }} /* Actualiza 'cargo' */
                  onBlur={(e) => validarCampo('cargo', e.target.value)} /* Valida al salir del campo */
                  placeholder="Ej: Desarrollador Full Stack"
                  className={errores.cargo ? 'input-error' : ''}
                  required
                />
              </div>
              {errores.cargo && <span className="error-message">{errores.cargo}</span>}
            </label>
            <label> Años de Experiencia: <span className="required">*</span>{/* Etiqueta del input de años de experiencia */}
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <input
                  type="number" /* Campo numérico */
                  value={anios} /* Valor controlado por 'anios' */
                  onChange={(e) => {
                    setAnios(Number(e.target.value));
                    validarCampo('anios', Number(e.target.value));
                  }} /* Convierte a número y guarda */
                  onBlur={(e) => validarCampo('anios', Number(e.target.value))} /* Valida al salir del campo */
                  placeholder="Ej: 5"
                  min="0"
                  max="50"
                  className={errores.anios ? 'input-error' : ''}
                  required
                />
              </div>
              {errores.anios && <span className="error-message">{errores.anios}</span>}
            </label>
            <label> Celular: <span className="required">*</span>{/* Etiqueta del input de celular */}
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <input
                  type="tel" /* Campo de teléfono */
                  value={celular} /* Valor controlado por 'celular' */
                  onChange={(e) => {
                    setCelular(e.target.value);
                    validarCampo('celular', e.target.value);
                  }} /* Actualiza 'celular' */
                  onBlur={(e) => validarCampo('celular', e.target.value)} /* Valida al salir del campo */
                  placeholder="Ej: 3151122335"
                  className={errores.celular ? 'input-error' : ''}
                  required
                />
              </div>
              {errores.celular && <span className="error-message">{errores.celular}</span>}
            </label>
            <label> Correo: <span className="required">*</span>{/* Etiqueta del input de correo */}
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  type="email" /* Campo de correo electrónico */
                  value={correo} /* Valor controlado por 'correo' */
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    validarCampo('correo', e.target.value);
                  }} /* Actualiza 'correo' */
                  onBlur={(e) => validarCampo('correo', e.target.value)} /* Valida al salir del campo */
                  placeholder="Ej: jean.sandoval@empresa.com"
                  className={errores.correo ? 'input-error' : ''}
                  required
                />
              </div>
              {errores.correo && <span className="error-message">{errores.correo}</span>}
            </label>

            {/* Botón que cambia de texto dependiendo si es nuevo o edición */}
            <button onClick={registrarDatos}>
              {editIndex !== null ? 'Actualizar' : 'Registrar'}{/* Texto dinámico del botón */}
            </button>
            {editIndex !== null && (
              <button 
              type="button"
              className="btn-cancelar"
              onClick={() => {
                setEditIndex(null);
                setNombre("");
                setEdad(0);
                setPais("");
                setCargo("");
                setAnios(0);
                setCelular("");
                setCorreo("");
                setDocumento("");
                setTipoDocumento("C.C");
                //limpiar errores
                setErrores({
                  nombre: '',
                  edad: '',
                  pais: '',
                  cargo: '',
                  anios: '',
                  celular: '',
                  correo: '',
    documento: '',
    tipoDocumento: ''
  });
              }}>
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Tabla con los empleados registrados - Lado derecho */}
        <div className="tabla-section">
          <div className="tabla-header">
            <h2 className="section-title">Lista de Empleados</h2>
            <div className="tabla-acciones">
              <button className="btn-exportar btn-excel" onClick={exportarExcel} title="Exportar a Excel">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Excel
              </button>
              <button className="btn-exportar btn-pdf" onClick={exportarPDF} title="Exportar a PDF">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                PDF
              </button>
            </div>
          </div>
          
          {/* Barra de búsqueda */}
          <div className="busqueda-container">
            <div className="busqueda-input-wrapper">
              <svg className="busqueda-icono" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                className="busqueda-input"
                placeholder="Buscar por nombre, documento, cargo, país..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button 
                  className="busqueda-limpiar"
                  onClick={() => setBusqueda("")}
                  title="Limpiar búsqueda"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
            <div className="busqueda-contador">
              {empleadosFiltrados.length} de {registros.length} empleados
            </div>
          </div>

          {cargando ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando empleados...</p>
            </div>
          ) : registros.length > 0 ? ( /* Solo mostramos la tabla si hay registros */
            <>
              <div className="tabla-container">{/* Contenedor para estilos de la tabla */}
                <table className="tabla-registros">{/* Tabla de empleados */}
                  <thead>{/* Cabecera de la tabla */}
                    <tr>{/* Fila de encabezados */}
                      <th 
                        className={`th-sortable ${ordenamiento.campo === 'nombre' ? 'th-sorted' : ''}`}
                        onClick={() => cambiarOrdenamiento('nombre')}
                        title="Clic para ordenar"
                      >
                        Nombre
                        {ordenamiento.campo === 'nombre' && (
                          <span className="sort-icon">
                            {ordenamiento.direccion === 'asc' ? ' ↑' : ' ↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className={`th-sortable ${ordenamiento.campo === 'edad' ? 'th-sorted' : ''}`}
                        onClick={() => cambiarOrdenamiento('edad')}
                        title="Clic para ordenar"
                      >
                        Edad
                        {ordenamiento.campo === 'edad' && (
                          <span className="sort-icon">
                            {ordenamiento.direccion === 'asc' ? ' ↑' : ' ↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className={`th-sortable ${ordenamiento.campo === 'pais' ? 'th-sorted' : ''}`}
                        onClick={() => cambiarOrdenamiento('pais')}
                        title="Clic para ordenar"
                      >
                        País
                        {ordenamiento.campo === 'pais' && (
                          <span className="sort-icon">
                            {ordenamiento.direccion === 'asc' ? ' ↑' : ' ↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className={`th-sortable ${ordenamiento.campo === 'cargo' ? 'th-sorted' : ''}`}
                        onClick={() => cambiarOrdenamiento('cargo')}
                        title="Clic para ordenar"
                      >
                        Cargo
                        {ordenamiento.campo === 'cargo' && (
                          <span className="sort-icon">
                            {ordenamiento.direccion === 'asc' ? ' ↑' : ' ↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className={`th-sortable ${ordenamiento.campo === 'anios' ? 'th-sorted' : ''}`}
                        onClick={() => cambiarOrdenamiento('anios')}
                        title="Clic para ordenar"
                      >
                        Años
                        {ordenamiento.campo === 'anios' && (
                          <span className="sort-icon">
                            {ordenamiento.direccion === 'asc' ? ' ↑' : ' ↓'}
                          </span>
                        )}
                      </th>
                      <th>Acciones</th>{/* Columna: Botones de acción */}
                    </tr>
                  </thead>
                  <tbody>{/* Cuerpo de la tabla */}
                    {empleadosPaginados.map((reg, idx) => { 
                      // Encontrar el índice real en el array original para las acciones
                      const indiceReal = registros.findIndex(r => r.id === reg.id);
                      return (
                      <tr key={reg.id || idx}>{/* Fila por empleado (key = id o índice) */}
                        <td>{reg.nombre}</td>{/* Celda: nombre del empleado */}
                        <td>{reg.edad}</td>{/* Celda: edad del empleado */}
                        <td>{reg.pais}</td>{/* Celda: país del empleado */}
                        <td>{reg.cargo}</td>{/* Celda: cargo del empleado */}
                        <td>{reg.anios}</td>{/* Celda: años de experiencia */}
                        <td>{/* Celda: acciones */}
                          <button
                            className="btn-ver-mas" /* Clase CSS para estilos */
                            onClick={() => setModalInfo({ mostrar: true, empleado: reg })} /* Al hacer clic, mostramos el modal */
                            title="Ver más información"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="16" x2="12" y2="12"></line>
                              <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                          </button>
                          <button
                            className="btn-editar" /* Clase CSS para estilos */
                            onClick={() => editarRegistro(indiceReal >= 0 ? indiceReal : idx)} /* Al hacer clic, cargamos los datos en el formulario */
                            title="Editar"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            className="btn-eliminar" /* Clase CSS para estilos */
                            onClick={() => solicitarEliminar(indiceReal >= 0 ? indiceReal : idx)} /* Al hacer clic, solicitamos confirmación */
                            title="Eliminar"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Controles de paginación */}
              {totalPaginas > 1 && (
              <div className="paginacion-container">
                <div className="paginacion-info">
                  Página {paginaActual} de {totalPaginas} ({empleadosFiltrados.length} empleados)
                </div>
                <div className="paginacion-botones">
                  <button
                    className="btn-paginacion"
                    onClick={() => cambiarPagina(1)}
                    disabled={paginaActual === 1}
                    title="Primera página"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="11 17 6 12 11 7"></polyline>
                      <polyline points="18 17 13 12 18 7"></polyline>
                    </svg>
                  </button>
                  <button
                    className="btn-paginacion"
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    title="Página anterior"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <div className="paginacion-numeros">
                    {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                      let pagina;
                      if (totalPaginas <= 5) {
                        pagina = i + 1;
                      } else if (paginaActual <= 3) {
                        pagina = i + 1;
                      } else if (paginaActual >= totalPaginas - 2) {
                        pagina = totalPaginas - 4 + i;
                      } else {
                        pagina = paginaActual - 2 + i;
                      }
                      return (
                        <button
                          key={pagina}
                          className={`btn-paginacion-numero ${pagina === paginaActual ? 'active' : ''}`}
                          onClick={() => cambiarPagina(pagina)}
                        >
                          {pagina}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="btn-paginacion"
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    title="Página siguiente"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                  <button
                    className="btn-paginacion"
                    onClick={() => cambiarPagina(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    title="Última página"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="13 17 18 12 13 7"></polyline>
                      <polyline points="6 17 11 12 6 7"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>No hay empleados registrados</p>
              <p className="empty-state-subtitle">Comienza agregando un nuevo empleado</p>
            </div>
          )}
          
          {/* Mensaje cuando no hay resultados de búsqueda */}
          {registros.length > 0 && empleadosFiltrados.length === 0 && (
            <div className="empty-state">
              <p>No se encontraron empleados</p>
              <p className="empty-state-subtitle">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {confirmarEliminar.mostrar && confirmarEliminar.empleado && (
        <div className="modal-overlay" onClick={() => setConfirmarEliminar({ mostrar: false, empleado: null, indice: null })}>
          <div className="modal-content modal-confirmacion" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Eliminación</h3>
              <button 
                className="modal-cerrar"
                onClick={() => setConfirmarEliminar({ mostrar: false, empleado: null, indice: null })}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de que deseas eliminar al empleado <strong>{confirmarEliminar.empleado.nombre}</strong>?</p>
              <p className="modal-warning">Esta acción no se puede deshacer.</p>
              <div className="modal-acciones">
                <button 
                  className="btn-cancelar"
                  onClick={() => setConfirmarEliminar({ mostrar: false, empleado: null, indice: null })}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-confirmar-eliminar"
                  onClick={eliminarRegistro}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de información del empleado */}
      {modalInfo.mostrar && modalInfo.empleado && (
        <div className="modal-overlay" onClick={() => setModalInfo({ mostrar: false, empleado: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Información Completa del Empleado</h3>
              <button 
                className="modal-cerrar"
                onClick={() => setModalInfo({ mostrar: false, empleado: null })}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="info-row">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{modalInfo.empleado.nombre}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Tipo de Documento:</span>
                <span className="info-value">{modalInfo.empleado.tipoDocumento || 'C.C'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Número de Documento:</span>
                <span className="info-value">{modalInfo.empleado.documento || '-'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Edad:</span>
                <span className="info-value">{modalInfo.empleado.edad} años</span>
              </div>
              <div className="info-row">
                <span className="info-label">País:</span>
                <span className="info-value">{modalInfo.empleado.pais}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Cargo:</span>
                <span className="info-value">{modalInfo.empleado.cargo}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Años de Experiencia:</span>
                <span className="info-value">{modalInfo.empleado.anios} años</span>
              </div>
              <div className="info-row">
                <span className="info-label">Celular:</span>
                <span className="info-value">{modalInfo.empleado.celular || '-'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Correo:</span>
                <span className="info-value">{modalInfo.empleado.correo || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pie de página */}
      <footer className="footer">
        <p>Desarrollado por <span className="footer-nombre">Jean Carlos Sandoval</span></p>
      </footer>
    </div>
  );
}

export default App; 

