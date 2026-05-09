const body = {
  name: `Test Client ${Math.random().toString(36).substring(7)}`,
  domain: `testclient-${Math.random().toString(36).substring(7)}.example`,
  businessType: "medical",
  plan: "growth",
  monthlyFee: 399
};

fetch("http://localhost:3000/api/admin/clients", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
})
  .then(res => res.json().then(data => ({ status: res.status, data })))
  .then(({ status, data }) => {
    console.log("Status:", status);
    console.log("Response:", JSON.stringify(data, null, 2));
  })
  .catch(err => console.error("Error:", err.message));
