import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
import registerServiceWorker from './registerServiceWorker';

import Map from './components/Map';
import Form from './components/Form';


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fromTo: null,
            date: '',
            geolocationReady: false,
        }
    }

    _onFormSubmit(formState) {
        this.setState({
            fromTo: {
                from: formState.from,
                to: formState.to
            },
            date: formState.date
        });
    }

    render() {
        const { fromTo, date } = this.state;
        return (
            <div className="app">
                <Map directions={fromTo} departureDate={date} onMapReady={() => this.setState({geolocationReady : true })}/>
                {this.state.geolocationReady && <Form onSubmit={this._onFormSubmit.bind(this)} />}
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
