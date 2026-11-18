import axios from 'axios'
import React, { useEffect, useState } from 'react'
export default function Users() {
  const [u, setU] = useState([])
  useEffect(() => { axios.get('http://localhost:4000/api/users').then(r => setU(r.data.data)) }, [])
  return <ul>{u.map(x => <li>{x.name}</li>)}</ul>
}
