const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/interview/start', {
      type: "Technical",
      domain: "Software Engineering"
    }, {
      headers: {
        // Provide a valid fake JWT or no JWT just to see if it reaches the controller.
        // Wait, authMiddleware will block it if we don't have a valid token!
      }
    });
    console.log(res.data);
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
