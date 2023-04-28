const express = require("express");
const { pool } = require("./data/data");
const app = express();
app.use(express.json());

app.listen(8080, () => {
    console.log("O servidor está ativo na porta 8080!")
});

app.get("/users", async (req, res) => {
    try {
        const client = await pool.connect();
        const { rows } = await client.query("SELECT * FROM Users");
        console.table(rows);
        res.status(200).send(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro de conexão com o servidor");
    }
});

app.post("/users", async (req, res) => {

    try {
        const { id, nome } = req.body
        const client = await pool.connect();

        if (!id || !nome) {
            return res.status(401).send("Id ou nome não informados.")
        }

        const user = await client.query(`SELECT FROM users where id=${id}`);
        if (user.rows.length === 0) {
            await client.query(`INSERT into users values (${id}, '${nome}')`)
            res.status(200).send({
                msg: "Sucesso em cadastrar usuario.",
                result: {
                    id,
                    nome
                }
            });
        } else {
            res.status(401).send("Usuario ja cadastrado.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro de conexão com o servidor");
    }
})

app.put("/users/:id", async (req, res) => {

    try {
        const { id } = req.params;
        const { nome } = req.body;

        const client = await pool.connect();
        if (!id || !nome) {
            return res.status(401).send("Id ou nome não informados.")
        }

        const user = await client.query(`SELECT FROM users where id=${id}`);
        if (user.rows.length > 0) {
            await client.query(`UPDATE users SET nome = '${nome}' WHERE id=${id}`);
            res.status(200).send({
                msg: "Usuario atualizado com sucesso.",
                result: {
                    id,
                    nome
                }
            });
        } else {
            res.status(401).send("Usuario não encontrado.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro de conexão com o servidor");
    }
})

app.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (id === undefined) {
            return res.status(401).send("Usuario não informado.")
        }

        const client = await pool.connect();
        const del = await client.query(`DELETE FROM users where id=${id}`)

        if (del.rowCount == 1) {
            return res.status(200).send("Usuario deletado com sucesso.");
        } else {
            return res.status(200).send("Usuario não encontrado.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro de conexão com o servidor");
    }
})