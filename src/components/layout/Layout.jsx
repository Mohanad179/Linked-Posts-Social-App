/* eslint-disable no-unused-vars */
import React from 'react'
import { Outlet } from 'react-router-dom';
import Signup from '../signup/Signup';
import Nav from '../navbar/Nav';
import FooterComponent from './../footer/Footer';

export default function Layout() {
return (
    <>
        <Nav/>
        <Outlet/>
        <FooterComponent/>
    </>
)
}
