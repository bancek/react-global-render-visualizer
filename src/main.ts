import * as React from 'react';

declare let require: (id: string) => any;

export const STATE_CHANGES = {
  MOUNT: 'mount',
  UPDATE: 'update'
};

export interface RenderVisualizerOptions {
  logInstance: boolean;
  ReactDOM: {
    findDOMNode(instance: any): HTMLElement
  },
  ignoreNames: string[];
}

export class RenderVisualizer {
  options: RenderVisualizerOptions;

  instance: any;
  name: string;
  originalComponentDidMount: Function;
  originalComponentDidUpdate: Function;
  originalComponentWillUnmount: Function;

  renderLogContainer: HTMLElement;
  renderLogDetail: HTMLElement;
  renderLogNotes: HTMLElement;
  renderLogRenderCount: HTMLElement;
  updateRenderLogPositionTimeout: any;

  renderLog: string[];
  renderCount: number;

  UPDATE_RENDER_LOG_POSITION_TIMEOUT_MS = 500;
  MAX_LOG_LENGTH = 20;

  styling = {
    renderLog: {
      color: 'rgb(85, 85, 85)',
      fontFamily: '\'Helvetica Neue\', Arial, Helvetica, sans-serif',
      fontSize: '10px',
      lineHeight: '18px',
      background: 'linear-gradient(#fff, #ccc)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      textShadow: '0 1px 0 #fff',
      borderRadius: '7px',
      position: 'absolute',
      maxWidth: '70%',
      padding: '2px 2px',
      zIndex: '10000',
    },
    renderLogDetailNotes: {
      color: 'red',
      textAlign: 'center',
    },
    elementHighlightMonitor: {
      outline: '1px solid rgba(47, 150, 180, 1)',
    },
    elementHighlightMount: {
      outline: '3px solid rgba(197, 16, 12, 1)',
    },
    elementHighlightUpdate: {
      outline: '3px solid rgba(197, 203, 1, 1)',
    },
    elementHighlightHover: {
      outline: '3px solid rgba(255, 0, 255, 1)',
    },
  };

  constructor(instance: any, options: RenderVisualizerOptions) {
    this.options = options;
    this.instance = instance;
    this.name = this.instance.constructor ? this.instance.constructor.name : null;

    if (options.ignoreNames.indexOf(this.name) !== -1) {
      return;
    }

    if (options.logInstance) {
      console.log(instance);
    }

    this.originalComponentDidMount = instance.componentDidMount;
    this.originalComponentDidUpdate = instance.componentDidUpdate;
    this.originalComponentWillUnmount = instance.componentWillUnmount;

    instance.componentDidMount = this.componentDidMount.bind(this);
    instance.componentDidUpdate = this.componentDidUpdate.bind(this);
    instance.componentWillUnmount = this.componentWillUnmount.bind(this);

    this.renderLogContainer = null;
    this.renderLogDetail = null;
    this.renderLogNotes = null;
    this.renderLogRenderCount = null;
    this.updateRenderLogPositionTimeout = null;

    this.renderLog = [];
    this.renderCount = 0;
  }

  componentDidMount() {
    // Reset the logs
    this.resetRenderLog();

    // Record initial mount
    this.addToRenderLog('Initial Render');

    // Build the monitor node
    this.buildRenderLogNode();

    // Highlight the initial mount
    this.highlightChange(STATE_CHANGES.MOUNT);

    // Set the watch to update log position
    this.updateRenderLogPositionTimeout = setInterval(
      this.updateRenderLogPosition.bind(this),
      this.UPDATE_RENDER_LOG_POSITION_TIMEOUT_MS
    );

    if (typeof this.originalComponentDidMount === 'function') {
      this.originalComponentDidMount.call(this.instance);
    }
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    // Get the changes in state and props
    this.getReasonForReRender(prevProps, prevState);

    // Update the render log
    this.updateRenderLogNode();

    // Highlight the update
    this.highlightChange(STATE_CHANGES.UPDATE);

    if (typeof this.originalComponentDidUpdate === 'function') {
      this.originalComponentDidUpdate.call(this.instance, prevProps, prevState);
    }
  }

  componentWillUnmount() {
    // Remove the monitor node
    this.removeRenderLogNode();

    // Clear the update position timeout
    clearInterval(this.updateRenderLogPositionTimeout);

    if (typeof this.originalComponentWillUnmount === 'function') {
      this.originalComponentWillUnmount.call(this.instance);
    }
  }

  /*
  * Reset the logs
  * @return void
  */
  resetRenderLog() {
    this.renderLog = [];
    this.renderCount = 1;
  }

  applyCSSStyling(node: HTMLElement, styles: any) {
    Object.keys(styles).forEach((className) => {
      (node.style as any)[className] = styles[className];
    });
  }

  /*
  * Build the renderLog node, add it to the body and assign it's position
  * based on the monitored component
  * @return void
  */
  buildRenderLogNode() {
    this.renderLogContainer = document.createElement('div');
    this.renderLogNotes = document.createElement('div');
    this.renderLogDetail = document.createElement('div');
    this.renderLogRenderCount = document.createElement('div');
    let renderLogDetailContainer = document.createElement('div');

    this.renderLogContainer.className = 'renderLog';
    this.renderLogContainer.title = this.name;

    // Apply styling
    this.applyCSSStyling(this.renderLogContainer, this.styling.renderLog)

    // Attach the click handler for toggling the detail log
    this.renderLogContainer.addEventListener('click', () => {
      // Show the detail Log
      if (this.renderLogRenderCount.style.display === 'none') {
        this.renderLogRenderCount.style.display = 'block';
        renderLogDetailContainer.style.display = 'none';
        this.renderLogContainer.style.zIndex = '10000';
        // Hide it
      } else {
        this.renderLogRenderCount.style.display = 'none';
        renderLogDetailContainer.style.display = 'block';
        this.renderLogContainer.style.zIndex = '10001';
      }
    });
    this.renderLogContainer.addEventListener('mouseover', () => {
      var parentNode = this.options.ReactDOM.findDOMNode(this.instance) as HTMLElement;

      if (parentNode) {
        parentNode.style.outline = this.styling.elementHighlightHover.outline;
      }
    });
    this.renderLogContainer.addEventListener('mouseout', () => {
      var parentNode = this.options.ReactDOM.findDOMNode(this.instance) as HTMLElement;

      if (parentNode) {
        parentNode.style.outline = this.styling.elementHighlightMonitor.outline;
      }
    });

    this.renderLogRenderCount.className = 'renderLogCounter';
    this.renderLogRenderCount.innerText = '1';

    renderLogDetailContainer.style.display = 'none';
    this.renderLogDetail.innerText = '';

    if (this.instance.shouldComponentUpdate) {
      this.renderLogNotes.innerText = 'NOTE: This component uses a custom shouldComponentUpdate(), so the results above are purely informational';
    }

    this.applyCSSStyling(this.renderLogNotes, this.styling.renderLogDetailNotes);

    renderLogDetailContainer.appendChild(this.renderLogDetail);
    renderLogDetailContainer.appendChild(this.renderLogNotes);

    this.renderLogContainer.appendChild(this.renderLogRenderCount);
    this.renderLogContainer.appendChild(renderLogDetailContainer);

    // Append to the body
    document.getElementsByTagName('body')[0].appendChild(this.renderLogContainer);

    // Set initial position
    this.updateRenderLogPosition();

    //
    this.updateRenderLogNode();
  }

  /*
  * Update the render log position based on its parent position
  * @return void
  */
  updateRenderLogPosition() {
    var parentNode = this.options.ReactDOM.findDOMNode(this.instance),
      parentNodeRect = parentNode && parentNode.getBoundingClientRect();

    if (this.renderLogContainer && parentNodeRect) {
      let left = parentNodeRect.left;
      let top = (window.pageYOffset + parentNodeRect.top);

      while (true) {
        let el = document.elementFromPoint(left + 1, top + 1);

        if (el && ((el.className === 'renderLog' && el != this.renderLogContainer) || (el.className === 'renderLogCounter' && el != this.renderLogRenderCount))) {
          if (el.className === 'renderLog') {
            left += el.clientWidth + 2;
          } else if (el.className === 'renderLogCounter') {
            left += el.parentElement.clientWidth + 2;
          }
        } else {
          break;
        }
      }

      this.renderLogContainer.style.left = left + 'px';
      this.renderLogContainer.style.top = top + 'px';
    }
  }

  /*
  * Update the render log count and details
  * @return void
  */
  updateRenderLogNode() {
    var logFragment = document.createDocumentFragment();

    if (this.renderLogRenderCount) {
      this.renderLogRenderCount.innerText = '' + (this.renderCount - 1);
    }

    if (this.renderLogDetail) {
      this.renderLogDetail.innerHTML = '';
      for (var i = 0; i < this.renderLog.length; i++) {
        var item = document.createElement('div');
        item.innerText = this.renderLog[i];
        logFragment.appendChild(item);
      }

      this.renderLogDetail.appendChild(logFragment);
    }
  }

  /*
  * Remove the render log node from the body
  * @return void
  */
  removeRenderLogNode() {
    if (this.renderLogContainer) {
      document.getElementsByTagName('body')[0].removeChild(this.renderLogContainer);
    }
  }

  /*
  * Add a detail message to the render log and update the count
  * @param object nextState - The most current state of the component
  * @param String message
  * @return void
  */
  addToRenderLog(message: string) {
    this.renderLog.unshift(this.renderCount + ') ' + message);
    this.renderCount++;

    // Trim the log
    this.renderLog.splice(this.MAX_LOG_LENGTH, 1);
  }


  /*
   * Get the changes made to props or state. In the event this component has its own
   * shouldComponentUpdate, don't do
   * anything
   * @param object prevProps
   * @param object prevState
   * @return boolean
   */
  getReasonForReRender(prevProps: any, prevState: any) {
    var nextState = this.instance.state;
    let nextProps = this.instance.props;

    for (let key in nextState) {
      if (nextState.hasOwnProperty(key) && nextState[key] !== prevState[key]) {
        if (typeof nextState[key] === 'object') {
          return this.addToRenderLog(`instance.state[${key}] changed`);
        } else {
          return this.addToRenderLog(
            `instance.state[${key}] changed: '${prevState[key]}' => '${nextState[key]}'`);
        }

      }
    }

    for (let key in nextProps) {
      if (nextProps.hasOwnProperty(key) && nextProps[key] !== prevProps[key]) {
        if (typeof nextProps[key] === 'object') {
          return this.addToRenderLog(`instance.props[${key}] changed`);
        } else {
          return this.addToRenderLog(
            `instance.props[${key}] changed: '${prevProps[key]}' => '${nextProps[key]}'`);
        }
      }
    }

    return this.addToRenderLog('unknown reason for update, possibly from forceUpdate()');
  }

  /*
   * Highlight any change by adding an animation style to the component DOM node
   * @param String change - The type of change being made to the node
   * @return void
   */
  highlightChange(change: string) {
    var parentNode = this.options.ReactDOM.findDOMNode(this.instance) as HTMLElement,
      ANIMATION_DURATION = 500;

    if (parentNode) {
      parentNode.style.boxSizing = 'border-box';

      window.requestAnimationFrame(() => {
        // Immediately show the border
        parentNode.style.transition = 'outline 0s';
        if (change === STATE_CHANGES.MOUNT) {
          parentNode.style.outline = this.styling.elementHighlightMount.outline;
        } else {
          parentNode.style.outline = this.styling.elementHighlightUpdate.outline;
        }

        // Animate the border back to monitored color
        window.requestAnimationFrame(() => {
          parentNode.style.outline = this.styling.elementHighlightMonitor.outline;
          parentNode.style.transition = 'outline ' + ANIMATION_DURATION + 'ms linear';
        });
      });
    }
  }
}

export function visualizeRender(options?: RenderVisualizerOptions) {
  if (options == null) {
    options = {} as RenderVisualizerOptions;
  }
  if (options.logInstance == null) {
    options.logInstance = false;
  }
  if (options.ReactDOM == null) {
    options.ReactDOM = require('react-dom');
  }
  if (options.ignoreNames == null) {
    options.ignoreNames = [];
  }

  return function<T extends React.ComponentClass<any>>(component: T): T {
    let visualizer = RenderVisualizer;
    let name = (component as any).name;
    let cls: any;

    // cannot change class name without eval
    var f = eval(`function ${name}() {
      new visualizer(this, options);
      return component.apply(this, Array.prototype.slice.call(arguments, 0));
    };
    ${name}.prototype = component.prototype;
    cls = ${name};
    `);

    return cls;
  };
}
