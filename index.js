/*

    * ThisFile contains only the create table and query methods 
    * the data to be insert and methods to insert data 
      into DB kept in Seperate file to avoid ambiguity and make code more readabe

*/


const express = require('express')
const sequelize = require('sequelize')
const cors = require('cors')

const app = express();
const port = 8000;

app.use(cors());

//data to be inserted into database
const {wholesellerData, retailerData, stockData} = require('./data.js')

//methods to insert data called after tables are created
const {addDataToStock, addDataToWholeseller, addDataToRetailer} = require('./addDataQueries.js')

//Connecting to local Shopping Database
const connection = new sequelize(<Your DB Name>,'root',<Your Password> ,{
    dialect : 'mysql',
    define: {
      timestamps: false //Have disabled timestamps default for all future tables
    }
})

//Table Wholeseller
const wholesellers = connection.define('wholesellers', {
    wid : {
        type : sequelize.UUID,
        primaryKey : true,
    },
    wname : {
        type : sequelize.STRING(25),
        notNull: true
    },
    wnumber : {
        type : sequelize.STRING(15),
        notNull: true
    }
});

//table Retailer
const retailers = connection.define('retailers', {
    rid : {
        type : sequelize.UUID,
        primaryKey : true,
    },
    rname : {
        type : sequelize.STRING(25),
        notNull: true
    },
    rnumber : {
        type : sequelize.STRING(15),
        notNull: true
    }
});

//defining Relationship : Many to Many
wholesellers.belongsToMany(retailers, {through : 'stocks'});
retailers.belongsToMany(wholesellers, {through : 'stocks'});

//table Stocks 
const stocks = connection.define('stocks', {
    wid : {
        type : sequelize.UUID,
        references : {
            model : 'wholesellers',
            key : 'wid'
        }
    },
    rid : {
        type : sequelize.UUID,
        references : {
            model : 'retailers',
            key : 'rid'
        }
    },
    amount : sequelize.FLOAT,
    date : sequelize.DATEONLY
});


//creating connection, creating tables, inserting data into tables
connection
    .sync({
        loggin: console.log,
        force : true
    })
    .then(()=>{
        console.log('Connect established successfully');

        for(key in wholesellerData)
            addDataToWholeseller(wholesellerData[key]);
        for(key in retailerData)
            addDataToRetailer(retailerData[key]);
        for(key in stockData)
            addDataToStock(stockData[key]);

        app.listen( port, () => {
            console.log("Listening on port :", port)
        })
    })
    .catch(err =>{
        console.error('unable toconnect to the database', err);
    })

app.get('', (req, res) => {
    res.send("<h1>Home Page</h1>")
})

// Query 1 : wholesaler along with a list of retailers associated.
app.get('/query1', (req,res) => {

    connection.query("SELECT w.wid, w.wname, r.rid, r.rname FROM wholesellers w INNER JOIN stocks s ON s.wid=w.wid INNER JOIN retailers r ON s.rid=r.rid group by s.wid,s.rid").then( (result) => {
        console.log(result[0])
        res.send(result[0])
    })
});

//Query 2 : Get a retailer who has single wholesaler
app.get('/query2', (req,res) => {
    connection.query("SELECT r.rid, r.rname, r.rnumber FROM retailers r INNER JOIN stocks s ON r.rid=s.rid GROUP BY(r.rid) HAVING count(s.wid)=1").then( (result) => {
        res.send(result[0])
    })
});

//Query 3 : Total monthly turnover of each wholesaler for a complete year
app.get('/query3', (req,res) => {
    connection.query("SELECT w.wid, w.wname, MONTH(s.date) as MONTH, round(sum(s.amount),2) as TOTAL FROM wholesellers w INNER JOIN stocks s ON w.wid=s.wid GROUP BY s.wid, MONTH(s.date)").then( (result) => {
        res.send(result[0])
    })
})

//Got a bit confused with what exactly was the requirement, so thought would split into both possibilities I thought was asked.
//Query 4 : Max turnover of each wholesaler from a single retailer
app.get('/query4', (req,res) => {
    connection.query("select w.wid, w.wname, s.rid, max(s.amount) as 'MAX TURNOVER' FROM wholesellers w INNER JOIN stocks s ON s.wid=w.wid GROUP BY s.wid, s.rid").then( (result) => {
        console.log(result[0])
        res.send(result[0])
    })
})

//Query 5 : Max turnover of each wholesaler from a single retailer
app.get('/query5', (req,res) => {
    connection.query("select s.wid, max(s.amount) 'MAX TURNOVER' from stocks s group by s.wid").then( (result) => {
        console.log(result[0])
        res.send(result[0])
    })
})
