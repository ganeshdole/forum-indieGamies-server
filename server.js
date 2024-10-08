require('dotenv').config()
const express = require('express');



const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require("./db/db")
const routes = require('./routes');



const authMiddleware = require('./middleware/authMiddleware');



const app = express();



const PORT = process.env.SERVER_PORT || 4000;


app.use(express.json());
app.use(cors());

// app.use(cors({
//   origin: ['https://forum-indiegamies.netlify.app/','http://forum.indiegamies.com/'],
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
// }));

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50 * 15,
});

app.use(limiter);

app.use((req, res, next)=>{
  console.log(req.url,"\n *****************  ")
  next()
})

app.use(express.static('public'))

app.use(authMiddleware)
app.use('/api', routes);

connectDB()
  .then(()=>{
    app.listen(PORT,()=>{
      console.log(`Server started on ${PORT}`);
    })
  }
  ).catch((error) =>{
    console.log('Error connecting to database:', error)
  })
  
