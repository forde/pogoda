import React, { Component } from 'react';
import styled from 'styled-components';

const flatpickr = require("flatpickr");

class Form extends Component {

    constructor(props) {
        super(props);
        this.state = {
            from: '',
            to: '',
            date: '',
        }
    }

    componentDidMount() {
        setTimeout(() => {
            const google = window.google;

            const fromInputAutocomplete = new google.maps.places.Autocomplete(document.getElementById('from-input'));
            fromInputAutocomplete.addListener('place_changed', () => {
                this.setState({
                    from: fromInputAutocomplete.getPlace().formatted_address || this.state.from
                });
            });

            const toInputAutocomplete = new google.maps.places.Autocomplete(document.getElementById('to-input'));
            toInputAutocomplete.addListener('place_changed', () => {
                this.setState({
                    to: toInputAutocomplete.getPlace().formatted_address || this.state.to
                });
            });

            flatpickr("#date-input", {
                dateFormat: 'd-m-Y',
                minDate: new Date(),
                maxDate: new Date().setDate(new Date().getDate() + 7),
                onChange: (selectedDates, dateStr, instance) => {
                    this.setState({ date: dateStr });
                }
            });

        },1000);
    }

    _onSubmit(e) {
        e.preventDefault();
        this.props.onSubmit(this.state);
    }

    render() {
        const { from, to, date } = this.state;
        return(
            <FormContainer onSubmit={this._onSubmit.bind(this)}>
                <Input placeholder="Miejsce początkowe" id="from-input" required value={from} onChange={e => this.setState({from: e.target.value})} />
                <Input placeholder="Miejsce docelowe" id="to-input" required value={to} onChange={e => this.setState({to: e.target.value})} />
                <Input placeholder="Data wyjazdu" id="date-input" value={date} onChange={e => this.setState({date: e.target.value})} />
                <Button>Wyznacz trasę</Button>
            </FormContainer>
        );
    }
}

export default Form;

const FormContainer = styled.form`
    position: absolute!important;
    background: #fff;
    padding: 15px;
    width: 100%;
    top:0;
    border-bottom:4px solid #2196F3;
`;

const Input = styled.input`
    padding: 8px 16px;
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
    margin-right: 10px;
    border: 1px solid #2196f382;
    background: #fff;
    color: #4a4a4a;
    outline: none;
    border-radius: 5px;
    height: 35px;
    position:relative;
`;

const Button = styled.button`
    outline:none;
    position: relative;
    font-size: 14px;
    background: #2196F3;
    padding: 8px 16px;
    border: none;
    color: #fff;
    -webkit-font-smoothing: antialiased;
    border-radius: 5px;
    height: 35px;
    cursor:pointer;
`;