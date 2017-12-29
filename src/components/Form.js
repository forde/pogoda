import React, { Component } from 'react';
import styled from 'styled-components';

class Form extends Component {

    constructor(props) {
        super(props);
        this.state = {
            from: 'Legnica',
            to: 'Poznań',
        }
    }

    _onSubmit(e) {
        e.preventDefault();
        this.props.onSubmit({
            from: this.state.from,
            to: this.state.to
        });
    }

    render() {
        const { from, to } = this.state;
        return(
            <FormContainer onSubmit={this._onSubmit.bind(this)}>
                <input placeholder="from" value={from} onChange={e => this.setState({from: e.target.value})} />
                <input placeholder="to" value={to} onChange={e => this.setState({to: e.target.value})} />
                <button>Submit</button>
            </FormContainer>
        );
    }
}

export default Form;

const FormContainer = styled.form`
    position: absolute!important;
    background: rgba(255,255,255, .5);
    padding:20px;
    width:100%;
`;