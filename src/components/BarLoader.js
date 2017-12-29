import React, { Component } from 'react';
import styled from 'styled-components';

class BarLoader extends Component {
    render() {
    const classes = (this.props.center)? 'center' : ''
    return (
        <BarWrapper>
            <div className={classes}>
                <div className="indeterminate"></div>
            </div>
        </BarWrapper>
    );
}
}
export default BarLoader;

const BarWrapper = styled.div`
    > div {
        position: relative;
        height: 4px;
        display: block;
        width: 100%;
        background: rgba(29, 139, 241, 0.42);
        margin: 0;
        top:-1px;
        overflow:hidden;
        &.center {
            position:absolute;
            top:50%;
            left:0;
            z-index: 900;
        }
        .determinate {
            position: absolute;
            background-color: inherit;
            top: 0;
            left: 0;
            bottom: 0;
            background-color: #1D8BF1;
            transition: width .2s linear;
        }
        .indeterminate {
            background-color: #1D8BF1;
            &:before {
                content: '';
                position: absolute;
                background-color: inherit;
                top: 0;
                left:0;
                bottom: 0;
                will-change: left, right;
                animation: indeterminate 2s cubic-bezier(0.650, 0.815, 0.735, 0.395) infinite;
            }
            &:after {
                content: '';
                position: absolute;
                background-color: inherit;
                top: 0;
                left:0;
                bottom: 0;
                will-change: left, right;
                // Custom bezier
                animation: indeterminate-short 2s cubic-bezier(0.165, 0.840, 0.440, 1.000) infinite;
                animation-delay: 1.15s;
            }
        }
    }
    @keyframes indeterminate {
        0% {
            left: -35%;
            right:100%;
        }
        60% {
            left: 100%;
            right: -90%;
        }
        100% {
            left: 100%;
            right: -90%;
        }
    }
    @keyframes indeterminate-short {
        0% {
            left: -200%;
            right: 100%;
        }
        60% {
            left: 107%;
            right: -8%;
        }
        100% {
            left: 107%;
            right: -8%;
        }
    }
`