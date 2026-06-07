import '../style/SingleEvent.css';
import React, { Component } from 'react';
import withRouter, { WithRouterProps } from '../HOC/withRouter';
import Participants from '../components/participant/Participants';
import Rounds from '../components/round/Rounds'
import Score from "./Score";
import ExportField from '../components/export/ExportField';
import Loader from '../components/elements/Loader';
import { IParticipant } from '../types';
import { getSingleEvent } from '../utils/handleRequests/event';
import { formattedDate } from '../utils/helpers';

interface ISingleEventProps extends WithRouterProps {
    params: {
        id: string;
    };
    navigateToTarget: (target: string) => void;
}

interface ISingleEventState {
    currentEventID: string | null;
    activeTab: string;
    currentEvent: {
        title: string | null;
        participants: IParticipant[];
        date: string | null;
    };
    participants: string; // You should define a type for participants
    isLoading: boolean;
}

class SingleEvent extends Component<ISingleEventProps, ISingleEventState> {
    private is_mounted: boolean = false;

    constructor(props) {
        super(props);
        this.state = {
            currentEventID: null,
            activeTab: 'event',
            currentEvent: {
                title: null,
                participants: [],
                date: null
            },
            participants: "",
            isLoading: false
        };

        this.clickItemHandler = this.clickItemHandler.bind(this);
        this.showAllNavItem = this.showAllNavItem.bind(this);
        this.updateEvent = this.updateEvent.bind(this);
    }



    async componentDidMount() {
        if (!localStorage.getItem('token')) {
            this.props.navigateToTarget("/admin");
        } else {
            this.is_mounted = true;
            (async ()=>{
                const fetchedEvent = await getSingleEvent(this.props.params.id);
                if(fetchedEvent)this.setState({currentEvent: fetchedEvent});
            })()
            this.setState({ currentEventID: this.props.params.id });
            // document.title = "Spikers Scramble - " + this.state.currentEvent.title;
        }

    }







    // ⛏️⛏️ MAKE ALL VALUE AS DEFAULT ON UNMOUNT AN COMPONENT 
    clickItemHandler(e, params) {
        this.setState({ activeTab: params });
    }

    // ⛏️⛏️ FETCH EVERYTIME WEHN WE MADE CHANGE ON DATABASE
    updateEvent = async (update) => { 
        if (update) {
            const fetcheedEvent = await getSingleEvent(this.state.currentEventID) 
            if(fetcheedEvent){
                this.setState({currentEvent: fetcheedEvent});
            }
        }
        };


    /* ⛏️⛏️ SHOW COMPONENT WITH CONDITIONS  */
    showAllNavItem() {
        switch (this.state.activeTab) {
            case "event":
                if (this.state.isLoading) {
                    return (<Loader />);
                } else {
                    return (<div className="tab-pane fade show active" >
                        <div className="row">
                            <div className="col">
                                <div className="card" >
                                    <div className="card-body">
                                        <h5 className="card-title">Total Participants</h5>
                                        <p className="card-text">{this.state.currentEvent.participants.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="card" >
                                    <div className="card-body">
                                        <h5 className="card-title">Tournament date</h5>
                                        <p className="card-text">{formattedDate(this.state.currentEvent.date)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>);
                }
            case "participants":
                if (this.state.isLoading) {
                    return (<Loader />);
                } else {
                    return (<div className="tab-pane fade show active" >
                        <Participants
                            event={this.state.currentEvent}
                            updateEvent={this.updateEvent}
                            participants={this.state.currentEvent.participants}
                            eventID={this.state.currentEventID}
                        />
                    </div>);
                }
            case "rounds":
                if (this.state.isLoading) {
                    return (<Loader />);
                } else {
                    return (<div className="tab-pane fade show active" ><Rounds eventName={this.state.currentEvent.title} eventID={this.state.currentEventID} /></div>);
                }
            case "score":
                if (this.state.isLoading) {
                    return (<Loader />);
                } else {
                    return (<div className="tab-pane fade show active score-board" ><Score admin={true} /></div>);
                }
            case "export":
                if (this.state.isLoading) {
                    return (<Loader />);
                } else {
                    return (<div className="tab-pane fade show active score-board" ><ExportField eventID={this.state.currentEventID} /></div>);
                }
            default:
                return (<div className="tab-pane fade show active" >Event overview</div>);
        }
    }


    // ⛏️⛏️ MAKE ALL VALUE AS DEFAULT ON UNMOUNT AN COMPONENT 
    componentWillUnmount() {
        this.is_mounted = false;
    }

    render() {
        if (this.state.isLoading) {
            return <Loader />
        } else {
            if (this.state.currentEventID) {
                return (
                    <div className="SingleEvent">
                        <div className="Overview">
                            <div className="d-flex align-items-start dashboard-nav container-fluid">
                                <div className="nav nav-pills dashboard-nav-items bg-dark text-center">
                                    <h3 className="text-secondary nav-link text-uppercase" >{this.state.currentEvent.title}</h3>
                                    <br />
                                    <div className="nv-btns-list">
                                        <button className={this.state.activeTab === "event" ? "nav-link active" : "nav-link"} onClick={e => this.clickItemHandler(e, "event")} >Events</button>
                                        <button className={this.state.activeTab === "participants" ? "nav-link active" : "nav-link"} onClick={e => this.clickItemHandler(e, "participants")}  >Participants</button>
                                        <button className={this.state.activeTab === "rounds" ? "nav-link active" : "nav-link"} onClick={e => this.clickItemHandler(e, "rounds")}  >Scramble</button>
                                        <button className={this.state.activeTab === "score" ? "nav-link active" : "nav-link"} onClick={e => this.clickItemHandler(e, "score")}  >Score</button>
                                        <button className={this.state.activeTab === "export" ? "nav-link active" : "nav-link"} onClick={e => this.clickItemHandler(e, "export")}  >Export</button>
                                    </div>
                                </div>
                                <div className="tab-content" >
                                    {this.showAllNavItem()}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className="SingleEvent">
                        No event id or incorrect event id
                    </div>
                );
            }
        }
    }
}

export default withRouter(SingleEvent);

