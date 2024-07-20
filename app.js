const express = require('express')
const {open} = require('sqlite')

const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()

app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDbAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
// bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb

app.get('/players/', async (request, response) => {
  const getCricketQuery = `select * from cricket_team;`
  const cricketArray = await db.all(getCricketQuery)
  response.send(
    cricketArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})
// mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addPlayerQuery = `insert into cricket_team(player_name, jersey_number, role)
            values ('${playerName}',${jerseyNumber}, '${role}');`
  const player = await db.run(addPlayerQuery)
  response.send(`Player Added to Team`)
})
//jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
app.get('/players/:playerId/', async (Request, Response) => {
  const {playerId} = Request.params
  const getPlayerQuery = `select * from cricket_team where player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  Response.send(convertDbObjectToResponseObject(player))
})

// mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm

app.put('/players/:playerId/', async (Request, Response) => {
  const {playerId} = Request.params
  const playerdetails = Request.body
  const {playerName, jerseyNumber, role} = playerdetails
  const updatePlayerQuery = `
            update cricket_team set player_name = '${playerName}', 
            jersey_number = '${jerseyNumber}',
            role = '${role}'
            where
            player_id = ${playerId};`
  await db.run(updatePlayerQuery)

  Response.send('Player Details Updated')
})

//delete a player from the team (database) based on the player ID..........

app.delete('/players/:playerId/', async (Request, Response) => {
  const {playerId} = Request.params
  const deletePLayerQuery = `
                DELETE FROM cricket_team WHERE
                player_id=${playerId};`
  await db.run(deletePLayerQuery)
  Response.send('Player Removed')
})

module.exports = app
