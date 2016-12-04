/// <reference types="react" />
import * as React from 'react';
export declare const STATE_CHANGES: {
    MOUNT: string;
    UPDATE: string;
};
export interface RenderVisualizerOptions {
    logInstance: boolean;
    ReactDOM: {
        findDOMNode(instance: any): HTMLElement;
    };
    ignoreNames: string[];
}
export declare class RenderVisualizer {
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
    UPDATE_RENDER_LOG_POSITION_TIMEOUT_MS: number;
    MAX_LOG_LENGTH: number;
    styling: {
        renderLog: {
            color: string;
            fontFamily: string;
            fontSize: string;
            lineHeight: string;
            background: string;
            boxShadow: string;
            textShadow: string;
            borderRadius: string;
            position: string;
            maxWidth: string;
            padding: string;
            zIndex: string;
        };
        renderLogDetailNotes: {
            color: string;
            textAlign: string;
        };
        elementHighlightMonitor: {
            outline: string;
        };
        elementHighlightMount: {
            outline: string;
        };
        elementHighlightUpdate: {
            outline: string;
        };
        elementHighlightHover: {
            outline: string;
        };
    };
    constructor(instance: any, options: RenderVisualizerOptions);
    componentDidMount(): void;
    componentDidUpdate(prevProps: any, prevState: any): void;
    componentWillUnmount(): void;
    resetRenderLog(): void;
    applyCSSStyling(node: HTMLElement, styles: any): void;
    buildRenderLogNode(): void;
    updateRenderLogPosition(): void;
    updateRenderLogNode(): void;
    removeRenderLogNode(): void;
    addToRenderLog(message: string): void;
    getReasonForReRender(prevProps: any, prevState: any): void;
    highlightChange(change: string): void;
}
export declare function visualizeRender(options?: RenderVisualizerOptions): <T extends React.ComponentClass<any>>(component: T) => T;
