import React, { Component } from 'react';
import EventList from '../components/events/EventList';
import Menu from '../components/elements/Menu';
import { IEvent } from '../types';
import { getAllEvents } from '../utils/handleRequests/event';

interface IHomeState {
    eventList: IEvent[];
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface IHomeProps {
    // Define props here if there are any
}

class Home extends Component<IHomeProps, IHomeState> {
    constructor(props: IHomeProps) {
        super(props);
        this.state = {
            eventList: [],
            isAuthenticated: false,
            isLoading: false
        };
        this.getEventID = this.getEventID.bind(this);
        this.updateList = this.updateList.bind(this);
    }


    getEventID(id: string) {
        // this.setState({ currentEventID: id });
        // this.getSingleEvent();
        console.info(id);
    }

    async updateList(update: boolean) {
        if (update) {
            const eList = await getAllEvents();
            this.setState({eventList: eList});
        }
    }

        

    async componentDidMount() {
        (async ()=>{
            const eList = await getAllEvents();
            this.setState({eventList: eList});
        })()
    }

    render() {
        return (
            <div className="Home">
                <Menu />
                <i className="bi bi-plus-lg"></i>
                <div className="container mt-3">
                    <EventList
                        isLoading={this.state.isLoading}
                        updateList={this.updateList}
                        eventList={this.state.eventList}
                        pageFor="home"
                    />
                </div>
            </div>
        )
    }
}

export default Home;
