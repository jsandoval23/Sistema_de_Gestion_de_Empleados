const mysql = require('mysql2');
require ('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database:process.env.DB_NAME
});


connection.connect((err)=>{

   if(err){
      console.log('Error al conectar la base de datos',err);
   }
   console.log("Conexion Exitosa...")
});

module.exports =connection;