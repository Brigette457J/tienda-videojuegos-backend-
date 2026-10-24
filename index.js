require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors()); // habilitar CORS

// Pool de conexión con soporte SSL para Aiven (Render)
const conexion = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }, // Obligatorio para Aiven
    waitForConnections: true,
    connectionLimit: 10
});

// ---------------- CRUD CLIENTES ----------------
app.get('/clientes', (req, res) => {
    conexion.query('SELECT * FROM clientes', (err, resultados) => {
        if (err) return res.status(500).send(err);
        res.json(resultados);
    });
});

app.post('/clientes', (req, res) => {
    const { nombre, correo } = req.body;
    conexion.query('INSERT INTO clientes (nombre, correo) VALUES (?, ?)',
        [nombre, correo], (err, result) => {
            if (err) return res.status(500).send(err);
            res.send({ message: `Cliente agregado: ${nombre}` });
        });
});

app.put('/clientes/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, correo } = req.body;
    conexion.query('UPDATE clientes SET nombre=?, correo=? WHERE id=?',
        [nombre, correo, id], (err, result) => {
            if (err) return res.status(500).send(err);
            res.send({ message: `Cliente con ID ${id} actualizado` });
        });
});

app.delete('/clientes/:id', (req, res) => {
    const id = req.params.id;
    conexion.query('DELETE FROM clientes WHERE id=?', [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: `Cliente con ID ${id} eliminado` });
    });
});

// ---------------- CRUD VIDEOJUEGOS ----------------
app.get('/videojuegos', (req, res) => {
    conexion.query('SELECT * FROM videojuegos', (err, resultados) => {
        if (err) return res.status(500).send(err);
        res.json(resultados);
    });
});

app.post('/videojuegos', (req, res) => {
    const { titulo, precio } = req.body;
    conexion.query('INSERT INTO videojuegos (titulo, precio) VALUES (?, ?)',
        [titulo, precio], (err, result) => {
            if (err) return res.status(500).send(err);
            res.send({ message: `Videojuego agregado: ${titulo}` });
        });
});

app.put('/videojuegos/:id', (req, res) => {
    const id = req.params.id;
    const { titulo, precio } = req.body;
    conexion.query('UPDATE videojuegos SET titulo=?, precio=? WHERE id=?',
        [titulo, precio, id], (err, result) => {
            if (err) return res.status(500).send(err);
            res.send({ message: `Videojuego con ID ${id} actualizado` });
        });
});

app.delete('/videojuegos/:id', (req, res) => {
    const id = req.params.id;
    conexion.query('DELETE FROM videojuegos WHERE id=?', [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: `Videojuego con ID ${id} eliminado` });
    });
});

// ---------------- CRUD COMPRAS (CON JOIN) ----------------
app.get('/compras', (req, res) => {
    const sql = `
    SELECT c.id, cl.nombre AS cliente, v.titulo AS videojuego,
    c.cantidad, c.fecha, v.precio, (c.cantidad * v.precio) AS total,
    c.cliente_id, c.videojuego_id
    FROM compras c
    INNER JOIN clientes cl ON c.cliente_id = cl.id
    INNER JOIN videojuegos v ON c.videojuego_id = v.id
    `;
    conexion.query(sql, (err, resultados) => {
        if (err) return res.status(500).send(err);
        res.json(resultados);
    });
});

app.post('/compras', (req, res) => {
    const { cliente_id, videojuego_id, cantidad, fecha } = req.body;
    conexion.query(
        'INSERT INTO compras (cliente_id, videojuego_id, cantidad, fecha) VALUES (?, ?, ?, ?)',
        [cliente_id, videojuego_id, cantidad, fecha],
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.send({ message: 'Compra registrada correctamente' });
        });
});

app.put('/compras/:id', (req, res) => {
    const id = req.params.id;
    const { cliente_id, videojuego_id, cantidad, fecha } = req.body;
    conexion.query(
        'UPDATE compras SET cliente_id=?, videojuego_id=?, cantidad=?, fecha=? WHERE id=?',
        [cliente_id, videojuego_id, cantidad, fecha, id],
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.send({ message: `Compra con ID ${id} actualizada` });
        });
});

app.delete('/compras/:id', (req, res) => {
    const id = req.params.id;
    conexion.query('DELETE FROM compras WHERE id=?', [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: `Compra con ID ${id} eliminada` });
    });
});

// ---------------- INICIO DEL SERVIDOR ----------------
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});