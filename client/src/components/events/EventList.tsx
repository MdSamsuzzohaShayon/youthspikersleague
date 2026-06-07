import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { hostname } from '../../utils/global';
import Loader from '../elements/Loader';
import EventRow from './EventRow';
import { handleRequestUnauthenticated } from '../../utils/auth';
import { IEvent } from '../../types';


interface IEventListProps {
  isLoading: boolean;
  eventList: IEvent[];
  pageFor: string;
  updateList: (shouldUpdate: boolean) => void;
}

// Constants
const INITIAL_EVENT_FORM: Pick<IEvent, 'title' | 'date'> = {
  title: '',
  date: '',
};

const ERROR_MESSAGES = {
  CREATE_EVENT_FAILED: 'Failed to create event. Please try again.',
} as const;

const EventList: React.FC<IEventListProps> = ({
  isLoading: parentIsLoading,
  eventList,
  pageFor,
  updateList,
}) => {
  // State Management
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [eventForm, setEventForm] = useState<Pick<IEvent, 'title' | 'date'>>(INITIAL_EVENT_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Derived State
  const isHomePage = pageFor === 'home';
  const showLoader = parentIsLoading || isLoading;

  // Authentication Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Modal Handlers
  const openModal = useCallback(() => setIsModalVisible(true), []);
  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setEventForm(INITIAL_EVENT_FORM);
    setErrorMessage('');
  }, []);

  // Event Form Handlers
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setEventForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // API Operations
  const createEvent = async (): Promise<boolean> => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${hostname}/api/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventForm),
      });

      handleRequestUnauthenticated(response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setEventForm(INITIAL_EVENT_FORM);
      setIsModalVisible(false);
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      setErrorMessage(ERROR_MESSAGES.CREATE_EVENT_FAILED);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.SyntheticEvent): Promise<void> => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    const success = await createEvent();
    if (success) {
      updateList(true);
    }
  };

  const handleKeyPress = useCallback(
    async (event: KeyboardEvent): Promise<void> => {
      if (event.key === 'Enter' && !event.repeat && isModalVisible) {
        event.preventDefault();
        
        if (!isFormValid()) {
          setErrorMessage('Please fill in all fields.');
          return;
        }

        const success = await createEvent();
        if (success) {
          updateList(true);
        }
      }
    },
    [eventForm, isModalVisible, updateList]
  );

  // Validation
  const isFormValid = (): boolean => {
    return !!(eventForm.title.trim() && eventForm.date);
  };

  // Keyboard Event Listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Render Helpers
  const renderCreateEventModal = (): React.ReactNode => {
    if (!isAuthenticated) return null;

    return (
      <div className="create-new-event mb-2">
        <Button variant="primary" onClick={openModal}>
          Create new event
        </Button>

        <Modal show={isModalVisible} onHide={closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>New Event</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <form onSubmit={handleFormSubmit} id="create-event-form">
              <div className="form-group">
                <label htmlFor="event-title">Title</label>
                <input
                  id="event-title"
                  type="text"
                  className="form-control"
                  name="title"
                  value={eventForm.title}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="event-date">Date</label>
                <input
                  id="event-date"
                  type="date"
                  className="form-control"
                  name="date"
                  value={eventForm.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {errorMessage && (
                <div className="alert alert-danger mt-3" role="alert">
                  {errorMessage}
                </div>
              )}
            </form>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="create-event-form"
              disabled={!isFormValid()}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  };

  const renderTableHeader = (): React.ReactNode => (
    <thead className="bg-dark text-light">
      <tr>
        <th scope="col">Title</th>
        <th scope="col">Date</th>
        <th scope="col">Details</th>
        {isAuthenticated && !isHomePage && <th scope="col">Handle</th>}
      </tr>
    </thead>
  );

  const renderEventRows = (): React.ReactNode => {
    if (!eventList || eventList.length === 0) {
      return (
        <tr>
          <td colSpan={isAuthenticated && !isHomePage ? 4 : 3} className="text-center">
            No events found
          </td>
        </tr>
      );
    }

    return eventList.map((event, index) => (
      <EventRow
        key={event._id || `event-${index}`}
        event={event}
        pageFor={pageFor}
        updateList={updateList}
        setIsLoading={setIsLoading}
      />
    ));
  };

  return (
    <div className="EventList ml-2">
      <h2 className="h2">All Events</h2>

      {renderCreateEventModal()}

      {showLoader ? (
        <Loader />
      ) : (
        <table className="table">
          {renderTableHeader()}
          <tbody>{renderEventRows()}</tbody>
        </table>
      )}
    </div>
  );
};

export default EventList;