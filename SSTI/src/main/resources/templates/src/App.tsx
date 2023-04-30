import { Component, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Controler } from './services/controler';
import { LoginFaceReq, LoginFaceRes, Response } from './faces';

class App extends Component {
  private controller: Controler
  constructor(props) {
    super(props)
    this.state = {
      method: "POST",
      url: "",
      base: "",
      body: {},
      response: {}
    }
    this.api = this.api.bind(this)
    this.controller = new Controler()
  }

  async api() {
    if (!Controler.islogged()) {
      const body: LoginFaceReq = { username: "test", password: "test", rik: Controler.getShareSecretKey() }
      const data = await Controler.rawRequest<LoginFaceReq, Response<LoginFaceRes>>(`${this.state["base"]}/api/sso/login`, body, this.state["method"])
      // console.log("🚀 ~ file: login.controler.tsx ~ line 10 ~ Auth ~ login ~ data", data)
      if (data !== null) {
        Controler.setToken(data.body.token)
        Controler.setServerKey(data.body.rik)
      }
    }
    if (Controler.islogged()) {
      const data = await Controler.secureRequest<Record<string, any>, Response<Record<string, any>>>(`${this.state["base"]}${this.state["url"]}`, this.state["body"] as Record<string, any>, "POST")
      this.setState({ response: data })
    }
  }



  render() {
    return (
      <div className="App">
        <header className="App-header">
          <table>
            <tr>
              <td>Base Url</td>
              <td><input type="text" onInput={(e) => this.setState({ base: (e.target as HTMLTextAreaElement).value })} /></td>
            </tr>
            <tr>
              <td>path</td>
              <td><input type="text" onInput={(e) => this.setState({ url: (e.target as HTMLTextAreaElement).value })} /></td>
            </tr>
            <tr>
              <td>method</td>
              <td>
                <select onChange={(e) => this.setState({ method: e.target.value })} >
                  <option value={"POST"}>POST</option>
                  <option value={"GET"}>GET</option>
                  <option value={"PUT"}>PUT</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>body(json)</td>
              <td>
                <textarea cols={70} rows={15} onInput={
                  (e) => {
                    try {
                      this.setState({
                        body: JSON.parse((e.target as HTMLTextAreaElement).value)
                      })
                    } catch (e) { }
                  }
                }></textarea>
              </td>
            </tr>
            <tr>
              <td colSpan={2}><button onClick={this.api}>Call Api</button></td>
            </tr>
            <tr>
              <td colSpan={2}>
                <div style={{
                  marginTop: "5rem",
                  width: "51rem",
                  height: "22rem",
                  background: "#fff",
                  color: "#000",
                  whiteSpace: 'break-spaces',
                  padding: "1rem",
                  textAlign: "left",
                  direction: "ltr",
                  fontSize: "14px"
                }}>{JSON.stringify(this.state["response"], null, 4)}</div>
              </td>
            </tr>
          </table>

        </header>
      </div >
    );
  }
}

export default App;
