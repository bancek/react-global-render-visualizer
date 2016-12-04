import React from 'react';
import ReactDOM from 'react-dom';
import { visualizeRender } from 'react-global-render-visualizer';

class Example extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      counter: 0,
    };
  }

  onClick() {
    this.setState({
      counter: this.state.counter + 1,
    });
  }

  render() {
    let { counter } = this.state;

    return (
      <div onClick={this.onClick.bind(this)} style={{ padding: '15px' }}>
        <p>Counter: {counter}</p>
        <Child foo={42} />
        <PureChild foo={42} />
      </div>
    )
  }
}

Example = visualizeRender()(Example);

class Child extends React.Component {
  render() {
    let { foo } = this.props;

    return (
      <div style={{ padding: '15px' }}>Child {foo}</div>
    )
  }
}

Child = visualizeRender()(Child);

class PureChild extends React.PureComponent {
  render() {
    let { foo } = this.props;

    return (
      <div style={{ padding: '15px' }}>PureChild {foo}</div>
    )
  }
}

PureChild = visualizeRender()(PureChild);

ReactDOM.render(<Example />, document.getElementById('container'));
