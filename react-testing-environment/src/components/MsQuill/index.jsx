
import React, {Component} from 'react'
import { default as MathQuill }  from 'mathquill';
import 'mathquill.css'

/**
 * Handles mathquill configuration in an indepotent manner. 
 * Allows mathquill configuration to be handled by React state. 
 * Currently, whenever a configuration change is detected or a re-render is caused,
 * the mathquill field will have it's contents extracted, unmounted, and recreated with 
 * the new configuration. 
 * 
 * This is for testing purposes only. I would not suggest incorporating this logic into
 * production.
 */
export default class MsQuill extends Component {
  container = React.createRef(); // reference to mathquill container 
  mathquillAPI = null;

  componentDidMount() {
    if (
      this.container &&
      this.container.current) {

      // setup MQ command 
      let MQ = MathQuill[this.props.editable === false ? 'StaticMath' : 'MathField']
      this.mathquillAPI = MQ(this.container.current, {
        commands: this.props.commands,
        autoCommands: this.props.autoCommands,
        autoCommandsMapping: this.props.autoCommandsMapping,
        // autoOperatorNames: this.props.autoOperatorNames,
        handlers: {
          edit: () => {
            if (this.props.onChange && this.mathquillAPI) {
              this.props.onChange({
                latex: this.mathquillAPI.latex()
              });
            }
          }
        },
        ...(this.props.extraConfig || {})
      });
      if(this.props.initialValue) this.mathquillAPI.__controller.writeLatex(this.props.initialValue)
      if(this.props.editable !== false) this.mathquillAPI.blur()
    }
  }

  
  render() {
    return <span ref={this.container}/>
  }
}

