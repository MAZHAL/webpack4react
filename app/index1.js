import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { render } from 'react-dom'
import Header from './Header'
import Content from './Content'
import Provider from './Provider';
import createStore from './store/store'
import themeReducer from './store/reducer'

const store = createStore(themeReducer);

class Index1 extends Component {
    render () {
        return (
            <div>
                <Header />
                <Content />
            </div>
        )
    }
}

render( <Provider store={store}>
        <Index1 />
    </Provider>,
    document.getElementById('app'));