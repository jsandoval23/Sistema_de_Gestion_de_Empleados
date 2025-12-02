const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

//get obtener - post crear - put actualizar - delete eliminar

app.get('/empleados', (req, res) => {
    const sql = 'SELECT * FROM empleados';

    db.query(sql, (err, results) => {
        if (err) {
            return res
                .status(500)
                .json({ error: 'error al obtener los empleados..' });
        }

        return res.json(results);
    });
});


app.post('/empleados', (req, res) => {
    const { nombre, edad, pais, cargo, anios, celular, correo, documento, tipoDocumento } = req.body;

    // Validar que el documento no esté vacío
    if (!documento || !documento.trim()) {
        return res
            .status(400)
            .json({ error: 'El documento es requerido' });
    }

    const documentoTrim = documento.trim();

    // Primero verificar si el documento ya existe (comparación exacta y sin espacios)
    const checkSql = 'SELECT id, nombre FROM empleados WHERE TRIM(documento) = ?';
    
    db.query(checkSql, [documentoTrim], (err, results) => {
        if (err) {
            console.error('Error al verificar documento:', err);
            return res
                .status(500)
                .json({ error: 'error al verificar el documento' });
        }

        if (results.length > 0) {
            return res
                .status(400)
                .json({ error: 'Este documento ya está registrado. El empleado ya existe en el sistema.' });
        }

        // Si no existe, insertar el nuevo empleado
        const sql = 'INSERT INTO empleados (nombre, edad, pais, cargo, anios, celular, correo, documento, tipoDocumento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

        db.query(sql, [nombre, edad, pais, cargo, anios, celular, correo, documentoTrim, tipoDocumento], (err, results) => {
            if (err) {
                // Verificar si el error es por documento duplicado (código 1062 en MySQL)
                if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
                    return res
                        .status(400)
                        .json({ error: 'Este documento ya está registrado. El empleado ya existe en el sistema.' });
                }
                console.error('Error al guardar empleado:', err);
                return res
                    .status(500)
                    .json({ error: 'error al guardar los datos del empleado' });
            }

            return res.json({
                message: 'empleado guardado correctamente',
                id: results.insertId,
                nombre,
                edad,
                pais,
                cargo,
                anios,
                celular,
                correo,
                documento: documentoTrim,
                tipoDocumento
            });
        });
    });
});

app.put('/empleados/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, edad, pais, cargo, anios, celular, correo, documento, tipoDocumento } = req.body;

    // Validar que el documento no esté vacío
    if (!documento || !documento.trim()) {
        return res
            .status(400)
            .json({ error: 'El documento es requerido' });
    }

    const documentoTrim = documento.trim();

    // Verificar si el documento ya existe en otro empleado (comparación exacta y sin espacios)
    const checkSql = 'SELECT id, nombre FROM empleados WHERE TRIM(documento) = ? AND id != ?';
    
    db.query(checkSql, [documentoTrim, id], (err, results) => {
        if (err) {
            console.error('Error al verificar documento:', err);
            return res
                .status(500)
                .json({ error: 'error al verificar el documento' });
        }

        if (results.length > 0) {
            return res
                .status(400)
                .json({ error: 'Este documento ya está registrado en otro empleado. El empleado ya existe en el sistema.' });
        }

        // Si no existe duplicado, actualizar el empleado
        const sql = 'UPDATE empleados SET nombre= ?, edad= ?, pais= ?, cargo= ?, anios= ?, celular= ?, correo= ?, documento= ?, tipoDocumento= ? WHERE id= ?';

        db.query(sql, [nombre, edad, pais, cargo, anios, celular, correo, documentoTrim, tipoDocumento, id], (err) => {
            if (err) {
                // Verificar si el error es por documento duplicado (código 1062 en MySQL)
                if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
                    return res
                        .status(400)
                        .json({ error: 'Este documento ya está registrado en otro empleado. El empleado ya existe en el sistema.' });
                }
                console.error('Error al actualizar empleado:', err);
                return res
                    .status(500)
                    .json({ error: 'error al actualizar el empleado' });
            }

            return res.json({
                message: 'empleado actualizado correctamente',
            });
        });
    });
});

app.delete('/empleados/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM empleados WHERE id = ?';

    db.query(sql, [id], (err) => {
        if (err) {
            return res
                .status(500)
                .json({ error: 'error al eliminar el empleado' });
        }

        return res.json({
            message: 'empleado eliminado correctamente'
        });
    });
});

app.listen(3001, () => {
    console.log('servidor del backend corriendo en el puerto 3001');
});



