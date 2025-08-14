import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors()); 

const SIMS_API_BASE = 'https://apiv2.simsroblox.com/api/v1/studentview';
const SIMS_API_KEY = '22c75aa9-99db-40a2-8745-18a74f9b559b';

app.post('/getStudentData', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Missing username' });

    const robloxRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username] })
    });

    if (!robloxRes.ok) return res.status(robloxRes.status).send('Roblox API error');

    const robloxData = await robloxRes.json();
    if (!robloxData.data || robloxData.data.length === 0) {
      return res.status(404).json({ error: 'Roblox username not found' });
    }

    const studentId = robloxData.data[0].id;

    const simsRes = await fetch(SIMS_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SIMS_API_KEY}`
      },
      body: JSON.stringify({ StudentID: studentId })
    });

    if (!simsRes.ok) {
      const text = await simsRes.text();
      return res.status(simsRes.status).send(text);
    }

    const simsData = await simsRes.json();
    res.json(simsData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
