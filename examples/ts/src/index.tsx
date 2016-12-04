import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { visualizeRender } from '../../../lib/main';

interface ExampleProps {

}

interface ExampleState {
  counter: number;
}

@visualizeRender()
class Example extends React.Component<ExampleProps, ExampleState> {
  constructor(props: any) {
    super(props);

    this.state = {
      counter: 0,
    };
  }

  onClick = () => {
    this.setState({
      counter: this.state.counter + 1,
    });
  }

  render() {
    let { counter } = this.state;

    return (
      <div onClick={this.onClick} style={{ padding: '15px' }}>
        <p>Counter: {counter}</p>
        <Child foo={42} />
        <PureChild foo={42} />
      </div>
    )
  }
}

interface ChildProps {
  foo: number;
}

@visualizeRender()
class Child extends React.Component<ChildProps, {}> {
  render() {
    let { foo } = this.props;

    return (
      <div style={{ padding: '15px' }}>Child {foo}</div>
    )
  }
}

interface PureChildProps {
  foo: number;
}

@visualizeRender()
class PureChild extends React.PureComponent<PureChildProps, {}> {
  render() {
    let { foo } = this.props;

    return (
      <div style={{ padding: '15px' }}>PureChild {foo}</div>
    )
  }
}

ReactDOM.render(<Example />, document.getElementById('container'));
