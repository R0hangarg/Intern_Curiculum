import express from 'express'
import pkg from 'pg'

const {Client} = pkg;

const app =express();
app.use(express.json()); // Parses application/json
app.use(express.urlencoded({ extended: true }));

const PORT = 6007;

const client = new Client({
    user:"postgres",
    host:"localhost",
    database:"tutorial",
    password:"1234",
    port:5432
})

 client.connect().then((res)=>{
    // console.log(res)
 }).catch(err=>console.log(err));

 //GET route to get user details by its id 

app.get('/user/:id', async (req, res) => {
    const userId = req.params.id;
  
    try {
      const result = await client.query('SELECT * FROM students WHERE id = $1', [userId]);
      res.json(result.rows);
    } catch (err) {
      console.error('Database query error', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  //POST route to add user
  app.post('/user', (req, res) => {
    const { firstname, lastname } = req.body;
  
  
    client.query('INSERT INTO students (firstname, lastname) VALUES ($1, $2)', [firstname, lastname], (error, results) => {
        if (error) {
            throw error
        }
        res.status(201).send("Student added");
    })
  });

  //UPDATE ROute to update user details 
  app.put('/user/:id', async (req, res) => {
    const userId = req.params.id;
    const { firstname, lastname } = req.body;

    // Validate input
    if (!firstname || !lastname) {
        return res.status(400).json({ error: 'Firstname and lastname are required' });
    }

    try {
        const result = await client.query(
            'UPDATE students SET firstname = $1, lastname = $2 WHERE id = $3',
            [firstname, lastname, userId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.send("Student updated");
    } catch (err) {
        console.error('Database update error', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

  //DELETE Route to remove user 
  app.delete('/user/:id', async (req, res) => {
    const uId = req.params.id;

    try {
        const result = await client.query('DELETE FROM students WHERE id = $1', [uId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.send("Student deleted");
    } catch (err) {
        console.error('Error while deleting user', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT,()=>{
    console.log("Server Running on Port ",PORT)
})