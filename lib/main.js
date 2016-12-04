"use strict";
exports.STATE_CHANGES = {
    MOUNT: 'mount',
    UPDATE: 'update'
};
var RenderVisualizer = (function () {
    function RenderVisualizer(instance, options) {
        this.UPDATE_RENDER_LOG_POSITION_TIMEOUT_MS = 500;
        this.MAX_LOG_LENGTH = 20;
        this.styling = {
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
    RenderVisualizer.prototype.componentDidMount = function () {
        // Reset the logs
        this.resetRenderLog();
        // Record initial mount
        this.addToRenderLog('Initial Render');
        // Build the monitor node
        this.buildRenderLogNode();
        // Highlight the initial mount
        this.highlightChange(exports.STATE_CHANGES.MOUNT);
        // Set the watch to update log position
        this.updateRenderLogPositionTimeout = setInterval(this.updateRenderLogPosition.bind(this), this.UPDATE_RENDER_LOG_POSITION_TIMEOUT_MS);
        if (typeof this.originalComponentDidMount === 'function') {
            this.originalComponentDidMount.call(this.instance);
        }
    };
    RenderVisualizer.prototype.componentDidUpdate = function (prevProps, prevState) {
        // Get the changes in state and props
        this.getReasonForReRender(prevProps, prevState);
        // Update the render log
        this.updateRenderLogNode();
        // Highlight the update
        this.highlightChange(exports.STATE_CHANGES.UPDATE);
        if (typeof this.originalComponentDidUpdate === 'function') {
            this.originalComponentDidUpdate.call(this.instance, prevProps, prevState);
        }
    };
    RenderVisualizer.prototype.componentWillUnmount = function () {
        // Remove the monitor node
        this.removeRenderLogNode();
        // Clear the update position timeout
        clearInterval(this.updateRenderLogPositionTimeout);
        if (typeof this.originalComponentWillUnmount === 'function') {
            this.originalComponentWillUnmount.call(this.instance);
        }
    };
    /*
    * Reset the logs
    * @return void
    */
    RenderVisualizer.prototype.resetRenderLog = function () {
        this.renderLog = [];
        this.renderCount = 1;
    };
    RenderVisualizer.prototype.applyCSSStyling = function (node, styles) {
        Object.keys(styles).forEach(function (className) {
            node.style[className] = styles[className];
        });
    };
    /*
    * Build the renderLog node, add it to the body and assign it's position
    * based on the monitored component
    * @return void
    */
    RenderVisualizer.prototype.buildRenderLogNode = function () {
        var _this = this;
        this.renderLogContainer = document.createElement('div');
        this.renderLogNotes = document.createElement('div');
        this.renderLogDetail = document.createElement('div');
        this.renderLogRenderCount = document.createElement('div');
        var renderLogDetailContainer = document.createElement('div');
        this.renderLogContainer.className = 'renderLog';
        this.renderLogContainer.title = this.name;
        // Apply styling
        this.applyCSSStyling(this.renderLogContainer, this.styling.renderLog);
        // Attach the click handler for toggling the detail log
        this.renderLogContainer.addEventListener('click', function () {
            // Show the detail Log
            if (_this.renderLogRenderCount.style.display === 'none') {
                _this.renderLogRenderCount.style.display = 'block';
                renderLogDetailContainer.style.display = 'none';
                _this.renderLogContainer.style.zIndex = '10000';
            }
            else {
                _this.renderLogRenderCount.style.display = 'none';
                renderLogDetailContainer.style.display = 'block';
                _this.renderLogContainer.style.zIndex = '10001';
            }
        });
        this.renderLogContainer.addEventListener('mouseover', function () {
            var parentNode = _this.options.ReactDOM.findDOMNode(_this.instance);
            if (parentNode) {
                parentNode.style.outline = _this.styling.elementHighlightHover.outline;
            }
        });
        this.renderLogContainer.addEventListener('mouseout', function () {
            var parentNode = _this.options.ReactDOM.findDOMNode(_this.instance);
            if (parentNode) {
                parentNode.style.outline = _this.styling.elementHighlightMonitor.outline;
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
    };
    /*
    * Update the render log position based on its parent position
    * @return void
    */
    RenderVisualizer.prototype.updateRenderLogPosition = function () {
        var parentNode = this.options.ReactDOM.findDOMNode(this.instance), parentNodeRect = parentNode && parentNode.getBoundingClientRect();
        if (this.renderLogContainer && parentNodeRect) {
            var left = parentNodeRect.left;
            var top_1 = (window.pageYOffset + parentNodeRect.top);
            while (true) {
                var el = document.elementFromPoint(left + 1, top_1 + 1);
                if (el && ((el.className === 'renderLog' && el != this.renderLogContainer) || (el.className === 'renderLogCounter' && el != this.renderLogRenderCount))) {
                    if (el.className === 'renderLog') {
                        left += el.clientWidth + 2;
                    }
                    else if (el.className === 'renderLogCounter') {
                        left += el.parentElement.clientWidth + 2;
                    }
                }
                else {
                    break;
                }
            }
            this.renderLogContainer.style.left = left + 'px';
            this.renderLogContainer.style.top = top_1 + 'px';
        }
    };
    /*
    * Update the render log count and details
    * @return void
    */
    RenderVisualizer.prototype.updateRenderLogNode = function () {
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
    };
    /*
    * Remove the render log node from the body
    * @return void
    */
    RenderVisualizer.prototype.removeRenderLogNode = function () {
        if (this.renderLogContainer) {
            document.getElementsByTagName('body')[0].removeChild(this.renderLogContainer);
        }
    };
    /*
    * Add a detail message to the render log and update the count
    * @param object nextState - The most current state of the component
    * @param String message
    * @return void
    */
    RenderVisualizer.prototype.addToRenderLog = function (message) {
        this.renderLog.unshift(this.renderCount + ') ' + message);
        this.renderCount++;
        // Trim the log
        this.renderLog.splice(this.MAX_LOG_LENGTH, 1);
    };
    /*
     * Get the changes made to props or state. In the event this component has its own
     * shouldComponentUpdate, don't do
     * anything
     * @param object prevProps
     * @param object prevState
     * @return boolean
     */
    RenderVisualizer.prototype.getReasonForReRender = function (prevProps, prevState) {
        var nextState = this.instance.state;
        var nextProps = this.instance.props;
        for (var key in nextState) {
            if (nextState.hasOwnProperty(key) && nextState[key] !== prevState[key]) {
                if (typeof nextState[key] === 'object') {
                    return this.addToRenderLog("instance.state[" + key + "] changed");
                }
                else {
                    return this.addToRenderLog("instance.state[" + key + "] changed: '" + prevState[key] + "' => '" + nextState[key] + "'");
                }
            }
        }
        for (var key in nextProps) {
            if (nextProps.hasOwnProperty(key) && nextProps[key] !== prevProps[key]) {
                if (typeof nextProps[key] === 'object') {
                    return this.addToRenderLog("instance.props[" + key + "] changed");
                }
                else {
                    return this.addToRenderLog("instance.props[" + key + "] changed: '" + prevProps[key] + "' => '" + nextProps[key] + "'");
                }
            }
        }
        return this.addToRenderLog('unknown reason for update, possibly from forceUpdate()');
    };
    /*
     * Highlight any change by adding an animation style to the component DOM node
     * @param String change - The type of change being made to the node
     * @return void
     */
    RenderVisualizer.prototype.highlightChange = function (change) {
        var _this = this;
        var parentNode = this.options.ReactDOM.findDOMNode(this.instance), ANIMATION_DURATION = 500;
        if (parentNode) {
            parentNode.style.boxSizing = 'border-box';
            window.requestAnimationFrame(function () {
                // Immediately show the border
                parentNode.style.transition = 'outline 0s';
                if (change === exports.STATE_CHANGES.MOUNT) {
                    parentNode.style.outline = _this.styling.elementHighlightMount.outline;
                }
                else {
                    parentNode.style.outline = _this.styling.elementHighlightUpdate.outline;
                }
                // Animate the border back to monitored color
                window.requestAnimationFrame(function () {
                    parentNode.style.outline = _this.styling.elementHighlightMonitor.outline;
                    parentNode.style.transition = 'outline ' + ANIMATION_DURATION + 'ms linear';
                });
            });
        }
    };
    return RenderVisualizer;
}());
exports.RenderVisualizer = RenderVisualizer;
function visualizeRender(options) {
    if (options == null) {
        options = {};
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
    return function (component) {
        var visualizer = RenderVisualizer;
        var name = component.name;
        var cls;
        // cannot change class name without eval
        var f = eval("function " + name + "() {\n      new visualizer(this, options);\n      return component.apply(this, Array.prototype.slice.call(arguments, 0));\n    };\n    " + name + ".prototype = component.prototype;\n    cls = " + name + ";\n    ");
        return cls;
    };
}
exports.visualizeRender = visualizeRender;
