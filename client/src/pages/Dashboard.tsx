/* ⛏️⛏️ SHOW ALL EVENTS, PARTICIPANT */

import React, { Component } from 'react';
import { Navigate, Link } from 'react-router-dom';
import EventList from '../components/events/EventList';
import withNavigate, { WithNavigateProps } from '../HOC/withNavigate';
import { getAllEvents } from '../utils/handleRequests/event';
import { IEvent } from '../types';
import '../style/Dashboard.css';

interface IDashboardState {
  activeTab: string;
  eventList: IEvent[];
  isLoading: boolean;
  errorMessage: string;
}

const INITIAL_STATE: IDashboardState = {
  activeTab: 'events',
  eventList: [],
  isLoading: false,
  errorMessage: '',
};

const ERROR_MESSAGES = {
  FETCH_EVENTS_FAILED: 'Failed to load events. Please try again.',
} as const;

class Dashboard extends Component<WithNavigateProps, IDashboardState> {
  private isComponentMounted: boolean;

  constructor(props: WithNavigateProps) {
    super(props);

    this.isComponentMounted = false;
    this.state = { ...INITIAL_STATE };

    this.updateEventList = this.updateEventList.bind(this);
  }

  componentDidMount(): void {
    this.isComponentMounted = true;
    this.fetchEvents();
  }

  componentWillUnmount(): void {
    this.isComponentMounted = false;
    this.setState({ eventList: [] });
  }

  private async fetchEvents(): Promise<void> {
    this.setState({ isLoading: true, errorMessage: '' });

    try {
      const events = await getAllEvents();

      if (this.isComponentMounted) {
        this.setState({
          eventList: events || [],
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      
      if (this.isComponentMounted) {
        this.setState({
          isLoading: false,
          errorMessage: ERROR_MESSAGES.FETCH_EVENTS_FAILED,
          eventList: [],
        });
      }
    }
  }

  async updateEventList(shouldUpdate: boolean): Promise<void> {
    if (shouldUpdate) {
      await this.fetchEvents();
    }
  }

  private isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  private navigateToLogin(): void {
    this.props.navigateToPath('/admin');
  }

  render(): React.ReactNode {
    if (!this.isAuthenticated()) {
      return <Navigate to="/admin" replace />;
    }

    const { isLoading, eventList, errorMessage } = this.state;

    return (
      <div className="Dashboard">
        <div className="container">
          <br />
          <Link className="btn btn-primary" to="/admin/list">
            Admin List
          </Link>
          <br />
          <br />

          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
              <button
                className="btn btn-link"
                onClick={() => this.fetchEvents()}
              >
                Retry
              </button>
            </div>
          )}

          <EventList
            isLoading={isLoading}
            updateList={this.updateEventList}
            eventList={eventList}
            pageFor="dashboard"
          />
        </div>
      </div>
    );
  }
}

export default withNavigate(Dashboard);