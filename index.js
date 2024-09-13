const express = require('express');
const app = express();
const pg = require('pg')
const PORT = "8080";
const client = new pg.Client(process.env.DATABASEURL||'postgres://postgres:postgres@localhost:5432/api_flavors')

app.use(express.json())
app.use(require('morgan')('dev'))

app.get('/api/flavors',async(req,res, next)=> {
    try{
        const SQL = `
        SELECT * FROM flavors ORDER BY created_at DESC;
        `
        const response = await client.query(SQL)
        res.send(response.rows)
    }catch(error){
        next(error)
    }
})
app.get('/api/flavors/:id',async(req,res, next)=> {
    try{
        const SQL = `
        SELECT *`
        const response = await client.query(SQL)
        res.send(response)
    }catch(error){}
})
app.post('/api/flavors',async(req,res, next)=> {
    try{
        const body = req.body
        const name = body.name
        const SQL = `
        INSERT INTO flavors(name)
        VALUES($1)
        RETURNING *;`
        const response = await client.query(SQL,[name])
        res.send(response.rows[0])
    }catch(error){
        next(error)
    }
})
app.put('/api/flavors/:id',async(req,res, next)=> {
    try{
        const id = Number(req.params.id)
        const body = req.body
        const name = body.name
        const favorite = Number(body.is_favorite)
        const SQL = `
        UPDATE flavors
        SET name=$1, is_favorite=$2, updated_at=now()
        WHERE id =$3 RETURNING *;`
        const response = await client.query(SQL,[name, is_favorite, id])
        res.send(response.rows)
    }catch(error){
        next(error)
    }
})

app.delete('/api/flavors/:id',async(req,res, next)=> {
    try{
        const id = req.params.id
        const SQL = `
        DELETE FROM flavors
        WHERE id = $1`
        const response = await client.query(SQL, [id])
        res.sendStatus(204)
    }catch(error){
        next(error)
    }
})

// app.listen(PORT, ()=>{
//     console.log(`server is runnning on port ${PORT}`)
// })

const init = async ()=> {
    await client.connect()
    console.log('success')
    const SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
    id SERIAL PRIMARY KEY,
    is_favorite BOOLEAN,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
    await client.query(SQL)
    console.log('successfully created table')
    const SQLTwo = `
    INSERT INTO flavors(name, is_favorite) VALUES('chocolate',true);
    INSERT INTO flavors(name, is_favorite) VALUES('vanilla',false);
    INSERT INTO flavors(name, is_favorite) VALUES('cherry',true);
    INSERT INTO flavors(name, is_favorite) VALUES('birthday cake',false)`
    await client.query(SQLTwo)
    console.log('successfully seeded db')
    app.listen(PORT,()=>{
        console.log('your server is running')
    })
}

init()