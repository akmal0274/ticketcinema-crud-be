const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Secret key for JWT
const secretKey = process.env.SECRET_KEY;

// Middleware for token verification
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token not found' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Create a cinema ticket
app.post('/tickets', verifyToken, async (req, res) => {
  try {
    const { title, genre, description, price } = req.body;
    const userId = req.userId;

    // Create the ticket in the database
    const newTicket = await prisma.ticket.create({
      data: {
        title,
        genre,
        description,
        price,
        user: { connect: { id: userId } }
      }
    });

    res.json(newTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all cinema tickets
app.get('/tickets', async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany();
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific cinema ticket by ID
app.get('/tickets/:id', async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);

    // Find the ticket in the database
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a cinema ticket
app.put('/tickets/:id', verifyToken, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { title, genre, description, price } = req.body;

    // Update the ticket in the database
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { title, genre, description, price }
    });

    res.json(updatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a cinema ticket
app.delete('/tickets/:id', verifyToken, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);

    // Delete the ticket from the database
    await prisma.ticket.delete({ where: { id: ticketId } });

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
// ... (previously implemented code)

// Protected route
// ... (previously implemented code)

// Start the server
app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});
