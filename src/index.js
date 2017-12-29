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
            fromTo: null
        }
    }

    render() {
        const { fromTo } = this.state;
        return (
            <div className="app">
                <Map directions={fromTo}/>
                <Form onSubmit={fromTo => this.setState({fromTo})} />
        </div>
      );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
