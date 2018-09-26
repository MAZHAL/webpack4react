import React, { Component } from 'react'
import { render } from 'react-dom'

class App extends Component{
    constructor (){
        super();
        this.state = {
            name:'张三'
        }
    }

    handleState(name) {
      this.setState({
          name:name
      })
    }

    render() {
        return (
            <div onClick={this.handleState.bind(this, '历史')}>{this.state.name}</div>
        )
    }

}

render(
    <App/>,
    document.getElementById('app')
);