class API {
  // test = () => {
  //   return fetch("api/world", {
  //     method: "POST",
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({ bottom: "text" })
  //   })
  // }

  addPlayer = async (username) => {
    const result = await fetch("api/world", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    })

    return await result.text();
  }
}

const instance = new API();
export default instance;