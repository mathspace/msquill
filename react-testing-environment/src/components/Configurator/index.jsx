import React, {Component} from 'react';

const initialState = {
  name: '',
  match: [],
  commands: [],
  latex: '',
  htmlEntity: '',
  skip: false
};

export default class Configurator extends Component {
  state = initialState

  setField = (name) => ev =>{
    let val = ev.target.value;
    this.setState({
      [name]: val
    })
  }

  setArray = name => ev =>{
    let val = ev.target.value.split(',');
    this.setState({
      [name]: val
    })
  }

  save = () => {
    if (this.props.onAddCommand) this.props.onAddCommand(this.state);
    this.setState(initialState)
  }
  render() {
    return <div>
        <label>Name</label>
        <input value={this.state.name} onChange={this.setField("name")} />
        <label>Matches</label>
        <input value={this.state.match} onChange={this.setArray("match")} />
        <label>Commands</label>
        <input value={this.state.commands} onChange={this.setArray("commands")} />
        <label>latex</label>
        <input value={this.state.latex} onChange={this.setField("latex")} />
        <label>HtmlEntity</label>
        <input value={this.state.htmlEntity} onChange={this.setField("htmlEntity")} />
        <label>Skip</label>
        <input value={this.state.skip} type="checkbox" onChange={(ev) => this.setState({skip: ev.target.checked})} />
        <button onClick={this.save}> Add Configuration </button>
      </div>;
  }
}