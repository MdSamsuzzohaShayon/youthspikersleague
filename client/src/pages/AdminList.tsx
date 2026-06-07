// @ts-nocheck

import React, { useState, useEffect } from 'react';
import Loader from '../components/elements/Loader';
import { hostname } from "../utils/global";
import { Navigate } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';

const AdminList = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState();
    const [adminList, setAdminList] = useState([]);
    const [isSuperuser, setIsSuperuser] = useState(false);
    const [newAdmin, setNewAdmin] = useState();
    const [errors, setErrors] = useState([]);

    // MODAL 
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);



    const getAllAdmins = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${hostname}/api/admin/list`, {
                method: "GET", headers: {
                    "authorization": `bearer ${token}`
                }
            });
            const text = await response.text();
            const jsonResponse = await JSON.parse(text);
            setAdminList(jsonResponse.admin ? jsonResponse.admin : []);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (localStorage.getItem('token')) {
            setIsAuthenticated(true);
            if (JSON.parse(localStorage.getItem('user')).role === "SUPER") {
                setIsSuperuser(true);
            } else {
                setIsSuperuser(false);
            }
        } else {
            setIsAuthenticated(false);
        }
        getAllAdmins();
    }, []);


    useEffect(() => {
        let timer;
        if (errors.length > 0) {
            timer = setTimeout(() => {
                setErrors(0);
            }, 2000);
        }
        return () => clearTimeout(timer);
    }, [errors])



    const handleChange = (e) => {
        // this.setState({ [e.target.name]: e.target.value });
        setNewAdmin(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    }
    const handleSubmit = async (e) => {
        setShow(false);
        setIsLoading(true);
        // {{HOST}}/api/admin/register
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: newAdmin?.username,
                    email: newAdmin?.registerEmail,
                    password: newAdmin?.registerPassword
                })
            };
            const response = await fetch(`${hostname}/api/admin/register`, options);
            const jsonResponse = await response.json();
            if (jsonResponse?.errors?.length > 0) {
                setErrors(jsonResponse.errors);
            }
            getAllAdmins();
            setNewAdmin({});
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    }



    const handleDelete = async (e, adminID) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const options = { 
                method: "DELETE", headers: {
                "authorization": `Bearer ${token}`
                }
            };
            await fetch(`${hostname}/api/admin/delete/${adminID}`, options );
            getAllAdmins();
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    }





    if (localStorage.getItem('token')) {
        return (
            <div className="AdminList">
                <h1>Staff List</h1>
                {isLoading === true ? <Loader /> : (<React.Fragment>
                    <br />
                    {isSuperuser && <React.Fragment>
                        <br />
                        <Button variant="primary" onClick={handleShow}>
                            Create admin
                        </Button>
                        <br />
                        {errors.length > 0 && <React.Fragment>
                            {errors.map((err, i) => <div className="alert alert-danger" key={i}>{err.msg}</div>)}
                        </React.Fragment>}

                        <Modal show={show} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title>Register new admin</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <form className="register-admin" onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Username</label>
                                        <input type="text" name="username" className="form-control" placeholder="Neymar JR" onChange={handleChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email address</label>
                                        <input type="email" name="registerEmail" className="form-control" placeholder="name@example.com" onChange={handleChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">password</label>
                                        <input type="password" name="registerPassword" className="form-control" autoComplete="on" placeholder="******" onChange={handleChange} />
                                    </div>
                                    {/* <div className="mb-3">
                                            <button className="btn btn-primary" type="submit">Submit</button>
                                        </div> */}
                                </form>
                                {/* {errorList} */}
                                {/* {props.success !== "" ? (<div className="alert alert-success" role="alert"> {props.success} </div>) : null} */}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Close
                                </Button>
                                <Button variant="primary" onClick={handleSubmit}>
                                    Register
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </React.Fragment>}
                    <br />
                    {adminList.length > 0 && (
                        <ul className="list-group">
                            {adminList.map((al, i) => (<li className="list-group-item d-flex justify-content-between" key={i}>
                                <div>{al.name}</div>
                                <div>{al.email}</div>
                                {isSuperuser && al.role === "GENERAL" ? <button className="btn btn-danger" onClick={e => handleDelete(e, al._id)}>Delete</button> : <div></div>}
                            </li>))}
                        </ul>
                    )}
                </React.Fragment>)}
            </div>
        )
    } else {
        return <Navigate to="/admin" />
    }
}

export default AdminList;
