const express = require('express')
const app = express()
require('dotenv').config()

const Person = require('./models/person')

app.use(express.static('dist'))

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

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  
  next(error)
}

const cors = require('cors')
app.use(cors())
app.use(express.json())
var morgan = require('morgan')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

app.get('/info', (request, response) => {
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
    Person.find({}).then(persons => {
      response.json(persons)
    })
    morgan.token('person', request => { return ' ' })
})

app.get('/api/persons/:id', (request, response) => {
    const id = ObjectId(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
    morgan.token('person', request => { return ' ' })
  })

app.post('/api/persons', (request, response) => {
    const body = request.body
    let savedPersonMorgan = null

    if (!body.name || !body.number) { return response.status(400).json({ error: 'content missing' })}

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

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
    morgan.token('person', request => { return ' ' })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    let updatedPersonMorgan = null

    const person = {
      name: body.name,
      number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        response.json(updatedPerson)
        updatedPersonMorgan = updatedPerson
      })
      .catch(error => next(error))
    morgan.token('person', request => { return JSON.stringify(updatedPersonMorgan) })
})

app.use(unknownEndpoint)
app.use(errorHandler)
  
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})