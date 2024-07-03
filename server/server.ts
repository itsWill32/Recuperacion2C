import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

type Message = {
    recipient: 'docente' | 'alumno',
    content: string
};

let docenteMessages: Message[] = [];
let alumnoMessages: Message[] = [];
let clients: any[] = [];

app.post('/send', (req, res) => {
    const message: Message = req.body;
    if (message.recipient === 'docente') {
        docenteMessages.push(message);
    } else {
        alumnoMessages.push(message);
    }
    
    clients.forEach(client => {
        if (message.recipient === 'docente') {
            client.res.write(`event: docente\ndata: ${JSON.stringify(docenteMessages)}\n\n`);
        } else {
            client.res.write(`event: alumno\ndata: ${JSON.stringify(alumnoMessages)}\n\n`);
        }
    });
    
    res.status(200).send({ message: 'Message received' });
});

app.get('/messege', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write(`event: docente\ndata: ${JSON.stringify(docenteMessages)}\n\n`);
    res.write(`event: alumno\ndata: ${JSON.stringify(alumnoMessages)}\n\n`);
    
    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res
    };
    clients.push(newClient);

    req.on('close', () => {
        clients = clients.filter(client => client.id !== clientId);
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
