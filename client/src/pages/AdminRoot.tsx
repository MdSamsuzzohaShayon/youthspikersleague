// @ts-nocheck

// ⛏️⛏️ ALL OPERATIONS OF ADMIN ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖
import React, { Component } from 'react';
import '../style/Admin.css';
import withNavigate from '../HOC/withNavigate';
import { Navigate, Outlet } from 'react-router-dom';
import Menu from '../components/elements/Menu';
import Footer from '../components/elements/Footer';





class AdminRoot extends Component {

    render() {
        return (<div className="Admin">
            <Menu />
            <div className="container min-vh-100">
               <Outlet />
            </div>
            <Footer />
        </div>
        );
    }
}


export default withNavigate(AdminRoot);