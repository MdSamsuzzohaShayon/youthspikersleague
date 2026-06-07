import React, { useState, useEffect } from 'react';
import { hostname } from '../../utils/global';
import { Button, Modal } from "react-bootstrap";
import { IParticipant } from '../../types';
import ParticipantList from './ParticipantList';

const Participants = (props) => {

    const [show, setShow] = useState<boolean>(false);
    const [csvShow, setCsvShow] = useState<boolean>(false);
    const [participant, setPartitipant] = useState<Partial<IParticipant>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorList, setErrorList] = useState([]);
    const handleClose = () => {
        setErrorList([]);
        setShow(false)
    };

    // ===== Toggle Events =====
    const handleShow = () => setShow(true);
    const handleCsvClose = () => setCsvShow(false);
    const handleCsvShow = () => setCsvShow(true);

    // ⛏️⛏️ ADD A PARTICIPANT
    const handleSaveParticipant = async (e) => {
        e.preventDefault();
        setErrorList([]);

        try {
            const token = localStorage.getItem("token");
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(participant)
            }
            // http://localhost:4000/api/admin/dashboard/participant
            const response = await fetch(`${hostname}/api/performance/${props.eventID}`, options);
            const text = await response.text();
            const jsonRes = JSON.parse(text);
            if (jsonRes.errors) {
                if (jsonRes.errors.length >= 1) {
                    setErrorList([...jsonRes.errors]);
                }
            } else {
                props.updateEvent(true);
                setShow(false);
                setPartitipant({});
            }
        } catch (error) {
            console.error(error);
        }
    };


    // ⛏️⛏️GETTING INPUT VALUE ON CHANGING ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖ 
    function handleChange(evt) {
        setPartitipant({
            ...participant,
            [evt.target.name]: evt.target.value
        });
    }



    useEffect(() => {
        const timer = setTimeout(() => {
            setErrorList([]);
        }, 3000);
        return () => clearTimeout(timer);
    }, [errorList])





    // ⛏️⛏️ ON CHANGE EVENT AND SET VALUE FOR A FILE ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖
    function handleCsvChange(e) {
        e.preventDefault();
        setSelectedFile(e.target.files[0]);
    }


    // ⛏️⛏️ SUBMIT FILE TO THE DATABASE ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖
    async function submitCsvUpload(e) {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append('file', selectedFile);
            const options = {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            };
            // http://localhost:4000/api/admin/dashboard/participant
            const response = await fetch(`${hostname}/api/performance/multiple/${props.eventID}`, options);
            const text = await response.text();
            const json = JSON.parse(text);
            if (json.errors) {
                setErrorList([...json.errors]);
            }
            props.updateEvent(true);
        } catch (error) {
            console.error(error);
        }
        setCsvShow(false);
    }



    




    if (props.participants) {
        return (
            <div className="Participants">
                <h2 className="h2">Participants</h2>
                {props.participants.length > 0 && <ParticipantList participants={props.participants} setErrorList={setErrorList} updateEvent={props.updateEvent} />}


                <div className="upload-single-participant">
                    {errorList && [...new Set(errorList)].map((e, i) => <p key={i} className="text-danger">{e.msg}</p>)}

                    <h3 className="h3">Add participants for this events</h3>

                    <Button variant="primary" onClick={handleShow}>
                        Add participants
                    </Button>

                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>{props.event.title}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {errorList && [...new Set(errorList)].map((e, i) => <p key={i} className="text-danger">{e.msg}</p>)}

                            <form>
                                <div className="form-group">
                                    <label htmlFor="firstname">First Name*</label>
                                    <input type="text" className="form-control" id="firstname" name="firstname" onChange={handleChange} placeholder="Enter Your First name" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastname">Last Name*</label>
                                    <input type="text" className="form-control" id="lastname" name="lastname" onChange={handleChange} placeholder="Enter Your Last Name" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="firstname">Email</label>
                                    <input type="email" className="form-control" id="email" name="email" onChange={handleChange} placeholder="Enter Your Email" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cell">Phone</label>
                                    <input type="text" className="form-control" id="cell" name="cell" onChange={handleChange} placeholder="Enter Your Phone Number" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="birthdate">Birthdate</label>
                                    <input type="date" className="form-control" id="birthdate" name="birthdate" onChange={handleChange} placeholder="Enter Your Birthdate" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="payment_amount">Payment Amount</label>
                                    <input type="text" className="form-control" id="payment_amount" name="payment_amount" onChange={handleChange} placeholder="Enter Your Payment Amount" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="payment_method">Payment Method</label>
                                    <select className="form-control" id="payment_method" name="payment_method" onChange={handleChange}>
                                        <option value="Cash">Cash</option>
                                        <option value="Check">Check</option>
                                        <option value="Venmo">Venmo</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="city">City</label>
                                    <input type="text" className="form-control" id="city" name="city" onChange={handleChange} placeholder="Enter Your City" />
                                </div>

                                <div className="form-group d-none">
                                    <input type="text" className="form-control" id="emailID" value={props.event._id} readOnly name="eventID" />
                                </div>
                            </form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={handleSaveParticipant}  >
                                Save Changes
                            </Button>
                        </Modal.Footer>
                    </Modal>

                </div>
                <div className="upload-multiple-participant">
                    <h3 className="h3">Add participants From CSV</h3>

                    <Button variant="primary" onClick={handleCsvShow}>
                        Add CSV
                    </Button>

                    <Modal show={csvShow} onHide={handleCsvClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>{props.event.title}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {/* // firstname,lastname,email,cell,birthdate,city, eventID */}
                            <form>
                                <div className="form-group">
                                    <label htmlFor="firstname">Upload CSV File</label>
                                    <input type="file" className="form-control" id="csvFile" name="csv-file" onChange={handleCsvChange} />
                                </div>
                                <div className="form-group d-none">
                                    <input type="text" className="form-control" id="csvFileEventID" value={props.event._id} readOnly name="eventID" />
                                </div>
                            </form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCsvClose}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={submitCsvUpload}  >
                                Save Changes
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        );
    } else {
        return (
            <div className="Participants">No Participants</div>
        );
    }
}

export default Participants;
