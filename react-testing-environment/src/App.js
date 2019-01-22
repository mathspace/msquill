import React, { Component } from "react";
import MsQuill from "./components/MsQuill";
import Configurator from "./components/Configurator";
import "./App.css";

class App extends Component {
  state = {
    latex: "y=\\frac{1}{2}x^2-2x\\left(\\frac{a}{b\\times c}\\right)=\\sqrt[n]{\\frac{a+b}{c}}",
    overrideLatexPaste: false,
    commands: []
  };

  render() {
    return (
      <div className="container" >
        <h3> Mathquill configuration demo </h3>
        <p>
          <span>Editable Text Field: </span>
          <span>
            <MsQuill
              initialValue={this.state.latex}
              onChange={({ latex }) =>
                this.setState({
                  latex
                })
              }
              commands={this.state.commands}
            />
          </span>
        </p>
        <p>
          <span>Latex Output: </span>
          <pre>{this.state.latex}</pre>
        </p>

        <p>
          <span>As static Math </span>
          <span>
            <MsQuill
              key={this.state.latex}
              initialValue={this.state.latex}
              editable={false}
              onChange={({ latex }) =>
                this.setState({
                  latex
                })
              }
              commands={this.state.commands}
            />
          </span>
        </p>

        <p>
          <span>Editable: </span>
          <span>
            <MsQuill
              key={"\\editable{}+10"}
              initialValue={"\\editable{}+10"}
              editable={false}
            />
          </span>
        </p>
      </div>
    );
  }
}

export default App;

// <div className="container">

//   <hr />
//   <Configurator onAddCommand={command => this.setState(state => ({
//     commands: state.commands.concat([command])
//   }))} commands={this.state.commands} />
//   <hr />
//   <h4>Command List</h4>
//   {this.state.commands.map(command => <div key={command.name}>
//     <p>name: {command.name}</p>
//     <p>matches: {command.matches}</p>
//     <p>skip: {JSON.stringify(command.skip)}</p>
//     <hr />
//   </div>)}
// </div>;
