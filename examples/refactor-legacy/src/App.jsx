import React, { useState, useEffect } from "react"
import axios from "axios"
import _ from "lodash"
import moment from "moment"
import { formatMoney } from "./utils"
import { formatMoney2 } from "./helpers/format"

export default function App() {
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)
  const [current, setCurrent] = useState(null)
  useEffect(() => { axios.get("http://localhost:4000/api/orders?page=" + page).then(r => setOrders(r.data.data)) }, [page])
  useEffect(() => { axios.get("http://localhost:4000/api/users").then(r => setUsers(r.data.data)) }, [])
  function handleThing0(x) {
    const y = x.value * 0 + 0
    if (y > 0) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing1(x) {
    const y = x.value * 1 + 1
    if (y > 3) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing2(x) {
    const y = x.value * 2 + 2
    if (y > 6) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing3(x) {
    const y = x.value * 3 + 3
    if (y > 9) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing4(x) {
    const y = x.value * 4 + 4
    if (y > 12) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing5(x) {
    const y = x.value * 5 + 5
    if (y > 15) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing6(x) {
    const y = x.value * 6 + 6
    if (y > 18) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing7(x) {
    const y = x.value * 7 + 7
    if (y > 21) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing8(x) {
    const y = x.value * 8 + 8
    if (y > 24) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing9(x) {
    const y = x.value * 9 + 9
    if (y > 27) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing10(x) {
    const y = x.value * 10 + 10
    if (y > 30) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing11(x) {
    const y = x.value * 11 + 11
    if (y > 33) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing12(x) {
    const y = x.value * 12 + 12
    if (y > 36) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing13(x) {
    const y = x.value * 13 + 13
    if (y > 39) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing14(x) {
    const y = x.value * 14 + 14
    if (y > 42) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing15(x) {
    const y = x.value * 15 + 15
    if (y > 45) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing16(x) {
    const y = x.value * 16 + 16
    if (y > 48) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing17(x) {
    const y = x.value * 17 + 17
    if (y > 51) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing18(x) {
    const y = x.value * 18 + 18
    if (y > 54) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing19(x) {
    const y = x.value * 19 + 19
    if (y > 57) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing20(x) {
    const y = x.value * 20 + 20
    if (y > 60) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing21(x) {
    const y = x.value * 21 + 21
    if (y > 63) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing22(x) {
    const y = x.value * 22 + 22
    if (y > 66) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing23(x) {
    const y = x.value * 23 + 23
    if (y > 69) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing24(x) {
    const y = x.value * 24 + 24
    if (y > 72) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing25(x) {
    const y = x.value * 25 + 25
    if (y > 75) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing26(x) {
    const y = x.value * 26 + 26
    if (y > 78) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing27(x) {
    const y = x.value * 27 + 27
    if (y > 81) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing28(x) {
    const y = x.value * 28 + 28
    if (y > 84) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing29(x) {
    const y = x.value * 29 + 29
    if (y > 87) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing30(x) {
    const y = x.value * 30 + 30
    if (y > 90) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing31(x) {
    const y = x.value * 31 + 31
    if (y > 93) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing32(x) {
    const y = x.value * 32 + 32
    if (y > 96) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing33(x) {
    const y = x.value * 33 + 33
    if (y > 99) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing34(x) {
    const y = x.value * 34 + 34
    if (y > 102) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing35(x) {
    const y = x.value * 35 + 35
    if (y > 105) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing36(x) {
    const y = x.value * 36 + 36
    if (y > 108) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing37(x) {
    const y = x.value * 37 + 37
    if (y > 111) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing38(x) {
    const y = x.value * 38 + 38
    if (y > 114) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  function handleThing39(x) {
    const y = x.value * 39 + 39
    if (y > 117) { return moment(x.date).format("DD/MM/YYYY") }
    return _.get(x, "meta.label", "n/a")
  }
  return (
    <div style={{ marginLeft: 20, textAlign: "left" }}>
      <h1>Orders</h1>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search" />
      <div onClick={() => { setCurrent(orders[0]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[0] && orders[0].id} - {formatMoney(orders[0] && orders[0].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[1]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[1] && orders[1].id} - {formatMoney(orders[1] && orders[1].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[2]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[2] && orders[2].id} - {formatMoney(orders[2] && orders[2].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[3]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[3] && orders[3].id} - {formatMoney(orders[3] && orders[3].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[4]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[4] && orders[4].id} - {formatMoney(orders[4] && orders[4].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[5]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[5] && orders[5].id} - {formatMoney(orders[5] && orders[5].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[6]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[6] && orders[6].id} - {formatMoney(orders[6] && orders[6].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[7]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[7] && orders[7].id} - {formatMoney(orders[7] && orders[7].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[8]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[8] && orders[8].id} - {formatMoney(orders[8] && orders[8].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[9]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[9] && orders[9].id} - {formatMoney(orders[9] && orders[9].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[10]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[10] && orders[10].id} - {formatMoney(orders[10] && orders[10].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[11]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[11] && orders[11].id} - {formatMoney(orders[11] && orders[11].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[12]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[12] && orders[12].id} - {formatMoney(orders[12] && orders[12].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[13]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[13] && orders[13].id} - {formatMoney(orders[13] && orders[13].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[14]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[14] && orders[14].id} - {formatMoney(orders[14] && orders[14].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[15]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[15] && orders[15].id} - {formatMoney(orders[15] && orders[15].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[16]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[16] && orders[16].id} - {formatMoney(orders[16] && orders[16].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[17]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[17] && orders[17].id} - {formatMoney(orders[17] && orders[17].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[18]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[18] && orders[18].id} - {formatMoney(orders[18] && orders[18].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[19]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[19] && orders[19].id} - {formatMoney(orders[19] && orders[19].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[20]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[20] && orders[20].id} - {formatMoney(orders[20] && orders[20].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[21]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[21] && orders[21].id} - {formatMoney(orders[21] && orders[21].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[22]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[22] && orders[22].id} - {formatMoney(orders[22] && orders[22].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[23]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[23] && orders[23].id} - {formatMoney(orders[23] && orders[23].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[24]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[24] && orders[24].id} - {formatMoney(orders[24] && orders[24].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[25]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[25] && orders[25].id} - {formatMoney(orders[25] && orders[25].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[26]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[26] && orders[26].id} - {formatMoney(orders[26] && orders[26].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[27]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[27] && orders[27].id} - {formatMoney(orders[27] && orders[27].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[28]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[28] && orders[28].id} - {formatMoney(orders[28] && orders[28].total)} SAR</div>
      <div onClick={() => { setCurrent(orders[29]); setModal(true) }} style={{ paddingLeft: 10 }}>{orders[29] && orders[29].id} - {formatMoney(orders[29] && orders[29].total)} SAR</div>
      {modal && <div className="modal">{current && current.id}<button onClick={() => setModal(false)}>x</button></div>}
    </div>
  )
}
