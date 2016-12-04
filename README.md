# react-global-render-visualizer

Render visualizer for React. A visual way to see what is (re)rendering and why.

Typescript version with support for global React.Component patching ported from
<https://github.com/marcin-mazurek/react-render-visualizer-decorator>.

ES7 decorator version ported from <https://github.com/redsunsoft/react-render-visualizer>.

## Features

- Shows when component is being mounted or updated by highlighting (red for mount, yellow for update)
- Shows render count for each component instance
- Shows individual render log for each component instance

## Installation

```sh
npm install react-global-render-visualizer
```

## Usage

Import and apply to any React component you want to start monitoring:

```js
import React, { Component } from 'react';
import { visualizeRender } from 'react-global-render-visualizer';

@visualizeRender()
class TodoItem extends Component {
    render () {
        // ...
    }
}
```
Component will show up with a blue border box when being monitored.

You can also use it to patch all React components:

```js
import React from 'react';
import { visualizeRender } from 'react-global-render-visualizer';

React.Component = visualizeRender()(React.Component);
React.PureComponent = visualizeRender()(React.PureComponent);
```

You can specify a list of names to ignore (e.g. to ignore react-redux's Connect):

```js
import React from 'react';
import { visualizeRender } from 'react-global-render-visualizer';

React.Component = visualizeRender({ ignoreNames: ['Connect'] })(React.Component);
React.PureComponent = visualizeRender({ ignoreNames: ['Connect'] })(React.PureComponent);
```

Demo
----

http://bancek.github.io/react-global-render-visualizer/examples/global/

Similar libraries
-----------------

* [mobx-react-devtools](https://github.com/mobxjs/mobx-react-devtools)
* [react-render-visualizer-decorator](https://github.com/marcin-mazurek/react-render-visualizer-decorator)
* [react-render-visualizer](https://github.com/redsunsoft/react-render-visualizer)
