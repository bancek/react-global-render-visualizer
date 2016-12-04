import React from 'react';
import ReactDOM from 'react-dom';
import { visualizeRender } from 'react-global-render-visualizer';

React.Component = visualizeRender({ ignoreNames: ['Connect'] })(React.Component);
React.PureComponent = visualizeRender({ ignoreNames: ['Connect'] })(React.PureComponent);

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
        <Connect><PureChild foo={42} /></Connect>
        <div style={{position: 'relative'}}>
          <div style={{position: 'absolute', left: '0px', top: '0px'}}><Child foo={100} /></div>
          <div style={{position: 'absolute', left: '0px', top: '0px'}}><PureChild foo={1001} /></div>
        </div>
      </div>
    )
  }
}

class Child extends React.Component {
  render() {
    let { foo } = this.props;

    return (
      <div style={{ padding: '15px' }}>Child {foo}</div>
    )
  }
}

class PureChild extends React.PureComponent {
  render() {
    let { foo } = this.props;

    return (
      <div style={{ padding: '15px' }}>PureChild {foo}</div>
    )
  }
}

class Connect extends React.Component {
  render() {
    return React.Children.only(this.props.children);
  }
}

ReactDOM.render(<Example />, document.getElementById('container'));
