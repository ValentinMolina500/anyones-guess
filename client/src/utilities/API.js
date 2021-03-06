class API {
  test = () => {
    return fetch("api/world", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bottom: "text" })
    })
  }
}

const instance = new API();
export default instance;