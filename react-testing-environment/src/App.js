import React, { Component } from 'react';
import MsQuill from './components/MsQuill';
import Configurator from './components/Configurator';
import {Grid, Paper} from '@material-ui/core'
import './App.css';

class App extends Component {

  state = {
    latex: '',
    pasteLatex: false,
    commands: []
  }


  render() {
    return (
      <Grid
        container 
        direction="row"
        justify="center"
      >
        <Grid direction="column">
          <Paper style={{padding: '20px'}}>
            <h3> Mathquill configuration demo </h3>
            <MsQuill onChange={({ latex }) => this.setState({
              latex
            })} commands={this.state.commands} />
            <div>
              <p>Latex Output: </p>
              <pre>{this.state.latex}</pre>
            </div>
          </Paper>
        </Grid>

      </Grid>
    )
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