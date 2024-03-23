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
    //console.log("get /info")
    const date = new Date()
    Person.find({}).then(persons => {
      response.send(
          '<p>Phonebook has info for ' + persons.length + ' people</p>' +
          '<p>' + date.toDateString() + ' ' +  date.toTimeString() + '<p/>'
      )
    })
    morgan.token('person', request => { return ' ' })
})
  
app.get('/api/persons', (request, response) => {
    //console.log("get /api/persons")
    Person.find({}).then(persons => {
      response.json(persons)
    })
    morgan.token('person', request => { return ' ' })
})

app.get('/api/persons/:id', (request, response) => {
    //console.log("get /api/persons/:id")
    const id = ObjectId(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
    morgan.token('person', request => { return ' ' })
  })

app.delete('/api/persons/:id', (request, response, next) => {
    //console.log("delete /api/persons/:id")
    Person.findByIdAndDelete(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
    morgan.token('person', request => { return ' ' })
})

app.post('/api/persons', (request, response) => {
    //console.log("post /api/persons")
    const body = request.body
    let savedPersonMorgan = null

    //personFound = persons.find(person => body.name === person.name)
    //if (!body.name || !body.number) { return response.status(400).json({ error: 'content missing' })}
    //if (personFound) { return response.status(400).json({ error: 'name must be unique' })}

    if (body.name === undefined) {
      return response.status(400).json({ error: 'content missing' })
    }

    const person = new Person ({
      name: body.name,
      number: body.number,
    })

    person.save().then(savedPerson => {
      response.json(savedPerson)
      savedPersonMorgan = savedPerson
    })
    morgan.token('person', request => { return JSON.stringify(savedPersonMorgan) })
})
  
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})