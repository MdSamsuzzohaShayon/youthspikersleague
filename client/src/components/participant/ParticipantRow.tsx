import React from 'react';
import { IError, IParticipant } from '../../types';
import ModalElement from '../elements/ModalElement';
import { hostname } from '../../utils/global';

interface IParticipantRowProps {
  participant: IParticipant;
  index: number;
  updateEvent: (u: boolean)=> void;
  setErrorList: React.Dispatch<React.SetStateAction<IError[]>>;
}

function ParticipantRow({ participant, index, updateEvent, setErrorList }: IParticipantRowProps) {


  // ⛏️⛏️DELETE PARTICIPANT ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖ 
  const deleteParticipant = async (e, id) => {
    e.preventDefault();
    try {
      const checkUser = JSON.parse(localStorage.getItem('user'));
      if (checkUser.role === "SUPER") {
        const token = localStorage.getItem("token");
        // http://localhost:4000/api/admin/dashboard/participant
        const response = await fetch(`${hostname}/api/performance/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.status === 200) {
          console.info("Delete participant [Participant.jsx] - ", response);
          updateEvent(true);
        }
      } else {
        // SHOW ERROR YOU CAN DELETE ANY PARTICIPANT 
        setErrorList(prevState => [...prevState, { msg: "Only super admin is able to delete any participant." }]);
      }

    } catch (error) {
      console.error(error);
    }
  }

  return (
    <tr >
      <td >{index + 1}</td>
      <td className='text-capitalize'>{participant.firstname + " " + participant.lastname}</td>
      <td>{participant.email}</td>
      <td>{participant.cell}</td>
      <td>{participant.birthdate}</td>
      <td>{participant.payment_amount}</td>
      <td>{participant.payment_method}</td>
      <td>{participant.city}</td>
      <td>
        <ModalElement
          btnColor="danger"
          openBtn="Delete"
          modalTitle="Alert"
          modalBody={<div>If you have sorted them in a round, please mark them as "left" rather than delete!</div>}
          failureBtn="Cancel"
          successBtn="Yes"
          successModal={e => deleteParticipant(e, participant._id)}
        />
      </td>

    </tr>
  )
}

export default ParticipantRow;