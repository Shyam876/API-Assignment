const sequelize = require('sequelize')


const connection = new sequelize('shopping','root','Syam123$@' ,{
    dialect : 'mysql'
})

const addDataToWholeseller = (input) => {
    const sql = `
        INSERT INTO wholesellers (wid, wname, wnumber)
        VALUES ( ${input.wid}, '${input.wname}', '${input.wnumber}');
    `
    return connection.query(sql, {
        type: sequelize.QueryTypes.INSERT
    })
}

const addDataToRetailer = (input) => {
    const sql = `
        INSERT INTO retailers (rid, rname, rnumber)
        VALUES ( ${input.rid}, '${input.rname}', '${input.rnumber}');
    `
    return connection.query(sql, {
        type: sequelize.QueryTypes.INSERT
    })
}

const addDataToStock = (input) => {
    const sql = `
        INSERT INTO stocks (wid, rid, amount, date)
        VALUES ( ${input.wid}, ${input.rid}, ${(Math.random()*100000).toFixed(2)}, '${input.date}');
    `
    return connection.query(sql, {
        type: sequelize.QueryTypes.INSERT
    })
}

module.exports = {addDataToStock, addDataToWholeseller, addDataToRetailer}