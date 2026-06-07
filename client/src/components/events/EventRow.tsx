import React from 'react';
import { Link } from 'react-router-dom';
import { IEvent } from '../../types';
import { formattedDate } from '../../utils/helpers';
import { hostname } from '../../utils/global';
import { handleRequestUnauthenticated } from '../../utils/auth';

interface IEventRowProps {
  event: IEvent;
  pageFor: string;
  setIsLoading: (isLoading: boolean) => void;
  updateList: (shouldUpdate: boolean) => void;
}

const EventRow: React.FC<IEventRowProps> = ({
  event,
  pageFor,
  setIsLoading,
  updateList,
}) => {
  // Helper Functions
  const isAdminPage = pageFor !== 'home';

  const getDetailsLink = (): React.ReactNode => {
    const linkText = isAdminPage ? 'Edit Details' : 'View Details';
    const linkPath = isAdminPage
      ? `/admin/dashboard/event/${event._id}`
      : `/event/${event._id}`;
    const buttonClass = isAdminPage
      ? 'text-white btn btn-primary'
      : 'btn btn-primary';

    return (
      <Link to={linkPath} className={buttonClass}>
        {linkText}
      </Link>
    );
  };

  // API Operations
  const deleteEvent = async (
    event: React.MouseEvent<HTMLButtonElement>,
    eventId: string
  ): Promise<void> => {
    event.preventDefault();

    if (!confirmDelete()) return;

    try {
      setIsLoading(true);

      const token = localStorage.getItem('token');
      const response = await fetch(`${hostname}/api/event/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      handleRequestUnauthenticated(response);

      if (!response.ok) {
        throw new Error(`Failed to delete event. Status: ${response.status}`);
      }

      updateList(true);
    } catch (error) {
      console.error('Error deleting event:', error);
      // Could show error toast/notification here
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (): boolean => {
    return window.confirm('Are you sure you want to delete this event? This action cannot be undone.');
  };

  const renderActionsColumn = (): React.ReactNode => {
    if (!isAdminPage) return null;

    return (
      <td>
        <button
          className="btn btn-danger"
          onClick={(e) => deleteEvent(e, event._id)}
          aria-label={`Delete event: ${event.title}`}
        >
          Delete
        </button>
      </td>
    );
  };

  return (
    <tr>
      <th className="text-capitalize" scope="row">
        {event.title}
      </th>
      <td>{formattedDate(event.date)}</td>
      <td>{getDetailsLink()}</td>
      {renderActionsColumn()}
    </tr>
  );
};

export default EventRow;