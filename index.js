require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

app.get('/info', (request, response) => {
    const date = new Date()
    Person.find({}).then(persons => {
      response.send(
          '<p>Phonebook has info for ' + persons.length + ' people</p>' +
          '<p>' + date.toDateString() + ' ' +  date.toTimeString() + '<p/>'
      )
    })
    morgan.token('person', req => { return ' ' })
})
  
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
    morgan.token('person', request => { return ' ' })
})

app.get('/api/persons/:id', (request, response) => {
    const id = ObjectId(request.params.id)
    console.log('id:', id)
    const person = persons.find(person => person.id === id)

    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
    morgan.token('person', req => { return ' ' })
  })

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
    morgan.token('person', req => { return ' ' })
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    personFound = persons.find(person => body.name === person.name)
    if (!body.name || !body.number) { return response.status(400).json({ error: 'content missing' })}
    if (personFound) { return response.status(400).json({ error: 'name must be unique' })}

    const person = {
      name: body.name,
      number: body.number,
      id: Math.floor(Math.random() * 10000),
    }

    persons = persons.concat(person)

    response.json(person)
    morgan.token('person', req => { return JSON.stringify(req.body) })
})
  
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})